'use client';

type Props = {
  jukuHours: number;
  gymCount: number;
  targetJukuHours?: number;
  targetGymCount?: number;
};

function ProgressBar({
  label,
  current,
  target,
  unit,
  colorClass,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClass: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const achieved = pct >= 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-xs">{label}</span>
        {achieved && (
          <span className="text-xs bg-yellow-400 text-gray-900 font-bold rounded-full px-2 py-0.5 animate-bounce">
            🎉 達成！
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-black text-white">
          {unit === 'h' ? current.toFixed(1) : current}
        </span>
        <span className="text-gray-400 text-sm mb-0.5">/ {target}{unit}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            achieved ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : colorClass
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-400 mt-0.5">{pct.toFixed(0)}%</div>
    </div>
  );
}

export default function MonthlyProgress({
  jukuHours,
  gymCount,
  targetJukuHours = 20,
  targetGymCount = 8,
}: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
      <h3 className="text-white text-sm font-medium opacity-80 mb-4">今月の目標</h3>
      <div className="flex flex-col gap-5">
        <ProgressBar
          label="📚 塾（学習時間）"
          current={jukuHours}
          target={targetJukuHours}
          unit="h"
          colorClass="bg-gradient-to-r from-green-600 to-green-400"
        />
        <ProgressBar
          label="🏋️ セントラル（通所回数）"
          current={gymCount}
          target={targetGymCount}
          unit="回"
          colorClass="bg-gradient-to-r from-blue-600 to-blue-400"
        />
      </div>
    </div>
  );
}
