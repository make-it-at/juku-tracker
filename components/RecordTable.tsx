'use client';

import { TrackingRecord } from '@/lib/types';

type Props = {
  records: TrackingRecord[];
};

const facilityBadge = (f: string) =>
  f === 'セントラルフィットネス'
    ? <span className="text-xs bg-blue-600 text-white rounded px-1.5 py-0.5">ジム</span>
    : <span className="text-xs bg-green-700 text-white rounded px-1.5 py-0.5">atama+塾</span>;

export default function RecordTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
        <p className="text-gray-400 text-center py-4 text-sm">記録がありません</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
      <h3 className="text-white text-sm font-medium opacity-80 mb-3">通所記録</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-2 pr-2">施設</th>
            <th className="text-left py-2 pr-2">日付</th>
            <th className="text-left py-2 pr-2">入室</th>
            <th className="text-left py-2 pr-2">退室</th>
            <th className="text-right py-2">時間</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-gray-700/50 text-gray-200 hover:bg-gray-700/30">
              <td className="py-2 pr-2">{facilityBadge(r.facility)}</td>
              <td className="py-2 pr-2 font-mono text-xs">{r.date}</td>
              <td className="py-2 pr-2">{r.checkIn || '-'}</td>
              <td className="py-2 pr-2">{r.checkOut || '-'}</td>
              <td className="py-2 text-right font-mono text-xs">
                {r.facility === 'セントラルフィットネス'
                  ? <span className="text-blue-400">-</span>
                  : <span className="text-green-400">{r.durationH || `${r.durationMin}分`}</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
