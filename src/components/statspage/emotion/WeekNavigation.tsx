import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

interface WeekNavigationProps {
  currentWeek: number;
  totalWeeks: number;
  weekDateRange: string;
  onWeekChange: (weekIndex: number) => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  totalWeeks,
  weekDateRange,
  onWeekChange,
}) => {
  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      onWeekChange(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks - 1) {
      onWeekChange(currentWeek + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        <TouchableOpacity 
          onPress={handlePreviousWeek}
          disabled={currentWeek === 0}
          style={[styles.navButton, currentWeek === 0 && styles.disabledButton]}
        >
          <Ionicons 
            name="chevron-back" 
            size={22} 
            color={currentWeek === 0 ? "#a1a1aa" : "#3b82f6"} 
          />
        </TouchableOpacity>
        
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>{weekDateRange}</Text>
          <View style={styles.dotsContainer}>
            {Array(totalWeeks).fill(0).map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  currentWeek === index && styles.activeDot
                ]} 
              />
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={handleNextWeek}
          disabled={currentWeek === totalWeeks - 1}
          style={[styles.navButton, currentWeek === totalWeeks - 1 && styles.disabledButton]}
        >
          <Ionicons 
            name="chevron-forward" 
            size={22} 
            color={currentWeek === totalWeeks - 1 ? "#a1a1aa" : "#3b82f6"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
  },
  disabledButton: {
    backgroundColor: '#f1f5f9',
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#3b82f6',
  },
});

export default WeekNavigation;