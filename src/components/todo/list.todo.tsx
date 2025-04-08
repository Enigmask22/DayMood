import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";

interface IProps {
  todoList: ITodo[];
  deleteTodo: (id: number) => void;
}
const ListTodo = (props: IProps) => {
  return (
    <View>
      <FlatList
        data={props.todoList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => props.deleteTodo(item.id)}>
              <Text style={styles.todo}>
                {item.id} - {item.title}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {/* <ScrollView style={{ marginTop: 20 }}>
        {todoList.map((todo) => (
          <View key={todo.id}>
            <Text style={styles.todo}>{todo.title}</Text>
          </View>
        ))}
      </ScrollView> */}
    </View>
  );
};
const styles = StyleSheet.create({
  todo: {
    fontSize: 20,
    backgroundColor: "pink",
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
  },
});
export default ListTodo;
