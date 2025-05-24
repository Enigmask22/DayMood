import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { HOME_COLOR } from "@/utils/constant";

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
}

const ActivityPieChart = ({ 
  pieChartData, 
  totalByType, 
  totalActivities,
  recentActivities = {}
}: ActivityPieChartProps) => {
  // No data handling
  if (!pieChartData || pieChartData.length === 0 || totalActivities <= 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.chartTitle}>Activity Distribution</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activity data available for this period</Text>
        </View>
      </View>
    );
  }

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
      

<View style={styles.chartContainer}>
  <PieChart
    data={pieChartData}
    width={Dimensions.get("window").width - 60} // Reduce width slightly
    height={200}
    chartConfig={{
      backgroundColor: "transparent",
      backgroundGradientFrom: "transparent",
      backgroundGradientTo: "transparent",
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }}
    accessor="count"
    backgroundColor="transparent"
    paddingLeft="0" // Remove padding left
    center={[Dimensions.get("window").width/5, 0]} // Shift center point significantly to the right
    absolute
    hasLegend={false}
  />
</View>
      
      {/* Custom Color Legend */}
      <View style={styles.colorLegendContainer}>
        {pieChartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name} ({Math.round((item.count / totalActivities) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
      
      {/* Summary Statistics */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total Activities: {totalActivities}
        </Text>
        <Text style={styles.summarySubtext}>
          Most frequent: {mostFrequentActivity} ({totalByType[mostFrequentActivity]})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  chartContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 200,
  marginVertical: 10,
  overflow: 'visible', // Allow chart to overflow its container if needed
},
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: HOME_COLOR.HOMESTATUS2,
    marginBottom: 15,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 10,
  },
  emptyText: {
    color: HOME_COLOR.HOMETEXT,
    fontSize: 16,
    textAlign: 'center',
  },
  // Add or replace these styles:

legendOuterContainer: {
  marginTop: 15,
  marginBottom: 10,
  backgroundColor: '#f9f9f9',
  borderRadius: 8,
  padding: 10,
},
legendHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '#eeeeee',
  paddingBottom: 8,
  marginBottom: 8,
},
legendHeaderText: {
  fontSize: 12,
  fontWeight: '600',
  color: HOME_COLOR.HOMESTATUS2,
},
colorLegendContainer: {
  flexDirection: 'column',
},
legendItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 6,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
legendLeftSection: {
  flexDirection: 'row',
  alignItems: 'center',
},
colorBox: {
  width: 12,
  height: 12,
  borderRadius: 3,
  marginRight: 8,
},
legendText: {
  fontSize: 13,
  color: '#444',
},
legendValueText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#666',
},
  summaryContainer: {
    marginTop: 10,
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
});

export default ActivityPieChart;