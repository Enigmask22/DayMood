import React from "react";
import {
  Modal,
  Pressable,
  View,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";

interface YearPickerModalProps {
  visible: boolean;
  currentYear: number;
  onClose: () => void;
  onYearSelect: (year: number) => void;
}

const YearPickerModal = ({
  visible,
  currentYear,
  onClose,
  onYearSelect,
}: YearPickerModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.2)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            width: 200,
            maxHeight: 400,
          }}
        >
          <FlatList
            data={Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onYearSelect(item)}
                style={{ padding: 12, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: item === currentYear ? "#7C5CFC" : "#222",
                    fontWeight: item === currentYear ? "bold" : "normal",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

export default YearPickerModal;
