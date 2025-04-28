import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"; // Lấy kiểu props
import { Ionicons } from "@expo/vector-icons"; // Ví dụ sử dụng Ionicons
import { HOME_COLOR } from "src/utils/constant";
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
  // Thêm state để theo dõi trạng thái hiển thị menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Các giá trị animated
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  // Chuyển đổi giá trị rotate thành độ
  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Lọc bỏ route 'add' khỏi danh sách hiển thị các tab thông thường
  const visibleRoutes = state.routes.filter((route) => route.name !== "add");

  // Reset animations khi component unmount
  useEffect(() => {
    return () => {
      rotateAnimation.setValue(0);
      scaleAnimation.setValue(0);
      opacityAnimation.setValue(0);
    };
  }, []);

  // Hàm xử lý mở/đóng menu
  const toggleMenu = () => {
    if (isMenuOpen) {
      // Đóng menu
      Animated.parallel([
        Animated.timing(rotateAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Đảm bảo state được cập nhật sau khi animation hoàn thành
        setIsMenuOpen(false);
      });
    } else {
      // Mở menu
      setIsMenuOpen(true); // Cập nhật state trước để render các nút
      Animated.parallel([
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Thực hiện các hành động khi nhấn vào một nút menu
  const handleAction = (actionType: string) => {
    console.log(`Action ${actionType} pressed`);

    // Đóng menu sau khi nhấn nút
    toggleMenu();

    // Có thể điều hướng đến màn hình tương ứng tùy vào actionType
    if (actionType === "primary") {
      navigation.navigate("add"); // Điều hướng đến màn hình Add chính
    } else if (actionType === "back") {
      // Xử lý cho nút quay lại
    } else if (actionType === "clock") {
      // Xử lý cho nút đồng hồ
    } else if (actionType === "calendar") {
      // Điều hướng đến trang newemoj trong thư mục (new)
      navigation.navigate("(new)/newemoj");
    }
  };

  return (
    <View style={styles.container}>
      {/* Overlay làm mờ màn hình khi menu mở */}
      {isMenuOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View
            style={[styles.overlay, { opacity: opacityAnimation }]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* 3 nút menu mở rộng - bố trí thành tam giác */}
      {isMenuOpen && (
        <>
          {/* Nút quay lại (bên trái) */}
          <Animated.View
            style={[
              styles.actionButton,
              {
                transform: [
                  { scale: scaleAnimation },
                  {
                    translateX: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -80], // Di chuyển sang trái
                    }),
                  },
                  {
                    translateY: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -80], // Di chuyển lên trên
                    }),
                  },
                ],
                opacity: scaleAnimation,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.fabButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => handleAction("back")}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Nút đồng hồ (chính giữa phía trên) */}
          <Animated.View
            style={[
              styles.actionButton,
              {
                transform: [
                  { scale: scaleAnimation },
                  {
                    translateY: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -120], // Di chuyển lên trên
                    }),
                  },
                ],
                opacity: scaleAnimation,
                left: width / 2 - (width * 0.12) / 2, // Căn giữa
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.fabButton, { backgroundColor: "#00BCD4" }]}
              onPress={() => handleAction("clock")}
            >
              <Ionicons name="time" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Nút lịch (bên phải) */}
          <Animated.View
            style={[
              styles.actionButton,
              {
                transform: [
                  { scale: scaleAnimation },
                  {
                    translateX: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 80], // Di chuyển sang phải
                    }),
                  },
                  {
                    translateY: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -80], // Di chuyển lên trên
                    }),
                  },
                ],
                opacity: scaleAnimation,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.fabButton, { backgroundColor: "#FFA000" }]}
              onPress={() => handleAction("calendar")}
            >
              <Ionicons name="calendar" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

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
            return (
              <React.Fragment key="add-button-fragment">
                {/* Render tab trước nút Add */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  // @ts-ignore // Tạm thời bỏ qua lỗi type checking cho tabBarTestID
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

                {/* Render nút Add/Close với animation xoay */}
                <TouchableOpacity
                  key="add-button"
                  accessibilityRole="button"
                  accessibilityLabel={isMenuOpen ? "Close Menu" : "Open Menu"}
                  onPress={toggleMenu}
                  style={styles.addButtonContainer}
                >
                  <Animated.View
                    style={[styles.addButton, { transform: [{ rotate }] }]}
                  >
                    <Ionicons
                      name="add"
                      size={width * 0.08}
                      color={ADD_BUTTON_COLOR}
                    />
                  </Animated.View>
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
              // @ts-ignore // Tạm thời bỏ qua lỗi type checking cho tabBarTestID
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
  overlay: {
    position: "absolute",
    top: -height, // Bắt đầu từ đỉnh màn hình
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 1,
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
    zIndex: 10, // Đảm bảo nút hiển thị trên các phần tử khác
  },
  addButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    position: "absolute",
    width: width * 0.12,
    height: width * 0.12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9, // Hiển thị dưới nút chính nhưng trên các phần tử khác
    left: width / 2 - (width * 0.12) / 2, // Mặc định căn giữa, nhưng sẽ bị ghi đè bởi transform
    bottom: Platform.OS === "ios" ? height * 0.055 : height * 0.05,
  },
  fabButton: {
    width: "100%",
    height: "100%",
    borderRadius: width * 0.06,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomTabBar;
