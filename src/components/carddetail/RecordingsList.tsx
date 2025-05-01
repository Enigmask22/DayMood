import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { wp, hp } from "@/components/newemoji/utils";
import { Audio } from "expo-av";

interface RecordingData {
  id: number;
  uri: string;
  duration: string;
  sound?: Audio.Sound;
  isPlaying?: boolean;
  isPaused?: boolean;
  fileExists: boolean;
  isMusic?: boolean;
  name?: string;
  currentPosition?: string;
  durationMillis?: number;
  currentMillis?: number;
}

interface RecordingsListProps {
  recordings: RecordingData[];
  onPlayRecording: (recording: RecordingData) => Promise<void>;
  onPauseRecording?: (recording: RecordingData) => Promise<void>;
  onStopRecording?: (recording: RecordingData) => Promise<void>;
  onResumeRecording?: (recording: RecordingData) => Promise<void>;
}

const RecordingsList: React.FC<RecordingsListProps> = ({
  recordings,
  onPlayRecording,
  onPauseRecording,
  onStopRecording,
  onResumeRecording,
}) => {
  if (!recordings || recordings.length === 0) {
    return null;
  }

  console.log("Hiển thị danh sách bản ghi - Số lượng:", recordings.length);

  return (
    <View style={styles.recordingsContainer}>
      <View style={styles.recordingsHeader}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesome5 name="headphones" size={wp(4.5)} color="#333" />
          <Text style={styles.sectionTitle}>Audio Recordings</Text>
        </View>
      </View>

      <View style={styles.recordingsList}>
        {recordings.map((recording) => {
          console.log(`Hiển thị bản ghi #${recording.id}:`, {
            name: recording.name,
            isPlaying: recording.isPlaying,
            isPaused: recording.isPaused,
            isMusic: recording.isMusic,
            duration: recording.duration,
          });

          return (
            <View key={recording.id} style={styles.recordingItem}>
              <View style={styles.recordingInfo}>
                <View
                  style={[
                    styles.recordingIconContainer,
                    recording.isPlaying && styles.recordingIconContainerActive,
                    recording.isPaused && styles.recordingIconContainerPaused,
                    recording.isMusic && styles.musicIconContainer,
                    recording.isMusic &&
                      recording.isPlaying &&
                      styles.musicIconContainerActive,
                    recording.isMusic &&
                      recording.isPaused &&
                      styles.musicIconContainerPaused,
                  ]}
                >
                  <FontAwesome5
                    name={
                      recording.isPlaying
                        ? "volume-up"
                        : recording.isPaused
                        ? "volume-down"
                        : recording.isMusic
                        ? "music"
                        : "microphone"
                    }
                    size={wp(4)}
                    color={
                      recording.isPlaying
                        ? "#fff"
                        : recording.isPaused
                        ? "#ffa726"
                        : recording.isMusic
                        ? "#6366F1"
                        : "#32B768"
                    }
                  />
                </View>
                <View style={styles.titleContainer}>
                  <Text
                    style={styles.recordingTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {recording.name || `Bản ghi #${recording.id + 1}`}
                  </Text>
                  <Text
                    style={
                      recording.isPlaying || recording.isPaused
                        ? styles.playingDuration
                        : styles.recordingDuration
                    }
                  >
                    {(recording.isPlaying || recording.isPaused) &&
                    recording.currentPosition
                      ? `${recording.currentPosition}/${recording.duration}`
                      : recording.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.controlsContainer}>
                {recording.isPlaying && (
                  <>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() =>
                        onPauseRecording && onPauseRecording(recording)
                      }
                    >
                      <LinearGradient
                        colors={["#ffa726", "#fb8c00"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <FontAwesome5
                          name="pause"
                          size={wp(3.5)}
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>PAUSE</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() =>
                        onStopRecording && onStopRecording(recording)
                      }
                    >
                      <LinearGradient
                        colors={["#ff6b6b", "#ff5252"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <FontAwesome5 name="stop" size={wp(3.5)} color="#fff" />
                        <Text style={styles.buttonText}>STOP</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

                {recording.isPaused && (
                  <>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() =>
                        onResumeRecording && onResumeRecording(recording)
                      }
                    >
                      <LinearGradient
                        colors={["#4CAF50", "#2E7D32"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <FontAwesome5 name="play" size={wp(3.5)} color="#fff" />
                        <Text style={styles.buttonText}>RESUME</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() =>
                        onStopRecording && onStopRecording(recording)
                      }
                    >
                      <LinearGradient
                        colors={["#ff6b6b", "#ff5252"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <FontAwesome5 name="stop" size={wp(3.5)} color="#fff" />
                        <Text style={styles.buttonText}>STOP</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

                {!recording.isPlaying && !recording.isPaused && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => onPlayRecording(recording)}
                  >
                    <LinearGradient
                      colors={
                        recording.isMusic
                          ? ["#6366F1", "#4F46E5"]
                          : ["#32B768", "#27A35A"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.playButtonGradient}
                    >
                      <FontAwesome5 name="play" size={wp(3.5)} color="#fff" />
                      <Text style={styles.playButtonText}>PLAY</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordingsContainer: {
    marginBottom: hp(3),
    backgroundColor: "#e6f9f0",
    borderRadius: wp(3),
    padding: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(50, 183, 104, 0.2)",
  },
  recordingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
    paddingBottom: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(50, 183, 104, 0.2)",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#333",
    marginLeft: wp(2),
    fontFamily: "Quicksand-Bold",
  },
  recordingsList: {
    gap: hp(1.5),
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: wp(2.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: wp(2),
  },
  recordingIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "rgba(50, 183, 104, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2.5),
  },
  recordingIconContainerActive: {
    backgroundColor: "#ff5252",
  },
  recordingIconContainerPaused: {
    backgroundColor: "#ffa726",
  },
  musicIconContainer: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  musicIconContainerActive: {
    backgroundColor: "#6366F1",
  },
  musicIconContainerPaused: {
    backgroundColor: "#7e57c2",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  recordingTitle: {
    fontSize: wp(3.8),
    color: "#333",
    fontFamily: "Quicksand-Bold",
    marginBottom: hp(0.3),
  },
  recordingDuration: {
    fontSize: wp(3.5),
    color: "#666",
    fontFamily: "Quicksand-Regular",
  },
  playingDuration: {
    fontSize: wp(3.5),
    color: "#32B768",
    fontFamily: "Quicksand-Medium",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  playButton: {
    borderRadius: wp(5),
    overflow: "hidden",
  },
  controlButton: {
    borderRadius: wp(5),
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(5),
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(5),
  },
  playButtonText: {
    fontSize: wp(3.3),
    color: "#fff",
    fontWeight: "bold",
    marginLeft: wp(1.5),
    fontFamily: "Quicksand-Bold",
    letterSpacing: 0.5,
  },
  buttonText: {
    fontSize: wp(3),
    color: "#fff",
    fontWeight: "bold",
    marginLeft: wp(1),
    fontFamily: "Quicksand-Bold",
    letterSpacing: 0.5,
  },
});

export default RecordingsList;
