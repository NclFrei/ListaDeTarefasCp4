// src/app/CadastrarScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
import ThemeToggleButton from '../src/components/ThemeToggleButton';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';

export default function CadastrarScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  const mudarIdioma = (lang: string) => i18n.changeLanguage(lang);

  const handleCadastrar = () => {
    if (!email || !senha || !confirmSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    if (senha !== confirmSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem!');
      return;
    }

    createUserWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await AsyncStorage.setItem('@user', JSON.stringify(user));
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        router.push('/');
      })
      .catch((error) => {
        console.log("Error:", error.message);
        Alert.alert('Erro', 'Não foi possível criar a conta.');
      });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={[styles.titulo, { color: colors.text }]}>{t("register")}</Text>

        <TextInput
          style={[styles.input, { borderColor: colors.border || '#ccc', color: colors.text }]}
          placeholder="E-mail"
          placeholderTextColor={colors.placeholder || '#999'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.border || '#ccc', color: colors.text }]}
          placeholder={t("password")}
          placeholderTextColor={colors.placeholder || '#999'}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.border || '#ccc', color: colors.text }]}
          placeholder={t("confirmPassword")}
          placeholderTextColor={colors.placeholder || '#999'}
          secureTextEntry
          value={confirmSenha}
          onChangeText={setConfirmSenha}
        />

        <TouchableOpacity style={[styles.botao, { backgroundColor: '#6200ee' }]} onPress={handleCadastrar}>
          <Text style={styles.textoBotao}>{t("register")}</Text>
        </TouchableOpacity>

        {/* Botão para alternar tema */}
        <ThemeToggleButton />

        {/* Seleção de idioma */}
        <View style={styles.langContainer}>
          <TouchableOpacity onPress={() => mudarIdioma("pt")} style={styles.langButton}><Text style={styles.langText}>PT</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => mudarIdioma("en")} style={styles.langButton}><Text style={styles.langText}>EN</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => mudarIdioma("es")} style={styles.langButton}><Text style={styles.langText}>ES</Text></TouchableOpacity>
        </View>

        {/* Link para login */}
        <Link href="/" style={[styles.link, { color: colors.primary || '#6200ee' }]}>{t("login")}</Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 16,
    backgroundColor: '#f2f2f2',
  },
  botao: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  langContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginVertical: 10,
  },
  langButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  langText: {
    fontWeight: 'bold',
    color: '#333',
  },
  link: {
    marginTop: 15,
    fontWeight: 'bold',
  },
});
