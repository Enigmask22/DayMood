import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboard2" />
      <Stack.Screen name="onboard3" />
    </Stack>
  );
}
