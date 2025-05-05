import React from "react";
import {
  Modal,
  Pressable,
  View,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";

interface MonthPickerModalProps {
  visible: boolean;
  currentMonth: number;
  onClose: () => void;
  onMonthSelect: (monthIndex: number) => void;
}

const MonthPickerModal = ({
  visible,
  currentMonth,
  onClose,
  onMonthSelect,
}: MonthPickerModalProps) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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
            width: 300,
          }}
        >
          <FlatList
            data={months}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => onMonthSelect(index)}
                style={{ padding: 12, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: index === currentMonth ? "#7C5CFC" : "#222",
                    fontWeight: index === currentMonth ? "bold" : "normal",
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

export default MonthPickerModal;
