import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Chips({
  options, value, onChange,
}: { options: string[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <View style={s.row}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} style={[s.chip, on && s.chipOn]} onPress={() => onChange(o)}>
            <Text style={[s.text, on && s.textOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, color: colors.text, fontWeight: '600' },
  textOn: { color: '#fff' },
});
