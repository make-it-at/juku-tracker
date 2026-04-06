'use client';

import { useEffect, useState } from 'react';
import { JukuRecord } from '@/lib/types';
import MonthlyChart from '@/components/MonthlyChart';
import RecordTable from '@/components/RecordTable';
import Link from 'next/link';

export default function MonthlyPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<JukuRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/records?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year, month]);

  const totalMin = records.reduce((s, r) => s + r.durationMin, 0);
  const totalH = (totalMin / 60).toFixed(1);
  const avgMin = records.length > 0 ? Math.round(totalMin / records.length) : 0;

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
        <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 mb-4">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white text-xl px-2">‹</button>
          <span className="font-bold">{year}年 {month}月</span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white text-xl px-2">›</button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : (
          <>
            {/* サマリー */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: '通塾回数', value: `${records.length}回` },
                { label: '合計時間', value: `${totalH}h` },
                { label: '平均滞在', value: `${avgMin}分` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-gray-400 text-xs mb-1">{label}</div>
                  <div className="text-white font-bold text-lg">{value}</div>
                </div>
              ))}
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
