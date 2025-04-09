import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import FeelingRecord from "@/components/FeelingRecord";
import { FeelingRecordProps } from "@/components/FeelingRecord";
import AntDesign from "@expo/vector-icons/AntDesign";

const RecordsList = ({ records }: { records: FeelingRecordProps[] }) => {
  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Records</Text>
        <AntDesign name="rightcircleo" size={24} color="black" />
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18, // Smaller font size for a minimalist look
    fontWeight: "600",
    color: "#000",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    alignItems: "stretch",
    gap: 10,
    paddingBottom: 10,
  },
});

export default RecordsList;
