import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={s.fab} onPress={onPress}>
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute', right: 18, bottom: 18, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5,
  },
});
