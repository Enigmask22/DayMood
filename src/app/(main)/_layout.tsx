import { Tabs } from "expo-router";
// Import các thư viện icon nếu bạn dùng chúng trực tiếp trong màn hình con
// import { FontAwesome } from "@expo/vector-icons";
// import { MaterialIcons } from '@expo/vector-icons';
// import { Ionicons } from '@expo/vector-icons';

// Import component Tab Bar tùy chỉnh
import CustomTabBar from "@/components/CustomTabBar";

// Định nghĩa màu sắc
const ACTIVE_COLOR = "#1DB954";
const INACTIVE_COLOR = "#8E8E93";

export default function MainAppLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
      }}
    >
      {/* Tab Home */}
      <Tabs.Screen
        name="index" // File: (main)/index.tsx
        options={{
          title: "Home",
          // @ts-ignore: Truyền params tùy chỉnh
          params: { iconSet: "Ionicons", iconName: "home-outline" },
          headerShown: true, // Hiện header cho Home
          headerTitle: "Homepage",
        }}
      />
      {/* Tab Stats */}
      <Tabs.Screen
        name="stats" // File: (main)/stats.tsx
        options={{
          title: "Stats",
          // @ts-ignore: Truyền params tùy chỉnh
          params: { iconSet: "Ionicons", iconName: "stats-chart" },
          headerShown: true,
          headerTitle: "Statistics",
        }}
      />
      {/* Tab Calendar */}
      <Tabs.Screen
        name="calendar" // File: (main)/calendar.tsx
        options={{
          title: "Calendar",
          // @ts-ignore
          params: { iconSet: "Ionicons", iconName: "calendar-outline" },
          headerShown: true,
          headerTitle: "Calendar View",
        }}
      />
      {/* Tab Setting */}
      <Tabs.Screen
        name="setting" // File: (main)/setting.tsx
        options={{
          title: "Setting",
          // @ts-ignore
          params: { iconSet: "Ionicons", iconName: "settings-outline" },
          headerShown: true,
          headerTitle: "Settings",
        }}
      />
    </Tabs>
  );
}
