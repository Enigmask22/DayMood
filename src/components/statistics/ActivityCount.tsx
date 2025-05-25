import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { HOME_COLOR } from '@/utils/constant';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 6; // Six columns grid
const ITEM_WIDTH = (width - 60) / COLUMN_COUNT;

type ActivityWithCount = {
  id: number;
  name: string;
  icon: string;
  count: number;
};

type ActivityCountProps = {
  activities: ActivityWithCount[];
  month?: Date;
};

const ActivityCount = ({ activities, month = new Date() }: ActivityCountProps) => {
  // Map of activity names to consistent display names
  const activityDisplayNames: Record<string, string> = {
    "1": "Work",
    "2": "Exercise",
    "3": "Biking",
    "4": "Music", 
    "5": "Dishes",
    "6": "Reading",
    "7": "Shopping",
    "8": "Travel",
    "Activity 1": "Work",
    "Activity 2": "Exercise",
    "Activity 3": "Biking",
    "Activity 4": "Music",
    "Activity 5": "Dishes", 
    "Activity 6": "Reading",
    "Activity 7": "Shopping"
  };
  
  // Map of activity names to consistent icons
  const activityIcons: Record<string, string> = {
    "Work": "briefcase",
    "Exercise": "running",
    "Biking": "bicycle",
    "Music": "headphones",
    "Dishes": "utensils",
    "Reading": "book-open",
    "Shopping": "shopping-bag",
    "Travel": "plane",
  };

  // Use provided activities or fall back to sample data if none provided
  let activitiesToRender = activities.length > 0 
    ? activities.map(activity => {
        // Get proper display name using activity name or ID
        const displayName = 
          activityDisplayNames[activity.name] || 
          activityDisplayNames[String(activity.id)] || 
          activity.name;
        
        // Get proper icon based on display name
        const icon = activityIcons[displayName] || activity.icon || "star";
        
        return {
          ...activity,
          name: displayName, // Use the mapped display name
          icon: icon // Use the mapped icon
        };
      })
    : [
        { id: 1, name: "Work", icon: "briefcase", count: 2 },
        { id: 2, name: "Exercise", icon: "running", count: 8 },
        { id: 3, name: "Biking", icon: "bicycle", count: 2 },
        { id: 4, name: "Music", icon: "headphones", count: 7 },
        { id: 5, name: "Dishes", icon: "utensils", count: 12 },
        { id: 6, name: "Reading", icon: "book-open", count: 2 },
      ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Count</Text>
      <Text style={styles.subtitle}>
        Your activity statistic with count in {month.toLocaleString('default', { month: 'long' })}
      </Text>
      
      <View style={styles.grid}>
        {activitiesToRender.map((activity, index) => (
          <View key={`${activity.id}-${index}`} style={styles.activityItem}>
            <View style={styles.iconContainer}>
              <FontAwesome5 
                name={activity.icon} 
                size={20} 
                color="black" 
                style={styles.icon}
              />
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{activity.count}</Text>
              </View>
            </View>
            <Text style={styles.activityName}>{activity.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7E7E7E',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  activityItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    // Icon styling
  },
  countBadge: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: HOME_COLOR.HOMETABBAR,
    position: 'absolute',
    top: -8,
    right: -8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activityName: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ActivityCount;