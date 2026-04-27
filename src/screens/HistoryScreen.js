import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../store/useStore';

const HistoryScreen = () => {
  const purchaseHistory = useStore(state => state.purchaseHistory);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryItem = ({ item }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.header} 
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerText}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.itemCount}>{item.items.length} itens comprados</Text>
          </View>
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.details}>
            {item.items.map((prod, index) => (
              <View key={`${item.id}-${prod.id}-${index}`} style={styles.productRow}>
                <Image source={{ uri: prod.image }} style={styles.productImage} />
                <Text style={styles.productName}>{prod.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <MaterialCommunityIcons name="history" size={28} color="#FF6347" />
        <Text style={styles.title}>Minhas Compras</Text>
      </View>

      {purchaseHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={80} color="#E0E0E0" />
          <Text style={styles.emptyText}>Você ainda não finalizou nenhuma compra.</Text>
        </View>
      ) : (
        <FlatList
          data={purchaseHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  details: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 35,
    height: 35,
    borderRadius: 6,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    color: '#444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;
