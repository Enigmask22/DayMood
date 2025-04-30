import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

// Bucket name trong Supabase Storage
const BUCKET_NAME = "daymood-files";
// Base URL và API key của Supabase project
const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  "https://zhmofktoopgfsqgzpwpe.supabase.co";
const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobW9ma3Rvb3BnZnNxZ3pwd3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzAxMDQsImV4cCI6MjA2MTI0NjEwNH0.Ev-R5yv2UQ0JjAg8b_z4Gracxr9o6pnURFeJ1aPsZ_4";

// Hàm chuyển đổi base64 thành blob
const base64ToBlob = async (base64: string, fileType: string) => {
  // Tách content type và data từ chuỗi base64
  const parts = base64.split(";base64,");
  const data = parts[1];

  return {
    base64: data,
    contentType: fileType || "image/jpeg",
  };
};

/**
 * Upload file từ base64 string lên Supabase Storage sử dụng SDK thay vì direct upload
 * @param base64Data - Chuỗi base64 của file (dạng data:image/jpeg;base64,...)
 * @param fileType - Loại file (mặc định là 'image/jpeg')
 * @param folder - Thư mục lưu trữ (mặc định là 'images')
 * @param userId - ID của người dùng để tạo thư mục riêng
 * @returns Thông tin file đã upload
 */
export const uploadFileFromBase64 = async (
  base64Data: string,
  fileType: string = "image/jpeg",
  folder: string = "images",
  userId: string = "anonymous"
) => {
  try {
    // Tạo tên file ngẫu nhiên
    const fileExt = fileType.split("/")[1] || "jpeg";
    const fileName = `${userId}/${folder}/${uuidv4()}.${fileExt}`;

    // Tách dữ liệu base64 đúng cách
    let base64Content = base64Data;
    if (base64Data.includes(";base64,")) {
      base64Content = base64Data.split(";base64,")[1];
    }

    // Chuyển base64 thành Uint8Array để upload
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Upload trực tiếp qua Supabase SDK
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, byteArray, {
        contentType: fileType,
        upsert: true,
      });

    if (error) {
      console.error("Lỗi upload file:", error);
      throw error;
    }

    // Lấy URL công khai
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return {
      fileName,
      url: publicUrl,
      key: fileName,
      size: base64Data.length / 1.37, // Ước tính kích thước thật
      fileType,
    };
  } catch (error) {
    console.error("Lỗi xử lý file:", error);
    throw error;
  }
};

/**
 * Upload file âm thanh từ URI lên Supabase Storage
 * @param fileUri - URI của file âm thanh
 * @param fileType - Loại file (mặc định là 'audio/mpeg')
 * @param userId - ID của người dùng
 * @returns Thông tin file đã upload
 */
export const uploadAudioFromUri = async (
  fileUri: string,
  fileType: string = "audio/mpeg",
  userId: string = "anonymous"
) => {
  try {
    // Tạo tên file ngẫu nhiên
    const fileExt = fileUri.split(".").pop() || "mp3";
    const fileName = `${userId}/audio/${uuidv4()}.${fileExt}`;

    // Đọc file thành base64
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Chuyển base64 thành Uint8Array để upload
    const byteCharacters = atob(fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Upload trực tiếp qua Supabase SDK
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, byteArray, {
        contentType: fileType,
        upsert: true,
      });

    if (error) {
      console.error("Lỗi upload file âm thanh:", error);
      throw error;
    }

    // Lấy URL công khai
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    // Lấy thông tin file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    const fileSize = fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0;

    return {
      fileName,
      url: publicUrl,
      key: fileName,
      size: fileSize,
      fileType,
    };
  } catch (error) {
    console.error("Lỗi xử lý file âm thanh:", error);
    throw error;
  }
};

/**
 * Lấy danh sách file trong một thư mục
 * @param folder - Đường dẫn thư mục
 * @returns Danh sách file
 */
export const listFiles = async (folder: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("Lỗi lấy danh sách file:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Lỗi xử lý danh sách file:", error);
    throw error;
  }
};

/**
 * Xóa file từ storage
 * @param filePath - Đường dẫn file cần xóa
 * @returns Kết quả xóa
 */
export const deleteFile = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Lỗi xóa file:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Lỗi xử lý xóa file:", error);
    throw error;
  }
};
