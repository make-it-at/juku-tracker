export type Level = {
  level: number;
  name: string;
  badge: string;
  requiredHours: number;
};

export const LEVELS: Level[] = [
  { level: 1, name: 'ビギナー',     badge: '🥉', requiredHours: 0 },
  { level: 2, name: 'レギュラー',   badge: '🥈', requiredHours: 10 },
  { level: 3, name: 'エキスパート', badge: '🥇', requiredHours: 30 },
  { level: 4, name: 'マスター',     badge: '💎', requiredHours: 60 },
  { level: 5, name: 'レジェンド',   badge: '👑', requiredHours: 100 },
];

export type StreakBadge = {
  days: number;
  badge: string;
  label: string;
};

export const STREAK_BADGES: StreakBadge[] = [
  { days: 3,  badge: '🔥',     label: '3日連続' },
  { days: 7,  badge: '🔥🔥',   label: '7日連続' },
  { days: 14, badge: '🔥🔥🔥', label: '14日連続' },
  { days: 30, badge: '⚡',     label: '30日連続' },
];

export function getCurrentLevel(totalHours: number): Level {
  const sorted = [...LEVELS].reverse();
  return sorted.find((l) => totalHours >= l.requiredHours) ?? LEVELS[0];
}

export function getNextLevel(totalHours: number): Level | null {
  const current = getCurrentLevel(totalHours);
  const next = LEVELS.find((l) => l.level === current.level + 1);
  return next ?? null;
}

export function getStreakBadge(streakDays: number): StreakBadge | null {
  const sorted = [...STREAK_BADGES].reverse();
  return sorted.find((b) => streakDays >= b.days) ?? null;
}
