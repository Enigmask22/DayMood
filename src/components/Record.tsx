import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { HOME_COLOR } from '@/utils/constant';

export interface FeelingRecordProps {
    date: string;
    emoji: string;
    feeling: string;
}

// Mapping of emoji names to their image paths
const emojiMap: { [key: string]: any } = {
    'sad': require('@/assets/emoji/sad.svg'),
    'excellent': require('@/assets/emoji/excellent.svg'),
    'joyful': require('@/assets/emoji/joyful.svg'),
    'normal': require('@/assets/emoji/normal.svg'),
    'angry': require('@/assets/emoji/angry.svg'),
    // Add more emojis as needed
};

const FeelingRecord = ({
    date = 'THURSDAY, MARCH 6 20:00',
    emoji = 'sad',
    feeling = "I'm feeling bad",
}: FeelingRecordProps) => {
    // Use the emojiMap to get the correct image source
    const emojiSource = emojiMap[emoji] || emojiMap['normal']; // Fallback to a default emoji if not found

    return (
        <View style={styles.container}>
            {/* Emoji Section */}
            <View style={styles.emojiContainer}>
                <Image source={emojiSource} resizeMode="contain" style={styles.imageContainer} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.dateText}>{date}</Text>
                {/* Button */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>{feeling}</Text>
                </TouchableOpacity>
            </View>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="black" style={styles.options} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 25,
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    dateText: {
        fontSize: 14,
        color: HOME_COLOR.HOMETEXT,
        fontWeight: '500',
    },
    emojiContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    textContainer: {
        flexDirection: 'column',
        gap: 10,
        paddingHorizontal: 10,
    },
    imageContainer: {
        width: 76,
        height: 80,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#2E7D32', // Dark green color
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    options: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default FeelingRecord;