import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Hàm tiện ích để tính toán kích thước dựa trên chiều rộng màn hình
export const wp = (percentage: number) => {
  const value = (percentage * width) / 100;
  return Math.round(value);
};

// Hàm tiện ích để tính toán kích thước dựa trên chiều cao màn hình
export const hp = (percentage: number) => {
  const value = (percentage * height) / 100;
  return Math.round(value);
};
