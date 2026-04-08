'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { TrackingRecord } from '@/lib/types';
import { useMemo } from 'react';

type Props = {
  records: TrackingRecord[];
  year: number;
  month: number;
};

type DayData = {
  day: string;
  juku: number;  // 塾（時間）
  gym: number;   // ジム（1 = 来館、0 = なし）
};

export default function MonthlyChart({ records, year, month }: Props) {
  const data: DayData[] = useMemo(() => {
    const map = new Map<string, DayData>();
    for (const r of records) {
      if (!r.date) continue;
      const [y, m] = r.date.split('-').map(Number);
      if (y !== year || m !== month) continue;
      const day = r.date.split('-')[2];
      const existing = map.get(day) ?? { day, juku: 0, gym: 0 };
      if (r.facility === '塾') existing.juku = Math.round((existing.juku * 60 + r.durationMin) / 60 * 10) / 10;
      if (r.facility === 'セントラルフィットネス') existing.gym = 1;
      map.set(day, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [records, year, month]);

  const hasJuku = records.some((r) => r.facility === '塾');
  const hasGym  = records.some((r) => r.facility === 'セントラルフィットネス');

  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
      <h3 className="text-white text-sm font-medium opacity-80 mb-4">日別記録</h3>
      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-8 text-sm">この月の記録はまだありません</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(v, name) => [
                name === 'juku' ? `${v}h` : v === 1 ? '来館' : '-',
                name === 'juku' ? '塾' : 'ジム',
              ]}
            />
            <Legend
              formatter={(value) => value === 'juku' ? '塾' : 'ジム'}
              wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
            />
            {hasJuku && (
              <Bar dataKey="juku" name="juku" radius={[4, 4, 0, 0]} fill="#22c55e" />
            )}
            {hasGym && (
              <Bar dataKey="gym" name="gym" radius={[4, 4, 0, 0]} fill="#3b82f6" />
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
