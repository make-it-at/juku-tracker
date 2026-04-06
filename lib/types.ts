export type JukuRecord = {
  id: string;
  title: string;
  date: string;        // ISO date (YYYY-MM-DD)
  checkIn: string;     // HH:MM
  checkOut: string;    // HH:MM
  durationMin: number; // 滞在時間（分）
  durationH: string;   // 滞在時間（h）表示用
  memo: string;
};
