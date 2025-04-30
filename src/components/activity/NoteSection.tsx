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
  // Tách tiêu đề và nội dung từ note
  const extractTitleAndContent = (noteText: string) => {
    if (!noteText) return { title: "", content: "" };

    const lines = noteText.split("\n");
    if (lines.length > 1) {
      return {
        title: lines[0],
        content: lines.slice(1).join("\n").trim(),
      };
    } else {
      return { title: "", content: noteText };
    }
  };

  const handleCloseEditor = () => {
    onToggleFullNote();
  };

  const handleSaveNote = (newNote: string) => {
    onChangeNote(newNote);
  };

  // Lấy tiêu đề và nội dung từ note
  const { title, content } = extractTitleAndContent(note);

  // Tạo preview cho nội dung
  const getContentPreview = (text: string) => {
    if (!text) return "";
    const maxPreviewLength = 50;
    if (text.length <= maxPreviewLength) return text;
    return text.substring(0, maxPreviewLength) + "...";
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
        {note ? (
          <>
            {title ? <Text style={styles.noteTitleText}>{title}</Text> : null}

            {content ? (
              <Text style={[styles.noteInputPreview]} numberOfLines={2}>
                {getContentPreview(content)}
              </Text>
            ) : null}
          </>
        ) : (
          <Text
            style={[styles.noteInputPreview, styles.noteInputPlaceholder]}
            numberOfLines={3}
          >
            Write something...
          </Text>
        )}
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
  noteTitleText: {
    fontFamily: "Quicksand-Bold",
    fontSize: wp(4.5),
    color: "#222",
    marginBottom: hp(0.5),
    fontWeight: "bold",
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
