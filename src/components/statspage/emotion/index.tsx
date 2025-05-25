import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  ImageSourcePropType,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { MOODS, moodAdviceMap } from "@/utils/constant";
import { API_ENDPOINTS } from "@/utils/config";
import { BarChart } from "react-native-gifted-charts";
import { ScreenItem, StatisticData } from "@/types/stats";
import { renderSlideCard } from "./renderSlideCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "@/store";

const { width, height } = Dimensions.get("window");

const EmotionPage = ({
  currentDate,
  setCurrentDate,
}: {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [screens, setScreens] = useState<ScreenItem[]>([]);
  const [statistic, setStatistic] = useState<StatisticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[][]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [user, setUser] = useState<any>(null);

  // Get records from Redux store
  const { records } = useAppSelector((state) => state.records);

  /* OPENING: Handle data for the line chart */
  // Function to handle month change
  function getDaysInMonthFromDate(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() trả về 0-11, nên cộng 1
    return new Date(year, month, 0).getDate();
  }
  // Generate x-axis labels for the chart based on the current month
  const xAxisLabels = Array.from(
    { length: getDaysInMonthFromDate(currentDate) },
    (_, i) => {
      // đưa về số có 2 chữ số
      const day = (i + 1).toString().padStart(2, "0");
      return day;
    }
  );
  // Create data for the stacked bar chart divided by weeks
  function createDataForChart() {
    const arr = statistic?.monthly?.dailyMoodStats;
    if (!arr) return;

    const chartData = arr.map((dayData, index) => {
      const day = (index + 1).toString().padStart(2, "0");

      // Create stacked data for each mood - include all moods for consistent structure
      const stackData = MOODS.map((mood) => {
        const foundMoodStat = dayData.moodStats.find(
          (moodStat) => moodStat.moodId === mood.id
        );
        const count = foundMoodStat ? foundMoodStat.count : 0;

        return {
          value: count,
          color: mood.color,
          label: count > 0 ? count.toString() : "",
          moodName: mood.name, // Add mood name for reference
        };
      });

      return {
        label: day,
        stacks: stackData,
        spacing: 2,
      };
    });

    // Divide data into weeks (7 days each)
    const weeks: any[][] = [];
    for (let i = 0; i < chartData.length; i += 7) {
      weeks.push(chartData.slice(i, i + 7));
    }

    setBarData(chartData);
    setWeeklyData(weeks);
    setCurrentWeekIndex(0); // Reset to first week
  }
  /* ENDING: Handle data for the line chart */

  /* OPENING: Handle data for the slide cards */
  // Create screens data based on the statistic
  function createScreens() {
    const weeklyStats = statistic?.weekly;
    const monthlyStats = statistic?.monthly;

    if (!weeklyStats || !monthlyStats) return;

    // Debug log to check data structure
    console.log("Weekly stats:", weeklyStats);
    console.log("Monthly stats:", monthlyStats);
    console.log("Weekly mostFrequentMood:", weeklyStats.mostFrequentMood);
    console.log("Monthly mostFrequentMood:", monthlyStats.mostFrequentMood);

    // Helper function to get percentage safely
    const getPercentage = (moodData: any, isWeekly: boolean = true) => {
      if (
        moodData.percentage !== undefined &&
        moodData.percentage !== null &&
        !isNaN(moodData.percentage)
      ) {
        return Math.round(moodData.percentage);
      }
      // Fallback: calculate percentage if not provided
      const totalRecords = isWeekly
        ? weeklyStats.totalRecords
        : monthlyStats.totalRecords;
      if (moodData.count && totalRecords && totalRecords > 0) {
        return Math.round((moodData.count / totalRecords) * 100);
      }
      return 0;
    };

    const screensData: ScreenItem[] = [
      {
        title: "This week",
        content: (
          <Text>
            Your highest % mood is{" "}
            <Text
              style={{
                color: MOODS.find(
                  (mood) => mood.id === weeklyStats.mostFrequentMood.moodId
                )?.color,
                fontWeight: "bold",
              }}
            >
              {
                MOODS.find(
                  (mood) => mood.id === weeklyStats.mostFrequentMood.moodId
                )?.name
              }
            </Text>
            {` (${getPercentage(weeklyStats.mostFrequentMood, true)}%)`}
          </Text>
        ),
        emoji:
          MOODS.find((mood) => mood.id === weeklyStats.mostFrequentMood.moodId)
            ?.emoji || null,
        indicator: [true, false, false],
      },
      {
        title: "This month",
        content: (
          <Text>
            Your highest % mood is{" "}
            <Text
              style={{
                color: MOODS.find(
                  (mood) => mood.id === monthlyStats.mostFrequentMood.moodId
                )?.color,
                fontWeight: "bold",
              }}
            >
              {
                MOODS.find(
                  (mood) => mood.id === monthlyStats.mostFrequentMood.moodId
                )?.name
              }
            </Text>
            {` (${getPercentage(monthlyStats.mostFrequentMood, false)}%)`}
          </Text>
        ),
        emoji:
          MOODS.find((mood) => mood.id === monthlyStats.mostFrequentMood.moodId)
            ?.emoji || null,
        indicator: [false, true, false],
      },
      {
        title: "Advice for this month",
        content:
          moodAdviceMap[monthlyStats.mostFrequentMood.moodId] ||
          "Keep up the good work!",
        emoji: undefined,
        indicator: [false, false, true],
      },
    ];
    setScreens(screensData);
  }
  // Handle slide change
  const handleSlideChange = (index: number) => {
    setCurrentScreenIndex(index);
  };
  // Render indicator bar based on the current slide
  const renderIndicator = () => {
    if (currentScreenIndex === 0) {
      return (
        <View style={styles.indicatorContainer}>
          <View style={[styles.indicator, styles.indicatorActive]} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
        </View>
      );
    } else if (currentScreenIndex === 1) {
      return (
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
          <View style={[styles.indicator, styles.indicatorActive]} />
          <View style={styles.indicator} />
        </View>
      );
    } else {
      return (
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
          <View style={styles.indicator} />
          <View style={[styles.indicator, styles.indicatorActive]} />
        </View>
      );
    }
  };
  /* ENDING: Handle data for the slide cards */

  // Load user data on component mount
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

  // Fetch statistic data when user or currentDate changes
  useEffect(() => {
    const fetchStatistic = async () => {
      if (!user) return; // Skip if no user loaded yet

      setLoading(true);
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const res = await fetch(
          `${API_ENDPOINTS.RECORDS}/statistic/mood?user_id=${user.id}&month=${month}&year=${year}`
        );
        const data = await res.json();
        console.log("Statistic data:", data);
        setStatistic(data.data);
      } catch (err) {
        setStatistic(null);
      }
      setLoading(false);
    };
    fetchStatistic();
  }, [currentDate, user, records]);

  // Create data for the chart when statistic data is available
  useEffect(() => {
    if (statistic) {
      createDataForChart();
      createScreens();
    }
  }, [statistic]);

  // Add new state for tooltip/modal
  const [selectedPointInfo, setSelectedPointInfo] = useState<{
    day: string;
    values: Array<{ moodName: string; moodColor: string; value: number }>;
    x: number;
    y: number;
  } | null>(null);

  // Function to handle bar press
  const handleBarPress = (item: any, index: number) => {
    const day = item.label;

    // Collect all mood values for this day from stacks
    const values = item.stacks
      .filter((stack: any) => stack.value > 0) // Only get stacks with values > 0
      .map((stack: any) => ({
        moodName: stack.moodName,
        moodColor: stack.color,
        value: stack.value,
      }));

    if (values.length > 0) {
      setSelectedPointInfo({
        day,
        values,
        x: index,
        y: Math.max(...values.map((v: any) => v.value)),
      });
    }
  };

  // Function to dismiss the tooltip/modal
  const dismissPointInfo = () => {
    setSelectedPointInfo(null);
  };

  // Render tooltip overlay
  const renderPointInfoOverlay = () => {
    if (!selectedPointInfo) return null;

    return (
      <Modal
        transparent={true}
        visible={!!selectedPointInfo}
        onRequestClose={dismissPointInfo}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.tooltipModalOverlay}
          activeOpacity={1}
          onPress={dismissPointInfo}
        >
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipTitle}>Day {selectedPointInfo.day}</Text>
            {selectedPointInfo.values.map((item, idx) => (
              <View key={idx} style={styles.tooltipRow}>
                <View
                  style={[
                    styles.tooltipColorDot,
                    { backgroundColor: item.moodColor },
                  ]}
                />
                <Text style={styles.tooltipMoodName}>{item.moodName}: </Text>
                <Text style={styles.tooltipValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={{ paddingBottom: height * 0.15 }}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Mood Chart</Text>
        <Text style={styles.chartSubtitle}>
          Your mood statistic in {format(currentDate, "MMMM")}
        </Text>
        <View style={{ overflow: "hidden" }}>
          {weeklyData.length > 0 ? (
            <View style={styles.weeklyChartContainer}>
              {/* Week Navigation */}
              <View style={styles.weekNavigationContainer}>
                <TouchableOpacity
                  style={[
                    styles.weekNavButton,
                    currentWeekIndex === 0 && styles.weekNavButtonDisabled,
                  ]}
                  onPress={() =>
                    setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))
                  }
                  disabled={currentWeekIndex === 0}
                >
                  <Text style={styles.weekNavButtonText}>←</Text>
                </TouchableOpacity>

                <Text style={styles.weekIndicatorText}>
                  Page {currentWeekIndex + 1} of {weeklyData.length}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.weekNavButton,
                    currentWeekIndex === weeklyData.length - 1 &&
                      styles.weekNavButtonDisabled,
                  ]}
                  onPress={() =>
                    setCurrentWeekIndex(
                      Math.min(weeklyData.length - 1, currentWeekIndex + 1)
                    )
                  }
                  disabled={currentWeekIndex === weeklyData.length - 1}
                >
                  <Text style={styles.weekNavButtonText}>→</Text>
                </TouchableOpacity>
              </View>

              {/* Chart Container */}
              <View style={styles.customChartContainer}>
                <View style={styles.yAxisContainer}>
                  {[10, 8, 6, 4, 2, 0].map((value) => (
                    <Text key={value} style={styles.yAxisLabel}>
                      {value}
                    </Text>
                  ))}
                </View>

                <View style={styles.chartContentWrapper}>
                  <View style={styles.chartContent}>
                    <View style={styles.barsContainer}>
                      {weeklyData[currentWeekIndex]?.map(
                        (dayData, dayIndex) => (
                          <TouchableOpacity
                            key={dayIndex}
                            style={styles.barColumn}
                            onPress={() => handleBarPress(dayData, dayIndex)}
                          >
                            <View style={styles.stackedBar}>
                              {dayData.stacks
                                .filter((stack: any) => stack.value > 0)
                                .map((stack: any, stackIndex: number) => {
                                  const barHeight =
                                    (stack.value / 10) * (height * 0.22);
                                  return (
                                    <View
                                      key={stackIndex}
                                      style={[
                                        styles.stackSegment,
                                        {
                                          height: Math.max(barHeight, 12),
                                          backgroundColor: stack.color,
                                        },
                                      ]}
                                    >
                                      <Text style={styles.stackLabel}>
                                        {stack.value}
                                      </Text>
                                    </View>
                                  );
                                })}
                            </View>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>

                  {/* X-Axis Labels */}
                  <View style={styles.xAxisLabelsContainer}>
                    {weeklyData[currentWeekIndex]?.map((dayData, dayIndex) => (
                      <Text key={dayIndex} style={styles.xAxisLabel}>
                        {dayData.label}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <Text>None of Data to show</Text>
          )}
          {loading && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 20,
              }}
            >
              <ActivityIndicator size="large" color="#00A36C" />
            </View>
          )}
          <View style={styles.legendContainer}>
            {MOODS.map((mood, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: mood.color,
                    borderRadius: 5,
                  }}
                />
                <Text style={{ marginLeft: 5 }}>{mood.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.slideContainer}>
        <FlatList
          ref={flatListRef}
          data={screens}
          renderItem={renderSlideCard}
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

      {/* Add tooltip overlay */}
      {renderPointInfoOverlay()}
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  monthText: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",
  },
  navButton: {
    padding: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  tabButton: {
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    marginHorizontal: width * 0.01,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },
  selectedTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    fontSize: width * 0.035,
    color: "#555",
  },
  selectedTabText: {
    color: "#fff",
    fontWeight: "500",
  },
  slideContainer: {
    flex: 1,
  },
  slidesList: {
    width: width,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: width * 0.05,
    padding: width * 0.05,
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartTitle: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: width * 0.035,
    color: "#777",
    marginBottom: 10,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: width * 0.02,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
    marginHorizontal: width * 0.01,
  },
  indicatorActive: {
    width: width * 0.05,
    backgroundColor: "#4CAF50",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  otherTabContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.6,
  },
  comingSoonText: {
    fontSize: 18,
    color: "#555",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    gap: 10,
    flexWrap: "wrap",
  },
  // Add these new styles for tooltip
  tooltipModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tooltipColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  tooltipMoodName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // Weekly Chart Styles
  weeklyChartContainer: {
    marginVertical: 10,
  },
  weekNavigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  weekNavButton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  weekNavButtonDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  weekNavButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  weekIndicatorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  customChartContainer: {
    flexDirection: "row",
    height: height * 0.28,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  yAxisContainer: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 12,
    width: 40,
    height: height * 0.22,
    paddingTop: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  chartContentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  chartContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: height * 0.22,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    maxWidth: 50,
  },
  stackedBar: {
    flexDirection: "column-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 20,
  },
  stackSegment: {
    width: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginVertical: 1,
    minHeight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  stackLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  xAxisLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingTop: 8,
    marginTop: 4,
  },
  xAxisLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    maxWidth: 50,
  },
});
export default EmotionPage;
