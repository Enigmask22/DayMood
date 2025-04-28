import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { moodIdAsyncStorageKey } from "@/utils/constant";
import { moods } from "@/utils/constant";
import type { mood } from "@/types/mood";
import { router } from "expo-router";
import { Image } from "expo-image";
import { activities } from "@/utils/constant";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function NewActivity() {
    const [mood, setMood] = useState<mood>();
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Format date for display
    const formatDate = (date: Date) => {
        const days = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const day = date.getDate();
        const month = months[date.getMonth()];

        let daySuffix = "th";
        if (day === 1 || day === 21 || day === 31) daySuffix = "st";
        else if (day === 2 || day === 22) daySuffix = "nd";
        else if (day === 3 || day === 23) daySuffix = "rd";

        return `Today, ${day}${daySuffix} ${month}`;
    };

    // Format time for display
    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const selectedDate = formatDate(date);
    const selectedTime = formatTime(date);

    useEffect(() => {
        const fetchMood = async () => {
            try {
                const moodIdString = await AsyncStorage.getItem(moodIdAsyncStorageKey);
                if (moodIdString) {
                    const moodId = Number(moodIdString);
                    const foundMood = moods.find(m => m.id === moodId);
                    setMood(foundMood);
                }
            } catch (error) {
                console.error("Failed to fetch mood:", error);
            }
        };

        fetchMood();
    }, []);

    const toggleActivity = (activityId: number) => {
        if (selectedActivities.includes(activityId)) {
            setSelectedActivities(selectedActivities.filter(id => id !== activityId));
        } else {
            setSelectedActivities([...selectedActivities, activityId]);
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(prev => !prev);
        if (selectedDate) {
            // Create a new date that merges the selected date with the current time
            const newDate = new Date(date);
            newDate.setFullYear(currentDate.getFullYear());
            newDate.setMonth(currentDate.getMonth());
            newDate.setDate(currentDate.getDate());
            setDate(newDate);
        }
    };

    const onChangeTime = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowTimePicker(prev => !prev);
        if (selectedDate) {
            // Create a new date that merges the current date with the selected time
            const newDate = new Date(date);
            newDate.setHours(currentDate.getHours());
            newDate.setMinutes(currentDate.getMinutes());
            setDate(newDate);
        }
    };

    const handleSave = () => {
        // Implementation for saving the activity
        console.log("Saving activity...", {
            selectedActivities,
            note,
            date: date.toISOString(),
            formattedDate: selectedDate,
            formattedTime: selectedTime
        });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Back button and Mood icon */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                {mood && (
                    <View style={styles.moodIcon}>
                        <Image
                            source={mood.emoji}
                            style={styles.moodEmojiImage}
                            contentFit="contain"
                        />
                    </View>
                )}
            </View>

            {/* What did you do? */}
            <Text style={styles.title}>What did you do?</Text>

            {/* Date and Time selectors */}
            <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Ionicons name="calendar-outline" size={20} color="#000" style={styles.inputIcon} />
                    <Text style={styles.dateTimeText}>{selectedDate}</Text>
                    <Ionicons name="chevron-down" size={16} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.timeSelector}
                    onPress={() => setShowTimePicker(true)}
                >
                    <Ionicons name="time-outline" size={20} color="#000" style={styles.inputIcon} />
                    <Text style={styles.dateTimeText}>{selectedTime}</Text>
                    <Ionicons name="chevron-down" size={16} color="#000" />
                </TouchableOpacity>
            </View>

            {/* DateTimePicker for Date */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeDate}
                />
            )}

            {/* DateTimePicker for Time */}
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeTime}
                    minuteInterval={1}
                />
            )}

            {/* Activities Section */}
            <Text style={styles.sectionTitle}>ACTIVITIES</Text>
            <View style={styles.activitiesContainer}>
                <View style={styles.activitiesGrid}>
                    {activities.map((activity) => {
                        const isSelected = selectedActivities.includes(activity.id);
                        return (
                            <TouchableOpacity
                                key={activity.id}
                                style={[
                                    styles.activityButton,
                                    isSelected && styles.selectedActivityButton
                                ]}
                                onPress={() => toggleActivity(activity.id)}
                            >
                                <Image
                                    source={isSelected ? activity.selectedIcon : activity.icon}
                                    style={styles.activityIcon}
                                    contentFit="contain"
                                />
                                <Text style={[
                                    styles.activityName,
                                    isSelected && styles.selectedActivityName
                                ]}>
                                    {activity.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <Text style={styles.selectText}>Select your activities...</Text>

            {/* Note input */}
            <View style={styles.noteContainer}>
                <View style={styles.noteHeader}>
                    <Ionicons name="pencil" size={20} color="#000" />
                    <Text style={styles.noteTitle}>Your note</Text>
                    <TouchableOpacity style={styles.fullNoteButton}>
                        <Text style={styles.fullNoteText}>Open full note</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Write something..."
                    placeholderTextColor="#aaa"
                    multiline={true}
                    value={note}
                    onChangeText={setNote}
                />
            </View>

            {/* Media options */}
            <View style={styles.mediaContainer}>
                <TouchableOpacity style={styles.mediaOption}>
                    <Text style={styles.mediaLabel}>Image</Text>
                    <View style={styles.mediaButtons}>
                        <TouchableOpacity style={styles.mediaButton}>
                            <Ionicons name="camera-outline" size={20} color="#000" />
                            <Text style={styles.mediaButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mediaButton}>
                            <Ionicons name="images-outline" size={20} color="#000" />
                            <Text style={styles.mediaButtonText}>From Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaOption}>
                    <Text style={styles.mediaLabel}>Audio</Text>
                    <View style={styles.mediaButtons}>
                        <TouchableOpacity style={styles.mediaButton}>
                            <Ionicons name="mic-outline" size={20} color="#000" />
                            <Text style={styles.mediaButtonText}>Tap to record</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mediaButton}>
                            <Ionicons name="musical-notes-outline" size={20} color="#000" />
                            <Text style={styles.mediaButtonText}>Add music here</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Save button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8FA',
        paddingRight: 16,
        paddingLeft: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 15,
    },
    backButton: {
        padding: 5,
    },
    moodIcon: {
        marginLeft: 10,
    },
    moodEmojiImage: {
        width: 30,
        height: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        marginBottom: 20,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25,
    },
    dateSelector: {
        flex: 1.3,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    timeSelector: {
        flex: 0.7,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    dateTimeText: {
        flex: 1,
        color: '#000',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 15,
    },
    activitiesContainer: {
        backgroundColor: '#4CAF50', // Green background for the entire grid
        borderRadius: 12,
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 15,
    },
    activitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    activityButton: {
        width: '22%', // Narrower to fit 4 icons per row like in the image
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)', // Semi-transparent white
        borderRadius: 20, // Fully rounded
        padding: 5,
        // marginBottom: 10,
    },
    selectedActivityButton: {
        backgroundColor: 'rgba(255,255,255,0.5)', // More opaque white for selected items
    },
    activityIcon: {
        width: '60%',
        height: '60%',
    },
    activityName: {
        fontSize: 9,
        marginTop: 2,
        color: '#fff', // White text since background is green
        textAlign: 'center',
    },
    selectedActivityName: {
        color: '#fff', // Keep white text for selected items
        fontWeight: '500',
    },
    selectText: {
        color: '#666',
        marginVertical: 10,
    },
    noteContainer: {
        backgroundColor: '#E8F3E8',
        borderRadius: 12,
        padding: 12,
        marginVertical: 15,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteTitle: {
        flex: 1,
        marginLeft: 8,
        color: '#000',
        fontWeight: '500',
    },
    fullNoteButton: {
        padding: 5,
    },
    fullNoteText: {
        color: '#4CAF50',
        fontSize: 12,
    },
    noteInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        minHeight: 40,
        color: '#000',
    },
    mediaContainer: {
        gap: 15,
    },
    mediaOption: {
        gap: 8,
    },
    mediaLabel: {
        fontSize: 14,
        color: '#666',
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    mediaButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    mediaButtonText: {
        color: '#000',
        fontSize: 14,
    },
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        padding: 15,
        marginVertical: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 5,
    },
});