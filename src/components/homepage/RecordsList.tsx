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
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { HOME_COLOR } from "@/utils/constant";
import { Ionicons } from "@expo/vector-icons";
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
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Records</Text>
          <TouchableOpacity
            style={styles.viewMoreContainer}
            onPress={() => router.push("/(user)/postlist" as any)}
          >
            <Text style={styles.viewMoreText}>View details</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
      </View>
      {/* Content Wrapper */}
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

        {/* Improved empty state with visual elements */}
        {!loading && !error && records.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <AntDesign name="calendar" size={width * 0.15} color="#BDBDBD" />
              <AntDesign
                name="exclamationcircleo"
                size={width * 0.06}
                color={HOME_COLOR.HOMETABBAR}
                style={styles.attentionIcon}
              />
            </View>
            <Text style={styles.emptyTitleText}>No Records Yet</Text>
            <Text style={styles.emptySubtitleText}>
              Track your mood daily to see your emotional journey here
            </Text>
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
            scrollIndicatorInsets={{ right: 1 }} 
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: height * 0.12,
    width: width * 0.9,
    alignSelf: "center",
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
    flex: 1,
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
    fontFamily: "Quicksand-Regular",
  },
  errorText: {
    fontSize: width * 0.04,
    color: "red",
    fontFamily: "Quicksand-Regular",
    textAlign: "center",
    padding: width * 0.05,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.05,
    marginTop: height * 0.05,
  },
  emptyIconContainer: {
    position: 'relative',
    margin: width * 0.05,
  },
  attentionIcon: {
    position: 'absolute',
    top: -width * 0.02,
    right: -width * 0.02,
  },
  emptyTitleText: {
    fontSize: width * 0.055,
    fontFamily: "Quicksand-Bold",
    color: "#424242",
    marginBottom: height * 0.015,
    textAlign: "center",
  },
  emptySubtitleText: {
    fontSize: width * 0.04,
    fontFamily: "Quicksand-Regular",
    color: "#757575",
    textAlign: "center",
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  viewMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewMoreText: {
    fontSize: 14,
    fontFamily: "Inter-Light",
    color: "#666",
    marginRight: 5,
  },
});

export default RecordsList;
