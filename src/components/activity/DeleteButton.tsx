import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { wp, hp } from "@/components/newemoji/utils";

const { width, height } = Dimensions.get("window");

interface DeleteButtonProps {
  onDelete: () => void;
}

const DeleteButton = ({ onDelete }: DeleteButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={onDelete}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Delete Record</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: wp(8),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: wp(4.5),
    fontFamily: "Quicksand-Bold",
    fontWeight: "700",
  },
});

export default DeleteButton;
