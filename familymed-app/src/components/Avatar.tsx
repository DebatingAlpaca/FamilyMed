import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { colors } from "../theme";

export default function Avatar({
  sexo,
  size = 40,
}: {
  sexo?: string;
  size?: number;
}) {
  const fem = sexo === "Fem";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: fem ? "#FCE4EC" : "#E3F2FD",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name={fem ? "woman" : "man"}
        size={size * 0.62}
        color={fem ? "#C2185B" : colors.primary}
      />
    </View>
  );
}
