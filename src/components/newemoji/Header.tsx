import React from "react";
import { Text, StyleSheet } from "react-native";
import { wp, hp } from "./utils";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: wp(7),
    fontWeight: "600",
    marginTop: hp(2),
    marginBottom: hp(3),
    color: "#333",
  },
});

export default Header;
