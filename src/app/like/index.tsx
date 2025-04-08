import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

const LikeScreen = () => {
  const navigation: any = useNavigation();
  return (
    <View>
      <Text>Like Component</Text>
      <Button
        title="Go to Like Details"
        onPress={() => navigation.navigate("LikeDetails")}
      />
    </View>
  );
};

export default LikeScreen;
