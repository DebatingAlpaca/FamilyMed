import { useTheme } from '../../src/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { api } from '../../src/api';
import { Field, PrimaryButton } from '../../src/components/ui';
import { radius } from '../../src/theme';
import type { Colors } from '../../src/theme';
import { useColors, useStyles } from '../../src/ThemeContext';

export default function Cadastro() {
  const colors = useColors();
  const s = useStyles(makeStyles);
  useTheme();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [termos, setTermos] = useState(false);

  const cadastrar = async () => {
    setErro('');
    if (!nome.trim() || !email.trim() || !senha || !confirmar) return setErro('Preencha todos os campos.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro('E-mail inválido.');
    if (senha.length < 8) return setErro('A senha deve ter no mínimo 8 caracteres.');
    if (senha !== confirmar) return setErro('A confirmação não confere com a senha.');
    if (!aceite) return setErro('É obrigatório aceitar os Termos de Uso e a Política de Privacidade.');

    setLoading(true);
    try {
      await api('/register', { body: { nome: nome.trim(), email: email.trim(), senha, confirmar, aceite } });
      Alert.alert('Conta criada', 'Agora faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>FamilyMed</Text>
        <Text style={s.sub}>Crie sua conta para começar a cuidar da sua família.</Text>

        <View style={s.card}>
          <Field label="Nome Completo" icon="person-outline" value={nome} onChangeText={setNome} placeholder="Digite seu nome" />
          <Field label="E-mail" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="exemplo@email.com" keyboardType="email-address" />
          <Field label="Senha" icon="lock-closed-outline" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secure />
          <Field label="Confirmar Senha" icon="refresh-outline" value={confirmar} onChangeText={setConfirmar} placeholder="Repita a senha" secure />

          <Pressable style={s.check} onPress={() => setAceite(!aceite)}>
            <Ionicons name={aceite ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
            <Text style={s.checkText}>
              Li e concordo com os{' '}
              <Text style={s.link} onPress={() => setTermos(true)}>Termos de Uso</Text> e a{' '}
              <Text style={s.link} onPress={() => setTermos(true)}>Política de Privacidade</Text>.
            </Text>
          </Pressable>

          {!!erro && <Text style={s.erro}>{erro}</Text>}
          <PrimaryButton title="Cadastrar" onPress={cadastrar} loading={loading} />

          <Text style={s.footer}>
            Já tem uma conta?{' '}
            <Text style={s.link} onPress={() => router.replace('/login')}>Faça Login</Text>
          </Text>
        </View>
      </ScrollView>

      <Modal visible={termos} animationType="slide" transparent onRequestClose={() => setTermos(false)}>
        <View style={s.modalBg}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Termos de Uso e Política de Privacidade</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              <Text style={s.modalText}>
                Este é um protótipo acadêmico do FamilyMed. Os dados informados são usados apenas para
                demonstrar o funcionamento do sistema de gerenciamento de medicamentos.{'\n\n'}
                Em conformidade com a LGPD, dados de saúde são sensíveis e só devem ser tratados com
                consentimento explícito do titular. Na versão final, o consentimento será registrado e os
                dados protegidos com criptografia.
              </Text>
            </ScrollView>
            <PrimaryButton title="Fechar" onPress={() => setTermos(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 70, paddingBottom: 40 },
  brand: { fontSize: 30, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  sub: { textAlign: 'center', color: colors.muted, marginTop: 6, marginBottom: 22, fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  checkText: { flex: 1, fontSize: 12, color: colors.text },
  link: { color: colors.primary, fontWeight: '700' },
  erro: { color: colors.danger, fontSize: 13, marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 13, color: colors.muted },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.card, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 12 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.primary },
  modalText: { fontSize: 14, color: colors.text, lineHeight: 21 },
});
