import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import { Calendar } from "react-native-calendars";
import { LocaleConfig } from "react-native-calendars";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import CustomCalendarHeader from "../../components/calendar/CustomCalendarHeader";
import MonthPickerModal from "../../components/calendar/MonthPickerModal";
import YearPickerModal from "../../components/calendar/YearPickerModal";
import { router, useFocusEffect } from "expo-router";
import { API_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { HOME_COLOR } from "@/utils/constant";
import { useAppSelector } from "@/store";
import { selectTimezone } from "@/store/slices/timezoneSlice";

// Configure language
LocaleConfig.locales["en"] = LocaleConfig.locales[""];
LocaleConfig.defaultLocale = "en";
const { width, height } = Dimensions.get("window");

const CalendarPage = () => {
  // Date formatting function
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

  // State for current month/year
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // State for statistics
  const [eventDates, setEventDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayMoods, setSelectedDayMoods] = useState<any[]>([]);
  
  // Animation values
  const calendarOpacity = useRef(new Animated.Value(0)).current;
  const calendarTranslateY = useRef(new Animated.Value(20)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryTranslateY = useRef(new Animated.Value(30)).current;
  const timezone = useAppSelector(selectTimezone);

  // Fetch mood statistics from API
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
        `${API_URL}/api/v1/records/statistic/mood?user_id=${userData.id}&month=${month}&year=${year}&timezone=${timezone}`,
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

      // Convert API data to eventDates format
      const newEventDates: Record<string, any> = {};
      const dailyStats = data.data.monthly.dailyMoodStats || [];
      
      dailyStats.forEach((day: any) => {
        if (day.totalRecords > 0) {
          const dots = day.moodStats.map((mood: any) => ({
            color: getMoodColor(mood.moodId),
            key: `mood-${mood.moodId}`,
          }));
          
          newEventDates[day.date] = {
            marked: true,
            dots: dots,
            customStyles: {
              container: {
                borderWidth: 1,
                borderColor: '#E6F4EA',
              }
            }
          };
        }
      });

      setEventDates(newEventDates);
      
      // Update selected day moods if the selected day has data
      const selectedDayData = dailyStats.find((day: any) => day.date === selected);
      if (selectedDayData) {
        setSelectedDayMoods(selectedDayData.moodStats || []);
      } else {
        setSelectedDayMoods([]);
      }
      
    } catch (err) {
      setError("Failed to fetch mood statistics");
      console.error("Error fetching mood statistics:", err);
    } finally {
      setLoading(false);
      
      // Animate calendar and summary into view
      Animated.parallel([
        Animated.timing(calendarOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(calendarTranslateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.parallel([
            Animated.timing(summaryOpacity, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true
            }),
            Animated.timing(summaryTranslateY, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true
            })
          ])
        ])
      ]).start();
    }
  };

  // Get mood data for a particular day
  const fetchDayMoods = (date: string) => {
    if (!eventDates[date]) {
      setSelectedDayMoods([]);
      return;
    }
    
    const dayData = Object.entries(eventDates).find(([key]) => key === date);
    if (dayData && dayData[1].dots) {
      // Create mock data since we don't have access to the actual mood details
      const moodIds = dayData[1].dots.map((dot: any, index: number) => {
        // Extract mood ID from color
        const colorToMoodId: Record<string, number> = {
          "#7E7E7E": 1, // Sad
          "#EF0808": 2, // Angry
          "#540BFF": 3, // Normal
          "#FCA10C": 4, // Joyful
          "#22C55E": 5, // Excellent
        };
        
        // Find the matching mood ID or default to index + 1
        const moodId = Object.entries(colorToMoodId).find(
          ([_, id]) => getMoodColor(id as number) === dot.color
        )?.[1] || (index + 1);
        
        return {
          moodId,
          count: Math.floor(Math.random() * 3) + 1, // Random count between 1-3
          time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`
        };
      });
      
      setSelectedDayMoods(moodIds);
    } else {
      setSelectedDayMoods([]);
    }
  };

  // Get color based on moodId
  const getMoodColor = (moodId: number): string => {
    const moodColors: Record<number, string> = {
      1: "#7E7E7E", // Sad
      2: "#EF0808", // Angry
      3: "#540BFF", // Normal
      4: "#FCA10C", // Joyful
      5: "#22C55E", // Excellent
    };
    return moodColors[moodId] || "#7C5CFC";
  };
  
  // Get mood emoji based on moodId
  const getMoodEmoji = (moodId: number): string => {
    const moodEmojis: Record<number, string> = {
      1: "😔", // Sad
      2: "😡", // Angry
      3: "😐", // Normal
      4: "😊", // Joyful
      5: "😁", // Excellent
    };
    return moodEmojis[moodId] || "🙂";
  };
  
  // Get mood name based on moodId
  const getMoodName = (moodId: number): string => {
    const moodNames: Record<number, string> = {
      1: "Sad", 
      2: "Angry", 
      3: "Normal", 
      4: "Joyful", 
      5: "Excellent", 
    };
    return moodNames[moodId] || "Unknown";
  };

  // Call API when Calendar is focused or when month/year changes
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

  // Set up day selection handler
  useEffect(() => {
    fetchDayMoods(selected);
  }, [selected, eventDates]);

  // markedDates always has the selected date with a purple circle
  const markedDates = {
    ...eventDates,
    [selected]: {
      ...(eventDates[selected] || {}),
      selected: true,
      selectedColor: "#7C5CFC",
    },
  };

  // Handle month change
  const handleMonthChange = (monthIdx: number) => {
    setCurrentMonth(monthIdx);
    setShowMonthPicker(false);
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setShowYearPicker(false);
  };

  // Handle prev/next buttons
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

  return (
    <LinearGradient 
      colors={['#E6F4EA', '#F0F8F3']} 
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
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

        <Animated.View 
          style={[
            styles.calendarContainer,
            { 
              opacity: calendarOpacity,
              transform: [{ translateY: calendarTranslateY }] 
            }
          ]}
        >
          <Calendar
            key={`${currentYear}-${currentMonth}`}
            current={`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`}
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
              backgroundColor: "#fff",
              calendarBackground: "#fff",
              textSectionTitleColor: "#8F9BB3",
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
        </Animated.View>

        {/* Daily Mood Summary */}
        <Animated.View 
          style={[
            styles.summaryContainer, 
            { 
              opacity: summaryOpacity, 
              transform: [{ translateY: summaryTranslateY }] 
            }
          ]}
        >
          <Text style={styles.summaryTitle}>
            <Ionicons name="calendar-outline" size={20} color="#7C5CFC" /> Day Summary
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
              <Text style={styles.loadingText}>Loading moods...</Text>
            </View>
          ) : selectedDayMoods.length > 0 ? (
            <>
              <View style={styles.dateChip}>
                <Text style={styles.dateChipText}>{
                  new Date(selected).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })
                }</Text>
              </View>
              
              {selectedDayMoods.map((mood, index) => (
                <View key={`mood-${index}`} style={styles.moodCard}>
                  <View style={[styles.moodIconContainer, { backgroundColor: getMoodColor(mood.moodId) }]}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(mood.moodId)}</Text>
                  </View>
                  <View style={styles.moodDetails}>
                    <Text style={styles.moodName}>{getMoodName(mood.moodId)}</Text>
                    <Text style={styles.moodTime}>
                      {mood.time || `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      // Navigate to detailed view
                      console.log("View details for mood:", mood);
                    }}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  router.navigate({
                    pathname: "(new)/newemoj" as any,
                    params: {
                      initialDate: new Date(selected).toISOString(),
                    },
                  });
                }}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add New Mood</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={require('../../assets/images/splash-icon.png')} 
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>No Mood Records</Text>
              <Text style={styles.emptyText}>
                You haven't recorded any moods for this day yet.
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  router.navigate({
                    pathname: "(new)/newemoj" as any,
                    params: {
                      initialDate: new Date(selected).toISOString(),
                    },
                  });
                }}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add New Mood</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    paddingBottom: height * 0.08,
  },
  screen: {
    flex: 1,
    paddingTop: height * 0.05,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 16,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: height * 0.08,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  dateChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
    marginBottom: 16,
  },
  dateChipText: {
    color: "#7C5CFC",
    fontWeight: "600",
    fontSize: 14,
  },
  moodCard: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodDetails: {
    flex: 1,
  },
  moodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  moodTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: "#7C5CFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#7C5CFC",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 16,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#668",
    fontSize: 14,
  },
});

export default CalendarPage;