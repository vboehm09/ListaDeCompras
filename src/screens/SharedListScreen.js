import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export default function SharedListScreen({ route }) {
    const [loading, setLoading] = useState(true);
    const [lista, setLista] = useState(null);

    // No site, o ID vem da URL. No App, vem das rotas.
    const { listId } = route.params;

    useEffect(() => {
        const fetchLista = async () => {
            try {
                const docRef = doc(db, "listas", listId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setLista(docSnap.data());
                } else {
                    console.log("Lista não encontrada!");
                }
            } catch (error) {
                console.error("Erro ao buscar lista:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLista();
    }, [listId]);

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

    if (!lista) return <View style={styles.container}><Text>Lista não encontrada ou expirada.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Compras Compartilhada</Text>
            <FlatList
                data={lista.itens}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={[styles.itemText, item.gotIt && styles.done]}>
                            {item.name} ({item.category})
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 18 },
    done: { textDecorationLine: 'line-through', color: 'gray' }
});