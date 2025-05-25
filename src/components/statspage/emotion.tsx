import { View, FlatList, StyleSheet, Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { format, addMonths, subMonths } from "date-fns";

const { width, height } = Dimensions.get("window");

// Chart data
const chartData = {
    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    datasets: [
        {
            data: [25, 45, 28, 80, 99, 43, 50, 70, 95, 65],
            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
            strokeWidth: 2,
        },
        {
            data: [20, 30, 40, 50, 60, 40, 60, 50, 85, 55],
            color: (opacity = 1) => `rgba(155, 89, 182, ${opacity})`,
            strokeWidth: 2,
        },
    ],
    legend: ["Mood", "Activity"],
};

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
    },
    fillShadowGradient: "rgba(46, 204, 113, 1)",
    fillShadowGradientOpacity: 0.4,
};

// Data for the screens
const screens = [
    {
        title: "This week",
        content: "Your highest % mood is Funny (56%)",
        emoji: "🥰",
        indicator: [true, false, false]
    },
    {
        title: "This month",
        content: "Your highest % mood is Normal (60%)",
        emoji: "🥰",
        indicator: [false, true, false]
    },
    {
        title: "Advice for this month",
        content: "courage to change what needs to be changed, serenity to accept what cannot be changed, wisdom to realize",
        emoji: null,
        indicator: [false, false, true]
    }
];

// Function to render a single slide card
const renderSlideCard = ({ item, index }: {
    item: { title: string; content: string; emoji: string | null; indicator: boolean[] };
    index: number;
}) => {
    return (
        <View style={styles.slideCardContainer}>
            <View style={[styles.infoCard, { backgroundColor: "#059669" }]}>
                {item.emoji && (
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>{item.emoji}</Text>
                    </View>
                )}

                <View style={[
                    styles.infoContent,
                    index === 2 ? styles.adviceContainer : styles.statsContainer
                ]}>
                    <Text style={[
                        styles.infoTitle,
                        index === 2 ? styles.adviceTitle : styles.statsTitle
                    ]}>
                        {item.title}
                    </Text>

                    <Text style={[
                        styles.infoText,
                        index === 2 ? styles.adviceText : styles.statsText
                    ]}>
                        {item.content}
                    </Text>

                    {index === 2 && (
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Ionicons name="water-outline" size={24} color="#000" />
                            <View style={styles.divider} />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const EmotionPage = ({
    currentDate,
    setCurrentDate,
} : {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
}) => {
    const flatListRef = useRef<FlatList>(null);
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    // Handle slide change
    const handleSlideChange = (index: number) => {
        setCurrentScreenIndex(index);
    };
    // Render indicator bar based on the current slide
    const renderIndicator = () => {
        if (currentScreenIndex === 0) {
            return (
                <View style={styles.indicatorContainer}>
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={styles.indicator} />
                    <View style={styles.indicator} />
                </View>
            );
        } else if (currentScreenIndex === 1) {
            return (
                <View style={styles.indicatorContainer}>
                    <View style={styles.indicator} />
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={styles.indicator} />
                </View>
            );
        } else {
            return (
                <View style={styles.indicatorContainer}>
                    <View style={styles.indicator} />
                    <View style={styles.indicator} />
                    <View style={[styles.indicator, styles.indicatorActive]} />
                </View>
            );
        }
    };
    return (
        <View>
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Mood Chart</Text>
                <Text style={styles.chartSubtitle}>Your mood statistic in {format(currentDate, 'MMMM')}</Text>
                <View style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <LineChart
                        data={chartData}
                        width={width * 0.9}
                        height={180}
                        chartConfig={chartConfig}
                        bezier
                        withInnerLines={false}
                        withOuterLines={false}
                        withDots={false}
                    />
                </View>
            </View>
            <View style={styles.slideContainer}>
                <FlatList
                    ref={flatListRef}
                    data={screens}
                    renderItem={renderSlideCard}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                            event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
                        );
                        handleSlideChange(index);
                    }}
                    style={styles.slidesList}
                />
                {renderIndicator()}
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: "#e8f5e9",
    // },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.02,
        paddingBottom: height * 0.02,
    },
    monthText: {
        fontSize: width * 0.05,
        fontWeight: "700",
        color: "#000",
    },
    navButton: {
        padding: 10,
    },
    tabsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.02,
    },
    tabButton: {
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.04,
        marginHorizontal: width * 0.01,
        borderRadius: 20,
        backgroundColor: "#f1f1f1",
    },
    selectedTabButton: {
        backgroundColor: "#4CAF50",
    },
    tabText: {
        fontSize: width * 0.035,
        color: "#555",
    },
    selectedTabText: {
        color: "#fff",
        fontWeight: "500",
    },
    slideContainer: {
        flex: 1,
    },
    slidesList: {
        width: width,
    },
    slideCardContainer: {
        width: width,
        paddingHorizontal: width * 0.05,
    },
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: width * 0.05,
        padding: width * 0.05,
        marginBottom: height * 0.02,
        marginHorizontal: width * 0.05,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    chartTitle: {
        fontSize: width * 0.045,
        fontWeight: "bold",
        marginBottom: 5,
    },
    chartSubtitle: {
        fontSize: width * 0.035,
        color: "#777",
        marginBottom: 10,
    },
    infoCard: {
        backgroundColor: "#00A36C",
        borderRadius: 15,
        padding: 15,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: "center",
    },
    emojiContainer: {
        marginVertical: height * 0.01,
    },
    emoji: {
        fontSize: width * 0.12,
    },
    infoContent: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    statsContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        width: "100%",
    },
    adviceContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: "100%",
    },
    infoTitle: {
        fontSize: width * 0.045,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    statsTitle: {
        color: "#000",
    },
    adviceTitle: {
        color: "#000",
    },
    infoText: {
        textAlign: "center",
    },
    statsText: {
        fontSize: width * 0.04,
        color: "#333",
    },
    adviceText: {
        fontSize: width * 0.038,
        color: "#333",
        lineHeight: width * 0.055,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginTop: height * 0.02,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    indicatorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    indicator: {
        width: width * 0.02,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#ddd",
        marginHorizontal: width * 0.01,
    },
    indicatorActive: {
        width: width * 0.05,
        backgroundColor: "#4CAF50",
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    paginationDot: {
        height: 6,
        borderRadius: 3,
    },
    otherTabContent: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        height: height * 0.6,
    },
    comingSoonText: {
        fontSize: 18,
        color: "#555",
    },
});
export default EmotionPage