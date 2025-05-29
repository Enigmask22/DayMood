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
    "2": "Exercise",
    "3": "Biking",
    "4": "Music",
    "5": "Dishes",
    "6": "Reading",
    "7": "Shopping",
    "8": "Travel",
    "9": "Study",
    "10": "Gaming",
    "11": "Cooking",
    "12": "Cleaning",
    "13": "Meditation",
    "14": "Social",
    "15": "Outdoors",
    "Activity 1": "Work",
    "Activity 2": "Exercise",
    "Activity 3": "Biking",
    "Activity 4": "Music",
    "Activity 5": "Dishes",
    "Activity 6": "Reading",
    "Activity 7": "Shopping",
    "Activity 8": "Travel",
    "Activity 9": "Study",
    "Activity 10": "Gaming",
    "Activity 11": "Cooking",
    "Activity 12": "Cleaning",
    "Activity 13": "Meditation",
    "Activity 14": "Social",
    "Activity 15": "Outdoors",
  };

  // Fixed color mapping for activities with more distinct colors
  const activityColors: Record<string, string> = {
    Work: "#8c4A4A", // Dark Gray
    Exercise: "#4CAF50", // Green
    Biking: "#FF5722", // Deep Orange
    Music: "#2196F3", // Blue
    Dishes: "#F44336", // Red
    Reading: "#9C27B0", // Purple
    Shopping: "#FFB300", // Amber
    Travel: "#00BCD4", // Cyan
    Study: "#607D8B", // Blue Gray
    Gaming: "#673AB7", // Deep Purple
    Cooking: "#E91E63", // Pink
    Cleaning: "#3F51B5", // Indigo
    Meditation: "#009688", // Teal
    Social: "#CDDC39", // Lime
    Outdoors: "#8BC34A", // Light Green
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
        {currentMonth.toLocaleString("default", { month: "long" })}
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
