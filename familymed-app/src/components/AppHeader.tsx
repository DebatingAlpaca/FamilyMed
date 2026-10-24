import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import type { Colors } from '../theme';
import { useColors, useStyles } from '../ThemeContext';
import PatientSwitcher from './PatientSwitcher';

export default function AppHeader() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode, toggle } = useTheme();
  return (
    <View style={[s.wrap, { paddingTop: insets.top }]}>
      <View style={s.row}>
        <Pressable style={s.side} onPress={toggle} hitSlop={10}>
          <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.primary} />
        </Pressable>
        <Text style={s.logo}>FamilyMed</Text>
        <Pressable style={[s.side, { alignItems: 'flex-end' }]} onPress={() => router.push('/alertas')} hitSlop={10}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <View style={s.sub}>
        <PatientSwitcher />
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 16 },
  side: { width: 44 },
  logo: { flex: 1, textAlign: 'center', fontSize: 23, fontWeight: '800', color: colors.primary, letterSpacing: 0.3 },
  sub: { alignItems: 'center', paddingBottom: 10 },
});
