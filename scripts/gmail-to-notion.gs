// ===== 設定 =====
const NOTION_API_KEY = ''; // Notion Integration Token を入れる
const NOTION_DATABASE_ID = 'e763b1388ec743158a44c3610642e181';
const PROCESSED_LABEL = 'juku-processed';
const BATCH_SIZE = 20; // 1回の実行で処理する件数（タイムアウト対策）

// ===== 施設定義 =====
const FACILITIES = {
  juku: {
    name: 'atama+塾',
    searchQuery: 'from:noreply@nyutai.com subject:THINX',
    parseTime: (body) => {
      // "04月04日 14時05分"
      const m = body.match(/(\d{2})月(\d{2})日\s+(\d{2})時(\d{2})分/);
      if (!m) return null;
      return { month: parseInt(m[1]), day: parseInt(m[2]), time: `${m[3]}:${m[4]}` };
    },
    isCheckIn:  (subject) => subject.includes('入室'),
    isCheckOut: (subject) => subject.includes('退室'),
  },
  central: {
    name: 'セントラルフィットネス',
    searchQuery: 'from:info@central.co.jp subject:セントラル',
    parseTime: (body) => {
      // "HH:MMに、マキタ ハルトさんが入館されました。"
      const m = body.match(/(\d{2}:\d{2})に、.+さんが(入館|退館)されました/);
      if (!m) return null;
      const [h, min] = m[1].split(':').map(Number);
      return { month: null, day: null, time: `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`, rawMatch: m };
    },
    isCheckIn:  (subject, body) => subject.includes('入館') || (body || '').includes('入館'),
    isCheckOut: (subject, body) => subject.includes('退館') || (body || '').includes('退館'),
  },
};

// ===== メイン処理 =====
function processJukuEmails() {
  processEmails(FACILITIES.juku);
}

function processCentralEmails() {
  processEmails(FACILITIES.central);
}

function processAllEmails() {
  processEmails(FACILITIES.juku);
  processEmails(FACILITIES.central);
}

function processEmails(facility) {
  const startTime = Date.now();
  const TIME_LIMIT_MS = 5 * 60 * 1000;

  const label = getOrCreateLabel(PROCESSED_LABEL);
  const threads = GmailApp.search(
    `${facility.searchQuery} -label:${PROCESSED_LABEL}`,
    0, BATCH_SIZE
  );

  if (threads.length === 0) {
    console.log(`[${facility.name}] 未処理メールはありません`);
    return;
  }

  const messages = [];
  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      messages.push({ msg, thread });
    }
  }
  messages.sort((a, b) => a.msg.getDate() - b.msg.getDate());

  let processed = 0;
  for (const { msg, thread } of messages) {
    if (Date.now() - startTime > TIME_LIMIT_MS) {
      console.log(`[${facility.name}] タイムアウト手前で中断。処理済み: ${processed}件`);
      return;
    }
    try {
      processMessage(msg, facility);
      thread.addLabel(label);
      processed++;
    } catch (e) {
      console.error(`[${facility.name}] エラー: ${msg.getSubject()} - ${e.message}`);
      thread.addLabel(label); // エラーでも処理済みにして無限ループ防止
    }
  }

  console.log(`[${facility.name}] 処理完了: ${processed}件`);

  const remaining = GmailApp.search(`${facility.searchQuery} -label:${PROCESSED_LABEL}`, 0, 1);
  if (remaining.length > 0) console.log(`[${facility.name}] まだ未処理メールが残っています`);
}

// ===== メール1件処理 =====
function processMessage(msg, facility) {
  const subject = msg.getSubject();
  const body = msg.getPlainBody();
  const receivedDate = msg.getDate();

  console.log(`処理中: ${subject}`);

  const isCheckIn  = facility.isCheckIn(subject, body);
  const isCheckOut = facility.isCheckOut(subject, body);
  if (!isCheckIn && !isCheckOut) return;

  const parsed = facility.parseTime(body);
  if (!parsed) {
    console.error(`時刻パース失敗: ${body.substring(0, 100)}`);
    return;
  }

  // 日付の決定
  let dateStr;
  if (parsed.month && parsed.day) {
    // 塾: 本文から日付取得
    const year = receivedDate.getFullYear();
    dateStr = `${year}-${String(parsed.month).padStart(2,'0')}-${String(parsed.day).padStart(2,'0')}`;
  } else {
    // セントラル: メール受信日を使用
    const y = receivedDate.getFullYear();
    const mo = receivedDate.getMonth() + 1;
    const d = receivedDate.getDate();
    dateStr = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  const timeStr = parsed.time;
  console.log(`日付: ${dateStr}, 時刻: ${timeStr}, 種別: ${isCheckIn ? '入室/入館' : '退室/退館'}, 施設: ${facility.name}`);

  if (isCheckIn) {
    handleCheckIn(dateStr, timeStr, facility.name);
  } else {
    handleCheckOut(dateStr, timeStr, facility.name);
  }
}

// ===== 入室/入館処理 =====
function handleCheckIn(dateStr, timeStr, facilityName) {
  const existingPageId = findNotionRecord(dateStr, facilityName);
  if (existingPageId) {
    updateNotionRecord(existingPageId, { checkIn: timeStr });
    console.log(`入室時刻を更新: ${dateStr} ${timeStr}`);
  } else {
    createNotionRecord(dateStr, timeStr, null, facilityName);
    console.log(`新規レコード作成（入室）: ${dateStr} ${timeStr}`);
  }
}

// ===== 退室/退館処理 =====
function handleCheckOut(dateStr, timeStr, facilityName) {
  const existingPageId = findNotionRecord(dateStr, facilityName);
  if (existingPageId) {
    updateNotionRecord(existingPageId, { checkOut: timeStr });
    console.log(`退室時刻を更新: ${dateStr} ${timeStr}`);
  } else {
    createNotionRecord(dateStr, null, timeStr, facilityName);
    console.log(`新規レコード作成（退室のみ）: ${dateStr} ${timeStr}`);
  }
}

// ===== Notion: 同日・同施設レコード検索 =====
function findNotionRecord(dateStr, facilityName) {
  const url = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
  const res = notionRequest('POST', url, {
    filter: {
      and: [
        { property: '日付', date: { equals: dateStr } },
        { property: '施設', select: { equals: facilityName } },
      ]
    }
  });
  return res.results && res.results.length > 0 ? res.results[0].id : null;
}

// ===== Notion: レコード新規作成 =====
function createNotionRecord(dateStr, checkIn, checkOut, facilityName) {
  const properties = {
    'タイトル': { title: [{ text: { content: dateStr } }] },
    '日付': { date: { start: dateStr } },
    '施設': { select: { name: facilityName } },
  };
  if (checkIn)  properties['入室時刻'] = { rich_text: [{ text: { content: checkIn } }] };
  if (checkOut) properties['退室時刻'] = { rich_text: [{ text: { content: checkOut } }] };

  notionRequest('POST', 'https://api.notion.com/v1/pages', {
    parent: { database_id: NOTION_DATABASE_ID },
    properties
  });
}

// ===== Notion: レコード更新 =====
function updateNotionRecord(pageId, { checkIn, checkOut }) {
  const properties = {};
  if (checkIn)  properties['入室時刻'] = { rich_text: [{ text: { content: checkIn } }] };
  if (checkOut) properties['退室時刻'] = { rich_text: [{ text: { content: checkOut } }] };
  notionRequest('PATCH', `https://api.notion.com/v1/pages/${pageId}`, { properties });
}

// ===== Notion API共通リクエスト =====
function notionRequest(method, url, payload) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  const res = UrlFetchApp.fetch(url, options);
  const code = res.getResponseCode();
  const body = JSON.parse(res.getContentText());
  if (code < 200 || code >= 300) throw new Error(`Notion API エラー ${code}: ${JSON.stringify(body)}`);
  return body;
}

// ===== Gmailラベルの取得または作成 =====
function getOrCreateLabel(labelName) {
  return GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);
}

// ===== トリガー設定（一度だけ実行） =====
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['processAllEmails', 'processJukuEmails', 'processCentralEmails'].includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 塾・セントラル両方を毎日20時に処理
  ScriptApp.newTrigger('processAllEmails')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .nearMinute(0)
    .inTimezone('Asia/Tokyo')
    .create();

  console.log('トリガー設定完了: 毎日20時に processAllEmails を実行');
}
