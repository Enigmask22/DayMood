import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"; // Lấy kiểu props
import { Ionicons } from "@expo/vector-icons"; // Ví dụ sử dụng Ionicons
import { HOME_COLOR } from "frontend/src/utils/constant";
// Import các bộ icon khác nếu cần
// import { FontAwesome } from '@expo/vector-icons';

// Lấy cả width và height
const { width, height } = Dimensions.get("window");

// Định nghĩa màu sắc (hoặc import từ constants)
const ACTIVE_COLOR = HOME_COLOR.HOMETABBAR;
const INACTIVE_COLOR = "#8E8E93";
const TAB_BAR_BG = "#FFFFFF";
const ADD_BUTTON_BG = HOME_COLOR.HOMEPLUS;
const ADD_BUTTON_COLOR = "#FFFFFF";

// Tạo map để lấy component Icon dễ dàng
const IconSets = {
  Ionicons,
  // FontAwesome, // Thêm các bộ khác nếu dùng
};

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  // Lọc bỏ route 'add' khỏi danh sách hiển thị các tab thông thường
  const visibleRoutes = state.routes.filter((route) => route.name !== "add");

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused =
            state.index === state.routes.findIndex((r) => r.key === route.key);

          // Lấy thông tin icon từ params đã truyền
          // @ts-ignore: Truy cập params tùy chỉnh
          const iconSet = options.params?.iconSet ?? "Ionicons"; // Mặc định là Ionicons
          // @ts-ignore
          const iconName = options.params?.iconName ?? "alert-circle-outline"; // Icon mặc định nếu thiếu

          const IconComponent =
            IconSets[iconSet as keyof typeof IconSets] || Ionicons; // Lấy component Icon

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            // Tìm index thực sự trong `state.routes` ban đầu (bao gồm cả 'add')
            const targetRouteIndex = state.routes.findIndex(
              (r) => r.key === route.key
            );
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Render nút Add ở vị trí giữa
          if (index === Math.floor(visibleRoutes.length / 2)) {
            // Xóa việc tìm addRouteKey
            const addOnPress = () => {
              // Đặt logic xử lý trực tiếp ở đây
              console.log("Custom Add button pressed!");
              // Ví dụ: Điều hướng đến màn hình Modal
              navigation.navigate("add"); // Giả sử có màn hình tên 'add'
            };

            return (
              <React.Fragment key="add-button-fragment">
                {/* Render tab trước nút Add */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabButton}
                >
                  <IconComponent
                    name={iconName}
                    size={width * 0.06} // Sử dụng width
                    color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                    ]}
                  >
                    {typeof label === "string" ? label : ""}
                  </Text>
                </TouchableOpacity>

                {/* Render nút Add */}
                <TouchableOpacity
                  key="add-button"
                  accessibilityRole="button"
                  accessibilityLabel="Add Item" // Thêm label rõ ràng
                  onPress={addOnPress} // Gọi listener của route 'add'
                  style={styles.addButtonContainer}
                >
                  <View style={styles.addButton}>
                    <Ionicons
                      name="add"
                      size={width * 0.08}
                      color={ADD_BUTTON_COLOR}
                    />
                    {/* Sử dụng width */}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          }

          // Render các tab còn lại
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <IconComponent
                name={iconName}
                size={width * 0.06} // Sử dụng width
                color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                ]}
              >
                {typeof label === "string" ? label : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute", // Để có thể đặt vị trí chính xác và bo góc
    bottom: 0,
    left: 0,
    right: 0,
    // Sử dụng height
    height: Platform.OS === "ios" ? height * 0.11 : height * 0.08,
    backgroundColor: "transparent", // Nền ngoài cùng trong suốt
    elevation: 0, // Bỏ shadow mặc định trên Android
  },
  tabBar: {
    flexDirection: "row",
    // Sử dụng height
    height: Platform.OS === "ios" ? height * 0.11 : height * 0.09,
    backgroundColor: TAB_BAR_BG,
    // Sử dụng width
    borderTopLeftRadius: width * 0.05,
    borderTopRightRadius: width * 0.05,
    // Sử dụng height và width
    paddingBottom: Platform.OS === "ios" ? height * 0.04 : height * 0.015,
    paddingHorizontal: width * 0.025,
    alignItems: "center", // Căn giữa các item theo chiều dọc
    justifyContent: "space-around", // Phân bố đều các tab
    // Shadow cho iOS
    shadowColor: "#000",
    // Sử dụng height
    shadowOffset: { width: 0, height: -height * 0.0025 },
    shadowOpacity: 0.1,
    // Sử dụng width
    shadowRadius: width * 0.01,
    // Shadow cho Android (dùng elevation nếu muốn đơn giản hơn)
    elevation: 5,
    borderTopWidth: StyleSheet.hairlineWidth, // Thêm viền mỏng nếu muốn
    borderTopColor: "#E0E0E0",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Căn giữa icon và text
    // Sử dụng height
    paddingTop: height * 0.012,
  },
  tabLabel: {
    // Sử dụng width và height
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    marginTop: height * 0.005, // Khoảng cách giữa icon và text
  },
  addButtonContainer: {
    // Dùng vị trí tuyệt đối hoặc một cách khác để đưa nút lên trên
    position: "absolute",
    // Tính toán dựa trên width
    width: width * 0.13,
    height: width * 0.13, // Giữ hình vuông theo width
    left: width / 2 - (width * 0.13) / 2, // Căn giữa
    // Sử dụng height
    bottom: Platform.OS === "ios" ? height * 0.055 : height * 0.05,
    // Sử dụng width
    borderRadius: width * 0.075,
    backgroundColor: ADD_BUTTON_BG,
    justifyContent: "center",
    alignItems: "center",
    // Shadow cho nút Add
    shadowColor: "#000",
    // Sử dụng height và width
    shadowOffset: { width: 0, height: height * 0.004 },
    shadowOpacity: 0.3,
    shadowRadius: width * 0.01,
    elevation: 6,
  },
  addButton: {
    // Có thể không cần nếu container đã style đủ
  },
});

export default CustomTabBar;
