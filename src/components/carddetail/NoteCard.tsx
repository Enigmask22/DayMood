import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { wp, hp } from "@/components/newemoji/utils";

// Map mood IDs to titles
const moodTitles: { [key: number]: string } = {
  1: "Not feeling good today",
  2: "I'm feeling angry",
  3: "Just an ordinary day",
  4: "It's a good day",
  5: "Today is so good",
};

interface NoteCardProps {
  moodId: number;
  note: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ moodId, note }) => {
  // Lấy tiêu đề tương ứng với mood
  const title = moodTitles[moodId] || "How I feel today";

  return (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>{title}</Text>
      <View style={styles.titleUnderline} />
      <Text style={styles.noteText}>{note}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    backgroundColor: "#FFFFC0", // Màu vàng nhạt
    borderRadius: wp(4),
    padding: wp(5),
    marginBottom: hp(3),
  },
  noteTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    fontFamily: "Quicksand-Bold",
    textAlign: "center",
    color: "#333",
  },
  titleUnderline: {
    height: 1,
    backgroundColor: "#999",
    marginVertical: hp(1),
    width: "90%",
    alignSelf: "center",
  },
  noteText: {
    fontSize: wp(3.8),
    color: "#333",
    fontFamily: "Quicksand-Regular",
    lineHeight: wp(5.5),
  },
});

export default NoteCard;
