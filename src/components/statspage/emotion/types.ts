export interface MoodStat {
  moodId: number;
  count: number;
  percentage?: number;
}

export interface DailyMoodStat {
  date: string;
  moodStats: MoodStat[];
  totalRecords: number;
}

export interface ChartWeekData {
  days: DayData[];
  startDate: string;
  endDate: string;
}

export interface DayData {
  date: string;
  day: string;
  moodCounts: {[moodId: number]: number};
  totalRecords: number;
  hasData: boolean;
}

export interface TooltipData {
  visible: boolean;
  date: string;
  day: string;
  position: {x: number, y: number};
  moods: Array<{
    moodId: number;
    moodName: string;
    moodColor: string;
    count: number;
    percentage: number;
  }>;
  totalCount: number;
}