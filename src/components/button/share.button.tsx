import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type TextStyle,
  type StyleProp,
} from "react-native";
import { APP_COLOR } from "@/utils/constant";
const styles = StyleSheet.create({
  text: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  btnContainer: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: APP_COLOR.GREEN,
  },
});
interface IProps {
  title: string;
  onPress: () => void;

  textStyle?: StyleProp<TextStyle>;
  pressStyle?: StyleProp<TextStyle>;
  btnStyle?: StyleProp<TextStyle>;
  icons?: React.ReactNode;
}
const ShareButton = (props: IProps) => {
  const { title, onPress, textStyle, pressStyle, btnStyle, icons } = props;
  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.5 : 1,
        },
        pressStyle,
      ]}
      onPress={onPress}
    >
      <View style={[styles.btnContainer, btnStyle]}>
        {icons}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </View>
    </Pressable>
  );
};
export default ShareButton;
