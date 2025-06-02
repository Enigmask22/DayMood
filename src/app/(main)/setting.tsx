import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { HOME_COLOR } from "@/utils/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingOption from "@/components/settingpage/SettingOption";
import CustomAlert from "@/components/common/CustomAlert";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");
const SettingPage = () => {
  // Sample state for settings toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Failed to load user data");
      }
    };

    loadUser();
  }, []);

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

  // Profile information
  const userProfile = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    memberSince: "January 2025",
    level: "7-day Trial",
  };

  // Sample languages
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ar", name: "Arabic" },
  ];

  // Currently selected language
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Logout handler
  const handleLogout = async () => {
    showAlert("warning", "Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Remove all stored data
            await AsyncStorage.multiRemove([
              "access_token",
              "refresh_token",
              "user",
            ]);

            // Navigate to login screen
            router.replace("/login");
          } catch (error) {
            console.error("Error during logout:", error);
            showAlert(
              "error",
              "Error",
              "An error occurred during logout. Please try again."
            );
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Handle language selection
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Implementation for language change
  };

  // Handle theme change
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implementation for theme change
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require("@/assets/images/home/home_avatar.png")}
            style={{ width: 60, height: 60, borderRadius: 100 }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.membershipBadge}>
              <Ionicons name="star" size={12} color={HOME_COLOR.HOMETABBAR} />
              <Text style={styles.membershipText}>{userProfile.level}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/(user)/user")}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingOption
            icon="person-outline"
            title="Personal Information"
            onPress={() => {}}
            showChevron
          />
          <SettingOption
            icon="notifications-outline"
            title="Notifications"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D1D6", true: HOME_COLOR.HOMESTATUS1 }}
                thumbColor={
                  notificationsEnabled ? HOME_COLOR.HOMETABBAR : "#F4F3F4"
                }
              />
            }
          />
          <SettingOption
            icon="lock-closed-outline"
            title="Privacy & Security"
            onPress={() => {}}
            showChevron
          />
        </View>

        {/* Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingOption
            icon="moon-outline"
            title="Dark Mode"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#D1D1D6", true: HOME_COLOR.HOMESTATUS1 }}
                thumbColor={darkMode ? HOME_COLOR.HOMETABBAR : "#F4F3F4"}
              />
            }
          />
          <SettingOption
            icon="language-outline"
            title="Language"
            subtitle={
              languages.find((l) => l.code === selectedLanguage)?.name ||
              "English"
            }
            onPress={() => {}}
            showChevron
          />
          <SettingOption
            icon="color-palette-outline"
            title="Appearance"
            onPress={() => {}}
            showChevron
          />
          <SettingOption
            icon="volume-high-outline"
            title="Sounds"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#D1D1D6", true: HOME_COLOR.HOMESTATUS1 }}
                thumbColor={soundEnabled ? HOME_COLOR.HOMETABBAR : "#F4F3F4"}
              />
            }
          />
        </View>

        {/* Data Management */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingOption
            icon="cloud-upload-outline"
            title="Sync Data"
            subtitle="Last synced: Today, 10:45 AM"
            rightElement={
              <Switch
                value={dataSync}
                onValueChange={setDataSync}
                trackColor={{ false: "#D1D1D6", true: HOME_COLOR.HOMESTATUS1 }}
                thumbColor={dataSync ? HOME_COLOR.HOMETABBAR : "#F4F3F4"}
              />
            }
          />
          <SettingOption
            icon="download-outline"
            title="Export Your Data"
            onPress={() => {}}
            showChevron
          />
        </View>

        {/* Support and About */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingOption
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => {}}
            showChevron
          />
          <SettingOption
            icon="information-circle-outline"
            title="About DayMood"
            subtitle="Version 1.0.0"
          />
          <SettingOption
            icon="chatbox-ellipses-outline"
            title="Feedback"
            onPress={() => {}}
            showChevron
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer with copyright */}
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} DayMood App. All rights reserved.
        </Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    paddingTop: height * 0.035,
    marginBottom: height * 0.065,
  },
  profileContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "Quicksand-Semibold",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  membershipText: {
    fontSize: 12,
    color: HOME_COLOR.HOMESTATUS2,
    marginLeft: 4,
    fontWeight: "500",
  },
  editButton: {
    padding: 10,
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: HOME_COLOR.HOMEPLUS,
  },
  editButtonText: {
    color: HOME_COLOR.HOMESTATUS2,
    fontWeight: "500",
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    paddingVertical: 12,
    backgroundColor: "#FEE2E2",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  copyrightText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    paddingBottom: height * 0.08,
  },
});

export default SettingPage;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

