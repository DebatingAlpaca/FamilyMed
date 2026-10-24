import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { radius } from '../theme';
import type { Colors } from '../theme';
import { useColors, useStyles } from '../ThemeContext';

type FieldProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
};

export function Field({ label, icon, value, onChangeText, placeholder, secure, keyboardType }: FieldProps) {
  const colors = useColors();
  const s = useStyles(makeStyles);
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputBox}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={secure || keyboardType === 'email-address' ? 'none' : 'words'}
          autoCorrect={false}
        />
        {secure && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function PrimaryButton({ title, onPress, loading }: { title: string; onPress: () => void; loading?: boolean }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable style={[s.btn, loading && { opacity: 0.7 }]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{title}</Text>}
    </Pressable>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius, paddingHorizontal: 12, height: 48,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  btn: {
    backgroundColor: colors.primary, height: 50, borderRadius: radius,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
