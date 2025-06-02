import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Randomstring from "randomstring";
import { format } from "date-fns";
import { MOODS } from "src/utils/constant";
import { API_ENDPOINTS, DEFAULT_USER_ID } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define Record interface
interface Record {
  id: string;
  date: string;
  emoji: string;
  feeling: string;
  rawDate: string; // Optional raw date for future use
}

// Define API record interface
interface ApiRecord {
  id: number;
  title: string;
  content: string;
  status: string;
  created_time: string;
  updated_time: string;
  date: string;
  mood_id: number;
  user_id: number;
}

// Define initial state
interface RecordState {
  records: Record[];
  loading: boolean;
  error: string | null;
}

// Fetch records from API
export const fetchRecords = createAsyncThunk(
  "records/fetchRecords",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Bắt đầu gọi API lấy dữ liệu...");
      const user = await (AsyncStorage.getItem("user"));
      if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng trong AsyncStorage");
      }
      console.log("User data from AsyncStorage:", user);
      const response = await fetch(
        `${API_ENDPOINTS.RECORDS}?user_id=${JSON.parse(user || "{}").id || DEFAULT_USER_ID}`,
      );
      console.log("API status:", response.status);

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu");
      }

      const data = await response.json();
      //console.log("Nhận được dữ liệu API:", JSON.stringify(data));

      // Kiểm tra cấu trúc dữ liệu
      if (
        data &&
        data.data &&
        data.data.items &&
        Array.isArray(data.data.items)
      ) {
        //console.log("Dữ liệu có cấu trúc { data: { items: [] } }");
        return data.data.items;
      } else if (data && data.items && Array.isArray(data.items)) {
        //console.log("Dữ liệu có cấu trúc { items: [] }");
        return data.items;
      } else if (data && Array.isArray(data)) {
        console.log("Dữ liệu là một mảng trực tiếp");
        return data;
      } else {
        console.log("Cấu trúc dữ liệu không xác định:", typeof data);
        // Trả về mảng rỗng nếu không có dữ liệu hợp lệ
        return [];
      }
    } catch (error: any) {
      console.error("Lỗi khi gọi API:", error.message);
      return rejectWithValue(error.message || "Đã xảy ra lỗi");
    }
  }
);

// Chuyển đổi dữ liệu từ API sang định dạng phù hợp
const convertApiRecordToRecord = (apiRecord: ApiRecord): Record => {
  // Format date từ ISO format sang định dạng ngày và giờ hiển thị
  const recordDate = new Date(apiRecord.date);
  const formattedDate = format(recordDate, "EEEE, MMMM d HH:mm").toUpperCase();

  // Tìm tên emoji dựa trên mood_id
  const mood = MOODS.find((m) => m.id === apiRecord.mood_id);
  const emojiName = mood ? mood.name.toLowerCase() : "normal";

  return {
    id: apiRecord.id.toString(),
    date: formattedDate,
    emoji: emojiName,
    feeling: apiRecord.title || "",
    rawDate: apiRecord.date, // Lưu trữ ngày gốc nếu cần
  };
};

const initialState: RecordState = {
  records: [],
  loading: false,
  error: null,
};

// Create record slice
export const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    addRecord: (
      state,
      action: PayloadAction<{
        date: string;
        emoji: string;
        feeling: string;
      }>
    ) => {
      const newRecord: Record = {
        id: Randomstring.generate(7),
        date: action.payload.date,
        emoji: action.payload.emoji,
        feeling: action.payload.feeling,
        rawDate: action.payload.date, // Lưu trữ ngày gốc nếu cần
      };
      state.records.push(newRecord);
    },
    removeRecord: (state, action: PayloadAction<{ id: string }>) => {
      state.records = state.records.filter(
        (record) => record.id !== action.payload.id
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        // Chuyển đổi dữ liệu API thành định dạng record
        state.records = action.payload.map(convertApiRecordToRecord);
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { addRecord, removeRecord } = recordSlice.actions;

// Export reducer
export default recordSlice.reducer;
