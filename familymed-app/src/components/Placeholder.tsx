import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, createStyles } from '../theme';

export default function Placeholder({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View style={s.box}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>Tela em construção</Text>
      {children}
    </View>
  );
}

const s = createStyles(() => ({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary },
  sub: { color: colors.muted },
}));
