'use client';

import { useEffect, useState } from 'react';
import { TrackingRecord, Facility } from '@/lib/types';
import MonthlyChart from '@/components/MonthlyChart';
import RecordTable from '@/components/RecordTable';
import Link from 'next/link';

type Filter = '全体' | Facility;
const FILTERS: Filter[] = ['全体', '塾', 'セントラルフィットネス'];
const FILTER_LABELS: Record<Filter, string> = {
  '全体': '全体',
  '塾': '📚 塾',
  'セントラルフィットネス': '🏋️ ジム',
};

export default function MonthlyPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [allRecords, setAllRecords] = useState<TrackingRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('全体');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/records?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setAllRecords(data.records ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year, month]);

  const records = filter === '全体'
    ? allRecords
    : allRecords.filter((r) => r.facility === filter);

  const jukuRecords = allRecords.filter((r) => r.facility === '塾');
  const gymRecords  = allRecords.filter((r) => r.facility === 'セントラルフィットネス');
  const jukuMin = jukuRecords.reduce((s, r) => s + r.durationMin, 0);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* ヘッダー */}
        <header className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white text-xl">←</Link>
          <h1 className="text-xl font-black">月間レポート</h1>
        </header>

        {/* 月選択 */}
        <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 mb-3">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white text-xl px-2">‹</button>
          <span className="font-bold">{year}年 {month}月</span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white text-xl px-2">›</button>
        </div>

        {/* 施設フィルター */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : (
          <>
            {/* サマリー */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">📚 塾 回数</div>
                <div className="text-white font-bold text-lg">{jukuRecords.length}回</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">📚 塾 時間</div>
                <div className="text-white font-bold text-lg">{(jukuMin / 60).toFixed(1)}h</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">🏋️ ジム 回数</div>
                <div className="text-white font-bold text-lg">{gymRecords.length}回</div>
              </div>
            </div>

            {/* 棒グラフ */}
            <section className="mb-4">
              <MonthlyChart records={records} year={year} month={month} />
            </section>

            {/* 記録テーブル */}
            <section>
              <RecordTable records={records} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
