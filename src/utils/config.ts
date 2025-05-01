import Constants from "expo-constants";

// API Config
export const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:8000";
export const API_ENDPOINTS = {
  RECORDS: `${API_URL}/api/v1/records`,
  FILES: `${API_URL}/api/v1/files`,
};

// Supabase Config
export const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl || "YOUR_SUPABASE_URL";
export const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY";

// Các cấu hình khác
export const DEFAULT_USER_ID = 1;
