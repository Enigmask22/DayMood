import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import FeelingRecord from "@/components/FeelingRecord";
import { FeelingRecordProps } from "@/components/FeelingRecord";
import AntDesign from "@expo/vector-icons/AntDesign";
const { width, height } = Dimensions.get("window");
const RecordsList = ({ records }: { records: FeelingRecordProps[] }) => {
  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Records</Text>
        <AntDesign name="rightcircleo" size={width * 0.06} color="black" />
      </View>

      {/* Scrollable List */}
      <FlatList
        data={records}
        renderItem={({ item }) => (
          <FeelingRecord
            date={item.date}
            emoji={item.emoji}
            feeling={item.feeling}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 1 }} // Optional: Adjust the position of the scroll indicator
      />
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
});

export default RecordsList;
