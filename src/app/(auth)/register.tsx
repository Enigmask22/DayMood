import ButtonAuth from "@/components/authpage/ButtonAuth";
import InputPasswordBox from "@/components/authpage/InputPasswordBox";
import InputUserNameBox from "@/components/authpage/InputUserNameBox";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
const { width, height } = Dimensions.get("window");

export default function Register() {
  const router = useRouter(); // Hook điều hướng
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReturnToLogin = () => {
    router.back();
  };

  const handleSignUp = () => {
    console.log("Sign up");
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
            <ButtonAuth title="Sign up" onPress={handleSignUp} />
          </View>

          <View style={styles.navigateBox}>
            <TouchableOpacity onPress={handleReturnToLogin}>
              <View style={styles.buttonInnerBox}>
                <Ionicons
                  name="return-down-back-sharp"
                  size={24}
                  color="#6F6D6C"
                />
                <Text style={styles.buttonText}> Back to Login</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingVertical: height * 0.02,
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
