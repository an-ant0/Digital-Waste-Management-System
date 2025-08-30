import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserRole, RootStackParamList } from "../navigation/types"; // ✅ Import RootStackParamList too
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import i18n from "../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavProp = NativeStackNavigationProp<RootStackParamList, "LanguageSelection">;

const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const userName = await AsyncStorage.getItem("userName");
        const userRoleStr = await AsyncStorage.getItem("userRole");

        // Validate and cast userRole safely
        const validRoles: UserRole[] = ["user", "admin", "truckdriver"];
        const userRole = validRoles.includes(userRoleStr as UserRole)
          ? (userRoleStr as UserRole)
          : null;

        if (userId && userName && userRole) {
          navigation.replace("UserDashboard", {
            userId,
            userName,
            role: userRole,
          });
        }
      } catch (error) {
        console.error("Error checking login:", error);
      }
    };

    checkLogin();
  }, [navigation]);

  const changeLanguageAndNavigate = (lang: "en" | "ne") => {
    i18n.changeLanguage(lang);
    navigation.replace("UserLogin");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Language</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => changeLanguageAndNavigate("en")}
      >
        <Text style={styles.text}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => changeLanguageAndNavigate("ne")}
      >
        <Text style={styles.text}>नेपाली</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#cc2323ff",
  },
  text: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
