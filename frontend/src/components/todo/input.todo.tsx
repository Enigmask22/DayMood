import { TextInput, View, Text, Button, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import MineButton from "../button/mine.button";
interface IProps {
  addTodo: (value: string) => void;
}

const InputTodo = (props: IProps) => {
  const [name, setName] = useState("");
  const handleAddNewTodo = () => {
    //validate
    if (name.trim() === "") {
      Alert.alert("Please enter a value", "Value is not null", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => console.log("OK Pressed"),
        },
      ]);
      return;
    }
    props.addTodo(name);
    setName("");
  };
  return (
    <View>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        // keyboardType="numeric"
        maxLength={20}
        multiline={true}
        autoCorrect={false}
        placeholder="Enter your name"
        onChangeText={(val) => setName(val)}
        value={name}
      />
      <Text style={styles.output}>Hello {name}</Text>
      <View style={styles.button}>
        <Button title="CLEAR" onPress={() => setName("")} />
        <View style={styles.button}>
          <Button title="ADD" onPress={handleAddNewTodo} />
        </View>
        <MineButton title="Add New Todo" onPress={handleAddNewTodo} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 6,
    height: 40,
    padding: 10,
  },
  output: {
    marginTop: 10,
    // marginBottom: 10,
    fontSize: 20,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 6,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});
export default InputTodo;
