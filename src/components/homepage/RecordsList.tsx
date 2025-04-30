import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import FeelingRecord from "src/components/homepage/FeelingRecord";
import { FeelingRecordProps } from "src/components/homepage/FeelingRecord";
import AntDesign from "@expo/vector-icons/AntDesign";
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
  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Records</Text>
        <AntDesign name="rightcircleo" size={width * 0.06} color="black" />
      </View>

      {/* Hiển thị loading */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.messageText}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {/* Hiển thị lỗi */}
      {error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Hiển thị khi không có dữ liệu */}
      {!loading && !error && records.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>Không có bản ghi nào</Text>
        </View>
      )}

      {/* Scrollable List */}
      {!loading && !error && records.length > 0 && (
        <FlatList
          data={records}
          renderItem={({ item }) => (
            <FeelingRecord
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
          scrollIndicatorInsets={{ right: 1 }} // Optional: Adjust the position of the scroll indicator
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: height * 0.12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  headerTitle: {
    fontFamily: "Quicksand-Bold",
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#000",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: width * 0.025,
    alignItems: "stretch",
    gap: height * 0.015,
    paddingBottom: height * 0.015,
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
