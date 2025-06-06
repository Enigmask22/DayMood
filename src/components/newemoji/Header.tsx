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
    fontFamily: "Quicksand-Bold",
    marginTop: hp(1),
    marginBottom: hp(2),
    color: "#333",
    textAlign: "center",
    width: "100%",
  },
});

export default Header;
