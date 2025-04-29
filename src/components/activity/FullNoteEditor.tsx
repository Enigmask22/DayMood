import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  SafeAreaView,
  Modal,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../newemoji/utils";

interface FullNoteEditorProps {
  visible: boolean;
  note: string;
  onClose: () => void;
  onSave: (newNote: string) => void;
}

const FullNoteEditor: React.FC<FullNoteEditorProps> = ({
  visible,
  note,
  onClose,
  onSave,
}) => {
  const [editedNote, setEditedNote] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  // Tách tiêu đề từ note khi có dấu hiệu phân cách như dấu xuống dòng
  useEffect(() => {
    if (visible) {
      // Hiệu ứng khi mở Modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Xử lý note
      if (note) {
        // Nếu note có nhiều dòng, lấy dòng đầu làm tiêu đề
        const lines = note.split("\n");
        if (lines.length > 1) {
          setTitle(lines[0]);
          setContent(lines.slice(1).join("\n").trim());
        } else {
          setContent(note);
        }
      }
      setEditedNote(note);
    } else {
      // Reset lại các giá trị
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, note]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSave = () => {
    // Kết hợp tiêu đề và nội dung nếu cả hai cùng có
    const finalNote = title ? `${title}\n${content}` : content;
    onSave(finalNote);
    handleClose();
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    updateEditedNote(text, content);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    updateEditedNote(title, text);
  };

  const updateEditedNote = (newTitle: string, newContent: string) => {
    const updatedNote = newTitle ? `${newTitle}\n${newContent}` : newContent;
    setEditedNote(updatedNote);
  };

  // Tính toán animation cho Modal
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <StatusBar
            backgroundColor="rgba(0, 0, 0, 0.5)"
            barStyle="light-content"
          />

          {/* Header */}
          <LinearGradient
            colors={["#32B768", "#26A65B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={wp(7)} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Note</Text>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={wp(7)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Editor Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.editorContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Field */}
              <View style={styles.titleContainer}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Add a title..."
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={handleTitleChange}
                  maxLength={100}
                  autoFocus={true}
                />
              </View>

              {/* Content Field */}
              <View style={styles.contentContainer}>
                <TextInput
                  style={styles.contentInput}
                  placeholder="Write your note here..."
                  placeholderTextColor="#999"
                  value={content}
                  onChangeText={handleContentChange}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Formatting Toolbar */}
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarButton}>
              <FontAwesome name="bold" size={wp(5)} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <FontAwesome name="italic" size={wp(5)} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <FontAwesome name="underline" size={wp(5)} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialIcons
                name="format-list-bulleted"
                size={wp(5.5)}
                color="#555"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialIcons
                name="format-list-numbered"
                size={wp(5.5)}
                color="#555"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="image-outline" size={wp(5.5)} color="#555" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomLeftRadius: wp(3),
    borderBottomRightRadius: wp(3),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  closeButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Quicksand-Bold",
  },
  editorContainer: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  scrollContent: {
    flexGrow: 1,
    padding: wp(5),
  },
  titleContainer: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleInput: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    fontSize: wp(5),
    fontFamily: "Quicksand-Bold",
    color: "#333",
    minHeight: hp(6),
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: hp(2),
  },
  contentInput: {
    padding: wp(4),
    fontSize: wp(4.2),
    fontFamily: "Quicksand-Regular",
    color: "#333",
    lineHeight: wp(6),
    minHeight: hp(30),
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#fff",
    paddingVertical: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  toolbarButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp(5),
  },
});

export default FullNoteEditor;
