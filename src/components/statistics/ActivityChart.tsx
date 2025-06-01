import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { HOME_COLOR } from "@/utils/constant";
import ActivityLineChart from "@/components/statistics/ActivityLineChart";
import ActivityPieChart from "@/components/statistics/ActivityPieChart";

interface ActivityWithCount {
  name: string;
  count: number;
  date: string;
}

interface ActivityChartProps {
  activities: ActivityWithCount[];
  currentMonth: Date;
  hasRealData?: boolean; // Add this prop
}

const ActivityChart = ({
  activities,
  currentMonth = new Date(),
  hasRealData = true, // Default to true but allow override from parent
}: ActivityChartProps) => {
  // Activity name mappings for better display
  const activityDisplayNames: Record<string, string> = {
    "1": "Work",
    "2": "Sport",
    "3": "Walking",
    "4": "Exercise",
    "5": "Music",
    "6": "Dishes",
    "7": "Reading",
    "8": "Study",
    "9": "Sleep",
    "10": "Camping",
    "11": "Shopping",
    "12": "Travel",
    "13": "Chat",
    "14": "Coffee",
    "15": "Swimming",
  };

  // Fixed color mapping for activities with more distinct colors
  const activityColors: Record<string, string> = {
    Work: "#8c4A4A", // Dark Gray
    Sport: "#4CAF50", // Green
    Walking: "#FF5722", // Deep Orange
    Excercise: "#2196F3", // Blue
    Music: "#F44336", // Red
    Dishes: "#9C27B0", // Purple
    Reading: "#FFB300", // Amber
    Study: "#00BCD4", // Cyan
    Sleep: "#607D8B", // Blue Gray
    Camping: "#673AB7", // Deep Purple
    Shopping: "#E91E63", // Pink
    Travel: "#3F51B5", // Indigo
    Chat: "#009688", // Teal
    Coffee: "#CDDC39", // Lime
    Swimming: "#8BC34A", // Light Green
    Other: "#BDBDBD", // Light Gray
  };

  const {
    lineChartData,
    pieChartData,
    totalByType,
    totalActivities,
    daysInMonth,
    recentActivities,
  } = useMemo(() => {
    console.log("Processing activities data:", activities);
    console.log("Using hasRealData value:", hasRealData);

    // Calculate days in month and current day
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const today = new Date();
    const isCurrentMonth =
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth();

    // For current month, include up to today's date
    let currentDay = isCurrentMonth ? today.getDate() : daysInMonth;
    currentDay = Math.min(currentDay, daysInMonth);

    // Initialize arrays - removed internal hasRealData calculation
    let dailyTotals = Array(currentDay).fill(0);
    let typeData: Record<string, number> = {};
    let recentActivities: Record<string, string> = {};

    if (hasRealData) {
      // Process the formatted activities data from activity.tsx
      activities.forEach((activity) => {
        if (activity.name === "Daily Total") {
          // This contains the daily totals for the line chart
          const activityDate = new Date(activity.date);
          const day = activityDate.getDate();

          if (day >= 1 && day <= currentDay) {
            dailyTotals[day - 1] = activity.count;
          }
        } else {
          // Individual activity types for pie chart
          const displayName =
            activityDisplayNames[activity.name] || activity.name;

          if (!typeData[displayName]) {
            typeData[displayName] = 0;
          }
          typeData[displayName] += activity.count;

          // Track most recent date for this activity type
          if (
            !recentActivities[displayName] ||
            new Date(activity.date) > new Date(recentActivities[displayName])
          ) {
            recentActivities[displayName] = activity.date;
          }
        }
      });
    } else {
      // Sample data - ensure consistency with ActivityCount sample data
      dailyTotals = Array(currentDay)
        .fill(0)
        .map((_, index) => {
          return Math.floor(Math.random() * 8) + 1; // Random 1-8 activities per day
        });

      typeData = {
        Work: 2,
        Exercise: 8,
        Biking: 2,
        Music: 7,
        Dishes: 12,
        Reading: 2,
      };
    }

    // Create labels for all days
    const chartLabels = Array.from(
      { length: currentDay },
      (_, i) => `${i + 1}`
    );

    console.log("Line chart data:", {
      labels: chartLabels,
      dailyTotals: dailyTotals,
      currentDay: currentDay,
    });

    // Process pie chart data
    const sortedActivities = Object.entries(typeData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const top5 = sortedActivities.map(([name, count]) => ({ name, count }));
    const otherCount =
      Object.values(typeData).reduce((sum, count) => sum + count, 0) -
      top5.reduce((sum, item) => sum + item.count, 0);

    const pieData = top5.map((item) => ({
      name: item.name,
      count: item.count,
      color: activityColors[item.name] || "#DDD",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

    if (otherCount > 0) {
      pieData.push({
        name: "Other",
        count: otherCount,
        color: activityColors["Other"] || "#CCCCCC",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      });
    }

    const total = Object.values(typeData).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      lineChartData: {
        labels: chartLabels,
        datasets: [
          {
            data: dailyTotals,
            color: () => HOME_COLOR.HOMETABBAR,
            strokeWidth: 2,
          },
        ],
      },
      pieChartData: pieData,
      totalByType: typeData,
      totalActivities: total,
      daysInMonth: currentDay,
      recentActivities,
    };
  }, [
    activities,
    currentMonth,
    activityDisplayNames,
    activityColors,
    hasRealData,
  ]); // Added hasRealData as dependency

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Chart</Text>
      <Text style={styles.subtitle}>
        Your activity statistic with chart in{" "}
        {currentMonth.toLocaleString("en", { month: "long" })}
      </Text>

      {/* Daily Activity Line Chart */}
      <ActivityLineChart
        lineChartData={lineChartData}
        daysInMonth={daysInMonth}
        hasRealData={hasRealData} // Pass the prop directly
      />

      {/* Activity Distribution Pie Chart */}
      <ActivityPieChart
        pieChartData={pieChartData}
        totalByType={totalByType}
        totalActivities={totalActivities}
        recentActivities={recentActivities}
        hasRealData={hasRealData} // Pass the prop directly
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: HOME_COLOR.HOMETEXT,
    marginBottom: 15,
  },
});

export default ActivityChart;
