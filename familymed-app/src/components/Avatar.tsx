import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useColors } from '../ThemeContext';

export default function Avatar({ sexo, size = 40 }: { sexo?: string; size?: number }) {
  const colors = useColors();
  const fem = sexo === 'Fem';
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: fem ? colors.pinkBg : colors.tint, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Ionicons name={fem ? 'woman' : 'man'} size={size * 0.62} color={fem ? colors.pink : colors.primary} />
    </View>
  );
}
