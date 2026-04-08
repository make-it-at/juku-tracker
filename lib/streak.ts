import { TrackingRecord } from './types';

function toJSTDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+09:00`);
}

function todayJST(): Date {
  const now = new Date();
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  jst.setHours(0, 0, 0, 0);
  return jst;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 通塾・通ジム日（ユニーク）を降順で返す（施設問わず合算）
 */
export function getAttendanceDates(records: TrackingRecord[]): string[] {
  const dates = new Set(records.map((r) => r.date).filter(Boolean));
  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}

/**
 * 連続通所日数（塾 or ジムどちらかで継続）
 * - 今日 or 昨日にどちらかに行っていれば継続
 * - 土日はスキップ可能
 */
export function calcStreak(records: TrackingRecord[]): number {
  const dates = getAttendanceDates(records);
  if (dates.length === 0) return 0;

  const today = todayJST();
  const latestDate = toJSTDate(dates[0]);
  const daysSinceLatest = diffDays(today, latestDate);

  if (daysSinceLatest > 3) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = toJSTDate(dates[i - 1]);
    const curr = toJSTDate(dates[i]);
    const diff = diffDays(prev, curr);

    if (diff === 1) { streak++; continue; }

    if (diff <= 3) {
      const skipped = Array.from({ length: diff - 1 }, (_, k) => {
        const d = new Date(curr.getTime() + (k + 1) * 24 * 60 * 60 * 1000);
        return d.getDay();
      });
      if (skipped.every((day) => day === 0 || day === 6)) { streak++; continue; }
    }

    break;
  }

  return streak;
}

/**
 * 今月の塾累計時間（時間）
 */
export function calcMonthlyJukuHours(records: TrackingRecord[], year: number, month: number): number {
  const filtered = records.filter((r) => {
    if (!r.date || r.facility !== 'atama+塾') return false;
    const [y, m] = r.date.split('-').map(Number);
    return y === year && m === month;
  });
  return filtered.reduce((sum, r) => sum + r.durationMin, 0) / 60;
}

/**
 * 今月のセントラル通所回数
 */
export function calcMonthlyGymCount(records: TrackingRecord[], year: number, month: number): number {
  return records.filter((r) => {
    if (!r.date || r.facility !== 'セントラルフィットネス') return false;
    const [y, m] = r.date.split('-').map(Number);
    return y === year && m === month;
  }).length;
}

/**
 * 全期間の塾累計時間（時間）— レベル計算用
 */
export function calcTotalHours(records: TrackingRecord[]): number {
  return records
    .filter((r) => r.facility === 'atama+塾')
    .reduce((sum, r) => sum + r.durationMin, 0) / 60;
}

// 後方互換
export const calcMonthlyHours = calcMonthlyJukuHours;
