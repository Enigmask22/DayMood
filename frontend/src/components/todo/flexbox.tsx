import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    borderWidth: 1,
    borderColor: "red",
    // padding: 10,
    justifyContent: "center",
    // alignItems: "center",
  },
  item1: {
    // flex: 1,
    backgroundColor: "red",
    height: 100,
    width: 100,
  },
  item2: {
    // flex: 1,
    backgroundColor: "blue",
    height: 100,
    width: 100,
  },
  item3: {
    // flex: 1,
    backgroundColor: "green",
    height: 100,
    width: 100,
  },
  item4: {
    // flex: 1,
    backgroundColor: "yellow",
    height: 100,
    width: 100,
  },
});
const Flexbox = () => {
  return (
    <View style={styles.container}>
      <View style={styles.item1}>
        <Text>Item 1</Text>
      </View>
      <View style={styles.item2}>
        <Text>Item 2</Text>
      </View>
      <View style={styles.item3}>
        <Text>Item 3</Text>
      </View>
      <View style={styles.item4}>
        <Text>Item 4</Text>
      </View>
    </View>
  );
};

export default Flexbox;
