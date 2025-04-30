import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import Constants from "expo-constants";

// Lấy thông tin từ biến môi trường
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
