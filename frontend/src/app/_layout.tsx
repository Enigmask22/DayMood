import { Stack, useRouter } from "expo-router";
import { View, Text } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "frontend/src/store";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Inter-Light": require("../assets/fonts/Inter-Light-BETA.otf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter-ExtraBold.otf"),
    "Quicksand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-Semibold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (!loaded && !error) {
          return;
        }

        const hasCompletedOnboarding = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );

        if (hasCompletedOnboarding === "true") {
          router.replace("/(main)");
        } else {
          router.replace("/");
        }
      } catch (e) {
        router.replace("/");
      } finally {
        setIsLoading(false);
        if (loaded || error) {
          SplashScreen.hideAsync();
        }
      }
    };

    checkOnboardingStatus();
  }, [loaded, error, router]);

  if (isLoading || (!loaded && !error)) {
    return null;
  }

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(onboarding)" />
      </Stack>
    </Provider>
  );
};

export default RootLayout;
