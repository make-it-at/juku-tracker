import { NextRequest, NextResponse } from 'next/server';
import { getAllRecords, getRecordsByDateRange, getRecordsByMonth } from '@/lib/api';

export const revalidate = 300; // 5分キャッシュ

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  try {
    let records;
    if (year && month) {
      records = await getRecordsByMonth(Number(year), Number(month));
    } else if (start && end) {
      records = await getRecordsByDateRange(start, end);
    } else {
      records = await getAllRecords();
    }
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}
