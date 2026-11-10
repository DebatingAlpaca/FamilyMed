import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BENEFITS, Feature, FEATURE_TEXT } from '../premium';
import { useTheme } from '../ThemeContext';

const GOLD = '#F5B301';

export default function PremiumModal({ feature, onClose }: { feature: Feature | null; onClose: () => void }) {
  const { mode } = useTheme();
  const dark = mode === 'dark';
  const s = useMemo(
    () =>
      StyleSheet.create({
        bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
        card: {
          backgroundColor: dark ? '#2B2410' : '#FFF8E1', borderRadius: 24, borderWidth: 2, borderColor: GOLD,
          maxHeight: '90%', overflow: 'hidden',
        },
        topo: { backgroundColor: GOLD, alignItems: 'center', paddingVertical: 20 },
        coroa: {
          width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center',
        },
        marca: { fontSize: 13, fontWeight: '800', color: '#3B2F0B', letterSpacing: 1.5, marginTop: 10 },
        corpo: { padding: 20 },
        titulo: { fontSize: 22, fontWeight: '800', color: dark ? '#FFD54F' : '#7A5600', textAlign: 'center' },
        sub: { fontSize: 14, color: dark ? '#E8DDB5' : '#5C4A12', textAlign: 'center', marginTop: 6, marginBottom: 16 },
        item: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
        itemText: { flex: 1, fontSize: 14, color: dark ? '#F3E9C6' : '#3B2F0B' },
        preco: { alignItems: 'center', marginTop: 10, marginBottom: 16 },
        valor: { fontSize: 26, fontWeight: '800', color: dark ? '#FFD54F' : '#7A5600' },
        trial: { fontSize: 12, color: dark ? '#E8DDB5' : '#5C4A12', marginTop: 2 },
        cta: {
          flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 52,
          borderRadius: 14, backgroundColor: GOLD,
        },
        ctaText: { fontSize: 16, fontWeight: '800', color: '#3B2F0B' },
        later: { textAlign: 'center', paddingVertical: 14, color: dark ? '#E8DDB5' : '#7A5600', fontWeight: '600' },
        foot: { textAlign: 'center', fontSize: 11, color: dark ? '#B8AC80' : '#8A7A45' },
      }),
    [dark]
  );

  const txt = FEATURE_TEXT[feature ?? 'welcome'];

  const assinar = () => {
    onClose();
    Alert.alert('Em breve', 'Este é um protótipo: nenhum pagamento é processado.');
  };

  return (
    <Modal visible={!!feature} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.bg}>
        <View style={s.card}>
          <View style={s.topo}>
            <View style={s.coroa}>
              <MaterialCommunityIcons name="crown" size={36} color={GOLD} />
            </View>
            <Text style={s.marca}>FAMILYMED PREMIUM</Text>
          </View>
          <ScrollView contentContainerStyle={s.corpo}>
            <Text style={s.titulo}>{txt.titulo}</Text>
            <Text style={s.sub}>{txt.sub}</Text>

            {BENEFITS.map((b) => (
              <View key={b} style={s.item}>
                <MaterialCommunityIcons name="check-circle" size={20} color={GOLD} />
                <Text style={s.itemText}>{b}</Text>
              </View>
            ))}

            <View style={s.preco}>
              <Text style={s.valor}>R$ 19,90<Text style={{ fontSize: 14 }}>/mês</Text></Text>
              <Text style={s.trial}>7 dias grátis para testar. Cancele quando quiser.</Text>
            </View>

            <Pressable style={s.cta} onPress={assinar}>
              <MaterialCommunityIcons name="crown" size={20} color="#3B2F0B" />
              <Text style={s.ctaText}>Assinar Premium</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Text style={s.later}>Agora não</Text>
            </Pressable>
            <Text style={s.foot}>Protótipo acadêmico: nenhuma cobrança é realizada.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
