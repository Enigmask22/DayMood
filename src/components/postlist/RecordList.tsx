import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { useState, useEffect } from "react";
import FeelingRecord from "./FeelingRecord";
import { FeelingRecordProps } from "src/components/homepage/FeelingRecord";
import { HOME_COLOR, MOODS } from "@/utils/constant";
const { width, height } = Dimensions.get("window");

interface RecordItem extends FeelingRecordProps {
  id?: string;
}

interface RecordsListProps {
  records: RecordItem[];
  loading?: boolean;
  error?: string | null;
}

const RecordsList = ({ records, loading, error }: RecordsListProps) => {
  // State to hold the selected mood filter
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  // State to hold filtered records
  const [filteredRecords, setFilteredRecords] = useState<RecordItem[]>(records);

  // Update filtered records when records change or filter changes
  useEffect(() => {
    if (selectedMoodFilter) {
      const filtered = records.filter(record => record.emoji === selectedMoodFilter.toLowerCase());
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [records, selectedMoodFilter]);

  // Function to handle mood filter selection
  const handleMoodFilter = (moodName: string) => {
    if (selectedMoodFilter === moodName) {
      // If clicking the same filter, clear the filter
      setSelectedMoodFilter(null);
    } else {
      setSelectedMoodFilter(moodName);
    }
  };

  // Function to clear the filter
  const clearFilter = () => {
    setSelectedMoodFilter(null);
  };

  return (
    <View style={styles.container}>
      {/* Results Status */}
      {!loading && !error && selectedMoodFilter && (
        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusText}>
            Showing {filteredRecords.length} {selectedMoodFilter} record{filteredRecords.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <View style={styles.contentWrapper}>
        {/* Hiển thị loading */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
            <Text style={styles.messageText}>Loading...</Text>
          </View>
        )}

        {/* Hiển thị lỗi */}
        {error && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Hiển thị khi không có dữ liệu */}
        {!loading && !error && filteredRecords.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>
              {selectedMoodFilter
                ? `No "${selectedMoodFilter}" records found`
                : "No Recording"}
            </Text>
          </View>
        )}

        {/* Scrollable List */}
        {!loading && !error && filteredRecords.length > 0 && (
          <FlatList
            data={filteredRecords}
            renderItem={({ item, index }) => (
              <FeelingRecord
                index={index}
                total={filteredRecords.length}
                id={item.id}
                date={item.date}
                emoji={item.emoji}
                feeling={item.feeling}
              />
            )}
            keyExtractor={(item, index) => item.id || index.toString()}
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            scrollIndicatorInsets={{ right: 1 }}
          />
        )}
        {/* Mood Filter Section */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filter by mood:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodFilterItem,
                  selectedMoodFilter === mood.name && styles.moodFilterItemSelected,
                  { backgroundColor: selectedMoodFilter === mood.name ? mood.color : 'rgba(0,0,0,0.05)' }
                ]}
                onPress={() => handleMoodFilter(mood.name)}
              >
                <Text style={[
                  styles.moodFilterText,
                  selectedMoodFilter === mood.name && styles.moodFilterTextSelected
                ]}>
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Show Clear Filter button when a filter is active */}
          {/* {selectedMoodFilter && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilter}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width * 0.9,
    alignSelf: "center",
  },
  filterContainer: {
    marginBottom: height * 0.015,
    paddingTop: height * 0.01,
  },
  filterTitle: {
    fontSize: width * 0.04,
    fontFamily: "Quicksand-Bold",
    marginBottom: height * 0.01,
    paddingLeft: width * 0.02,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  moodFilterItem: {
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    marginRight: width * 0.02,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodFilterItemSelected: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  moodFilterText: {
    fontFamily: "Quicksand-Medium",
    fontSize: width * 0.035,
  },
  moodFilterTextSelected: {
    color: "white",
    fontFamily: "Quicksand-Bold",
  },
  clearFilterButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    marginTop: height * 0.01,
  },
  clearFilterText: {
    color: "#2196F3",
    fontFamily: "Quicksand-Medium",
    fontSize: width * 0.035,
  },
  filterStatusContainer: {
    paddingHorizontal: width * 0.02,
    paddingBottom: height * 0.01,
  },
  filterStatusText: {
    fontFamily: "Quicksand-Medium",
    fontSize: width * 0.035,
    color: "#666",
    fontStyle: 'italic',
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: height * 0.02,
    width: "100%",
    paddingHorizontal: width * 0.02,
  },
  headerTitle: {
    fontFamily: "Quicksand-Bold",
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#000",
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: width * 0.025,
    alignItems: "stretch",
    gap: height * 0.015,
    paddingBottom: height * 0.015,
    marginLeft: width * 0.03,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    marginTop: 10,
    fontSize: width * 0.04,
    fontFamily: "Quicksand-Medium",
  },
  errorText: {
    fontSize: width * 0.04,
    color: "red",
    fontFamily: "Quicksand-Medium",
    textAlign: "center",
    padding: width * 0.05,
  },
});

export default RecordsList;
