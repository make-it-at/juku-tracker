import { JukuRecord } from './types';

// 日付文字列 YYYY-MM-DD を JST で Date に変換
function toJSTDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+09:00`);
}

// 今日の日付（JST）
function todayJST(): Date {
  const now = new Date();
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  jst.setHours(0, 0, 0, 0);
  return jst;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 通塾日（ユニーク）を降順で返す
 */
export function getAttendanceDates(records: JukuRecord[]): string[] {
  const dates = new Set(records.map((r) => r.date).filter(Boolean));
  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}

/**
 * 連続通塾日数を計算する。
 * - 今日 or 昨日に通塾していれば継続カウント
 * - 土日はスキップ可能（平日ベースでカウント）
 */
export function calcStreak(records: JukuRecord[]): number {
  const dates = getAttendanceDates(records);
  if (dates.length === 0) return 0;

  const today = todayJST();
  const latestDate = toJSTDate(dates[0]);
  const daysSinceLatest = diffDays(today, latestDate);

  // 最後の通塾が2日以上前（土日を考慮しても切れている）
  if (daysSinceLatest > 3) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = toJSTDate(dates[i - 1]);
    const curr = toJSTDate(dates[i]);
    const diff = diffDays(prev, curr);

    // 1日差はそのまま継続
    if (diff === 1) {
      streak++;
      continue;
    }

    // 土日スキップ: 差が2〜3日で間に土日が含まれる場合は継続
    if (diff <= 3) {
      const skipped = Array.from({ length: diff - 1 }, (_, k) => {
        const d = new Date(curr.getTime() + (k + 1) * 24 * 60 * 60 * 1000);
        return d.getDay(); // 0=日, 6=土
      });
      if (skipped.every((day) => day === 0 || day === 6)) {
        streak++;
        continue;
      }
    }

    break;
  }

  return streak;
}

/**
 * 今月の累計時間（時間）を返す
 */
export function calcMonthlyHours(records: JukuRecord[], year: number, month: number): number {
  const filtered = records.filter((r) => {
    if (!r.date) return false;
    const [y, m] = r.date.split('-').map(Number);
    return y === year && m === month;
  });
  const totalMin = filtered.reduce((sum, r) => sum + r.durationMin, 0);
  return totalMin / 60;
}

/**
 * 全期間の累計時間（時間）を返す
 */
export function calcTotalHours(records: JukuRecord[]): number {
  const totalMin = records.reduce((sum, r) => sum + r.durationMin, 0);
  return totalMin / 60;
}
