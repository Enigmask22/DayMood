import { mood } from "@/types/mood";
export const APP_COLOR = {
  ORANGE: "#f4511e",
  GREEN: "#4CAF50",
  BLUE: "#2196F3",
  RED: "#F44336",
  ONBOARDING: "#007AFF",
  ONBOARDINGTEXT1: "black",
  ONBOARDINGTEXT2: "white",
  ONBOARDINGTEXT3: "#79BF5D",
};
export const HOME_COLOR = {
  HOMEBACKGROUND: "#E0F1E6",
  HOMEBUTTON: "#2CA148",
  HOMESTATUS1: "#86EFAC",
  HOMESTATUS2: "#14532D",
  HOMEPLUS: "#16A34A",
  HOMETABBAR: "#22C55E",
  HOMETEXT: "#7E7E7E",
};
export const EMOJI_COLOR = {
  SAD: "#7E7E7E",
  EXCELLENT: "#22C55E",
  JOYFUL: "#FCA10C",
  NORMAL: "#540BFF",
  ANGRY: "#EF0808",
};

export const moods: mood[] = [
  {
    id: 1,
    name: "Sad",
    emoji: require("@/assets/emoji/sad.gif"),
    color: "#7E7E7E",
  },
  {
    id: 2,
    name: "Angry",
    emoji: require("@/assets/emoji/angry.gif"),
    color: "#EF0808",
  },
  {
    id: 3,
    name: "Normal",
    emoji: require("@/assets/emoji/normal.gif"),
    color: "#540BFF",
  },
  {
    id: 4,
    name: "Joyful",
    emoji: require("@/assets/emoji/joyful.gif"),
    color: "#FCA10C",
  },
  {
    id: 5,
    name: "Excellent",
    emoji: require("@/assets/emoji/excellent.gif"),
    color: "#22C55E",
  },
];

export const moodIdAsyncStorageKey = "moodId";


export const activities = [
  { id: 1, name: 'Work', icon: require('@/assets/activity/work.png'), selectedIcon: require('@/assets/activity/work_selected.png') },
  { id: 2, name: 'Walking', icon: require('@/assets/activity/walking.png'), selectedIcon: require('@/assets/activity/walking_selected.png') },
  { id: 3, name: 'Study', icon: require('@/assets/activity/study.png'), selectedIcon: require('@/assets/activity/study_selected.png') },
  { id: 4, name: 'Sport', icon: require('@/assets/activity/sport.png'), selectedIcon: require('@/assets/activity/sport_selected.png') },
  { id: 5, name: 'Shopping', icon: require('@/assets/activity/shopping.png'), selectedIcon: require('@/assets/activity/shopping_selected.png') },
  { id: 6, name: 'Sleep', icon: require('@/assets/activity/sleep.png'), selectedIcon: require('@/assets/activity/sleep_selected.png') },
  { id: 7, name: 'Reading', icon: require('@/assets/activity/reading.png'), selectedIcon: require('@/assets/activity/reading_selected.png') },
  { id: 8, name: 'Music', icon: require('@/assets/activity/music.png'), selectedIcon: require('@/assets/activity/music_selected.png') },
  { id: 9, name: 'Exercise', icon: require('@/assets/activity/excercise.png'), selectedIcon: require('@/assets/activity/excercise_selected.png') },
  { id: 10, name: 'Dishes', icon: require('@/assets/activity/dishes.png'), selectedIcon: require('@/assets/activity/dishes_selected.png') },
  { id: 11, name: 'Chat', icon: require('@/assets/activity/chat.png'), selectedIcon: require('@/assets/activity/chat_selected.png') },
  { id: 12, name: 'Camping', icon: require('@/assets/activity/camping.png'), selectedIcon: require('@/assets/activity/camping_selected.png') },
  { id: 13, name: 'Travel', icon: require('@/assets/activity/travel.png'), selectedIcon: require('@/assets/activity/travel_selected.png') },
];
