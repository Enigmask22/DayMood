import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { MOODS } from '@/utils/constant';
import { ChartWeekData, DayData } from './types';

const { width } = Dimensions.get('window');

const BAR_HEIGHT = 180;
const BAR_WIDTH = 32;
const MAX_BAR_VALUE = 5; // Default maximum value for y-axis
const CHART_HEIGHT = 150; // Actual height for bars to match y-axis

interface MoodChartProps {
  weekData: ChartWeekData;
  onDayPress: (dayData: DayData, dayIndex: number) => void;
}

const MoodChart: React.FC<MoodChartProps> = ({ weekData, onDayPress }) => {
  // Calculate the maximum value for proper scaling
  const calculateMaxValue = () => {
    let maxValue = MAX_BAR_VALUE;
    weekData.days.forEach(day => {
      const totalCount = Object.values(day.moodCounts).reduce((sum, count) => sum + count, 0);
      if (totalCount > maxValue) maxValue = totalCount;
    });
    return Math.max(5, Math.ceil(maxValue));
  };

  const maxValue = calculateMaxValue();
  
  // Generate y-axis values
  const yAxisValues = [];
  for (let i = maxValue; i >= 0; i -= Math.ceil(maxValue / 5)) {
    yAxisValues.push(i);
  }
  if (yAxisValues[yAxisValues.length - 1] !== 0) {
    yAxisValues.push(0);
  }

  // Calculate the distance between grid lines
  const gridSpacing = CHART_HEIGHT / (yAxisValues.length - 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.yAxisContainer}>
        {yAxisValues.map((value, index) => (
          <View 
            key={index} 
            style={[
              styles.yAxisLabelContainer, 
              { top: index * gridSpacing }
            ]}
          >
            <Text style={styles.yAxisLabel}>{value}</Text>
            <View style={styles.gridLine} />
          </View>
        ))}
      </View>

      <View style={[styles.barsContainer, { height: CHART_HEIGHT }]}>
        {weekData.days.map((dayData, index) => {
          return (
            <TouchableOpacity 
              key={index} 
              style={styles.barColumn}
              onPress={() => dayData.hasData && onDayPress(dayData, index)}
              activeOpacity={dayData.hasData ? 0.7 : 1}
            >
              <View style={[styles.barContainer, { height: CHART_HEIGHT }]}>
                {dayData.hasData ? (
                  <View style={styles.bar}>
                    {MOODS.map(mood => {
                      const count = dayData.moodCounts[mood.id] || 0;
                      if (count === 0) return null;
                      
                      // Calculate height based on grid spacing
                      const heightValue = (count / maxValue) * CHART_HEIGHT;
                      
                      return (
                        <View
                          key={mood.id}
                          style={[
                            styles.barSegment,
                            {
                              height: heightValue,
                              backgroundColor: mood.color,
                            },
                          ]}
                        >
                          {count > 0 && (
                            <Text style={styles.barLabel}>{count}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyBar}>
                    <View style={styles.emptyDash} />
                  </View>
                )}
              </View>
              <Text style={styles.dayLabel}>{dayData.day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {MOODS.map(mood => (
          <View key={mood.id} style={styles.legendItem}>
            <View 
              style={[styles.legendColorBox, { backgroundColor: mood.color }]} 
            />
            <Text style={styles.legendText}>{mood.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    position: 'relative',
    paddingLeft: 10,
    paddingBottom: 10, // Add space for legend
  },
  yAxisContainer: {
    position: 'absolute',
    top: 10,
    height: CHART_HEIGHT,
    zIndex: 2,
  },
  yAxisLabelContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 20,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 25,
    textAlign: 'right',
    marginRight: 5,
  },
  gridLine: {
    position: 'absolute',
    left: 30,
    right: -width + 85,
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.4)',
    zIndex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 35,
    marginTop: 10,
    marginRight: 5,
  },
  barColumn: {
    alignItems: 'center',
    width: BAR_WIDTH + 6,
  },
  barContainer: {
    width: BAR_WIDTH,
    justifyContent: 'flex-end',
  },
  bar: {
    flexDirection: 'column-reverse',
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barSegment: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyBar: {
    height: 20,
    width: BAR_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDash: {
    width: 16,
    height: 2,
    backgroundColor: '#cbd5e1',
    borderRadius: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  legendColorBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#334155',
  },
});

export default MoodChart;