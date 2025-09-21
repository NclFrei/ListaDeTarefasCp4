
import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, db } from "../src/services/firebaseConfig";
import { deleteUser } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useTheme } from "../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useQuery } from "@tanstack/react-query";

interface Item {
  id: string;
  nomeTarefa: string;
  isChecked: boolean;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [nomeTarefa, setNomeTarefa] = useState("");
  const [listaItems, setListaItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const user = auth.currentUser;
  const userId = user?.uid;

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const scheduleNotification = async (tarefa: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Nova Tarefa!",
        body: tarefa,
      },
      trigger: { seconds: 1 },
    });
  };

  const buscarTarefas = () => {
    if (!userId) return;
    const q = query(collection(db, "items"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: Item[] = [];
        querySnapshot.forEach((doc) =>
          items.push({ id: doc.id, ...doc.data() } as Item)
        );
        setListaItems(items);
        setLoading(false);
      },
      (error) => {
        console.log("Erro ao buscar tarefas:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = buscarTarefas();
    return () => unsubscribe && unsubscribe();
  }, [userId]);

  const salvarTarefa = async () => {
    if (!nomeTarefa.trim()) return;
    if (!userId) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    try {
      if (editingId) {

        await updateDoc(doc(db, "items", editingId), { nomeTarefa });
        setEditingId(null);
      } else {

        await addDoc(collection(db, "items"), {
          nomeTarefa,
          isChecked: false,
          userId,
        });
        await scheduleNotification(nomeTarefa);
      }
      setNomeTarefa("");
    } catch (e) {
      console.log("Erro ao salvar tarefa:", e);
    }
  };


  const excluirTarefa = async (id: string) => {
    Alert.alert(
      "Excluir Tarefa",
      "Deseja realmente excluir esta tarefa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "items", id));
            } catch (error) {
              console.log("Erro ao excluir tarefa:", error);
            }
          },
        },
      ]
    );
  };


  const editarTarefa = (item: Item) => {
    setNomeTarefa(item.nomeTarefa);
    setEditingId(item.id);
  };

  // Excluir conta
  const excluirConta = () => {
    Alert.alert(
      "CONFIRMAR EXCLUSÃO",
      "Tem certeza que deseja excluir a conta? Esta ação não poderá ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                await deleteUser(user);
                await AsyncStorage.removeItem("@user");
                Alert.alert("Conta Excluída", "Conta excluída com sucesso.");
                router.push("/");
              } else {
                Alert.alert("Erro", "Nenhum usuário logado");
              }
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a conta.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  const realizarLogoff = async () => {
    await AsyncStorage.removeItem("@user");
    router.replace("/");
  };


  const fetchMotivationalQuote = async () => {
    try {
      const response = await fetch(
        "https://phrase-api.vercel.app/api/list/random"
      );
      if (!response.ok) throw new Error("Erro na resposta da API");
      const data = await response.json();
      return data.text || "Frase não encontrada";
    } catch (err) {
      console.log("Erro ao buscar frase:", err);
      return "A persistência é o caminho do êxito.";
    }
  };

  const { data: frase, isLoading: loadingFrase, error: fraseError } = useQuery({
    queryKey: ["fraseMotivacional"],
    queryFn: fetchMotivationalQuote,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fraseError) {
      console.log("Erro ao buscar frase:", fraseError);
    }
  }, [fraseError]);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.card, { backgroundColor: colors.card || "#fff" }]}>
      <Text style={[styles.taskText, { color: colors.text || "#000" }]}>
        {item.nomeTarefa}
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={() => editarTarefa(item)}>
          <Ionicons name="create-outline" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => excluirTarefa(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background || "#f2f2f2" }]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={realizarLogoff}>
            <Text style={styles.headerButtonText}>Logoff</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: "#ff4d4d" }]}
            onPress={excluirConta}
          >
            <Text style={styles.headerButtonText}>Excluir Conta</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.fraseContainer}>
          {loadingFrase ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : frase ? (
            <Text style={[styles.fraseText, { color: colors.text }]}>"{frase}"</Text>
          ) : (
            <Text style={{ color: colors.text }}>Não foi possível carregar a frase</Text>
          )}
        </View>


        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 30 }} />
        ) : listaItems.length === 0 ? (
          <Text
            style={{
              padding: 20,
              textAlign: "center",
              color: colors.text || "#555",
            }}
          >
            Nenhuma tarefa cadastrada
          </Text>
        ) : (
          <FlatList
            data={listaItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Digite o nome da tarefa"
            placeholderTextColor="#999"
            style={[
              styles.input,
              {
                backgroundColor: colors.input || "#e0e0e0",
                color: colors.text || "#000",
              },
            ]}
            value={nomeTarefa}
            onChangeText={setNomeTarefa}
            onSubmitEditing={salvarTarefa}
          />
          <TouchableOpacity style={styles.addButton} onPress={salvarTarefa}>
            <Text style={styles.addButtonText}>{editingId ? "✎" : "+"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
  headerButton: { padding: 10, backgroundColor: "#6200ee", borderRadius: 8 },
  headerButtonText: { color: "#fff", fontWeight: "bold" },
  fraseContainer: { padding: 15, alignItems: "center" },
  fraseText: { fontStyle: "italic", fontSize: 16, textAlign: "center" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", margin: 15, alignItems: "center" },
  input: { flex: 1, padding: 15, borderRadius: 12, fontSize: 16 },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
