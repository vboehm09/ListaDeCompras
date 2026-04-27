import { useState, useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { PRODUCTS_DATA } from '../data/mockData';
import useStore from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProductsScreen() {
  const { myList, addProduct, removeProduct, favorites, toggleFavorite } = useStore();
  const [search, setSearch] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const isProductFavorite = (productId) => {
    return favorites.some(p => p.id === productId);
  };

  // Função auxiliar para processar nomes com parênteses
  const parseProduct = (item) => {
    const match = item.name.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      const baseName = match[1].trim();
      const variations = match[2].split(',').map(v => v.trim());
      return { ...item, baseName, variations };
    }
    return { ...item, baseName: item.name, variations: null };
  };

  const isProductInList = (productId) => {
    return myList.some(p => p.id === productId);
  };

  // Verifica se o item pai tem alguma variação na lista
  const hasVariationInList = (item) => {
    const parsed = parseProduct(item);
    if (!parsed.variations) return isProductInList(item.id);
    return parsed.variations.some(v => isProductInList(`${item.id}-${v}`));
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Filtra os produtos pela busca do usuário
  const filteredSections = useMemo(() => {
    if (!search.trim()) return PRODUCTS_DATA;

    const query = search.toLowerCase().trim();
    return PRODUCTS_DATA
      .map(section => ({
        ...section,
        data: section.data.filter(item =>
          item.name.toLowerCase().includes(query)
        )
      }))
      .filter(section => section.data.length > 0);
  }, [search]);

  const renderProductRow = (item, section, isVariation = false, variationName = null) => {
    const parsed = parseProduct(item);
    
    // A seta (hasVariationsToggle) só aparece se houver MAIS de uma opção
    const hasVariationsToggle = !isVariation && parsed.variations && parsed.variations.length > 1;
    
    let productId = isVariation ? `${item.id}-${variationName}` : item.id;
    let displayName = isVariation ? `${parsed.baseName} ${variationName}` : parsed.baseName;

    // Se tiver apenas 1 variação e não for uma linha de variação, mostra o nome completo direto
    if (!isVariation && parsed.variations && parsed.variations.length === 1) {
      displayName = `${parsed.baseName} ${parsed.variations[0]}`;
      // Mantemos o ID original do item para simplicidade
    }

    const inList = isProductInList(productId);
    const isFav = isProductFavorite(productId);
    const isExpanded = expandedItems.has(item.id);

    // Se o pai tem múltiplas variações, ele serve como toggle
    // Se não, ele é um item normal que adiciona/remove
    const handlePress = () => {
      if (hasVariationsToggle) {
        toggleExpand(item.id);
      } else {
        if (inList) removeProduct(productId);
        else addProduct({ ...item, id: productId, name: displayName, category: section.category });
      }
    };

    return (
      <View key={productId}>
        <TouchableOpacity
          style={[
            styles.itemContainer,
            inList && styles.itemContainerInList,
            isVariation && styles.variationContainer,
            !isVariation && hasVariationInList(item) && !inList && styles.parentWithVariation
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {!isVariation && (
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
            />
          )}

          <Text style={[
            styles.itemName,
            (inList || (!isVariation && hasVariationInList(item))) && styles.itemNameInList,
            isVariation && styles.variationName
          ]}>
            {displayName}
          </Text>

          {/* Botão de Favorito */}
          <TouchableOpacity 
            onPress={() => toggleFavorite({ ...item, id: productId, name: displayName, category: section.category })}
            style={styles.favoriteButton}
          >
            <MaterialCommunityIcons 
              name={isFav ? "heart" : "heart-outline"} 
              size={22} 
              color={isFav ? "#E91E63" : "#CCC"} 
            />
          </TouchableOpacity>

          {hasVariationsToggle ? (
            <MaterialCommunityIcons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#1B5E20" 
              style={styles.expandIcon}
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

        {/* Renderiza variações se expandido (apenas se houver múltiplas) */}
        {hasVariationsToggle && isExpanded && parsed.variations.map(v => 
          renderProductRow(item, section, true, v)
        )}
      </View>
    );
  };

  const renderItem = ({ item, section }) => {
    return renderProductRow(item, section);
  };

  const renderSectionHeader = ({ section: { category } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{category}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#AAA" />
          </TouchableOpacity>
        )}
      </View>

      {filteredSections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="magnify-close" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          <Text style={styles.emptySubtext}>Tente buscar por outro nome.</Text>
        </View>
      ) : (
        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  sectionHeader: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 0.3,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  itemContainerInList: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  parentWithVariation: {
    backgroundColor: '#F1F8F1',
    borderLeftWidth: 4,
    borderLeftColor: '#A5D6A7',
  },
  variationContainer: {
    marginLeft: 40,
    marginTop: 2,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F0F4F1',
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemNameInList: {
    color: '#1B5E20',
  },
  favoriteButton: {
    padding: 8,
    marginRight: 4,
  },
  variationName: {
    fontSize: 15,
    color: '#555',
  },
  expandIcon: {
    padding: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
});
