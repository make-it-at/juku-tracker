'use client';

import { getCurrentLevel, getNextLevel, LEVELS } from '@/lib/levels';

type Props = {
  totalHours: number;
};

export default function LevelBadge({ totalHours }: Props) {
  const current = getCurrentLevel(totalHours);
  const next = getNextLevel(totalHours);
  const pct = next
    ? Math.min(
        ((totalHours - current.requiredHours) / (next.requiredHours - current.requiredHours)) * 100,
        100
      )
    : 100;

  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
      <h3 className="text-white text-sm font-medium opacity-80 mb-3">レベル</h3>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{current.badge}</span>
        <div>
          <div className="text-white font-bold text-lg">Lv.{current.level} {current.name}</div>
          <div className="text-gray-400 text-xs">累計 {totalHours.toFixed(1)}h</div>
        </div>
      </div>
      {next ? (
        <>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{current.name}</span>
            <span>次: {next.badge} {next.name} まであと {(next.requiredHours - totalHours).toFixed(1)}h</span>
          </div>
        </>
      ) : (
        <div className="text-yellow-400 text-sm font-bold text-center mt-2">
          👑 最高レベル到達！おめでとう！
        </div>
      )}
      <div className="flex gap-1 mt-3 justify-center">
        {LEVELS.map((l) => (
          <div
            key={l.level}
            className={`text-lg transition-all ${
              totalHours >= l.requiredHours ? 'opacity-100 scale-110' : 'opacity-30 scale-90'
            }`}
            title={`Lv${l.level} ${l.name} (${l.requiredHours}h〜)`}
          >
            {l.badge}
          </div>
        ))}
      </div>
    </div>
  );
}
