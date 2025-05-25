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

export const MOODS = [
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

export const ACTIVITIES = [
  { id: 1, name: "Work", icon: "briefcase" },
  { id: 2, name: "Sport", icon: "running" },
  { id: 3, name: "Walking", icon: "walking" },
  { id: 4, name: "Exercise", icon: "bicycle" },
  { id: 5, name: "Music", icon: "headphones" },
  { id: 6, name: "Dishes", icon: "utensils" },
  { id: 7, name: "Reading", icon: "book-open" },
  { id: 8, name: "Study", icon: "book" },
  { id: 9, name: "Sleep", icon: "bed" },
  { id: 10, name: "Camping", icon: "campground" },
  { id: 11, name: "Shopping", icon: "shopping-cart" },
  { id: 12, name: "Travel", icon: "map-marker-alt" },
  { id: 13, name: "Chat", icon: "comments" },
  { id: 14, name: "Coffee", icon: "coffee" },
  { id: 15, name: "Swimming", icon: "swimmer" },
  { id: 16, name: "More", icon: "plus" },
];

export const moodAdviceMap: { [key: number]: string } = {
  1: "It's okay to feel sad sometimes. Take care of yourself and reach out if you need support.",
  2: "Try to manage your anger with deep breaths or a walk. Remember, it's healthy to express your feelings.",
  3: "Keep a balanced routine and enjoy the normal moments in your life.",
  4: "Let your joy inspire others! Spread your happiness and keep doing what makes you smile.",
  5: "Excellent mood! Use this energy to achieve your goals and help others.",
};
