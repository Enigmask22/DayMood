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
import { HOME_COLOR } from "@/utils/constant";
// Import các bộ icon khác nếu cần
// import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

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
              // navigation.navigate('YourAddModalScreen');
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
                    size={24}
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
                    <Ionicons name="add" size={32} color={ADD_BUTTON_COLOR} />
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
                size={24}
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
    height: Platform.OS === "ios" ? 90 : 70, // Chiều cao tab bar (cao hơn cho iOS để chứa vùng an toàn)
    backgroundColor: "transparent", // Nền ngoài cùng trong suốt
    elevation: 0, // Bỏ shadow mặc định trên Android
  },
  tabBar: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 90 : 70,
    backgroundColor: TAB_BAR_BG,
    borderTopLeftRadius: 20, // Bo góc trên
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 10, // Padding dưới cho vùng an toàn iOS
    paddingHorizontal: 10,
    alignItems: "center", // Căn giữa các item theo chiều dọc
    justifyContent: "space-around", // Phân bố đều các tab
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow cho Android (dùng elevation nếu muốn đơn giản hơn)
    elevation: 5,
    borderTopWidth: StyleSheet.hairlineWidth, // Thêm viền mỏng nếu muốn
    borderTopColor: "#E0E0E0",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Căn giữa icon và text
    paddingTop: 10, // Khoảng cách trên cùng
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4, // Khoảng cách giữa icon và text
  },
  addButtonContainer: {
    // Dùng vị trí tuyệt đối hoặc một cách khác để đưa nút lên trên
    position: "absolute",
    left: width / 2 - 25, // Căn giữa nút (50 là width mới của nút)
    bottom: Platform.OS === "ios" ? 45 : 40, // Giữ nguyên giá trị bottom đã sửa
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: ADD_BUTTON_BG,
    justifyContent: "center",
    alignItems: "center",
    // Shadow cho nút Add
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  addButton: {
    // Có thể không cần nếu container đã style đủ
  },
});

export default CustomTabBar;
