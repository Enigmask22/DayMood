import ButtonAuth from "@/components/authpage/ButtonAuth";
import InputPasswordBox from "@/components/authpage/InputPasswordBox";
import InputUserNameBox from "@/components/authpage/InputUserNameBox";
import { API_URL } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import CustomAlert from "@/components/common/CustomAlert";

const { width, height } = Dimensions.get("window");

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    buttons: [{ text: "OK", style: "default" as const }],
    autoDismiss: false,
    tapToDismiss: false,
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info",
    onConfirm?: () => void
  ) => {
    const isSuccess = type === "success";
    const buttons =
      onConfirm && !isSuccess
        ? [{ text: "OK", style: "default" as const, onPress: onConfirm }]
        : [{ text: "OK", style: "default" as const }];

    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
      autoDismiss: isSuccess,
      tapToDismiss: true,
    });
  };

  // Auto navigation for success alert
  useEffect(() => {
    if (alertConfig.visible && alertConfig.type === "success") {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alertConfig.visible, alertConfig.type]);

  const handleReturnToLogin = () => {
    router.back();
  };

  const handleSignUp = async () => {
    // Kiểm tra nếu đang signing up thì return sớm
    if (isSigningUp) {
      return;
    }

    try {
      setIsSigningUp(true); // Bắt đầu quá trình signing up

      if (password !== confirmPassword) {
        showAlert(
          "Error",
          "Password and confirm password do not match",
          "error"
        );
        return;
      }
      if (!email || !username || !password || !confirmPassword) {
        showAlert("Error", "Please fill in all fields", "error");
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok && data.statusCode === 201) {
        showAlert(
          "Success",
          "Registration successful! Please login to continue.",
          "success"
        );
      } else {
        showAlert(
          "Registration Failed",
          data.message ||
            "An error occurred during registration. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      showAlert(
        "Error",
        "An unexpected error occurred. Please try again later.",
        "error"
      );
    } finally {
      setIsSigningUp(false); // Kết thúc quá trình signing up trong mọi trường hợp
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar barStyle="dark-content" />
      {/* Logo */}
      <View style={{ backgroundColor: "#E0F1E6", flex: 1 }}>
        <View style={[styles.container, { flex: 1 }]}>
          {/* Logo */}
          <View style={styles.containerLogo}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>Create An</Text>
            </View>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>Account</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <InputUserNameBox
              title={"Email address"}
              data={email}
              setData={setEmail}
              isEmail={true}
            />
            <InputUserNameBox
              title={"User name"}
              data={username}
              setData={setUserName}
            />
            <InputPasswordBox
              title={"Password"}
              password={password}
              setPassword={setPassword}
            />
            <InputPasswordBox
              title={"Confirm Password"}
              password={confirmPassword}
              setPassword={setConfirmPassword}
            />
          </View>

          <View style={styles.buttonLoginBox}>
            <ButtonAuth
              title="Sign up"
              onPress={handleSignUp}
              isLoading={isSigningUp}
            />
          </View>

          <View style={styles.navigateBox}>
            <TouchableOpacity onPress={handleReturnToLogin}>
              <View style={styles.buttonInnerBox}>
                <Ionicons name="chevron-back" size={24} color="#6F6D6C" />
                <Text style={styles.buttonText}> Back to Login</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        autoDismiss={alertConfig.autoDismiss}
        tapToDismiss={alertConfig.tapToDismiss}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: width * 0.06,
    gap: height * 0.06,
  },
  containerLogo: {
    height: height * 0.1,
    marginTop: height * 0.1,
    paddingVertical: height * 0.025,
  },
  logoBox: {
    margin: 0,
    padding: 0,
  },
  logoText: {
    color: "#16A34A",
    fontSize: 33,
    fontFamily: "Poppins-Bold",
  },
  navigateBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: height * 0.02,
    marginBottom: 30,
  },
  buttonInnerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonText: {
    color: "#6F6D6C",
    fontSize: 22,
    textAlign: "center",
    alignItems: "center",
  },
  nextButton: {
    fontSize: 20,
    textAlign: "center",
    alignItems: "center",
    color: "black",
    // fontWeight: "bold",
  },
  buttonLoginBox: {
    alignItems: "center",
  },
});
