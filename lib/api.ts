import { notion, DATABASE_ID } from './notion';
import { JukuRecord } from './types';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

function parseRecord(page: PageObjectResponse): JukuRecord {
  const props = page.properties;

  const getTitle = (p: typeof props[string]): string => {
    if (p.type === 'title') return p.title.map((t) => t.plain_text).join('');
    return '';
  };

  const getDate = (p: typeof props[string]): string => {
    if (p.type === 'date' && p.date) return p.date.start ?? '';
    return '';
  };

  const getText = (p: typeof props[string]): string => {
    if (p.type === 'rich_text') return p.rich_text.map((t) => t.plain_text).join('');
    return '';
  };

  const getNumber = (p: typeof props[string]): number => {
    if (p.type === 'formula' && p.formula.type === 'number') return p.formula.number ?? 0;
    if (p.type === 'number') return p.number ?? 0;
    return 0;
  };

  const getFormulaText = (p: typeof props[string]): string => {
    if (p.type === 'formula' && p.formula.type === 'string') return p.formula.string ?? '';
    return '';
  };

  return {
    id: page.id,
    title: getTitle(props['タイトル'] ?? props['名前'] ?? Object.values(props).find(p => p.type === 'title')!),
    date: getDate(props['日付']),
    checkIn: getText(props['入室時刻']),
    checkOut: getText(props['退室時刻']),
    durationMin: getNumber(props['滞在時間（分）']),
    durationH: getFormulaText(props['滞在時間（h）']),
    memo: getText(props['メモ']),
  };
}

export async function getAllRecords(): Promise<JukuRecord[]> {
  const records: JukuRecord[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ property: '日付', direction: 'descending' }],
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if (page.object === 'page' && 'properties' in page) {
        records.push(parseRecord(page as PageObjectResponse));
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return records;
}

export async function getRecordsByMonth(year: number, month: number): Promise<JukuRecord[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return getRecordsByDateRange(start, end);
}

export async function getRecordsByDateRange(start: string, end: string): Promise<JukuRecord[]> {
  const records: JukuRecord[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          { property: '日付', date: { on_or_after: start } },
          { property: '日付', date: { on_or_before: end } },
        ],
      },
      sorts: [{ property: '日付', direction: 'descending' }],
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if (page.object === 'page' && 'properties' in page) {
        records.push(parseRecord(page as PageObjectResponse));
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return records;
}
