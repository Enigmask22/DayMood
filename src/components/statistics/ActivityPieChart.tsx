import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { HOME_COLOR } from "@/utils/constant";
import { FontAwesome5 } from "@expo/vector-icons";

interface PieChartItem {
  name: string;
  count: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface ActivityPieChartProps {
  pieChartData: PieChartItem[];
  totalByType: Record<string, number>;
  totalActivities: number;
  recentActivities?: Record<string, string>;
  hasRealData?: boolean;
}

const ActivityPieChart = ({ 
  pieChartData, 
  totalByType, 
  totalActivities,
  recentActivities = {},
  hasRealData = true
}: ActivityPieChartProps) => {

  // Find most frequent activity
  let mostFrequentActivity = '';
  let maxCount = 0;
  
  for (const [activity, count] of Object.entries(totalByType)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentActivity = activity;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Activity Distribution</Text>
      
      {/* Chart and Legend Container with relative positioning for overlay */}
      <View style={styles.chartAndLegendContainer}>
        {/* Centered Pie Chart */}
        <View style={styles.chartContainer}>
          <PieChart
            data={pieChartData}
            width={Dimensions.get("window").width/2}
            height={200}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[50, 0]}
            absolute
            hasLegend={false}
          />
        </View>
        
        {/* Custom Color Legend */}
        <View style={styles.colorLegendContainer}>
          {pieChartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendLeftSection}>
                <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
              <Text style={styles.legendValueText}>
                {item.count} ({Math.round((item.count / totalActivities) * 100)}%)
              </Text>
            </View>
          ))}
        </View>
        
        {/* Summary Statistics */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Total Activities: {totalActivities}
          </Text>
          {mostFrequentActivity && (
            <Text style={styles.summarySubtext}>
              Most frequent: {mostFrequentActivity} ({totalByType[mostFrequentActivity]})
            </Text>
          )}
        </View>
        
        {/* Sample data overlay - only show when no real data */}
        {!hasRealData && (
          <View style={styles.sampleDataOverlay}>
            <View style={styles.sampleDataBanner}>
              <FontAwesome5 name="info-circle" size={24} color={HOME_COLOR.HOMETABBAR} style={styles.infoIcon} />
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
    marginVertical: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: HOME_COLOR.HOMESTATUS2,
    marginBottom: 15,
  },
  chartAndLegendContainer: {
    position: 'relative', // For overlay positioning
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    marginVertical: 10,
    overflow: 'visible',
  },
  colorLegendContainer: {
    flexDirection: 'column',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legendLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 10,
  },
  legendText: {
    fontSize: 13,
    color: '#444',
    flex: 1,
  },
  legendValueText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  summaryContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: HOME_COLOR.HOMESTATUS2,
  },
  summarySubtext: {
    fontSize: 12,
    color: HOME_COLOR.HOMETEXT,
    marginTop: 4,
  },
  // Sample data overlay styles
  sampleDataOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  sampleDataBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 12,
    padding: 16,
    width: '85%',
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
});

export default ActivityPieChart;