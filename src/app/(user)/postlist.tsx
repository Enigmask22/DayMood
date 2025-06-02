import RecordsList from "@/components/postlist/RecordList";
import Greeting from "@/components/postlist/Greeting";
import { HOME_COLOR } from "src/utils/constant";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { useAppSelector, useAppDispatch } from "src/store";
import { fetchRecords } from "src/store/slices/recordSlice";
import { useFocusEffect } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';

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
      // console.log("Fetched records:", records);
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
      <View style={styles.monthSelectorContainer}>
        <LinearGradient
          colors={["#22ee99", "#2ceeAA"]}
          style={styles.monthSelector}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={styles.monthButton}
            activeOpacity={0.7}
          >
            <AntDesign name="leftcircle" size={28} color="#25A18E" />
          </TouchableOpacity>

          <View style={styles.monthTextContainer}>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleString('en', { month: 'long' })}
            </Text>
            <Text style={styles.yearText}>
              {selectedDate.getFullYear()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.monthButton}
            activeOpacity={0.7}
          >
            <AntDesign name="rightcircle" size={28} color="#25A18E" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
      <View style={styles.recordsListContainer}>
        <RecordsList records={filteredRecords} loading={loading} error={error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  monthSelectorContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.01,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthButton: {
    padding: width * 0.015,
    borderRadius: 30,
  },
  monthTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  monthText: {
    fontSize: width * 0.055,
    fontFamily: 'Quicksand-Bold', // Use your app's font family
    color: '#333',
  },
  yearText: {
    fontSize: width * 0.035,
    fontFamily: 'Quicksand-Medium', // Use your app's font family
    color: '#666',
    marginTop: 2,
  },
  recordsListContainer: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.01,
  },
});

export default PostlistPage;
