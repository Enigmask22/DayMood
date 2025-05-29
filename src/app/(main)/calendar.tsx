import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { LocaleConfig } from "react-native-calendars";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import CustomCalendarHeader from "../../components/calendar/CustomCalendarHeader";
import MonthPickerModal from "../../components/calendar/MonthPickerModal";
import YearPickerModal from "../../components/calendar/YearPickerModal";
import { router, useFocusEffect } from "expo-router";
import { API_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cấu hình ngôn ngữ
LocaleConfig.locales["en"] = LocaleConfig.locales[""];
LocaleConfig.defaultLocale = "en";

const CalendarPage = () => {
  // Hàm format ngày hiện tại
  const formatDate = (date: Date) => {
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const months = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    return `${dayName}, ${monthName} ${date.getDate()}`;
  };

  const todayString = formatDate(new Date());
  const [selected, setSelected] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // State cho tháng/năm hiện tại
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // State cho thống kê
  const [eventDates, setEventDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy thống kê từ API
  const fetchMoodStatistics = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        throw new Error("User not found");
      }
      const userData = JSON.parse(user);
      const response = await fetch(
        `${API_URL}/api/v1/records/statistic/mood?user_id=${userData.id}&month=${month}&year=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch mood statistics");
      }

      const data = await response.json();

      // Chuyển đổi dữ liệu từ API thành định dạng eventDates
      const newEventDates: Record<string, any> = {};
      data.data.monthly.dailyMoodStats.forEach((day: any) => {
        if (day.totalRecords > 0) {
          const dots = day.moodStats.map((mood: any) => ({
            color: getMoodColor(mood.moodId),
          }));
          newEventDates[day.date] = {
            marked: true,
            dots: dots,
          };
        }
      });

      setEventDates(newEventDates);
    } catch (err) {
      setError("Failed to fetch mood statistics");
      console.error("Error fetching mood statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy màu dựa trên moodId
  const getMoodColor = (moodId: number): string => {
    const moodColors: Record<number, string> = {
      1: "#7E7E7E", // Sad
      2: "#EF0808", // Angry
      3: "#540BFF", // Normal
      4: "#FCA10C", // Joyfulr
      5: "#22C55E", // Excellent
    };
    return moodColors[moodId] || "#7C5CFC";
  };

  // Gọi API mỗi khi trang Calendar được focus hoặc khi thay đổi tháng/năm
  useFocusEffect(
    React.useCallback(() => {
      fetchMoodStatistics(currentMonth + 1, currentYear);
    }, [currentMonth, currentYear])
  );

  // Format selected date for display
  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDate(date);
  };

  // markedDates luôn có ngày selected với khung tròn tím
  const markedDates = {
    ...eventDates,
    [selected]: {
      ...(eventDates[selected] || {}),
      selected: true,
      selectedColor: "#7C5CFC",
    },
  };

  // Xử lý thay đổi tháng
  const handleMonthChange = (monthIdx: number) => {
    setCurrentMonth(monthIdx);
    setShowMonthPicker(false);
  };

  // Xử lý thay đổi năm
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  // Xử lý nút prev/next
  const handlePrevPress = () => {
    if (currentMonth === 0) {
      const newYear = currentYear - 1;
      const newMonth = 11;
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    } else {
      const newMonth = currentMonth - 1;
      setCurrentMonth(newMonth);
    }
  };

  const handleNextPress = () => {
    if (currentMonth === 11) {
      const newYear = currentYear + 1;
      const newMonth = 0;
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    } else {
      const newMonth = currentMonth + 1;
      setCurrentMonth(newMonth);
    }
  };
  console.log(todayString);

  return (
    <View style={styles.screen}>
      <CalendarHeader
        dateString={formatSelectedDate(selected)}
        onAddPress={() => {
          router.navigate({
            pathname: "(new)/newemoj" as any,
            params: {
              initialDate: new Date(selected).toISOString(),
            },
          });
        }}
      />

      <View style={styles.calendarBox}>
        <Calendar
          key={`${currentYear}-${currentMonth}`}
          current={`${currentYear}-${String(currentMonth + 1).padStart(
            2,
            "0"
          )}-01`}
          onDayPress={(day: any) => {
            setSelected(day.dateString);
            setCurrentMonth(Number(day.month) - 1);
            setCurrentYear(Number(day.year));
          }}
          markedDates={markedDates}
          markingType={"multi-dot"}
          renderHeader={() => (
            <CustomCalendarHeader
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrevPress={handlePrevPress}
              onNextPress={handleNextPress}
              onMonthPress={() => setShowMonthPicker(true)}
              onYearPress={() => setShowYearPicker(true)}
            />
          )}
          hideArrows={true}
          onMonthChange={(month: { month: number; year: number }) => {
            setCurrentMonth(month.month - 1);
            setCurrentYear(month.year);
          }}
          theme={{
            backgroundColor: "#F0F8F3",
            calendarBackground: "#F0F8F3",
            textSectionTitleColor: "#8F9BB3",
            textDayHeaderColor: "#8F9BB3",
            selectedDayBackgroundColor: "#7C5CFC",
            selectedDayTextColor: "#fff",
            todayTextColor: "#7C5CFC",
            dayTextColor: "#222",
            textDisabledColor: "#ccc",
            dotColor: "#7C5CFC",
            selectedDotColor: "#fff",
            arrowColor: "#7C5CFC",
            monthTextColor: "#222",
            indicatorColor: "#7C5CFC",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "bold",
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      <MonthPickerModal
        visible={showMonthPicker}
        currentMonth={currentMonth}
        onClose={() => setShowMonthPicker(false)}
        onMonthSelect={handleMonthChange}
      />

      <YearPickerModal
        visible={showYearPicker}
        currentYear={currentYear}
        onClose={() => setShowYearPicker(false)}
        onYearSelect={handleYearChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E6F4EA",
    paddingTop: 24,
    paddingHorizontal: 0,
  },
  calendarBox: {
    backgroundColor: "#F0F8F3",
    borderRadius: 18,
    margin: 18,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default CalendarPage;
