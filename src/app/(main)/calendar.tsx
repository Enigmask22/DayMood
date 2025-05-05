import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { LocaleConfig } from "react-native-calendars";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import CustomCalendarHeader from "../../components/calendar/CustomCalendarHeader";
import MonthPickerModal from "../../components/calendar/MonthPickerModal";
import YearPickerModal from "../../components/calendar/YearPickerModal";

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

  // Demo: các ngày có sự kiện
  const eventDates: Record<string, any> = {
    "2025-05-03": { marked: true, dots: [{ color: "#79BF5D" }] },
    "2025-05-04": { marked: true, dots: [{ color: "#7C5CFC" }] },
    "2025-05-07": {
      marked: true,
      dots: [{ color: "#79BF5D" }, { color: "#7C5CFC" }],
    },
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

  // State cho tháng/năm hiện tại
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Xử lý thay đổi tháng
  const handleMonthChange = (monthIdx: number) => {
    setCurrentMonth(monthIdx);
    const today = new Date();
    const isCurrentMonth =
      monthIdx === today.getMonth() && currentYear === today.getFullYear();
    if (isCurrentMonth) {
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setSelected(`${yyyy}-${mm}-${dd}`);
    } else {
      setSelected("");
    }
    setShowMonthPicker(false);
  };

  // Xử lý thay đổi năm
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    const today = new Date();
    const isCurrentYear =
      year === today.getFullYear() && currentMonth === today.getMonth();
    if (isCurrentYear) {
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setSelected(`${yyyy}-${mm}-${dd}`);
    } else {
      setSelected("");
    }
    setShowYearPicker(false);
  };

  // Xử lý nút prev/next
  const handlePrevPress = () => {
    const today = new Date();
    if (currentMonth === 0) {
      const newYear = currentYear - 1;
      const newMonth = 11;
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
      const isCurrentMonth =
        newMonth === today.getMonth() && newYear === today.getFullYear();
      if (isCurrentMonth) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setSelected(`${yyyy}-${mm}-${dd}`);
      } else {
        setSelected("");
      }
    } else {
      const newMonth = currentMonth - 1;
      setCurrentMonth(newMonth);
      const isCurrentMonth =
        newMonth === today.getMonth() && currentYear === today.getFullYear();
      if (isCurrentMonth) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setSelected(`${yyyy}-${mm}-${dd}`);
      } else {
        setSelected("");
      }
    }
  };

  const handleNextPress = () => {
    const today = new Date();
    if (currentMonth === 11) {
      const newYear = currentYear + 1;
      const newMonth = 0;
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
      const isCurrentMonth =
        newMonth === today.getMonth() && newYear === today.getFullYear();
      if (isCurrentMonth) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setSelected(`${yyyy}-${mm}-${dd}`);
      } else {
        setSelected("");
      }
    } else {
      const newMonth = currentMonth + 1;
      setCurrentMonth(newMonth);
      const isCurrentMonth =
        newMonth === today.getMonth() && currentYear === today.getFullYear();
      if (isCurrentMonth) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setSelected(`${yyyy}-${mm}-${dd}`);
      } else {
        setSelected("");
      }
    }
  };

  return (
    <View style={styles.screen}>
      <CalendarHeader
        todayString={todayString}
        onAddPress={() => {
          // Handle add event
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
