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
    const [streakRow, setStreakRow] = useState<("empty" | "check" | "plus" | "bookmark" | "rect")[]>(
        ["plus", "plus", "plus", "plus", "bookmark"]
    );
    const [lineChartData, setLineChartData] = useState<any>(null);
    const [hasRealData, setHasRealData] = useState<boolean>(false);
    const [daysInMonth, setDaysInMonth] = useState(31);
    const [moodStats, setMoodStats] = useState<any[]>([]);

    // Get records from Redux store
    const { records } = useAppSelector((state) => state.records);

    // Load user data and streaks on component mount
    useEffect(() => {
        const loadUserAndStreaks = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);

                    // Fetch real mood statistics
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth() + 1;
                    
                    const res = await fetch(
                        `${API_URL}/api/v1/records/statistic/mood?user_id=${parsedUser.id}&month=${month}&year=${year}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    
                    const data = await res.json();
                    const dailyStats = data?.data?.monthly?.dailyMoodStats || [];
                    setMoodStats(dailyStats);

                    // Calculate longest streak from start of month up to and including today
                    let maxStreak = 0,
                        curStreak = 0;
                    const start = new Date(year, month - 1, 1);
                    const realToday = new Date();
                    const isCurrentMonth =
                        realToday.getFullYear() === year &&
                        realToday.getMonth() + 1 === month;
                    const lastDay = isCurrentMonth
                        ? realToday.getDate()
                        : new Date(year, month, 0).getDate();
                    
                    for (let i = 0; i < lastDay; i++) {
                        const d = new Date(year, month - 1, 1 + i);
                        const dateStr = d.toISOString().slice(0, 10);
                        const found = dailyStats.find((ds: any) => ds.date === dateStr);
                        if (found && found.totalRecords > 0) {
                            curStreak++;
                            if (curStreak > maxStreak) maxStreak = curStreak;
                        } else {
                            curStreak = 0;
                        }
                    }
                    
                    // Check today
                    const todayDate = new Date(year, month - 1, lastDay);
                    const todayStr = todayDate.toISOString().slice(0, 10);
                    const todayFound = dailyStats.find((ds: any) => ds.date === todayStr);
                    if (todayFound && todayFound.totalRecords > 0) {
                        curStreak++;
                        if (curStreak > maxStreak) maxStreak = curStreak;
                    } else {
                        curStreak = 0;
                    }
                    setLongestStreak(maxStreak);

                    // Prepare streak row (4 previous days + today as yellow)
                    let streakArr: ("empty" | "check" | "plus" | "bookmark" | "rect")[] = [];
                    for (let i = 3; i >= 0; i--) {
                        let d = new Date(
                            realToday.getFullYear(),
                            realToday.getMonth(),
                            realToday.getDate() - i
                        );
                        if (d.getMonth() + 1 !== month || d > realToday) {
                            streakArr.push("empty");
                            continue;
                        }
                        const dateStr = d.toISOString().slice(0, 10);
                        const found = dailyStats.find((ds: any) => ds.date === dateStr);
                        streakArr.push(found && found.totalRecords > 0 ? "check" : "plus");
                    }
                    // Today (yellow)
                    streakArr.push("bookmark");
                    // Rectangle (visual only)
                    streakArr.push("rect");
                    setStreakRow(streakArr);
                }
            } catch (err) {
                console.error("Failed to load user data or streaks:", err);
                setError("Failed to load user data");
                // Set default values if there's an error
                setStreakRow(["plus", "plus", "plus", "plus", "bookmark", "rect"]);
                setLongestStreak(0);
            }
        };

        loadUserAndStreaks();
    }, [currentDate]);

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
                const response = await fetchActivityStatistics(user.id, month, year);

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
            <StreakRow streak={streakRow} longestStreak={longestStreak} />

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
        paddingTop: 10,
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
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    viewMoreContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewMoreText: {
        fontSize: 14,
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