import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Pressable,
} from "react-native";
import { Link, router, useRouter } from "expo-router";
import InputUserNameBox from "@/components/authpage/InputUserNameBox";
import InputPasswordBox from "@/components/authpage/InputPasswordBox";
import { Checkbox } from "react-native-paper";
import ButtonAuth from "@/components/authpage/ButtonAuth";
import ButtonLoginGoogle from "@/components/authpage/ButtonLoginGoogle";
import { API_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/common/CustomAlert";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    onConfirm: () => {},
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info",
    onConfirm?: () => void
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm:
        onConfirm ||
        (() => setAlertConfig((prev) => ({ ...prev, visible: false }))),
    });
  };

  const handleCheckboxPress = () => {
    setChecked((prev) => !prev);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert(
        "Missing Information",
        "Please enter both email and password",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.statusCode === 201) {
        await AsyncStorage.setItem("access_token", data.data.access_token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user));

        const cookies = response.headers.get("set-cookie");
        if (cookies) {
          const refreshToken = cookies.split(";")[0].split("=")[1];
          await AsyncStorage.setItem("refresh_token", refreshToken);
        }

        showAlert("Success", "Login successful!", "success", () => {
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          router.push("/(main)");
        });
      } else {
        showAlert(
          "Error",
          data.message || "Login failed. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert(
        "Error",
        "An error occurred during login. Please try again.",
        "error"
      );
    }
  };

  return (
    <>
      <StatusBar backgroundColor={"#E0F1E6"} />
      <View
        style={{
          height: height * 1.1,
          width: "100%",
          backgroundColor: "#E0F1E6",
        }}
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.containerLogo}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>Welcome To</Text>
            </View>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>YoloHome</Text>
            </View>

            {/* sign up */}
            <View style={styles.signupLabel}>
              <View>
                <Text style={styles.normalText}>Don't have account? </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <View>
                  <Text style={[styles.normalText, styles.signupText]}>
                    Sign up
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Box */}
          <View>
            <InputUserNameBox
              title={"Email address or user name"}
              data={email}
              setData={setEmail}
            />
            <InputPasswordBox
              title={"Password"}
              password={password}
              setPassword={setPassword}
            />

            <View style={styles.remembermeBox}>
              {/* checkbox */}
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  onPress={handleCheckboxPress}
                  style={styles.checkbox}
                >
                  <Checkbox
                    status={checked ? "checked" : "unchecked"}
                    color="#47B069"
                  />
                  <Text style={styles.normalText}>Remember me</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  /* Xử lý quên mật khẩu */
                }}
                style={styles.forgotPasswordBox}
              >
                {({ pressed }) => (
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      {
                        fontFamily: "Poppins-Regular",
                        color: pressed ? "#A7C7B7" : "black",
                      },
                    ]}
                  >
                    Forgot password
                  </Text>
                )}
              </Pressable>
            </View>
            {/* Loggin Normal*/}
            <View style={styles.buttonLoginBox}>
              <ButtonAuth title="Login" onPress={handleLogin} />
            </View>

            <View style={styles.lineSeperateBox}>
              <View style={styles.line} />
              <Text
                style={[styles.normalText, { marginHorizontal: width * 0.03 }]}
              >
                OR
              </Text>
              <View style={styles.line} />
            </View>
            <View style={styles.buttonLoginBox}>
              <ButtonLoginGoogle onPress={() => {}} />
            </View>
          </View>
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onConfirm={alertConfig.onConfirm}
        showConfirmButton={alertConfig.type === "success"}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "auto",
    marginHorizontal: width * 0.06,
    gap: height * 0.15,
  },
  containerLogo: {
    marginTop: height * 0.08,
    height: height * 0.1,
    paddingVertical: height * 0.02,
  },
  logoBox: {
    margin: 0,
    padding: 0,
    // borderColor: "black",
    // borderWidth: 2,
  },
  logoText: {
    color: "#16A34A",
    fontSize: 33,
    fontFamily: "Poppins-Bold",
  },
  signupLabel: {
    paddingTop: height * 0.01,
    flexDirection: "row",
  },
  normalText: {
    color: "black",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  signupText: {
    color: "#186DA1",
    textDecorationLine: "underline",
    textDecorationColor: "#186DA1",
  },
  remembermeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  forgotPasswordBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 15,
  },
  buttonLoginBox: {
    alignItems: "center",
    marginVertical: height * 0.05,
  },
  lineSeperateBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    borderBottomWidth: 1,
    flex: 1,
    borderColor: "#CFD2D7",
  },
  forgotPasswordText: {
    textDecorationLine: "underline",
  },
});
