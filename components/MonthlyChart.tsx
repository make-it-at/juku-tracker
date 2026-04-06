'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { JukuRecord } from '@/lib/types';
import { useMemo } from 'react';

type Props = {
  records: JukuRecord[];
  year: number;
  month: number;
};

type DayData = {
  day: string;
  hours: number;
};

export default function MonthlyChart({ records, year, month }: Props) {
  const data: DayData[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      if (!r.date) continue;
      const [y, m] = r.date.split('-').map(Number);
      if (y !== year || m !== month) continue;
      map.set(r.date, (map.get(r.date) ?? 0) + r.durationMin);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, min]) => ({
        day: date.split('-')[2],
        hours: Math.round((min / 60) * 10) / 10,
      }));
  }, [records, year, month]);

  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
      <h3 className="text-white text-sm font-medium opacity-80 mb-4">日別学習時間</h3>
      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-8 text-sm">この月の記録はまだありません</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} unit="h" />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(v) => [`${v}h`, '学習時間']}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill="#3b82f6" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
