import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import { Field, PrimaryButton } from '../../src/components/ui';
import { useSession } from '../../src/session';
import { colors, radius } from '../../src/theme';

export default function Login() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const entrar = async () => {
    setErro('');
    if (!email.trim() || !senha) return setErro('Informe e-mail e senha.');
    setLoading(true);
    try {
      const r = await api<{ userId: string; nome: string }>('/login', {
        body: { email: email.trim(), senha },
      });
      await signIn(r); // o Gate redireciona para o dashboard
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>FAMILY MED</Text>
        <Text style={s.sub}>Gestão de saúde familiar simplificada</Text>

        <View style={s.card}>
          <Field label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
          <Field label="Senha" icon="lock-closed-outline" value={senha} onChangeText={setSenha} placeholder="••••••••" secure />

          {!!erro && <Text style={s.erro}>{erro}</Text>}
          <PrimaryButton title="ENTRAR" onPress={entrar} loading={loading} />

          <View style={s.divider}>
            <View style={s.line} />
            <Text style={s.ou}>ou</Text>
            <View style={s.line} />
          </View>

          <Pressable style={s.outline} onPress={() => router.push('/cadastro')}>
            <Text style={s.outlineText}>CRIAR CONTA</Text>
          </Pressable>

          <Text
            style={s.forgot}
            onPress={() => Alert.alert('Em breve', 'A recuperação de senha ficará para a versão final.')}
          >
            Esqueceu sua senha?
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 100, paddingBottom: 40 },
  brand: { fontSize: 30, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  sub: { textAlign: 'center', color: colors.muted, marginTop: 6, marginBottom: 26, fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ou: { color: colors.muted, fontSize: 12 },
  outline: {
    height: 50, borderRadius: radius, borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  forgot: { textAlign: 'center', color: colors.primary, marginTop: 18, fontSize: 13 },
});
