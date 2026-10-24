import { useTheme } from '../src/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/api';
import { Field, PrimaryButton } from '../src/components/ui';
import { useSession } from '../src/session';
import { radius } from '../src/theme';
import type { Colors } from '../src/theme';
import { useColors, useStyles } from '../src/ThemeContext';
import { useApiData } from '../src/useApiData';

type Alerta = { tipo: 'atraso' | 'estoque' | 'validade'; titulo: string; mensagem: string; medId?: string; doseId?: string };
type Fam = { id: string; telefone: string | null };

const TIPO = (colors: Colors) => ({
  atraso: { icon: 'alert-circle', cor: colors.danger },
  estoque: { icon: 'cube', cor: colors.warn },
  validade: { icon: 'calendar', cor: '#EF6C00' },
}) as const;

const chave = (a: Alerta) => `${a.tipo}-${a.medId ?? a.doseId}`;

export default function Alertas() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const { patientId } = useSession();
  const { data: alertas, erro, reload: carregar } = useApiData<Alerta[]>('/alerts');
  const [ignorados, setIgnorados] = useState<string[]>([]);
  const [fone, setFone] = useState('');
  const [rep, setRep] = useState<Alerta | null>(null);
  const [qtd, setQtd] = useState('');
  const [erroRep, setErroRep] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Fam[]>('/family').then((fs) => {
      const p = fs.find((f) => f.id !== patientId && f.telefone);
      setFone(p?.telefone ?? '');
    }).catch(() => {});
  }, [patientId]);

  const reestocar = async () => {
    if (!rep?.medId) return;
    setSaving(true); setErroRep('');
    try {
      await api(`/medications/${rep.medId}/restock`, { body: { quantidade: Number(qtd) } });
      setRep(null); setQtd('');
      carregar();
    } catch (e: any) {
      setErroRep(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!alertas) {
    return (
      <View style={s.center}>
        {erro ? <Text style={{ color: colors.danger }}>{erro}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  const lista = alertas.filter((a) => !ignorados.includes(chave(a)));

  return (
    <View style={s.screen}>
      <FlatList
        data={lista}
        keyExtractor={chave}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={s.titulo}>Alertas e Notificações</Text>
            <Text style={s.sub}>Fique atento aos avisos importantes sobre o cuidado familiar.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={s.vazio}>Você não tem notificações.</Text>}
        renderItem={({ item: a }) => {
          const t = TIPO(colors)[a.tipo];
          return (
            <View style={[s.card, { borderLeftColor: t.cor }]}>
              <View style={s.head}>
                <Ionicons name={t.icon} size={22} color={t.cor} />
                <Text style={[s.cardTitulo, { color: t.cor }]}>{a.titulo}</Text>
              </View>
              <Text style={s.msg}>{a.mensagem}</Text>
              <View style={s.acoes}>
                <Pressable style={s.btnCinza} onPress={() => setIgnorados([...ignorados, chave(a)])}>
                  <Text style={s.btnCinzaText}>IGNORAR</Text>
                </Pressable>
                {a.tipo === 'estoque' && (
                  <Pressable style={s.btnAzul} onPress={() => { setRep(a); setQtd(''); setErroRep(''); }}>
                    <Text style={s.btnAzulText}>PEDIR REESTOQUE</Text>
                  </Pressable>
                )}
                {a.tipo === 'atraso' && !!fone && (
                  <Pressable style={[s.btnAzul, { backgroundColor: colors.danger }]} onPress={() => Linking.openURL(`tel:${fone}`)}>
                    <Text style={s.btnAzulText}>LIGAR PARA UM FAMILIAR</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />

      <Modal visible={!!rep} transparent animationType="slide" onRequestClose={() => setRep(null)}>
        <View style={s.modalBg}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Registrar reposição</Text>
            <Text style={s.sub}>{rep?.mensagem}</Text>
            <Field label="Quantidade reposta" icon="cube-outline" value={qtd} onChangeText={setQtd} placeholder="Ex.: 30" keyboardType="numeric" />
            {!!erroRep && <Text style={{ color: colors.danger, fontSize: 13 }}>{erroRep}</Text>}
            <PrimaryButton title="Confirmar reposição" onPress={reestocar} loading={saving} />
            <Pressable onPress={() => setRep(null)} style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: colors.muted }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  vazio: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.card, borderRadius: radius, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitulo: { fontSize: 14, fontWeight: '800' },
  msg: { fontSize: 13, color: colors.text, marginTop: 8 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  btnCinza: { backgroundColor: colors.chip, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnCinzaText: { fontSize: 11, fontWeight: '700', color: colors.muted },
  btnAzul: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAzulText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
});
