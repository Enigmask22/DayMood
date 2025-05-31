import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { HOME_COLOR, ACTIVITIES } from '@/utils/constant'; // Import ACTIVITIES

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 6;
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
  hasRealData?: boolean;
};

const ActivityCount = ({ 
  activities, 
  month = new Date(),
  hasRealData = true
}: ActivityCountProps) => {
  // Generate activity display names from ACTIVITIES constant
  const activityDisplayNames: Record<string, string> = {};
  
  // Add ID to name mappings
  ACTIVITIES.forEach(activity => {
    activityDisplayNames[String(activity.id)] = activity.name;
    activityDisplayNames[`Activity ${activity.id}`] = activity.name;
  });

  // Generate activity icons from ACTIVITIES constant
  const activityIcons: Record<string, string> = {};
  
  // Add name to icon mappings
  ACTIVITIES.forEach(activity => {
    activityIcons[activity.name] = activity.icon;
  });

  // Use provided activities or fall back to sample data if none provided
  const activitiesToRender = hasRealData
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
        name: displayName,
        icon: icon
      };
    })
    : [
      // Updated sample data based on ACTIVITIES array
      { id: 1, name: "Work", icon: "briefcase", count: 2 },
      { id: 2, name: "Sport", icon: "running", count: 8 },
      { id: 3, name: "Walking", icon: "walking", count: 2 },
      { id: 4, name: "Exercise", icon: "bicycle", count: 7 },
      { id: 5, name: "Music", icon: "headphones", count: 12 },
      { id: 6, name: "Dishes", icon: "utensils", count: 2 },
    ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Count</Text>
      <Text style={styles.subtitle}>
        Your activity statistic with count in {month.toLocaleString('en', { month: 'long' })}
      </Text>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {activitiesToRender.map((activity, index) => (
            <View key={`${activity.id}-${index}`} style={styles.activityItem}>
              <View style={styles.iconContainer}>
                <FontAwesome5
                  name={activity.icon}
                  size={20}
                  color="#059669"
                  style={styles.icon}
                />
                {/* Change badge color to orange */}
                <View style={[styles.countBadge, { backgroundColor: "#FF9800" }]}>
                  <Text style={styles.countText}>{activity.count}</Text>
                </View>
              </View>
              <Text style={styles.activityName}>{activity.name}</Text>
            </View>
          ))}
        </View>

        {/* Sample data overlay - only show when using sample data */}
        {!hasRealData && (
          <View style={styles.sampleDataOverlay}>
            <View style={styles.sampleDataBanner}>
              <FontAwesome5 name="info-circle" size={24} color="#FF9800" style={styles.infoIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.sampleDataTitle}>
                  SAMPLE DATA
                </Text>
                <Text style={styles.sampleDataSubtitle}>
                  Track activities to see your progress!
                </Text>
              </View>
            </View>
          </View>
        )}
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
  gridContainer: {
    position: 'relative', // For overlay positioning
  },

  // Update the overlay styles for better visibility balance:

  sampleDataOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Lighter background overlay
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  sampleDataBanner: {
  backgroundColor: 'rgba(255, 255, 255, 0)', // Semi-transparent but readable
  borderRadius: 12,
  padding: 16,
  width: '90%',
  alignItems: 'center',
  flexDirection: 'row',
},

textContainer: {
  flex: 1,
  alignItems: 'center',
},

sampleDataTitle: {
  fontSize: 16,
  color: '#333',
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: 4,
},

sampleDataSubtitle: {
  fontSize: 12,
  color: '#666',
  fontWeight: '500',
  textAlign: 'center',
  lineHeight: 16,
},

infoIcon: {
  marginRight: 12,
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
    fontSize: 11,
    textAlign: 'center',
  },
});

export default ActivityCount;