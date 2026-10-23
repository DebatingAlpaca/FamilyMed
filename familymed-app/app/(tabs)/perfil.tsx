import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import Avatar from '../../src/components/Avatar';
import { useSession } from '../../src/session';
import { colors, radius } from '../../src/theme';

type Fam = {
  id: string; nome: string; idade: number; sexo: string; telefone: string | null;
  total: number; administradas: number; perdidas: number; estoqueBaixo: number;
};
type Prof = { id: string; nome: string; vinculo: string; telefone: string };

function Badge({ texto, bg, fg }: { texto: string; bg: string; fg: string }) {
  return <Text style={[s.badge, { backgroundColor: bg, color: fg }]}>{texto}</Text>;
}

export default function Familia() {
  const router = useRouter();
  const { session, signOut, patientId, setPatient, patientsVersion } = useSession();
  const [fam, setFam] = useState<Fam[] | null>(null);
  const [profs, setProfs] = useState<Prof[]>([]);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    api<Fam[]>('/family').then((d) => { setErro(''); setFam(d); }).catch((e) => setErro(e.message));
    api<{ profissionais: Prof[] }>('/network').then((d) => setProfs(d.profissionais)).catch(() => setProfs([]));
  }, [patientId, patientsVersion]);
  useFocusEffect(carregar);
  useEffect(() => { carregar(); }, [carregar]);

  const atual = fam?.find((f) => f.id === patientId);

  const abrir = async (f: Fam) => {
    await setPatient(f.id);
    router.navigate('/dashboard');
  };

  const removerProf = (p: Prof) =>
    Alert.alert('Remover profissional', `Remover ${p.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          try { await api('/network/remove', { body: { id: p.id } }); carregar(); }
          catch (e: any) { Alert.alert('Erro', e.message); }
        },
      },
    ]);

  const sair = () =>
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.conta}>
        <Ionicons name="person-circle" size={44} color={colors.primary} />
        <View>
          <Text style={s.nome}>{session?.nome}</Text>
          <Text style={s.sub}>Sua conta</Text>
        </View>
      </View>

      <View style={s.topo}>
        <Text style={s.titulo}>Minha família</Text>
        <Pressable style={s.addBtn} onPress={() => router.push('/novo-paciente')}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={s.addText}>Adicionar</Text>
        </Pressable>
      </View>

      {!fam ? (
        erro ? <Text style={{ color: colors.danger }}>{erro}</Text> : <ActivityIndicator color={colors.primary} />
      ) : fam.length === 0 ? (
        <Text style={s.vazio}>Nenhum familiar cadastrado. Toque em Adicionar.</Text>
      ) : (
        fam.map((f) => {
          const emDia = f.total > 0 && f.administradas === f.total && f.perdidas === 0;
          return (
            <Pressable key={f.id} style={[s.card, f.id === patientId && s.cardOn]} onPress={() => abrir(f)}>
              <View style={s.linha}>
                <Avatar sexo={f.sexo} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{f.nome}</Text>
                  <Text style={s.sub}>{f.idade} anos - {f.sexo}</Text>
                </View>
                {!!f.telefone && (
                  <Pressable style={s.icone} onPress={() => Linking.openURL(`tel:${f.telefone}`)}>
                    <Ionicons name="call" size={16} color={colors.primary} />
                  </Pressable>
                )}
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
              <View style={s.badges}>
                <Text style={s.hoje}>
                  {f.total === 0 ? 'Sem doses hoje' : `${f.administradas}/${f.total} doses hoje`}
                </Text>
                {emDia && <Badge texto="Em dia" bg="#E3F4E5" fg={colors.ok} />}
                {f.perdidas > 0 && <Badge texto={`${f.perdidas} perdida(s)`} bg="#FDE8E8" fg={colors.danger} />}
                {f.estoqueBaixo > 0 && <Badge texto="Estoque baixo" bg="#FFF3CD" fg="#8A6D00" />}
              </View>
            </Pressable>
          );
        })
      )}

      {!!atual && (
        <>
          <View style={s.topo}>
            <Text style={s.titulo}>Profissionais de {atual.nome.split(' ')[0]}</Text>
            <Pressable style={s.addBtn} onPress={() => router.push('/novo-membro')}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={s.addText}>Adicionar</Text>
            </Pressable>
          </View>
          {profs.length === 0 && <Text style={s.vazio}>Nenhum profissional cadastrado.</Text>}
          {profs.map((p) => (
            <View key={p.id} style={s.card}>
              <View style={s.linha}>
                <View style={s.avatar}><Ionicons name="medkit" size={18} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{p.nome}</Text>
                  <Text style={s.sub}>{p.vinculo}</Text>
                </View>
                <Pressable style={s.icone} onPress={() => Linking.openURL(`tel:${p.telefone}`)}>
                  <Ionicons name="call" size={16} color={colors.primary} />
                </Pressable>
                <Pressable style={s.icone} onPress={() => Linking.openURL(`sms:${p.telefone}`)}>
                  <Ionicons name="chatbubble" size={16} color={colors.primary} />
                </Pressable>
                <Pressable style={s.icone} onPress={() => removerProf(p)}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}

      <Pressable style={s.sair} onPress={sair}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={s.sairText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  conta: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius,
    padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  titulo: { fontSize: 17, fontWeight: '800', color: colors.text, flexShrink: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  addText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  vazio: { color: colors.muted, textAlign: 'center', marginVertical: 12 },
  card: {
    backgroundColor: colors.card, borderRadius: radius, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.border,
  },
  cardOn: { borderLeftColor: colors.primary, backgroundColor: '#F7FAFE' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  hoje: { fontSize: 12, fontWeight: '600', color: colors.text },
  badge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 14, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  icone: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2F6', alignItems: 'center', justifyContent: 'center' },
  sair: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 48, marginTop: 28,
    borderRadius: radius, borderWidth: 1, borderColor: colors.danger,
  },
  sairText: { color: colors.danger, fontWeight: '700' },
});
