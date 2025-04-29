import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { wp, hp } from "../newemoji/utils";

interface NoteSectionProps {
  note: string;
  onChangeNote: (text: string) => void;
  isFullNoteOpen: boolean;
  onToggleFullNote: () => void;
}

const NoteSection: React.FC<NoteSectionProps> = ({
  note,
  onChangeNote,
  isFullNoteOpen,
  onToggleFullNote,
}) => {
  return (
    <View style={styles.noteSection}>
      <View style={styles.noteHeader}>
        <View style={styles.noteIcon}>
          <MaterialIcons name="edit" size={wp(5)} color="#333" />
          <Text style={styles.noteTitle}>Your note</Text>
        </View>
        <TouchableOpacity onPress={onToggleFullNote}>
          <Text style={styles.openFullNote}>Open full note</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.noteInput}
        placeholder="Write something..."
        placeholderTextColor="#666"
        multiline
        value={note}
        onChangeText={onChangeNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  noteSection: {
    marginTop: hp(2.5),
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  noteIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    marginLeft: wp(2),
    fontFamily: "Quicksand-Bold",
  },
  openFullNote: {
    fontSize: wp(3.5),
    color: "#666",
    fontFamily: "Quicksand-Bold",
  },
  noteInput: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(3),
    minHeight: hp(6),
    fontFamily: "Quicksand-Regular",
    fontSize: wp(4),
    color: "#333",
  },
});

export default NoteSection;
