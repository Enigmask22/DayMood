import { Tabs } from "expo-router";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#f4511e",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Tabs.Screen name="index" options={{}} />
      <Tabs.Screen name="setting" options={{}} />
    </Tabs>
  );
};

export default TabLayout;
