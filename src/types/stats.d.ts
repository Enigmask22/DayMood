import { ImageSourcePropType } from "react-native";
import { ReactNode } from "react";

interface MoodStat {
    moodId: number;
    count: number;
    percentage?: number; // Optional as it's not in dailyMoodStats's moodStats
}

interface MostFrequentMood {
    moodId: number;
    count: number;
    percentage: number;
}

interface DailyMoodStat {
    date: string;
    moodStats: Array<{ moodId: number; count: number }>; // Simplified for daily, no percentage
    totalRecords: number;
}

interface WeeklyStats {
    moodStats: MoodStat[];
    mostFrequentMood: MostFrequentMood;
    totalRecords: number;
}

interface MonthlyStats {
    moodStats: MoodStat[];
    dailyMoodStats: DailyMoodStat[];
    mostFrequentMood: MostFrequentMood;
    totalRecords: number;
    month: number;
    year: number;
}

export interface ScreenItem {
    title: string;
    content: string | ReactNode;
    emoji: ImageSourcePropType | undefined;
    indicator: boolean[];
}

export interface StatisticData {
    weekly: WeeklyStats;
    monthly: MonthlyStats;
}