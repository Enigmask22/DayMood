// filepath: d:\BT\Mobile\DayMood\src\app\(user)\user.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Keyboard,
  BackHandler,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { HOME_COLOR } from "@/utils/constant";
import { API_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/common/CustomAlert";

const { width, height } = Dimensions.get("window");

interface UserData {
  id: number;
  email: string;
  username: string;
}

const UserScreen = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isAnyInputFocused, setIsAnyInputFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [userData, setUserData] = useState<UserData>({
    id: 0,
    email: "",
    username: "",
  });

  // Form fields
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    email: "",
    username: "",
  });

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [{ text: "OK", style: "default" }],
  });

  // Helper function to show custom alert
  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    buttons?: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      buttons: buttons || [{ text: "OK", style: "default" }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Load user data from AsyncStorage
  useEffect(() => {
    loadUserData();

    // Keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Separate effect for hardware back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isKeyboardVisible) {
          Keyboard.dismiss();
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      }
    );

    return () => {
      backHandler?.remove();
    };
  }, [isKeyboardVisible]);

  // Effect to handle scroll position based on focus and keyboard state
  useEffect(() => {
    if (!isAnyInputFocused || (isAnyInputFocused && !isKeyboardVisible)) {
      // Lock scroll at top when no input is focused OR when input is focused but keyboard is not visible
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [isAnyInputFocused, isKeyboardVisible]);

  // Effect to detect when new password is entered to enable scrolling
  useEffect(() => {
    if (newPassword) {
      // When newPassword has a value, enable scrolling and scroll to the confirm field
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [newPassword]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const userDataString = await AsyncStorage.getItem("user");
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
        setFormData(user);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showAlert("error", "Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.username.trim()) {
      showAlert("warning", "Validation Error", "Username is required");
      return false;
    }
    if (!formData.email.trim()) {
      showAlert("warning", "Validation Error", "Email is required");
      return false;
    }
    if (!currentPassword.trim()) {
      showAlert("warning", "Validation Error", "Current password is required for security");
      return false;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showAlert("warning", "Validation Error", "New passwords do not match");
      return false;
    }
    if (newPassword && newPassword.length < 6) {
      showAlert("warning", "Validation Error", "New password must be at least 6 characters");
      return false;
    }
    return true;
  };
    // No separate password verification is needed as the API will handle it
  
  // Update user data
  const handleUpdateProfile = async () => {
    if (!validateForm()) return;    try {
      setUpdating(true);
      
      // Get access token from storage
      const accessToken = await AsyncStorage.getItem("access_token");
      
      if (!accessToken) {
        showAlert("error", "Authentication Error", "Your session has expired. Please log in again.");
        router.replace("/(auth)/login");
        return;
      }      // Prepare payload for API
      const updateData: {
        email: string;
        username: string;
        currentPassword: string;  // Required for verification
        updatePassword?: string;  // Optional field to update password
      } = {
        email: formData.email,
        username: formData.username,
        currentPassword: currentPassword, // Include current password for verification
      };
        
      // Add new password if provided
      if (newPassword) {
        updateData.updatePassword = newPassword; // Use 'updatePassword' as API expects
      }
        // Show updating status
      showAlert("info", "Updating Profile", "Please wait while we verify your password and update your profile...");
      
      // Make API request
      const response = await fetch(`${API_URL}/api/v1/users/${userData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(updateData)
      });
      
      // Hide the updating message
      hideAlert();
        if (response.ok) {
        const updatedUser = await response.json();
        
        // Update local storage
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        
        // For all successful updates, show alert and log out
        showAlert(
          "success", 
          "Profile Updated", 
          "Your profile has been updated successfully. For security purposes, you'll be logged out.",
          [{
            text: "OK",
            style: "default",
            onPress: async () => {
              // Clear credentials in AsyncStorage
              await AsyncStorage.removeItem("access_token");
              await AsyncStorage.removeItem("refresh_token");
              // Navigate to login screen
              router.replace("/(auth)/login");
            }
          }]
        );      } else {
        // Handle API errors
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 400) {
          // This could be an incorrect password
          showAlert(
            "error", 
            "Password Verification Failed", 
            errorData.message || "Your current password is incorrect. Please try again."
          );
        } else if (response.status === 404) {
          showAlert(
            "error", 
            "Update Failed", 
            "User account not found. Please log out and log in again."
          );
        } else if (response.status === 401) {
          showAlert(
            "error", 
            "Authentication Error", 
            "Your session has expired. Please log in again."
          );
          // Navigate to login after they close the alert
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 1000);
        } else if (response.status === 403) {
          showAlert(
            "error", 
            "Permission Denied", 
            "You don't have permission to update this profile."
          );
        } else {
          showAlert(
            "error", 
            "Update Failed", 
            errorData.message || "Failed to update profile. Please try again."
          );
        }
      }} catch (error) {
      console.error("Error updating profile:", error);
      showAlert("error", "Error", "An error occurred while updating your profile. Please check your connection and try again.");    } finally {
      // Always set updating to false after the operation completes
      // The user will be logged out via the alert button's onPress callback
      setUpdating(false);
    }
  };

  // Input focus handlers
  const handleInputFocus = () => {
    setIsAnyInputFocused(true);
  };

  const handleInputBlur = () => {
    // Small delay to check if another input is focused
    setTimeout(() => {
      setIsAnyInputFocused(false);
    }, 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HOME_COLOR.HOMETABBAR} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Simple function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Determine if scrolling should be enabled
  const shouldAllowScroll = isAnyInputFocused || newPassword ? true : isKeyboardVisible;

  return (
    <View style={styles.mainContainer}>
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={HOME_COLOR.HOMESTATUS2} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <View style={styles.dummy} />
      </View>

      {/* Content with ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={shouldAllowScroll}
        showsVerticalScrollIndicator={shouldAllowScroll}
      >
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard} style={{ flex: 1 }}>
          <View style={styles.contentContainer}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
              <Image
                source={require("@/assets/images/home/home_avatar.png")}
                style={{ width: 100, height: 100, borderRadius: 30 }}
              />
            </View>

            {/* Personal Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  placeholder="Enter your username"
                  placeholderTextColor="#999"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            {/* Security Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Security</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password (Optional)</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {newPassword ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.updateButton, updating && styles.updateButtonDisabled]}
              onPress={handleUpdateProfile}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Update Profile</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  contentContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: HOME_COLOR.HOMESTATUS2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.001,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  dummy: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: HOME_COLOR.HOMESTATUS2,
  },
  avatarContainer: {
    alignItems: "center",
    backgroundColor: "white",
    paddingBottom: 24,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 16,
  },
  avatarLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: HOME_COLOR.HOMESTATUS2,
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Quicksand-Bold",
    color: HOME_COLOR.HOMESTATUS2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: HOME_COLOR.HOMESTATUS2,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 12,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: HOME_COLOR.HOMETABBAR,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  updateButtonDisabled: {
    backgroundColor: "#CCC",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },  
  bottomPadding: {
    height: height * 0.45,
  },
});

export default UserScreen;
