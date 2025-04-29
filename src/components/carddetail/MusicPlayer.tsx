import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { wp, hp } from "@/components/newemoji/utils";

interface MusicPlayerProps {
  musicTitle: string;
  onPlayMusic: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  musicTitle,
  onPlayMusic,
}) => {
  return (
    <View style={styles.musicPlayer}>
      <FontAwesome5 name="music" size={wp(5)} color="#333" />
      <Text style={styles.musicTitle}>{musicTitle}</Text>
      <TouchableOpacity style={styles.playButton} onPress={onPlayMusic}>
        <LinearGradient
          colors={["#32B768", "#27A35A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.musicPlayButton}
        >
          <Ionicons name="play" size={wp(4)} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  musicPlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FFF0",
    padding: wp(4),
    borderRadius: wp(10),
    marginBottom: hp(2),
  },
  musicTitle: {
    fontSize: wp(4),
    color: "#333",
    fontFamily: "Quicksand-Regular",
  },
  playButton: {
    borderRadius: wp(5),
    overflow: "hidden",
  },
  musicPlayButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MusicPlayer;
