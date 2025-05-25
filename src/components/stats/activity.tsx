import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { HOME_COLOR } from "@/utils/constant";
import { useRouter } from "expo-router";
import ActivityCount from "@/components/statistics/ActivityCount";
import ActivityChart from "@/components/statistics/ActivityChart";
import { fetchActivityStatistics } from "./datafetching";
//import { useAuth } from "@/hooks/useAuth"; // Import your auth hook to get userId

interface ActivityPageProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

interface ActivityStats {
  activityData: { [key: string]: number[] };
  activityNames: { [key: string]: string };
  dates: string[];
  totalActivities: number;
}

const ActivityPage = ({ currentDate, setCurrentDate }: ActivityPageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const  user  = "1" // Get the current user

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Extract month and year from the currentDate
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const year = currentDate.getFullYear();
        
        // Fetch activity statistics
        const response = await fetchActivityStatistics(user, month, year);
        
        if (response.statusCode === 200 && response.data?.monthly) {
          const { activityData, activityNames, dates, totalRecords } = response.data.monthly;
          
          setActivityStats({
            activityData,
            activityNames,
            dates,
            totalActivities: totalRecords
          });
        }
      } catch (err) {
        setError('Failed to load activity statistics.');
        console.error('Error loading activity statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate, user]);

  // Format activity data for the ActivityCount component
  const formatActivitiesForCount = () => {
    if (!activityStats) return [];
    
    const countByActivity: { [key: string]: number } = {};
    
    // Calculate total for each activity
    Object.entries(activityStats.activityData).forEach(([activityId, dailyCounts]) => {
      const totalCount = dailyCounts.reduce((sum, count) => sum + count, 0);
      countByActivity[activityId] = totalCount;
    });
    
    // Map to the format expected by ActivityCount
    return Object.entries(countByActivity).map(([activityId, count]) => {
      const name = activityStats.activityNames[activityId] || `Activity ${activityId}`;
      return {
        id: Number(activityId),
        name,
        // Map activity names to FontAwesome5 icons - you may need to customize this mapping
        icon: mapActivityNameToIcon(name),
        count,
      };
    });
  };

  // Helper function to map activity names to appropriate icons
  const mapActivityNameToIcon = (activityName: string): string => {
    const lowerCaseName = activityName.toLowerCase();
    
    // Map common activities to Font Awesome 5 icons
    if (lowerCaseName.includes('work')) return 'briefcase';
    if (lowerCaseName.includes('exercise') || lowerCaseName.includes('workout')) return 'running';
    if (lowerCaseName.includes('bike') || lowerCaseName.includes('cycling')) return 'bicycle';
    if (lowerCaseName.includes('music')) return 'headphones';
    if (lowerCaseName.includes('dish') || lowerCaseName.includes('cook')) return 'utensils';
    if (lowerCaseName.includes('read')) return 'book-open';
    if (lowerCaseName.includes('sleep')) return 'bed';
    if (lowerCaseName.includes('eat') || lowerCaseName.includes('food')) return 'hamburger';
    if (lowerCaseName.includes('shop')) return 'shopping-cart';
    if (lowerCaseName.includes('game')) return 'gamepad';
    
    // Default icon
    return 'star';
  };

// Replace the formatActivitiesForChart function with this:

const formatActivitiesForChart = () => {
  if (!activityStats) return [];
  
  const formattedActivities: { date: string; count: number; name: string; id?: string; }[] = [];
  
  // First create the daily total line chart data
  activityStats.dates.forEach((dateStr, dateIndex) => {
    let dailyTotal = 0;
    Object.values(activityStats.activityData).forEach(activityDailyCounts => {
      dailyTotal += activityDailyCounts[dateIndex] || 0;
    });
    
    // Only add dates with activity
    if (dailyTotal > 0) {
      formattedActivities.push({
        date: dateStr,
        count: dailyTotal,
        name: 'Daily Total' // For line chart
      });
    }
  });
  
  // Then add separate entries for each activity type
  Object.entries(activityStats.activityData).forEach(([activityId, dailyCounts]) => {
    const activityName = activityStats.activityNames[activityId] || `Activity ${activityId}`;
    
    // Calculate the total for this activity
    const totalForActivity = dailyCounts.reduce((sum, count) => sum + count, 0);
    
    // Only add activities with counts > 0
    if (totalForActivity > 0) {
      // Find most recent date with this activity
      let mostRecentDate = '';
      let mostRecentIndex = -1;
      
      dailyCounts.forEach((count, i) => {
        if (count > 0 && i > mostRecentIndex) {
          mostRecentIndex = i;
          mostRecentDate = activityStats.dates[i];
        }
      });
      
      formattedActivities.push({
        date: mostRecentDate,
        count: totalForActivity,
        name: activityName,
        id: activityId
      });
    }
  });
  
  return formattedActivities;
};

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
          <Text style={styles.loadingText}>Loading activity stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Pull down to refresh</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedActivitiesForCount = formatActivitiesForCount();
  const formattedActivitiesForChart = formatActivitiesForChart();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <ActivityCount activities={formattedActivitiesForCount} />
          <ActivityChart 
            activities={formattedActivitiesForChart} 
            currentMonth={currentDate}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    padding: 15,
  },
  contentContainer: {
    flex: 1,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: HOME_COLOR.HOMETEXT,
    textAlign: 'center',
  },
});

export default ActivityPage;