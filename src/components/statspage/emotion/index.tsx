import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { format, parseISO } from "date-fns";
import { HOME_COLOR, MOODS, moodAdviceMap } from "@/utils/constant";
import { API_ENDPOINTS } from "@/utils/config";
import { ScreenItem, StatisticData } from "@/types/stats";
import { renderSlideCard } from "./renderSlideCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "@/store";

// Import our new components
import MoodChart from "./MoodChart";
import WeekNavigation from "./WeekNavigation";
import MoodTooltip from "./MoodTooltip";

// Import types
import { ChartWeekData, DayData, TooltipData, DailyMoodStat } from "./types";
import { selectTimezone } from "@/store/slices/timezoneSlice";

const { width, height } = Dimensions.get("window");

// Number of days to show per week
const DAYS_PER_WEEK = 7;

interface EmotionPageProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  showMoodChartOnly?: boolean; // New prop to only show the chart
}

const EmotionPage: React.FC<EmotionPageProps> = ({
  currentDate,
  setCurrentDate,
  showMoodChartOnly = false, // Default to false
}) => {
  // State management
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [screens, setScreens] = useState<ScreenItem[]>([]);
  const [statistic, setStatistic] = useState<StatisticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [chartWeeks, setChartWeeks] = useState<ChartWeekData[]>([]);
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    date: "",
    day: "",
    position: { x: 0, y: 0 },
    moods: [],
    totalCount: 0,
  });

  // Refs
  const flatListRef = useRef<FlatList>(null);

  // Redux store
  const { records } = useAppSelector((state) => state.records);
  const timezone = useAppSelector(selectTimezone);
  // Process the API data into weekly charts data
  const processChartData = () => {
    if (!statistic || !statistic.monthly || !statistic.monthly.dailyMoodStats) {
      return [];
    }

    const { dailyMoodStats } = statistic.monthly;
    const daysInMonth = dailyMoodStats.length;

    // Group days into weeks
    const weeks: ChartWeekData[] = [];

    for (let startIdx = 0; startIdx < daysInMonth; startIdx += DAYS_PER_WEEK) {
      const weekDays: DayData[] = [];
      const endIdx = Math.min(startIdx + DAYS_PER_WEEK, daysInMonth);

      let startDate = "";
      let endDate = "";

      for (let i = startIdx; i < endIdx; i++) {
        const dailyStat = dailyMoodStats[i];
        const date = dailyStat.date;

        if (i === startIdx) startDate = date;
        if (i === endIdx - 1) endDate = date;

        // Get day of month number
        const day = date.split("-")[2];

        // Create mood counts object
        const moodCounts: { [key: number]: number } = {};
        let hasData = false;

        dailyStat.moodStats.forEach((stat) => {
          moodCounts[stat.moodId] = stat.count;
          if (stat.count > 0) hasData = true;
        });

        weekDays.push({
          date,
          day,
          moodCounts,
          totalRecords: dailyStat.totalRecords,
          hasData,
        });
      }

      // Format date range for this week
      const formattedStartDate = format(parseISO(startDate), "MMM d");
      const formattedEndDate = format(parseISO(endDate), "MMM d");
      const weekDateRange = `${formattedStartDate} - ${formattedEndDate}`;

      weeks.push({
        days: weekDays,
        startDate,
        endDate,
      });
    }

    return weeks;
  };

  // Create the data for the slide cards
  const createScreensData = () => {
    const weeklyStats = statistic?.weekly;
    const monthlyStats = statistic?.monthly;

    if (!weeklyStats || !monthlyStats) return;

    const findMoodById = (moodId: number) =>
      MOODS.find((mood) => mood.id === moodId);

    const getPercentage = (moodData: any, totalRecords: number) => {
      // If percentage is already provided in the data
      if (moodData.percentage !== undefined) {
        return Math.round(moodData.percentage);
      }

      // Otherwise calculate it from count and total records
      if (totalRecords > 0 && moodData.count !== undefined) {
        return Math.round((moodData.count / totalRecords) * 100);
      }

      return 0;
    };

    const screensData: ScreenItem[] = [
      {
        title: "This week",
        content: (
          <Text style={styles.screenContentText}>
            Your highest mood is{" "}
            <Text
              style={{
                color: findMoodById(weeklyStats.mostFrequentMood.moodId)?.color,
                fontWeight: "bold",
              }}
            >
              {findMoodById(weeklyStats.mostFrequentMood.moodId)?.name}
            </Text>
            {` (${getPercentage(
              weeklyStats.mostFrequentMood,
              weeklyStats.totalRecords
            )}%)`}
          </Text>
        ),
        emoji: findMoodById(weeklyStats.mostFrequentMood.moodId)?.emoji || null,
        indicator: [true, false, false],
      },
      {
        title: "This month",
        content: findMoodById(monthlyStats.mostFrequentMood.moodId) ? (
          <Text style={styles.screenContentText}>
            Your highest mood is{" "}
            <Text
              style={{
                color: findMoodById(monthlyStats.mostFrequentMood.moodId)
                  ?.color,
                fontWeight: "bold",
              }}
            >
              {findMoodById(monthlyStats.mostFrequentMood.moodId)?.name}
            </Text>
            {` (${getPercentage(
              monthlyStats.mostFrequentMood,
              monthlyStats.totalRecords
            )}%)`}
          </Text>
        ) : (
          <Text style={styles.screenContentText}>
            You haven't recorded any mood yet.
          </Text>
        ),
        emoji:
          findMoodById(monthlyStats.mostFrequentMood.moodId)?.emoji || null,
        indicator: [false, true, false],
      },
      // Keep the advice slide the same
      {
        title: "Advice for this month",
        content: (
          <Text style={styles.screenContentText}>
            {moodAdviceMap[monthlyStats.mostFrequentMood.moodId] ||
              "Keep up the good work!"}
          </Text>
        ),
        emoji: undefined,
        indicator: [false, false, true],
      },
    ];

    setScreens(screensData);
  };

  // Handle user tapping on a day bar in the chart
  const handleDayPress = (dayData: DayData, dayIndex: number) => {
    // Create tooltip data from the day data
    const moodDetails = MOODS.map((mood) => {
      const count = dayData.moodCounts[mood.id] || 0;
      const percentage = dayData.totalRecords
        ? Math.round((count / dayData.totalRecords) * 100)
        : 0;

      return {
        moodId: mood.id,
        moodName: mood.name,
        moodColor: mood.color,
        count,
        percentage,
      };
    }).filter((mood) => mood.count > 0);

    setTooltipData({
      visible: true,
      date: dayData.date,
      day: dayData.day,
      position: { x: dayIndex * 40, y: 100 }, // Approximate position
      moods: moodDetails,
      totalCount: dayData.totalRecords,
    });
  };

  // Update handleSlideChange to consider monthType
  const handleSlideChange = (index: number) => {
    const monthType = getMonthType(currentDate);

    // For past months, only slide 1 is visible, so set index to 1
    if (monthType === "past") {
      setCurrentScreenIndex(1);
    }
    // For future months, only slide 2 is visible, so set index to 2
    else if (monthType === "future") {
      setCurrentScreenIndex(2);
    }
    // For current month, use the calculated index
    else {
      setCurrentScreenIndex(index);
    }
  };

  // Event Handlers
  const closeTooltip = () => {
    setTooltipData((prev) => ({ ...prev, visible: false }));
  };

  const handleWeekChange = (weekIndex: number) => {
    setCurrentWeekIndex(weekIndex);
  };

  const renderIndicator = () => {
    const monthType = getMonthType(currentDate);
    //console.log("Current month type:", monthType);

    // Only show indicators for visible slides based on month type
    const visibleIndices = (() => {
      if (monthType === "past") {
        return [1]; // Only month card (index 1) is visible in past months
      } else if (monthType === "future") {
        return [2]; // Only advice card (index 2) is visible in future months
      }
      return [0, 1, 2]; // All cards are visible in current month
    })();

    // Enhance the indicators to make sure they're visible
    return (
      <View
        style={[styles.indicatorContainer, styles.enhancedIndicatorContainer]}
      >
        {visibleIndices.map((index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              styles.enhancedIndicator,
              currentScreenIndex === index && styles.indicatorActive,
              visibleIndices.length === 1 && styles.singleIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderChartSection = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
        </View>
      );
    }

    if (!chartWeeks.length) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No mood data for this period</Text>
        </View>
      );
    }

    const currentWeek = chartWeeks[currentWeekIndex];

    // Format week date range for display
    const startDate = parseISO(currentWeek.startDate);
    const endDate = parseISO(currentWeek.endDate);
    const weekDateRange = `${format(startDate, "MMM d")} - ${format(
      endDate,
      "MMM d"
    )}`;

    return (
      <View>
        <WeekNavigation
          currentWeek={currentWeekIndex}
          totalWeeks={chartWeeks.length}
          weekDateRange={weekDateRange}
          onWeekChange={handleWeekChange}
        />

        <MoodChart weekData={currentWeek} onDayPress={handleDayPress} />
      </View>
    );
  };

  const getMonthType = (date: Date): "past" | "current" | "future" => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const selectedYear = date.getFullYear();
    const selectedMonth = date.getMonth();

    if (
      selectedYear < currentYear ||
      (selectedYear === currentYear && selectedMonth < currentMonth)
    ) {
      return "past";
    } else if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth > currentMonth)
    ) {
      return "future";
    }
    return "current";
  };

  // Effects
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const fetchStatistic = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const response = await fetch(
          `${API_ENDPOINTS.RECORDS}/statistic/mood?user_id=${user.id}&month=${month}&year=${year}&timezone=${timezone}`
        );

        const data = await response.json();

        if (response.ok && data.statusCode === 200) {
          setStatistic(data.data);
        } else {
          setStatistic(null);
        }
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setStatistic(null);
      }
      setLoading(false);
    };

    fetchStatistic();
  }, [currentDate, user, records]);

  useEffect(() => {
    if (statistic) {
      const weeks = processChartData();
      setChartWeeks(weeks);
      createScreensData();

      // Set current week to the week that includes today
      const today = new Date();
      const todayDay = today.getDate();
      const approxWeek = Math.floor((todayDay - 1) / 7);
      setCurrentWeekIndex(Math.min(approxWeek, weeks.length - 1));
    }
  }, [statistic]);

  useEffect(() => {
    // Reset the currentScreenIndex whenever the month changes
    const monthType = getMonthType(currentDate);

    // For past months, show the monthly stats card (index 1)
    if (monthType === "past") {
      setCurrentScreenIndex(1);
      // Optional: scroll to the right position
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: width, animated: false });
      }
    }
    // For future months, show the advice card (index 2)
    else if (monthType === "future") {
      setCurrentScreenIndex(2);
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: width * 2,
          animated: false,
        });
      }
    }
    // For current month, reset to the first card (index 0)
    else {
      setCurrentScreenIndex(0);
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }
  }, [currentDate]); // Only watch for month changes
  // Main render
  return (
    <View
      style={[styles.container, showMoodChartOnly && styles.compactContainer]}
    >
      {/* If showMoodChartOnly is true, only render the chart section */}
      {showMoodChartOnly ? (
        <View style={styles.chartWrapper}>{renderChartSection()}</View>
      ) : (
        <View style={styles.container}>
          {/* Chart Section */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Mood Chart</Text>
            <Text style={styles.chartSubtitle}>
              {/* {format(currentDate, 'MMMM yyyy')} */}
              {"Let's see how your mood has been this month!"}
            </Text>

            <View style={styles.chartWrapper}>{renderChartSection()}</View>
          </View>

          {/* Slides Section */}
          <View style={styles.slideContainer}>
            <FlatList
              ref={flatListRef}
              data={screens}
              renderItem={({ item, index }) =>
                renderSlideCard({
                  item,
                  index,
                  monthType: getMonthType(currentDate),
                })
              }
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x /
                    event.nativeEvent.layoutMeasurement.width
                );
                handleSlideChange(index);
              }}
              style={styles.slidesList}
            />
            {renderIndicator()}
          </View>

          {/* Tooltip for mood details */}
          <MoodTooltip data={tooltipData} onClose={closeTooltip} />
        </View>
      )}

      {/* Only show tooltip if not in compact mode or if it's visible */}
      {(!showMoodChartOnly || tooltipData.visible) && (
        <MoodTooltip data={tooltipData} onClose={closeTooltip} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: height * 0.01,
    paddingBottom: height * 0.05,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.04,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 20,
    fontFamily: "Quicksand-Bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Light",
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: width * 0.1,
  },
  chartWrapper: {
    overflow: "hidden",
    borderRadius: 12,
  },
  loadingContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  slideContainer: {
    flex: 1,
  },
  slidesList: {
    width: width,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 30,
    backgroundColor: "#4CAF50",
  },
  screenContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    textAlign: "center",
  },
  compactContainer: {
    paddingBottom: 0,
    height: 200,
  },
  singleIndicator: {
    width: 30, // Make single indicators more prominent
    backgroundColor: "#4CAF50",
  },
  enhancedIndicatorContainer: {
    position: "absolute",
    bottom: height * 0.04,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingVertical: 8,
  },
  enhancedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default EmotionPage;
