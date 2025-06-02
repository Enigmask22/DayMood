import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import * as Localization from 'expo-localization';

interface TimezoneState {
  timezone: string;       // Timezone name (e.g., "Asia/Ho_Chi_Minh")
  offset: number;         // Offset in minutes
  offsetString: string;   // Formatted offset (e.g., "+07:00")
}

const formatTimezoneOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Gets the device timezone using the recommended approach
 */
const getDeviceTimezone = (): string => {
  // Use getCalendars() as recommended in the deprecation notice
  try {
    const calendars = Localization.getCalendars();
    // The first calendar usually contains the device timezone
    if (calendars && calendars.length > 0 && calendars[0].timeZone) {
      return calendars[0].timeZone;
    }
  } catch (error) {
    console.error('Error getting timezone from calendars:', error);
  }

  // Fallback: Use Intl API (works in most environments)
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting timezone from Intl API:', error);
  }

  // Last resort fallback
  return 'UTC';
};

export const fetchDeviceTimezone = createAsyncThunk(
  'timezone/fetchDeviceTimezone',
  async () => {
    // Get timezone name using the recommended approach
    const timezone = getDeviceTimezone();
    
    // Get timezone offset in minutes
    const offset = -new Date().getTimezoneOffset();
    
    // Format offset for API calls
    const offsetString = formatTimezoneOffset(offset);
    
    //console.log(`Device timezone: ${timezone}, offset: ${offset} (${offsetString})`);
    
    return {
      timezone,
      offset,
      offsetString
    };
  }
);

// Get initial values using the recommended methods
const initialTimezone = getDeviceTimezone();
const initialOffset = -new Date().getTimezoneOffset();
const initialOffsetString = formatTimezoneOffset(initialOffset);

const initialState: TimezoneState = {
  timezone: initialTimezone,
  offset: initialOffset,
  offsetString: initialOffsetString
};

export const timezoneSlice = createSlice({
  name: "timezone",
  initialState,
  reducers: {
    // Add manual setters if needed
    setManualTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeviceTimezone.fulfilled, (state, action) => {
        state.timezone = action.payload.timezone;
        state.offset = action.payload.offset;
        state.offsetString = action.payload.offsetString;
      });
  },
});

export const { setManualTimezone } = timezoneSlice.actions;

// Selectors
export const selectTimezone = (state: { timezone: TimezoneState }) => state.timezone.timezone;
export const selectOffset = (state: { timezone: TimezoneState }) => state.timezone.offset;
export const selectOffsetString = (state: { timezone: TimezoneState }) => state.timezone.offsetString;

export default timezoneSlice.reducer;