import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { wp, hp } from "../newemoji/utils";
import FullNoteEditor from "./FullNoteEditor";

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
  // Xử lý hiển thị nội dung ghi chú trong input box
  const getPreviewText = () => {
    if (!note) return "";

    // Giới hạn hiển thị khoảng 50 ký tự
    const maxPreviewLength = 50;
    if (note.length <= maxPreviewLength) return note;

    return note.substring(0, maxPreviewLength) + "...";
  };

  const handleCloseEditor = () => {
    onToggleFullNote();
  };

  const handleSaveNote = (newNote: string) => {
    onChangeNote(newNote);
  };

  return (
    <View style={styles.noteSection}>
      <View style={styles.noteHeader}>
        <View style={styles.noteIcon}>
          <MaterialIcons name="edit" size={wp(5)} color="#333" />
          <Text style={styles.noteTitle}>Your note</Text>
        </View>
        <TouchableOpacity
          style={styles.openFullNoteButton}
          onPress={onToggleFullNote}
          activeOpacity={0.7}
        >
          <Text style={styles.openFullNote}>Open full note</Text>
          <MaterialIcons
            name="launch"
            size={wp(4)}
            color="#666"
            style={styles.openIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.noteInputContainer}
        onPress={onToggleFullNote}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.noteInputPreview,
            !note && styles.noteInputPlaceholder,
          ]}
          numberOfLines={3}
        >
          {note ? getPreviewText() : "Write something..."}
        </Text>
      </TouchableOpacity>

      {/* Full Note Editor Modal */}
      <FullNoteEditor
        visible={isFullNoteOpen}
        note={note}
        onClose={handleCloseEditor}
        onSave={handleSaveNote}
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
  openFullNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
  },
  openFullNote: {
    fontSize: wp(3.5),
    color: "#666",
    fontFamily: "Quicksand-Bold",
  },
  openIcon: {
    marginLeft: wp(1),
  },
  noteInputContainer: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(3),
    minHeight: hp(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noteInputPreview: {
    fontFamily: "Quicksand-Regular",
    fontSize: wp(4),
    color: "#333",
    lineHeight: wp(6),
  },
  noteInputPlaceholder: {
    color: "#999",
    fontStyle: "italic",
  },
});

export default NoteSection;
