import { HOME_COLOR } from "@/utils/constant";
import { Dimensions, Image, ImageBackground, StyleSheet, Text, View } from "react-native";
const {width, height} = Dimensions.get('window');

const HeaderHomePage = () => {
  return (
    <ImageBackground 
            source={require("@/assets/images/home/home_bg.png")}
            style={styles.background}
          >
            <View style={{flexDirection: "column", width: "100%", height: "100%"}}>
              <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: height * 0.06}}>
                <View>
                  <Text style={styles.greeting}> Hello there</Text>
                  <Text style={styles.quote}> Hung Jonathan </Text>
                </View>
                <View>
                  <Image 
                    source={require("@/assets/images/home/home_avatar.png")}
                    resizeMode="contain"
                    style={styles.avatar}
                    />
                </View>
              </View>
              <View style={styles.box_container}>
                  <Text style={styles.text_header}>
                    “You can’t be that kid standing at the top of the waterslide, overthinking it.”
                  </Text>
              </View>
            </View>
          </ImageBackground>
  )
}



const styles = StyleSheet.create({
  background: {
    height: height * 0.4,
    width: width,
    padding: height * 0.05,
    marginBottom: height * 0.03,
  },
  greeting: {
    fontSize: 16,
    color: "#000",
  },
  quote: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#000',
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 18,
    borderColor: "#fff",
    borderWidth: 1,
  },
  box_container: {
    width: "100%", 
    height: height* 0.09, 
    alignSelf: "center", 
    marginTop: height * 0.06,
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#FDFEFA", 
    borderRadius: 20, 
    paddingHorizontal: width * 0.06
  },
  text_header: {
    textAlign:"center", 
    color: "#000"
  }
});

export default HeaderHomePage;
