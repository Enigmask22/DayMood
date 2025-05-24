import React, { useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { HOME_COLOR } from "@/utils/constant";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload
} from "react-native-gesture-handler";
import { SegmentedControl } from "@/components/statistics/SegmentedControl";

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
}

const ActivityLineChart = ({ lineChartData, daysInMonth }: ActivityLineChartProps) => {
  // Display mode state: 'daily', '2day', or '5day'
  const [displayMode, setDisplayMode] = useState<'daily' | '2day' | '5day'>('5day');
  
  // For horizontal scrolling
  const [panX, setPanX] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Derive zoom level from display mode
  const zoomLevel = useMemo(() => {
    switch(displayMode) {
      case 'daily': return 1;  // Show every day
      case '2day': return 2;   // Group by 2 days
      case '5day': return 5;   // Group by 5 days
      default: return 5;
    }
  }, [displayMode]);

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
      // Calculate average for this group
      let sum = 0;
      let count = 0;
      
      for (let j = 0; j < zoomLevel && i + j < data.length; j++) {
        sum += data[i + j];
        count++;
      }
      
      if (count > 0) {
        aggregatedData.push(Math.round(sum / count));
        aggregatedLabels.push(`${parseInt(labels[i])}`);
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
                        displayMode === '2day' ? chartWidth * 1.3 : // Slightly wider for 2-day
                        chartWidth; // Regular width for 5-day (fits whole month)

  // Event handler for pan gesture
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onPanHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      // Update pan position
      let newPanX = panX + event.nativeEvent.translationX;
      
      // Calculate boundaries for horizontal scrolling
      const maxPanX = Math.max(0, (displayWidth - chartWidth) / 2);
      
      // Apply boundaries
      newPanX = Math.min(Math.max(newPanX, -maxPanX), maxPanX);
      
      setPanX(newPanX);
      
      // Reset animated values
      translateX.setValue(0);
    }
  };

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
            // Reset pan position when changing display mode
            setPanX(0);
            translateX.setValue(0);
          }}
          style={styles.segmentedControl}
        />
      </View>
      
      {/* Chart Window Container */}
      <View style={styles.chartWindowContainer}>
        <GestureHandlerRootView style={styles.gestureContainer}>
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
            minDist={10}
            enabled={displayMode !== '5day'} // Only enable pan for detailed views
          >
            <Animated.View 
              style={[
                styles.scrollableChartContent,
                { 
                  transform: [
                    { translateX: Animated.add(translateX, new Animated.Value(panX)) }
                  ]
                }
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
          </PanGestureHandler>
        </GestureHandlerRootView>
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