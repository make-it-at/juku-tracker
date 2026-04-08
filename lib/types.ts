export type Facility = 'atama+塾' | 'セントラルフィットネス';

export type TrackingRecord = {
  id: string;
  title: string;
  facility: Facility;
  date: string;        // ISO date (YYYY-MM-DD)
  checkIn: string;     // HH:MM
  checkOut: string;    // HH:MM
  durationMin: number; // 滞在時間（分）— セントラルは0
  durationH: string;   // 滞在時間（h）表示用
  memo: string;
};

// 後方互換エイリアス
export type JukuRecord = TrackingRecord;
