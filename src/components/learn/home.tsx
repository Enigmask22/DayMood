import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation: any = useNavigation();
  return (
    <View>
      <Text>Home Component</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate("HomeDetails")}
      />
    </View>
  );
};

export default HomeScreen;
