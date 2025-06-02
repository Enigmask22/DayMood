import { API_ENDPOINTS } from '@/utils/config';

interface ActivityStatisticsResponse {
  statusCode: number;
  message: string;
  data: {
    monthly: {
      activityData: { [key: string]: number[] };
      activityIds: number[];
      activityNames: { [key: string]: string };
      dates: string[];
      month: number;
      year: number;
      totalRecords: number;
    }
  };
}

export const fetchActivityStatistics = async (
  userId: string,
  month: number,
  year: number,
  timezone: string = 'UTC' // Default to UTC if timezone is not provided
): Promise<ActivityStatisticsResponse> => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.RECORDS}/statistic/activity?user_id=${userId}&month=${month}&year=${year}&timezone=${timezone}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    //console.log('Fetching activity statistics:', response);
    if (!response.ok) {
      throw new Error('Failed to fetch activity statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    throw error;
  }
};