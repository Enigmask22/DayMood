import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MOODS } from "@/utils/constant";
import { ChartWeekData, DayData } from "./types";

const { width } = Dimensions.get("window");

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
    weekData.days.forEach((day) => {
      const totalCount = Object.values(day.moodCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      if (totalCount > maxValue) maxValue = totalCount;
    });
    return Math.max(5, Math.ceil(maxValue));
  };

  const maxValue = calculateMaxValue();

  // Generate y-axis values
  const yAxisValues: number[] = [];
  for (let i = maxValue; i >= 0; i -= Math.ceil(maxValue / 5)) {
    yAxisValues.push(i);
  }
  if (yAxisValues[yAxisValues.length - 1] !== 0) {
    yAxisValues.push(0);
  }

  // Calculate the distance between grid lines
  const gridSpacing = CHART_HEIGHT / (yAxisValues.length - 1);

  const getPixelHeightForValue = (
    valueToConvert: number,
    yAxisLabelsDesc: number[], // e.g., [9, 7, 5, 3, 1, 0]
    pixelSpacePerSegment: number // This is gridSpacing
  ): number => {
    let totalPixelHeight = 0;
    // Iterate through the visual segments of the Y-axis from bottom to top
    // yAxisLabelsDesc is sorted high to low.
    // Example: [9, 7, 5, 3, 1, 0]. Length = 6. numVisualSegments = 5.
    // Bottom segment is between yAxisLabelsDesc[4] (value 1) and yAxisLabelsDesc[5] (value 0)
    for (let i = yAxisLabelsDesc.length - 2; i >= 0; i--) {
      const segmentUpperValue = yAxisLabelsDesc[i]; // Upper value of the current Y-axis segment
      const segmentLowerValue = yAxisLabelsDesc[i + 1]; // Lower value of the current Y-axis segment
      const valueCapacityOfSegment = segmentUpperValue - segmentLowerValue;

      if (valueCapacityOfSegment <= 0) {
        // This case should ideally not happen if yAxisLabels are distinct and ordered
        continue;
      }

      if (valueToConvert > segmentLowerValue) {
        // Determine how much of the valueToConvert falls into this specific segment's range
        const valuePortionInSegment = Math.min(
          valueToConvert - segmentLowerValue,
          valueCapacityOfSegment
        );
        totalPixelHeight +=
          (valuePortionInSegment / valueCapacityOfSegment) *
          pixelSpacePerSegment;
      }
    }
    return totalPixelHeight;
  };

  return (
    <View style={styles.chartContainer}>
      <View style={styles.yAxisContainer}>
        {yAxisValues.map((value, index) => (
          <View
            key={index}
            style={[styles.yAxisLabelContainer, { top: index * gridSpacing }]}
          >
            <Text style={styles.yAxisLabel}>{value}</Text>
            <View style={styles.gridLine} />
          </View>
        ))}
      </View>

      <View style={[styles.barsContainer, { height: CHART_HEIGHT }]}>
        {weekData.days.map((dayData, index) => {
          let cumulativeValue = 0; // Reset for each day's bar

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
                    {/* MOODS are iterated in their defined order.
                        With flexDirection: 'column-reverse', MOODS[0] will be at the bottom.
                    */}
                    {MOODS.map((mood) => {
                      const count = dayData.moodCounts[mood.id] || 0;
                      if (count === 0) return null;

                      const previousCumulativeValue = cumulativeValue;
                      cumulativeValue += count;

                      const heightAtTopOfSegment = getPixelHeightForValue(
                        cumulativeValue,
                        yAxisValues, // This is your yAxisLabelsDesc
                        gridSpacing
                      );
                      const heightAtBottomOfSegment = getPixelHeightForValue(
                        previousCumulativeValue,
                        yAxisValues, // This is your yAxisLabelsDesc
                        gridSpacing
                      );

                      const segmentPixelHeight =
                        heightAtTopOfSegment - heightAtBottomOfSegment;

                      return (
                        <View
                          key={mood.id}
                          style={[
                            styles.barSegment,
                            {
                              height: segmentPixelHeight,
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
                  // ... existing emptyBar ...
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
        {MOODS.map((mood) => (
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
    backgroundColor: "#fff",
    borderRadius: 12,
    position: "relative",
    paddingLeft: 10,
    paddingBottom: 10, // Add space for legend
  },
  yAxisContainer: {
    position: "absolute",
    top: 10,
    height: CHART_HEIGHT,
    zIndex: 2,
  },
  yAxisLabelContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 20,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#64748b",
    width: 25,
    textAlign: "right",
    marginRight: 5,
  },
  gridLine: {
    position: "absolute",
    left: 30,
    right: -width + 85,
    height: 1,
    backgroundColor: "rgba(203, 213, 225, 0.4)",
    zIndex: 1,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginLeft: 35,
    marginTop: 10,
    marginRight: 5,
    zIndex: 2,
  },
  barColumn: {
    alignItems: "center",
    width: BAR_WIDTH + 6,
  },
  barContainer: {
    width: BAR_WIDTH,
    justifyContent: "flex-end",
    zIndex: 3,
  },
  bar: {
    flexDirection: "column-reverse",
    width: "100%",
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
    zIndex: 3,
  },
  barSegment: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  barLabel: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  emptyBar: {
    height: 20,
    width: BAR_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDash: {
    width: 16,
    height: 2,
    backgroundColor: "#cbd5e1",
    borderRadius: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 40,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
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
    color: "#334155",
  },
});

export default MoodChart;
