'use client';

import { getStreakBadge } from '@/lib/levels';

type Props = {
  streak: number;
};

export default function StreakCard({ streak }: Props) {
  const badge = getStreakBadge(streak);

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">連続通塾日数</span>
        {badge && (
          <span className="text-xs bg-white/20 rounded-full px-2 py-1">
            {badge.badge} {badge.label}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-6xl font-black">{streak}</span>
        <span className="text-xl mb-2 opacity-80">日連続</span>
      </div>
      <div className="mt-2 text-xs opacity-70">
        {streak === 0
          ? '今日から始めよう！'
          : streak >= 30
          ? '⚡ 伝説のストリーク継続中！'
          : streak >= 14
          ? '🔥🔥🔥 2週間突破！すごい！'
          : streak >= 7
          ? '🔥🔥 1週間継続中！'
          : streak >= 3
          ? '🔥 いい調子！続けよう！'
          : '継続中！このまま頑張れ！'}
      </div>
    </div>
  );
}
