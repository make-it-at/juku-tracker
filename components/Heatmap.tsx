'use client';

import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { TrackingRecord } from '@/lib/types';
import { useMemo } from 'react';

type Props = {
  records: TrackingRecord[];
};

type DayStats = {
  date: string;
  jukuMin: number;
  gymCount: number;
};

// 色クラス決定ロジック
// 塾のみ=緑、ジムのみ=青、両方=紫
function getColorClass(stats: DayStats): string {
  const hasJuku = stats.jukuMin > 0;
  const hasGym = stats.gymCount > 0;

  if (hasJuku && hasGym) return 'color-both';

  if (hasJuku) {
    if (stats.jukuMin <= 60)  return 'color-juku-1';
    if (stats.jukuMin <= 120) return 'color-juku-2';
    if (stats.jukuMin <= 180) return 'color-juku-3';
    return 'color-juku-4';
  }

  if (hasGym) return 'color-gym';

  return 'color-empty';
}

export default function Heatmap({ records }: Props) {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const values = useMemo(() => {
    const map = new Map<string, DayStats>();
    for (const r of records) {
      if (!r.date) continue;
      const existing = map.get(r.date) ?? { date: r.date, jukuMin: 0, gymCount: 0 };
      if (r.facility === '塾') existing.jukuMin += r.durationMin;
      if (r.facility === 'セントラルフィットネス') existing.gymCount += 1;
      map.set(r.date, existing);
    }
    return Array.from(map.values());
  }, [records]);

  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow-lg">
      <h3 className="text-white text-sm font-medium mb-3 opacity-80">通所ヒートマップ（直近3ヶ月）</h3>
      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={threeMonthsAgo}
          endDate={today}
          values={values}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return getColorClass(value as DayStats);
          }}
          showWeekdayLabels
        />
      </div>
      {/* 凡例 */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {['bg-green-900','bg-green-600','bg-green-500','bg-green-400'].map((c,i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
          </div>
          <span>塾（時間↑）</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>ジム</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-purple-500" />
          <span>両方</span>
        </div>
      </div>
      <style>{`
        .react-calendar-heatmap .color-empty   { fill: #374151; }
        .react-calendar-heatmap .color-juku-1  { fill: #14532d; }
        .react-calendar-heatmap .color-juku-2  { fill: #16a34a; }
        .react-calendar-heatmap .color-juku-3  { fill: #22c55e; }
        .react-calendar-heatmap .color-juku-4  { fill: #4ade80; }
        .react-calendar-heatmap .color-gym     { fill: #3b82f6; }
        .react-calendar-heatmap .color-both    { fill: #a855f7; }
        .react-calendar-heatmap text { fill: #9ca3af; font-size: 8px; }
      `}</style>
    </div>
  );
}
