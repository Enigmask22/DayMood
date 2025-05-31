import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { HOME_COLOR } from "@/utils/constant";
import ActivityCount from "@/components/statistics/ActivityCount";
import ActivityChart from "@/components/statistics/ActivityChart";
import { fetchActivityStatistics } from "./datafetching";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "@/store";
const { height } = Dimensions.get("window");

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
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hasRealData, setHasRealData] = useState<boolean>(false);
  
  // Get records from Redux store
  const { records } = useAppSelector((state) => state.records);

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
        setError("Failed to load user data");
      }
    };
    
    loadUser();
  }, []);

  // Fetch activity data when user or currentDate changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Skip if no user loaded yet
      
      try {
        setLoading(true);
        setError(null);
        
        // Extract month and year from the currentDate
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const year = currentDate.getFullYear();
        
        // Fetch activity statistics using the user ID
        const response = await fetchActivityStatistics(user.id, month, year);
        console.log("Fetched activity statistics:", response);
        
        if (response.statusCode === 200 && response.data?.monthly) {
          const { activityData, activityNames, dates, totalRecords } = response.data.monthly;
          
          // Save activity stats to state
          setActivityStats({
            activityData,
            activityNames,
            dates,
            totalActivities: totalRecords
          });
          
          // Determine if we have real data by checking if any activity has counts > 0
          const hasAnyActivities = Object.values(activityData).some(dailyCounts => 
            dailyCounts.some(count => count > 0)
          );
          
          setHasRealData(hasAnyActivities && totalRecords > 0);
          console.log("Has real data:", hasAnyActivities && totalRecords > 0);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError('Failed to load activity statistics.');
        console.error('Error loading activity statistics:', err);
        setHasRealData(false); // No real data when there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate, user, records]);

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
    return Object.entries(countByActivity)
      .filter(([_, count]) => count > 0) // Only include activities with counts > 0
      .map(([activityId, count]) => {
        const name = activityStats.activityNames[activityId] || `Activity ${activityId}`;
        return {
          id: Number(activityId),
          name,
          icon: mapActivityNameToIcon(name),
          count,
        };
      });
  };

  // Helper function to map activity names to appropriate icons
  const mapActivityNameToIcon = (activityName: string): string => {
    const lowerCaseName = activityName.toLowerCase();
    
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
    
    return 'star'; // Default icon
  };

  // Format activities for chart display
  const formatActivitiesForChart = () => {
    if (!activityStats) return [];
    
    const formattedActivities: { date: string; count: number; name: string; id?: string; }[] = [];
    
    // Create daily totals for line chart
    activityStats.dates.forEach((dateStr, dateIndex) => {
      let dailyTotal = 0;
      
      // Sum all activities for this specific day
      Object.values(activityStats.activityData).forEach(activityDailyCounts => {
        dailyTotal += activityDailyCounts[dateIndex] || 0;
      });
      
      // Add daily total entry for line chart (even if 0)
      formattedActivities.push({
        date: dateStr,
        count: dailyTotal,
        name: 'Daily Total'
      });
    });
    
    // Add individual activity types for pie chart
    Object.entries(activityStats.activityData).forEach(([activityId, dailyCounts]) => {
      const activityName = activityStats.activityNames[activityId] || `Activity ${activityId}`;
      const totalForActivity = dailyCounts.reduce((sum, count) => sum + count, 0);
      
      // Only add activities with counts > 0
      if (totalForActivity > 0) {
        // Find most recent date with this activity
        let mostRecentDate = '';
        let mostRecentIndex = -1;
        
        for (let i = dailyCounts.length - 1; i >= 0; i--) {
          if (dailyCounts[i] > 0) {
            mostRecentIndex = i;
            mostRecentDate = activityStats.dates[i];
            break;
          }
        }
        
        formattedActivities.push({
          date: mostRecentDate || activityStats.dates[0],
          count: totalForActivity,
          name: activityName,
          id: activityId
        });
      }
    });
    
    console.log("Formatted activities for chart:", formattedActivities);
    return formattedActivities;
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
          <Text style={styles.loadingText}>Loading activity data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
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

  // Format data for components
  const formattedActivitiesForCount = formatActivitiesForCount();
  const formattedActivitiesForChart = formatActivitiesForChart();

  // Render main content
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <ActivityCount 
            activities={formattedActivitiesForCount} 
            hasRealData={hasRealData}
          />
          <ActivityChart 
            activities={formattedActivitiesForChart} 
            currentMonth={currentDate}
            hasRealData={hasRealData}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: height*0.05,
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