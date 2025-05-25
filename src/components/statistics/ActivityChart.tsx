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
}

const ActivityChart = ({ activities, currentMonth = new Date() }: ActivityChartProps) => {
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
    "Activity 15": "Outdoors"
  };
  
 // Update the activityColors object with these more distinct colors:

// Fixed color mapping for activities with more distinct colors
const activityColors: Record<string, string> = {
  "Work": "#8c4A4A",       // Dark Gray
  "Exercise": "#4CAF50",   // Green
  "Biking": "#FF5722",     // Deep Orange
  "Music": "#2196F3",      // Blue
  "Dishes": "#F44336",     // Red
  "Reading": "#9C27B0",    // Purple
  "Shopping": "#FFB300",   // Amber
  "Travel": "#00BCD4",     // Cyan
  "Study": "#607D8B",      // Blue Gray
  "Gaming": "#673AB7",     // Deep Purple
  "Cooking": "#E91E63",    // Pink
  "Cleaning": "#3F51B5",   // Indigo
  "Meditation": "#009688", // Teal
  "Social": "#CDDC39",     // Lime
  "Outdoors": "#8BC34A",   // Light Green
  "Other": "#BDBDBD",      // Light Gray
};

  // Data preparation for both charts
  const { lineChartData, pieChartData, totalByType, totalActivities, daysInMonth, recentActivities } = 
  useMemo(() => {
    // Calculate days in month and current day
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const currentDay = Math.min(currentMonth.getDate(), daysInMonth);
    
    // Check if we have real data from API
    const hasAPIData = activities && activities.length > 0;
    
    // Prepare daily activity data for line chart
    let dailyTotals = Array(currentDay).fill(0);
    let typeData: Record<string, number> = {};
    let recentActivities: Record<string, string> = {};
    
// Focus on the data processing part in useMemo

// Inside useMemo, update the activity processing logic:
if (hasAPIData) {
  // Process activities from the activities prop (formatted data)
  activities.forEach(activity => {
    const activityDate = new Date(activity.date);
    const day = activityDate.getDate();
    
    // Update daily totals for the line chart
    if (day >= 1 && day <= currentDay) {
      dailyTotals[day - 1] += activity.count;
    }
    
    // Skip "Daily Total" entries for the pie chart
    if (activity.name === "Daily Total") {
      return; // Skip this iteration
    }
    
    // Get proper display name for this activity
    const displayName = activityDisplayNames[activity.name] || activity.name;
    
    // Update total counts by activity type
    if (!typeData[displayName]) {
      typeData[displayName] = 0;
    }
    typeData[displayName] += activity.count;
    
    // Track most recent date for this activity type
    const dateStr = activity.date;
    if (!recentActivities[displayName] || 
        new Date(dateStr) > new Date(recentActivities[displayName])) {
      recentActivities[displayName] = dateStr;
    }
  });
} else {
      // When no activities data provided, create sample data
      dailyTotals = Array(currentDay).fill(0).map(() => 
        Math.floor(Math.random() * 15) + 2 // Random value between 2-17
      );
      
      // Sample pie chart data
      typeData = {
        "Work": 18,
        "Exercise": 24,
        "Biking": 8,
        "Music": 22,
        "Dishes": 16,
        "Reading": 12,
      };
    }
    
    // Calculate total activities
    const total = Object.values(typeData).reduce((sum, count) => sum + count, 0);
    
    // Create array of activity types sorted by count
    const sortedActivities = Object.entries(typeData)
      .filter(([_, count]) => count > 0) // Filter out zero counts
      .sort((a, b) => b[1] - a[1]) // Sort by count, highest first
      .map(([name, count]) => ({ name, count }));
    
    // Get top 5 activities
    const top5 = sortedActivities.slice(0, 5);
    
    // Sum up remaining activities for "Other" category
    const otherActivities = sortedActivities.slice(5);
    const otherCount = otherActivities.reduce((sum, item) => sum + item.count, 0);
    
    // Create pie chart data with colors
    const pieData = top5.map(item => {
      return {
        name: item.name,
        count: item.count,
        color: activityColors[item.name] || "#DDD",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      };
    });
    
    // Add "Other" category if needed
    if (otherCount > 0) {
      pieData.push({
        name: "Other",
        count: otherCount,
        color: activityColors["Other"],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      });
    }
    
    // If no data or only one type, add placeholder
    if (pieData.length === 0) {
      pieData.push({
        name: "No Data",
        count: 1,
        color: "#EEEEEE",
        legendFontColor: "#AAAAAA",
        legendFontSize: 12
      });
    } else if (pieData.length === 1) {
      // Add a tiny segment for visual separation
      pieData.push({
        name: "Other",
        count: pieData[0].count * 0.01, // 1% of main value
        color: "#F0F0F0",
        legendFontColor: "#CCCCCC",
        legendFontSize: 12
      });
    }
    
    return {
      lineChartData: {
        labels: Array.from({ length: currentDay }, (_, i) => `${i + 1}`),
        datasets: [
          {
            data: dailyTotals,
            color: () => HOME_COLOR.HOMETABBAR,
            strokeWidth: 2,
          }
        ],
      },
      pieChartData: pieData,
      totalByType: typeData,
      totalActivities: total,
      daysInMonth: currentDay,
      recentActivities
    };
  }, [activities, currentMonth, activityDisplayNames, activityColors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Chart</Text>
      <Text style={styles.subtitle}>
        Your activity statistic with chart in {currentMonth.toLocaleString('default', { month: 'long' })}
      </Text>
      
      {/* Daily Activity Line Chart */}
      <ActivityLineChart 
        lineChartData={lineChartData} 
        daysInMonth={daysInMonth} 
      />
      
      {/* Activity Distribution Pie Chart */}
      <ActivityPieChart 
        pieChartData={pieChartData} 
        totalByType={totalByType}
        totalActivities={totalActivities}
        recentActivities={recentActivities}
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