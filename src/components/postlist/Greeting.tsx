import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Dimensions,
} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Greeting = () => {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (err) {
                console.error("Failed to load user data:", err);
                setError("Failed to load user data");
            }
        };

        loadUser();
    }, []);
    const router = useRouter();
    return (
        <View style={styles.greetingContainer}>
            <TouchableOpacity onPress={() => router.push('/(main)')} style={{ marginLeft: width * 0.05, borderColor: "black", borderWidth: 1, borderRadius: 50, padding: 5 }}>
                <AntDesign name="left" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.greetingText}>Hello there,</Text>
                    {/* Replace the simple Text with this TextWithOutline component */}
                    <View style={styles.nameTextContainer}>
                        {/* Create the outline effect with multiple text shadows */}
                        <Text style={styles.nameTextOutline}>{(user != null ? user.username : "")}</Text>
                        {/* Main text on top */}
                        <Text style={styles.nameText}>{(user != null ? user.username : "")}</Text>
                    </View>
                </View>
                <Image
                    source={require("@/assets/images/home/home_avatar.png")}
                    style={styles.profileImage}
                />
            </View>
            <Image
                source={require("@/assets/images/home/home_bg.png")}
                style={styles.greetingImage}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    greetingImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        borderBottomLeftRadius: width * 0.08,
        borderBottomRightRadius: width * 0.08,
    },
    greetingContainer: {
        position: "relative",
        height: height * 0.16,
        overflow: "hidden",
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    greetingText: {
        fontFamily: "Quicksand-Semibold",
        fontSize: width * 0.035,
        color: "#000",
    },
    nameTextContainer: {
        position: 'relative',  // For proper stacking of texts
    },
    nameText: {
        fontFamily: "Quicksand-Bold",
        fontSize: width * 0.045,
        fontWeight: "600",
        color: "black",
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2, // Ensure it's on top
    },
    nameTextOutline: {
        fontFamily: "Quicksand-Bold",
        fontSize: width * 0.045,
        fontWeight: "600",
        color: "#222",
        textShadowColor: 'white',
        textShadowOffset: { width: -1, height: -1 },
        textShadowRadius: 3,
    },
    nameContainer: {
        flexDirection: "column",
        marginLeft: width * 0.025,
    },
    profileImage: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: width * 0.025,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.05,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
    },
    quoteContainer: {
        position: "absolute",
        bottom: height * 0.35 * 0.15,
        width: width * 0.9,
        alignSelf: "center",
        backgroundColor: "#fff",
        opacity: 0.97,
        padding: width * 0.04,
        borderRadius: width * 0.04,
        marginBottom: height * 0.02,
    },
    quoteText: {
        fontFamily: "Quicksand-Semibold",
        fontSize: width * 0.035,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },
});

export default Greeting;

