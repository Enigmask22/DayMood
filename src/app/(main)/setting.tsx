import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { HOME_COLOR } from "@/utils/constant";
import Avatar from "@/components/settingpage/Avatar";
import SettingOption from "@/components/settingpage/SettingOption";

const SettingPage = () => {
  // Sample state for settings toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  
  // Profile information
  const userProfile = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    memberSince: "January 2023",
    level: "Premium"
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
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => {
            // Perform logout operations
            router.replace("/login");
          },
          style: "destructive" 
        }
      ]
    );
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
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Avatar 
          size={80} 
          source={{ uri: "https://randomuser.me/api/portraits/people/42.jpg" }}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
          <View style={styles.membershipBadge}>
            <Ionicons name="star" size={12} color={HOME_COLOR.HOMETABBAR} />
            <Text style={styles.membershipText}>{userProfile.level}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {/* Account Settings */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingOption
          icon="person-outline"
          title="Personal Information"
          onPress={() => router.push("/")}
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
              thumbColor={notificationsEnabled ? HOME_COLOR.HOMETABBAR : "#F4F3F4"}
            />
          }
        />
        <SettingOption
          icon="lock-closed-outline"
          title="Privacy & Security"
          onPress={() => router.push("/")}
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
          subtitle={languages.find(l => l.code === selectedLanguage)?.name || "English"}
          onPress={() => router.push("/")}
          showChevron
        />
        <SettingOption
          icon="color-palette-outline"
          title="Appearance"
          onPress={() => router.push("/")}
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
          onPress={() => router.push("/")}
          showChevron
        />
      </View>
      
      {/* Support and About */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingOption
          icon="help-circle-outline"
          title="Help Center"
          onPress={() => router.push("/")}
          showChevron
        />
        <SettingOption
          icon="information-circle-outline"
          title="About DayMood"
          subtitle="Version 1.2.3"
          onPress={() => router.push("/")}
          showChevron
        />
        <SettingOption
          icon="chatbox-ellipses-outline"
          title="Feedback"
          onPress={() => router.push("/")}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
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
    fontWeight: "600",
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
    padding: 8,
    borderRadius: 16,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
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
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 30,
  }
});

export default SettingPage;