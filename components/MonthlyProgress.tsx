'use client';

type Props = {
  currentHours: number;
  targetHours?: number;
};

export default function MonthlyProgress({ currentHours, targetHours = 20 }: Props) {
  const pct = Math.min((currentHours / targetHours) * 100, 100);
  const achieved = pct >= 100;

  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white text-sm font-medium opacity-80">今月の学習時間</h3>
        {achieved && (
          <span className="text-xs bg-yellow-400 text-gray-900 font-bold rounded-full px-2 py-0.5 animate-bounce">
            🎉 目標達成！
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-black text-white">{currentHours.toFixed(1)}</span>
        <span className="text-gray-400 text-sm mb-1">/ {targetHours}h</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            achieved
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
              : 'bg-gradient-to-r from-blue-500 to-blue-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-400 mt-1">{pct.toFixed(0)}%</div>
    </div>
  );
}
