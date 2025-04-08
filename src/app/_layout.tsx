import { Stack, Slot } from "expo-router";
import { View, Text } from "react-native";

const RootLayout = () => {
  return (
    // <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //   <Text>Header</Text>
    //   <Slot />
    //   <Text>Footer</Text>
    // </View>
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerTitle: "Home" }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: true, headerTitle: "Tabs" }}
      />
      <Stack.Screen
        name="product/index"
        options={{ headerShown: true, headerTitle: "Product" }}
      />
      <Stack.Screen
        name="(auth)/login"
        options={{ headerShown: true, headerTitle: "Login" }}
      />
    </Stack>
  );
};

export default RootLayout;
