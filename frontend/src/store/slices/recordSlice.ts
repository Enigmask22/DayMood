import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Randomstring from "randomstring";

// Define Record interface
interface Record {
  id: string;
  date: string;
  emoji: string;
  feeling: string;
}

// Define initial state
interface RecordState {
  records: Record[];
  loading: boolean;
  error: string | null;
}

const initialState: RecordState = {
  records: [
    {
      id: Randomstring.generate(7),
      date: "THURSDAY, MARCH 6 20:00",
      emoji: "sad",
      feeling: "I'm feeling bad",
    },
    {
      id: Randomstring.generate(7),
      date: "FRIDAY, MARCH 7 18:00",
      emoji: "excellent",
      feeling: "I'm feeling great",
    },
    {
      id: Randomstring.generate(7),
      date: "SATURDAY, MARCH 8 14:00",
      emoji: "joyful",
      feeling: "I'm feeling joyful",
    },
    {
      id: Randomstring.generate(7),
      date: "SUNDAY, MARCH 9 12:00",
      emoji: "normal",
      feeling: "I'm feeling normal",
    },
    {
      id: Randomstring.generate(7),
      date: "MONDAY, MARCH 10 10:00",
      emoji: "angry",
      feeling: "I'm feeling angry",
    },
  ],
  loading: false,
  error: null,
};

// Create record slice
export const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    addRecord: (state, action: PayloadAction<{
        date: string;
        emoji: string;
        feeling: string;
    }>) => {
        const newRecord: Record = {
            id: Randomstring.generate(7),
            date: action.payload.date,
            emoji: action.payload.emoji,
            feeling: action.payload.feeling,
        };
        state.records.push(newRecord);
    },
    removeRecord: (state, action: PayloadAction<{ id: string }>) => {
        state.records = state.records.filter((record) => record.id !== action.payload.id);
    },
  },
});

// Export actions
export const { addRecord, removeRecord } = recordSlice.actions;

// Export reducer
export default recordSlice.reducer;
