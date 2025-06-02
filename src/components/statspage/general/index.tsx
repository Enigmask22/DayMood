import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StreakRow from "@/components/statspage/general/StreakRow";
import EmotionPage from "@/components/statspage/emotion";
import ActivityLineChart from "@/components/statistics/ActivityLineChart";
import { fetchActivityStatistics } from "@/components/statspage/activity/datafetching";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "@/store";
import { HOME_COLOR } from "@/utils/constant";
import { API_URL } from "@/utils/config";
import { selectTimezone } from "@/store/slices/timezoneSlice";
const { height } = Dimensions.get("window");

interface GeneralPageProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    onTabChange: (tabId: string) => void;
}

const GeneralPage: React.FC<GeneralPageProps> = ({
  currentDate,
  setCurrentDate,
  onTabChange
}) => {
    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [longestStreak, setLongestStreak] = useState(0);
    // Change to use array type for streak
    const [streakRow, setStreakRow] = useState<("empty" | "check" | "plus" | "bookmark")[]>(
        ["plus", "plus", "plus", "plus", "bookmark"]
    );
    const [streakDates, setStreakDates] = useState<Date[]>([]); // Store dates for streak icons
    const [lineChartData, setLineChartData] = useState<any>(null);
    const [hasRealData, setHasRealData] = useState<boolean>(false);
    const [daysInMonth, setDaysInMonth] = useState(31);
    const [moodStats, setMoodStats] = useState<any[]>([]);

    // Get records from Redux store
    const { records } = useAppSelector((state) => state.records);
    const timezone = useAppSelector(selectTimezone);

    // Define loadUserAndStreaks function for initial load and for refreshing when records change
    const loadUserAndStreaks = async () => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem("user");
            if (userData) {                    
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);                    
                // We need to fetch mood data for the last 5 days from today
                // This might span across two months, so we need to be smart about it
                // Get today's date in local timezone
                const realToday = new Date();
                console.log("Timezone from Redux:", timezone);
                const timezoneOffset = new Date().getTimezoneOffset() * -1;
                console.log("Local timezone offset in minutes:", timezoneOffset);
                
                // Calculate which months we need data for based on timezone offset
                // The API may store dates in UTC, so we need to consider that when requesting months
                const monthsToFetch = new Set<string>();
                    
                // Include current month always
                const currentMonthStr = String(realToday.getMonth() + 1).padStart(2, '0');
                monthsToFetch.add(`${realToday.getFullYear()}-${currentMonthStr}`);
                
                // Check if we need data from previous or next month due to timezone differences
                // Get day of month - if close to start/end of month, we might need adjacent months
                const dayOfMonth = realToday.getDate();
                const daysInMonth = new Date(realToday.getFullYear(), realToday.getMonth() + 1, 0).getDate();
                
                // If we're within 5 days of the start of the month, also fetch previous month
                if (dayOfMonth <= 5) {
                    const prevMonth = realToday.getMonth() === 0 ? 12 : realToday.getMonth();
                    const prevYear = realToday.getMonth() === 0 ? realToday.getFullYear() - 1 : realToday.getFullYear();
                    const prevMonthStr = String(prevMonth).padStart(2, '0');
                    monthsToFetch.add(`${prevYear}-${prevMonthStr}`);
                }
                
                // If we're within 5 days of the end of the month, also fetch next month
                if (dayOfMonth >= daysInMonth - 5) {
                    const nextMonth = realToday.getMonth() === 11 ? 1 : realToday.getMonth() + 2;
                    const nextYear = realToday.getMonth() === 11 ? realToday.getFullYear() + 1 : realToday.getFullYear();
                    const nextMonthStr = String(nextMonth).padStart(2, '0');
                    monthsToFetch.add(`${nextYear}-${nextMonthStr}`);
                }
                
                console.log("Months to fetch for streak:", Array.from(monthsToFetch));
                
                // Fetch data for all needed months
                let allDailyStats: any[] = [];                    
                for (const monthYear of monthsToFetch) {
                    const [year, monthStr] = monthYear.split('-');
                    const month = parseInt(monthStr, 10); // Parse as base-10 integer
                    
                    try {
                        const res = await fetch(
                            `${API_URL}/api/v1/records/statistic/mood?user_id=${parsedUser.id}&month=${month}&year=${year}&timezone=${timezone}`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            }
                        );
                        
                        const data = await res.json();
                        const monthlyStats = data?.data?.monthly?.dailyMoodStats || [];
                        allDailyStats = [...allDailyStats, ...monthlyStats];
                    } catch (error) {
                        console.error(`Failed to fetch data for ${year}-${month}:`, error);
                    }
                }
                
                // For the main stats display, still fetch the current viewed month
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                
                const res = await fetch(
                    `${API_URL}/api/v1/records/statistic/mood?user_id=${parsedUser.id}&month=${month}&year=${year}&timezone=${timezone}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await res.json();
                const dailyStats = data?.data?.monthly?.dailyMoodStats || [];
                
                // Log the dates that have records for debugging
                const recordDaysWithData = dailyStats
                    .filter((day: any) => day.totalRecords > 0)
                    .map((day: any) => day.date);
                console.log("Days with records in current month:", recordDaysWithData);
                
                setMoodStats(dailyStats);
                
                // Calculate longest streak for CURRENT MONTH ONLY with timezone consideration
                let maxStreak = 0,
                    curStreak = 0;
                
                const isCurrentMonth =
                    realToday.getFullYear() === year &&
                    realToday.getMonth() + 1 === month;
                  // This will correctly get the last day of the month accounting for timezone
                const lastDay = isCurrentMonth
                    ? realToday.getDate()
                    : new Date(year, month, 0).getDate();
                
                // Only calculate streak for current month
                if (isCurrentMonth) {
                    console.log(`Calculating streak for month ${month}/${year} up to day ${lastDay}`);
                    
                    // Get all days that have records
                    const daysWithRecords = dailyStats
                        .filter((ds: any) => ds.totalRecords > 0)
                        .map((ds: any) => {
                            // Extract the day from the date string (format: YYYY-MM-DD)
                            const day = parseInt(ds.date.split('-')[2], 10);
                            return day;
                        })
                        .sort((a: number, b: number) => a - b); // Sort days in ascending order
                    
                    console.log("Days with records:", daysWithRecords);
                    
                    // Handle case with no records
                    if (daysWithRecords.length === 0) {
                        maxStreak = 0;
                        console.log("No records found, max streak = 0");
                    } else {
                        // Calculate the longest streak by checking for consecutive days
                        curStreak = 0;
                        maxStreak = 0;
                        
                        // Improved algorithm that properly handles non-consecutive days
                        for (let i = 0; i < daysWithRecords.length; i++) {
                            if (i === 0) {
                                // First day with a record starts a streak
                                curStreak = 1;
                            } else if (daysWithRecords[i] === daysWithRecords[i-1] + 1) {
                                // Only consecutive days contribute to streak
                                curStreak++;
                            } else {
                                // Non-consecutive day breaks the streak and starts a new one
                                // Update max streak before resetting
                                if (curStreak > maxStreak) {
                                    maxStreak = curStreak;
                                }
                                // Start a new streak with this day
                                curStreak = 1;
                            }
                            
                            // Update max streak at each step (including the last day)
                            if (curStreak > maxStreak) {
                                maxStreak = curStreak;
                            }
                            console.log(`Day ${daysWithRecords[i]}: Current streak = ${curStreak}, Max streak = ${maxStreak}`);
                        }
                    }
                }
                setLongestStreak(maxStreak);
                
                // Prepare streak row (4 previous days + today) - ONLY 5 CIRCLES
                // Use allDailyStats which contains data from all needed months
                let streakArr: ("empty" | "check" | "plus" | "bookmark")[] = [];
                let dateArr: Date[] = [];
                
                console.log("Debug - Building streak for past 5 days:");
                console.log("Current date being viewed:", currentDate);
                console.log("Real today:", realToday);
                
                // Log records found from API for debugging
                const recordsWithDates = allDailyStats
                    .filter((ds: any) => ds.totalRecords > 0)
                    .map((ds: any) => `${ds.date}: ${ds.totalRecords} records`);
                console.log("Records from API:", recordsWithDates);
                
                // For the streak visualization, we need dates in local timezone
                // Calculate the last 5 days including today
                const streakDates: string[] = [];
                
                // First get today's date formatted as YYYY-MM-DD in user's timezone
                const userTodayStr = `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, '0')}-${String(realToday.getDate()).padStart(2, '0')}`;
                streakDates.push(userTodayStr);
                
                // Then get the previous 4 days
                for (let i = 1; i <= 4; i++) {
                    const d = new Date(realToday);
                    d.setDate(d.getDate() - i);
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    streakDates.unshift(dateStr); // Add to beginning of array to maintain chronological order
                }
                
                console.log("Streak dates to check:", streakDates);
                
                // Now build the streak array based on these dates
                for (let i = 0; i < 4; i++) { // First 4 days (not including today)
                    const dateStr = streakDates[i];
                    // Store original Date object for navigation
                    const [year, month, day] = dateStr.split('-').map(Number);
                    dateArr.push(new Date(year, month - 1, day));
                    
                    const found = allDailyStats.find((ds: any) => ds.date === dateStr);
                    console.log(`Day ${i+1} (${dateStr}):`, found ? `Found ${found.totalRecords} records` : "No records found");
                    
                    // Only show empty if the date is in the future
                    const dateObj = new Date(year, month - 1, day);
                    if (dateObj > realToday) {
                        streakArr.push("empty");
                    } else {
                        streakArr.push(found && found.totalRecords > 0 ? "check" : "plus");
                    }
                }
                
                // Today - check if there's a mood record for today
                const todayStr = streakDates[4]; // Last date is today
                const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
                dateArr.push(new Date(todayYear, todayMonth - 1, todayDay));
                
                const todayFound = allDailyStats.find((ds: any) => ds.date === todayStr);
                console.log(`Today (${todayStr}):`, todayFound ? `Found ${todayFound.totalRecords} records` : "No records found");
                
                // If today has records, show as "bookmark", otherwise show as "plus"
                if (todayFound && todayFound.totalRecords > 0) {
                    streakArr.push("bookmark");
                } else {
                    streakArr.push("plus");
                }
                // Note: today's date is already added to dateArr earlier
                
                console.log("Final streak array:", streakArr);
                
                setStreakRow(streakArr);
                setStreakDates(dateArr);
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to load user data or streaks:", err);
            setError("Failed to load user data");
            // Set default values if there's an error
            setStreakRow(["plus", "plus", "plus", "plus", "bookmark"]);
            setStreakDates([]);
            setLongestStreak(0);
            setLoading(false);
        }
    };

    // Load user data and streaks on component mount or when records change
    useEffect(() => {
        loadUserAndStreaks();
    }, [currentDate, records]); // Added records to dependencies to refresh streak when new records are added/removed

    // Fetch activity data for the line chart when user or currentDate changes
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return; // Skip if no user loaded yet

            try {
                setLoading(true);
                setError(null);

                // Extract month and year from the currentDate
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();

                // Calculate days in month
                const daysInCurrentMonth = new Date(year, month, 0).getDate();
                setDaysInMonth(daysInCurrentMonth);

                // Fetch activity statistics using the user ID
                const response = await fetchActivityStatistics(user.id, month, year,timezone);

                if (response.statusCode === 200 && response.data?.monthly) {
                    const { activityData, dates } = response.data.monthly;

                    // Process data for the line chart
                    let dailyTotals = Array(daysInCurrentMonth).fill(0);

                    // Sum all activities for each day
                    dates.forEach((dateStr: string, dateIndex: number) => {
                        let dailyTotal = 0;

                        Object.values(activityData).forEach((dailyCounts: number[]) => {
                            dailyTotal += dailyCounts[dateIndex] || 0;
                        });

                        const day = new Date(dateStr).getDate();
                        if (day >= 1 && day <= daysInCurrentMonth) {
                            dailyTotals[day - 1] = dailyTotal;
                        }
                    });

                    // Create labels for all days
                    const chartLabels = Array.from(
                        { length: daysInCurrentMonth },
                        (_, i) => `${i + 1}`
                    );

                    setLineChartData({
                        labels: chartLabels,
                        datasets: [
                            {
                                data: dailyTotals,
                                color: () => HOME_COLOR.HOMETABBAR,
                                strokeWidth: 2,
                            },
                        ],
                    });

                    // Determine if we have real data
                    const hasAnyActivities = dailyTotals.some(count => count > 0);
                    setHasRealData(hasAnyActivities);

                } else {
                    throw new Error("Invalid response from server");
                }
            } catch (err) {
                console.error('Error loading activity statistics for general page:', err);
                setHasRealData(false);

                // Generate fallback data for the line chart
                const daysInCurrentMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                ).getDate();

                const chartLabels = Array.from(
                    { length: daysInCurrentMonth },
                    (_, i) => `${i + 1}`
                );

                const randomData = Array.from({ length: daysInCurrentMonth }, () =>
                    Math.floor(Math.random() * 5) + 1
                );

                setLineChartData({
                    labels: chartLabels,
                    datasets: [
                        {
                            data: randomData,
                            color: () => HOME_COLOR.HOMETABBAR,
                            strokeWidth: 2,
                        },
                    ],
                });

                setDaysInMonth(daysInCurrentMonth);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentDate, user, records]);

    // Render loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
                <Text style={styles.loadingText}>Loading statistical data...</Text>
            </View>
        );
    }

    // Render error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // Render main content
    return (
        <View style={styles.container}>
            {/* Use streakRow directly with the StreakRow component */}
            <StreakRow streak={streakRow} longestStreak={longestStreak} streakDates={streakDates} />

            {/* Mood Insights Card */}
            <TouchableOpacity
                style={styles.moodcard}
                activeOpacity={0.99}
                onPress={() => onTabChange("emotion")}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Mood Insights</Text>
                    <View style={styles.viewMoreContainer}>
                        <Text style={styles.viewMoreText}>View details</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <EmotionPage
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        showMoodChartOnly={true}
                    />
                </View>
            </TouchableOpacity>

            {/* Activity Overview Card */}
            <TouchableOpacity
                style={styles.activitycard}
                activeOpacity={0.9}
                onPress={() => onTabChange("activity")}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Activity Overview</Text>
                    <View style={styles.viewMoreContainer}>
                        <Text style={styles.viewMoreText}>View details</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    {lineChartData && (
                        <ActivityLineChart
                            lineChartData={lineChartData}
                            daysInMonth={daysInMonth}
                            hasRealData={hasRealData}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // Styles remain unchanged
    container: {
        flex: 1,
        paddingBottom: height * 0.14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Inter-Light',
        color: HOME_COLOR.HOMETEXT,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
    },
    statisticsHeader: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 15,
        color: "#333",
    },
    moodcard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        height: height*0.55,
        marginHorizontal: 16,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activitycard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        height: height * 0.44,
        padding: 15,
        marginHorizontal: 16,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: "Quicksand-Bold",
        color: "#333",
    },
    viewMoreContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewMoreText: {
        fontSize: 14,
        fontFamily: "Inter-Light",
        color: "#666",
        marginRight: 5,
    },
    chartContainer: {
        height: height * 0.5,
        marginTop: 10,
        overflow: 'hidden',
    },
});

export default GeneralPage;
