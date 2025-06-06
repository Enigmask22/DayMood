import React, { useState, useRef, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { HOME_COLOR } from "@/utils/constant";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { SegmentedControl } from "@/components/statistics/SegmentedControl";
import { FontAwesome5 } from "@expo/vector-icons";

interface ActivityLineChartProps {
  lineChartData: {
    labels: string[];
    datasets: {
      data: number[];
      color: () => string;
      strokeWidth: number;
    }[];
  };
  daysInMonth: number;
  hasRealData?: boolean;
}

const ActivityLineChart = ({ lineChartData, daysInMonth, hasRealData = true }: ActivityLineChartProps) => {
  // Display mode state: 'daily', '2day', or '5day'
  const [displayMode, setDisplayMode] = useState<'daily' | '2day' | '5day'>('5day');


  // For horizontal scrolling (Reanimated 2)
  const panX = useSharedValue(0);
  const contextX = useSharedValue(0);

  // Derive zoom level from display mode
  const zoomLevel = useMemo(() => {
    switch (displayMode) {
      case 'daily': return 1;  // Show every day
      case '2day': return 2;   // Group by 2 days
      case '5day': return 5;   // Group by 5 days
      default: return 5;
    }
  }, [displayMode]);

  // Update the zoomedLineChartData useMemo function:

  // Create zoomed data based on zoom level
  const zoomedLineChartData = useMemo(() => {
    const { labels, datasets } = lineChartData;
    const data = datasets[0].data;

    if (zoomLevel === 1) {
      // Show all days (maximum detail)
      return lineChartData;
    }

    // Aggregate data points based on zoom level
    const aggregatedLabels: string[] = [];
    const aggregatedData: number[] = [];

    for (let i = 0; i < labels.length; i += zoomLevel) {
      // Calculate SUM for this group (not average)
      let sum = 0;
      let count = 0;
      let startDay = parseInt(labels[i]);
      let endDay = startDay;

      for (let j = 0; j < zoomLevel && i + j < data.length; j++) {
        sum += data[i + j];
        count++;
        endDay = parseInt(labels[i + j]);
      }

      if (count > 0) {
        // Use sum directly instead of average to maintain proper scaling
        aggregatedData.push(sum);

        // Show date range in label
        if (startDay === endDay) {
          aggregatedLabels.push(`${startDay}`);
        } else {
          aggregatedLabels.push(`${startDay}-${endDay}`);
        }
      }
    }

    return {
      labels: aggregatedLabels,
      datasets: [
        {
          data: aggregatedData,
          color: datasets[0].color,
          strokeWidth: datasets[0].strokeWidth,
        }
      ]
    };
  }, [lineChartData, zoomLevel]);

  // Calculate chart dimensions based on display mode
  const chartWidth = Dimensions.get('window').width - 40; // Base width
  const chartHeight = 180; // Base height

  // Calculate width based on display mode (wider for more detailed views)
  const displayWidth = displayMode === 'daily' ? chartWidth * 2 : // Double width for daily view
    displayMode === '2day' ? chartWidth * 1.8 : // Slightly wider for 2-day
      chartWidth; // Regular width for 5-day (fits whole month)

  // Modern gesture system
  const panGesture = Gesture.Pan()
    .enabled(displayMode !== '5day')
    .onStart(() => {
      contextX.value = panX.value;
    })
    .onUpdate((event) => {
      // Calculate boundaries for horizontal scrolling
      const maxPanX = Math.max(0, (displayWidth - chartWidth) / 2);

      // Apply boundaries with smooth movement
      let newPanX = contextX.value + event.translationX;
      newPanX = Math.min(Math.max(newPanX, -maxPanX), maxPanX);

      panX.value = newPanX;
    });

  // Create animated styles for chart panning
  const animatedChartStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }]
  }));

  // Set initial position to show most recent data (right edge)
  React.useEffect(() => {
    if (displayMode !== '5day') {
      // Calculate position to show right edge of chart
      const maxPanX = Math.max(0, (displayWidth - chartWidth) / 2);
      const initialPosition = -maxPanX; // Negative to show right side
      panX.value = withSpring(initialPosition);
    } else {
      // Reset for 5-day view
      panX.value = withSpring(0);
    }
  }, [displayMode, displayWidth, chartWidth]);

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartTitleContainer}>
        <Text style={styles.chartTitle}>Daily Activity Count</Text>
      </View>

      {/* Display Mode Selector */}
      <View style={styles.displayModeContainer}>
        <SegmentedControl
          values={['5-Day View', '2-Day View', 'Daily View']}
          selectedIndex={displayMode === '5day' ? 0 : displayMode === '2day' ? 1 : 2}
          onChange={(index) => {
            const modes: Array<'5day' | '2day' | 'daily'> = ['5day', '2day', 'daily'];
            setDisplayMode(modes[index]);
          }}
          style={styles.segmentedControl}
        />
      </View>

      {/* Chart Window Container with relative positioning for overlay */}
      <View style={styles.chartWindowContainer}>
        <GestureHandlerRootView style={styles.gestureContainer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.scrollableChartContent,
                animatedChartStyle
              ]}
            >
              <LineChart
                data={zoomedLineChartData}
                width={displayWidth}
                height={chartHeight}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "white",
                  backgroundGradientTo: "white",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: HOME_COLOR.HOMETABBAR,
                  },
                  fillShadowGradient: HOME_COLOR.HOMESTATUS1,
                  fillShadowGradientOpacity: 0.6,
                }}
                bezier
                style={styles.chart}
              />
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
        {/* Sample data overlay - only show when no real data */}
        {!hasRealData && (
          <View style={styles.sampleDataOverlay}>
            <View style={styles.sampleDataBanner}>
              <FontAwesome5 name="info-circle" size={20} color={HOME_COLOR.HOMETABBAR} style={styles.infoIcon} />
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

      {displayMode !== '5day' && (
        <View style={styles.gestureHint}>
          <Text style={styles.hintText}>Swipe to scroll horizontally</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartSection: {
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: HOME_COLOR.HOMESTATUS2,
  },
  displayModeContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  segmentedControl: {
    width: '100%',
    height: 36,
  },

  chartWindowContainer: {
    height: 180,
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative', // Add this for overlay positioning
  },

  // Add these new overlay styles
  sampleDataOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  sampleDataBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 10,
    padding: 12,
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row',
  },

  textContainer: {
    flex: 1,
    alignItems: 'center',
  },

  sampleDataTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },

  sampleDataSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Light',
    textAlign: 'center',
    lineHeight: 14,
  },

  infoIcon: {
    marginRight: 10,
  },
  gestureContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollableChartContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  gestureHint: {
    alignItems: 'center',
    marginTop: 8,
  },
  hintText: {
    fontSize: 11,
    color: HOME_COLOR.HOMETEXT,
  },
});

export default ActivityLineChart;

