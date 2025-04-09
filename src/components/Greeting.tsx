import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Greeting = () => {
    return (
        <View style={styles.greetingContainer}>
            <View style={styles.infoContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.greetingText}>Hello there,</Text>
                    <Text style={styles.nameText}>Hung Jonathan</Text>
                </View>
                <Image
                    source={require('@/assets/images/home/home_avatar.svg')} // Replace with actual profile image URL'
                    style={styles.profileImage}
                />
            </View>
            <Image
                source={require('@/assets/images/home/home_header.svg')} // Replace with actual profile image URL'
                style={styles.greetingImage}
            />
            {/* Quote Section */}
            <View style={styles.quoteContainer}>
                <Text style={styles.quoteText}>
                    “You can’t be that kid standing at the top of the waterslide, overthinking it.”
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F0FA', // Light blue background
        paddingHorizontal: 20,
    },
    greetingImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        borderBottomEndRadius: 20
    },
    time: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    statusIcons: {
        flexDirection: 'row',
    },
    icon: {
        fontSize: 16,
        marginLeft: 5,
    },
    greetingContainer: {
        position: 'relative',
        aspectRatio: 1.2,
        overflow: 'hidden',
    },
    greetingText: {
        fontSize: 14,
        color: '#000',
    },
    nameText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    nameContainer: {
        flexDirection: 'column',
        marginLeft: 10,
    },
    profileImage: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5%',
        paddingHorizontal: '5%',
        marginTop: '5%',
    },
    quoteContainer: {
        position: 'absolute',
        bottom: '15%',
        marginHorizontal: '5%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    quoteText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default Greeting;