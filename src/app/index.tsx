import { View, Text, StyleSheet } from "react-native";
import ShareButton from "components/button/share.button";
import { APP_COLOR } from "utils/constant";
import { FontAwesome } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeText: {
    flex: 0.6,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
  },
  welcomeButton: {
    flex: 0.4,
    gap: 20,
  },
  heading: {
    fontSize: 40,
    fontWeight: "bold",
  },
  body: {
    fontSize: 30,
    fontWeight: "bold",
    color: APP_COLOR.GREEN,
    marginVertical: 8,
  },
  footer: {
    fontSize: 16,
    color: "gray",
  },
  btnContainer: {},
  btnContent: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
const WelcomePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.welcomeText}>
        <Text style={styles.heading}>Welcome to </Text>
        <Text style={styles.body}>DayMood</Text>
        <Text style={styles.footer}>Let make your day better</Text>
      </View>
      <View style={styles.welcomeButton}>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: APP_COLOR.GREEN,
            marginHorizontal: 50,
          }}
        >
          <Text
            style={{
              backgroundColor: "white",
              padding: 10,
              alignSelf: "center",
              textAlign: "center",
              position: "relative",
              top: 20,
            }}
          >
            Sign in with
          </Text>
        </View>
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 30 }}
        >
          <ShareButton
            title="Facebook"
            onPress={() => {}}
            textStyle={{ textTransform: "none" }}
            pressStyle={{ alignSelf: "stretch" }}
            btnStyle={{
              borderRadius: 30,
              backgroundColor: APP_COLOR.BLUE,
              justifyContent: "center",
            }}
            icons={<FontAwesome name="facebook" size={24} color="white" />}
          />
          <ShareButton
            title="Google"
            onPress={() => {}}
            textStyle={{ textTransform: "none" }}
            btnStyle={{
              borderRadius: 30,
              backgroundColor: APP_COLOR.RED,
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
            icons={<FontAwesome name="google" size={24} color="white" />}
          />
        </View>
        <View>
          <ShareButton
            title="Đăng nhập với email"
            onPress={() => {
              alert("Đăng nhập với email");
            }}
            textStyle={{ textTransform: "none" }}
            pressStyle={{ alignSelf: "stretch" }}
            btnStyle={{
              borderRadius: 30,
              backgroundColor: APP_COLOR.GREEN,
              marginHorizontal: 50,
              justifyContent: "center",
              paddingVertical: 12,
            }}
          />
        </View>
        <View>
          <Text style={{ textAlign: "center", color: "gray" }}>
            Chưa có tài khoản? Đăng ký
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WelcomePage;
