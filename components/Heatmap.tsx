'use client';

import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { JukuRecord } from '@/lib/types';
import { useMemo } from 'react';

type Props = {
  records: JukuRecord[];
};

type HeatmapValue = {
  date: string;
  count: number; // 分
};

function getColorClass(minutes: number): string {
  if (minutes === 0) return 'color-empty';
  if (minutes <= 60) return 'color-scale-1';
  if (minutes <= 120) return 'color-scale-2';
  if (minutes <= 180) return 'color-scale-3';
  return 'color-scale-4';
}

export default function Heatmap({ records }: Props) {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const values: HeatmapValue[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      if (!r.date) continue;
      map.set(r.date, (map.get(r.date) ?? 0) + r.durationMin);
    }
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }, [records]);

  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow-lg">
      <h3 className="text-white text-sm font-medium mb-3 opacity-80">通塾ヒートマップ（直近3ヶ月）</h3>
      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={threeMonthsAgo}
          endDate={today}
          values={values}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return getColorClass(value.count);
          }}
          showWeekdayLabels
        />
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <span>少ない</span>
        <div className="flex gap-1">
          {['bg-gray-700', 'bg-green-900', 'bg-green-600', 'bg-green-500', 'bg-green-400'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>多い</span>
      </div>
      <style>{`
        .react-calendar-heatmap .color-empty { fill: #374151; }
        .react-calendar-heatmap .color-scale-1 { fill: #14532d; }
        .react-calendar-heatmap .color-scale-2 { fill: #16a34a; }
        .react-calendar-heatmap .color-scale-3 { fill: #22c55e; }
        .react-calendar-heatmap .color-scale-4 { fill: #4ade80; }
        .react-calendar-heatmap text { fill: #9ca3af; font-size: 8px; }
      `}</style>
    </div>
  );
}
