import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { POPULAR_PRODUCTS } from '../data/mockData';
import useStore from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const { myList, addProduct, removeProduct, favorites, toggleFavorite } = useStore();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const isProductInList = (productId) => {
    return myList.some(p => p.id === productId);
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedItems(newExpanded);
  };

  // Função auxiliar para processar nomes com parênteses (reutilizada)
  const parseProduct = (item) => {
    const match = item.name.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      const baseName = match[1].trim();
      const variations = match[2].split(',').map(v => v.trim());
      return { ...item, baseName, variations };
    }
    return { ...item, baseName: item.name, variations: null };
  };

  const renderItem = ({ item }) => {
    const parsed = parseProduct(item);
    const inList = isProductInList(item.id);
    const hasVariationsToggle = parsed.variations && parsed.variations.length > 1;
    const isExpanded = expandedItems.has(item.id);

    const handlePress = () => {
      if (hasVariationsToggle) {
        toggleExpand(item.id);
      } else {
        if (inList) removeProduct(item.id);
        else addProduct(item);
      }
    };

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[styles.itemContainer, inList && styles.itemContainerInList]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
          />

          <View style={styles.textContainer}>
            <Text style={[styles.itemName, inList && styles.itemNameInList]}>
              {item.name}
            </Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>

          {/* Botão de Remover dos Favoritos (Coração) */}
          <TouchableOpacity 
            onPress={() => toggleFavorite(item)}
            style={styles.favoriteButton}
          >
            <MaterialCommunityIcons name="heart" size={24} color="#E91E63" />
          </TouchableOpacity>

          {hasVariationsToggle ? (
            <MaterialCommunityIcons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#1B5E20"
            />
          ) : (
            <View style={[styles.addButton, inList && styles.removeButton]}>
              <MaterialCommunityIcons 
                name={inList ? "check" : "plus"} 
                size={20} 
                color={inList ? "#FFF" : "#1B5E20"} 
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Se for um item pai favoritado, permite escolher a variação aqui também */}
        {hasVariationsToggle && isExpanded && parsed.variations.map(v => {
          const varId = `${item.id}-${v}`;
          const varName = `${parsed.baseName} ${v}`;
          const varInList = isProductInList(varId);
          
          return (
            <TouchableOpacity
              key={varId}
              style={[styles.itemContainer, styles.variationContainer, varInList && styles.itemContainerInList]}
              onPress={() => {
                if (varInList) removeProduct(varId);
                else addProduct({ ...item, id: varId, name: varName });
              }}
            >
              <Text style={[styles.itemName, styles.variationName, varInList && styles.itemNameInList]}>
                {varName}
              </Text>
              <View style={[styles.addButton, varInList && styles.removeButton]}>
                <MaterialCommunityIcons name={varInList ? "check" : "plus"} size={18} color={varInList ? "#FFF" : "#1B5E20"} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="heart" size={32} color="#E91E63" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
          <Text style={styles.headerSubtitle}>Produtos marcados por você</Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="heart-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Sua lista de favoritos está vazia.</Text>
          <Text style={styles.emptySubtext}>Dê um coração nos produtos que você mais gosta lá na aba de mercado!</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContainerInList: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 1,
  },
  variationContainer: {
    marginLeft: 30,
    marginTop: -4,
    marginBottom: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    elevation: 0,
    shadowOpacity: 0,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F0F4F1',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemNameInList: {
    color: '#1B5E20',
  },
  variationName: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  itemCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    padding: 8,
    marginRight: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#2E7D32',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});
