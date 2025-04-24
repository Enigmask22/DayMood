import { View, Text, StyleSheet, Pressable } from "react-native";
import { AntDesign } from "@expo/vector-icons";
const styles = StyleSheet.create({
  text: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "blue",
  },
  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 10,
    padding: 10,
  },
});
interface IProps {
  title: string;
  onPress: () => void;
}
const MineButton = (props: IProps) => {
  //   const { title, onPress } = props;
  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        alignSelf: "flex-start",
      })}
      onPress={props.onPress}
    >
      <View style={styles.btnContainer}>
        <AntDesign name="pluscircle" size={24} color="blue" />
        <Text style={styles.text}>{props.title}</Text>
      </View>
    </Pressable>
  );
};
export default MineButton;
