import "react-native-url-polyfill/auto"; // For Supabase URL needs
import "react-native-get-random-values"; // If you encounter crypto issues, Supabase relies on a global
// Buffer polyfill
import { Buffer } from "buffer";
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

// Initialize Sentry
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://f33481725bcc898aec47c4440808f974@o4509424068067328.ingest.de.sentry.io/4509424070754384", // Replace with your actual DSN
  debug: true, // Enable debug mode for testing
  environment: __DEV__ ? "development" : "production",
  beforeSend(event) {
    // Log events to console for debugging
    if (__DEV__) {
      console.log("Sentry Event:", event);
    }
    return event;
  },
});

import { Stack, useRouter } from "expo-router";
import { View, Text, Platform, StatusBar } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "src/store";
import { Provider } from "react-redux";
import "stream-browserify";
import { fetchDeviceTimezone } from "@/store/slices/timezoneSlice";
import { SystemBars, SystemBarsEntry } from "react-native-edge-to-edge";

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
  const systemBarsEntry = useRef<SystemBarsEntry | null>(null);

  useEffect(() => {
    // Directly dispatch to the store - no hooks needed
    store.dispatch(fetchDeviceTimezone());
  }, []);

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
          const access_token = await AsyncStorage.getItem("access_token");
          if (access_token) {
            router.replace("/(main)");
          } else {
            router.replace("/(auth)/login");
          }
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

  //Configure system bars using the SystemBars API
  useEffect(() => {
    if (Platform.OS !== "android") return;

    // Use a ref to track if we've already configured the system bars
    if (systemBarsEntry.current !== null) return;

    try {
      // Push a new entry to the SystemBars stack with desired properties
      systemBarsEntry.current = SystemBars.pushStackEntry({
        // Light content for better visibility on dark backgrounds
        style: { statusBar: "auto", navigationBar: "light" },
        // Hide the navigation bar initially
        hidden: { navigationBar: true, statusBar: false },
      });

      //console.log('SystemBars configured successfully');
    } catch (error) {
      console.error("Failed to configure SystemBars:", error);
    }
  }, []); // Empty dependency array to ensure it only runs once

  if (isLoading || (!loaded && !error)) {
    return null;
  }

  return (
    <Provider store={store}>
      <SystemBars
        style={{ statusBar: "auto", navigationBar: "light" }}
        hidden={{ navigationBar: true, statusBar: false }}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </Provider>
  );
};

export default RootLayout;
