import { Stack } from "expo-router";
import { View, Text } from "react-native";

const RootLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Các màn hình trong group (onboarding) sẽ được quản lý bởi layout riêng */}
      <Stack.Screen name="(onboarding)" />
      {/* Các màn hình trong group (main) sẽ được quản lý bởi layout riêng */}
      <Stack.Screen name="(main)" />
    </Stack>
  );
};

export default RootLayout;
