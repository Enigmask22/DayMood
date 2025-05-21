import RecordsList from "@/components/postlist/RecordList";
import Greeting from "@/components/postlist/Greeting";
import { HOME_COLOR } from "src/utils/constant";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { useAppSelector, useAppDispatch } from "src/store";
import { fetchRecords } from "src/store/slices/recordSlice";
import { useFocusEffect } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';

const { width, height } = Dimensions.get("window");
const PostlistPage = () => {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector((state) => state.records);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sử dụng useFocusEffect thay vì useEffect để tải lại dữ liệu mỗi khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      // Tải dữ liệu khi màn hình được focus (khi người dùng quay lại từ màn hình khác)
      console.log("Home screen focused, fetching records...");
      dispatch(fetchRecords());
      console.log("Fetched records:", records);
    }, [dispatch])
  );

  // Go to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  // Go to next month
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    if (!records || records.length === 0) return [];

    return records.filter(record => {
      const recordDate = new Date(record.rawDate);
      return recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getFullYear() === selectedDate.getFullYear();
    }).sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [records, selectedDate]);

  return (
    <View style={styles.container}>
      <Greeting />
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
          <AntDesign name="leftcircleo" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedDate.toLocaleString('en', { month: 'long' })}, {selectedDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
          <AntDesign name="rightcircleo" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <RecordsList records={filteredRecords} loading={loading} error={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    gap: width * 0.05,
  },
  monthButton: {
    padding: width * 0.02,
  },
  monthText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default PostlistPage;
