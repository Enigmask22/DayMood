import RecordsList from "src/components/homepage/RecordsList";
import Greeting from "src/components/homepage/Greeting";
import { HOME_COLOR } from "src/utils/constant";
import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MoodPromptCard from "src/components/homepage/MoodPromptCard";
import { useAppSelector, useAppDispatch } from "src/store";
import { fetchRecords } from "src/store/slices/recordSlice";

const { width, height } = Dimensions.get("window");
const HomePage = () => {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector((state) => state.records);

  useEffect(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  // Lấy 5 record gần nhất dựa trên date
  const recentRecords = useMemo(() => {
    if (!records || records.length === 0) return [];

    // Sắp xếp records theo date giảm dần (mới nhất trước)
    const sortedRecords = [...records].sort((a, b) => {
      // Tìm date từ trong chuỗi date (dạng WEEKDAY, MONTH DAY HH:MM)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Chỉ lấy 5 record đầu tiên
    return sortedRecords.slice(0, 5);
  }, [records]);

  return (
    <View style={styles.container}>
      <View style={styles.introContainer}>
        <Greeting />
        <MoodPromptCard />
      </View>
      <View style={styles.listContainer}>
        <RecordsList records={recentRecords} loading={loading} error={error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  introContainer: {
    flex: 0.51,
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "red",
    paddingBottom: height * 0.02,
  },
  background: {
    height: height * 0.4,
    width: width,
    padding: height * 0.05,
    marginBottom: height * 0.03,
  },
  greeting: {
    fontSize: 16,
    color: "#000",
  },
  quote: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 0.49,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomePage;
