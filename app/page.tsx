import { getAllRecords } from '@/lib/api';
import { calcStreak, calcMonthlyHours, calcTotalHours } from '@/lib/streak';
import { getCurrentLevel } from '@/lib/levels';
import StreakCard from '@/components/StreakCard';
import Heatmap from '@/components/Heatmap';
import MonthlyProgress from '@/components/MonthlyProgress';
import LevelBadge from '@/components/LevelBadge';
import Link from 'next/link';

export const revalidate = 300;

export default async function DashboardPage() {
  const records = await getAllRecords();

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const streak = calcStreak(records);
  const monthlyHours = calcMonthlyHours(records, year, month);
  const totalHours = calcTotalHours(records);
  const currentLevel = getCurrentLevel(totalHours);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* ヘッダー */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">塾トラッカー</h1>
            <p className="text-gray-400 text-xs mt-0.5">遼都の通塾ダッシュボード</p>
          </div>
          <div className="text-right">
            <div className="text-2xl">{currentLevel.badge}</div>
            <div className="text-xs text-gray-400">Lv.{currentLevel.level} {currentLevel.name}</div>
          </div>
        </header>

        {/* ストリーク */}
        <section className="mb-4">
          <StreakCard streak={streak} />
        </section>

        {/* ヒートマップ */}
        <section className="mb-4">
          <Heatmap records={records} />
        </section>

        {/* 月間プログレス */}
        <section className="mb-4">
          <MonthlyProgress currentHours={monthlyHours} targetHours={20} />
        </section>

        {/* レベル */}
        <section className="mb-6">
          <LevelBadge totalHours={totalHours} />
        </section>

        {/* 月間レポートへ */}
        <Link
          href="/monthly"
          className="block w-full text-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors rounded-xl py-3 font-bold text-sm"
        >
          📊 月間レポートを見る
        </Link>
      </div>
    </main>
  );
}
