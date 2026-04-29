import { useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Image, Alert, Share, Platform } from 'react-native';
import useStore from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Função que funciona tanto na web quanto no celular
const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    // Na web, simula o fluxo dos botões com confirm/alert do navegador
    const buttonLabels = buttons.filter(b => b.text !== 'Cancelar').map(b => b.text);
    
    if (buttonLabels.length === 1) {
      window.alert(`${title}\n\n${message}`);
      buttons[0].onPress?.();
    } else {
      // Monta uma mensagem com as opções
      const opcoes = buttonLabels.map((label, i) => `${i + 1}. ${label}`).join('\n');
      const escolha = window.prompt(`${title}\n\n${message}\n\nDigite o número da opção:\n${opcoes}`);
      
      if (escolha === '1') {
        buttons.find(b => b.text === buttonLabels[0])?.onPress?.();
      } else if (escolha === '2') {
        buttons.find(b => b.text === buttonLabels[1])?.onPress?.();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function MyListScreen() {
  const { myList, toggleGotIt, finishPurchase, clearCompleted, clearAll } = useStore();

  const completedCount = myList.filter(p => p.gotIt).length;

  const sections = useMemo(() => {
    const groups = myList.reduce((acc, item) => {
      const category = item.category || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort()
      .map(category => ({
        title: category,
        data: groups[category],
      }));
  }, [myList]);

  const handleFinishPurchase = () => {
    const pegoCount = myList.filter(p => p.gotIt).length;

    if (pegoCount === 0) {
      showAlert("Atenção", "Você não marcou nenhum item como pego.", [
        { text: "OK" }
      ]);
      return;
    }

    showAlert(
      "Finalizar Compra",
      `O que deseja fazer com estes ${pegoCount} itens?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apenas Limpar",
          onPress: () => {
            clearCompleted();
            showAlert("Sucesso", "Lista limpa (não salva no histórico).", [{ text: "OK" }]);
          },
          style: "destructive"
        },
        {
          text: "Salvar e Finalizar",
          onPress: () => {
            finishPurchase();
            showAlert("Sucesso", "Compra salva no histórico!", [{ text: "OK" }]);
          }
        }
      ]
    );
  };

  const handleShareList = () => {
    if (myList.length === 0) {
      showAlert('Atenção', 'Sua lista está vazia para compartilhar.', [{ text: "OK" }]);
      return;
    }

    const lines = ['Lista de compras', ''];

    sections.forEach((section) => {
      lines.push(section.title.toUpperCase());
      section.data.forEach((item) => {
        lines.push(`- ${item.gotIt ? '[x]' : '[ ]'} ${item.name}`);
      });
      lines.push('');
    });

    lines.push('Lista compartilhada em modo de leitura.');
    const mensagem = lines.join('\n');

    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(mensagem).then(() => {
        window.alert("Lista copiada para a área de transferência!");
      }).catch(() => {
        window.alert(mensagem);
      });
    } else {
      Share.share({ message: mensagem });
    }
  };

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Tem certeza que deseja esvaziar toda a lista?")) {
        clearAll();
      }
    } else {
      Alert.alert(
        "Esvaziar Lista",
        "Tem certeza que deseja remover todos os itens?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Esvaziar", onPress: clearAll, style: "destructive" }
        ]
      );
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.itemContainer, item.gotIt && styles.itemContainerGotIt]}
        onPress={() => toggleGotIt(item.id)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={item.gotIt ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={item.gotIt ? "#2E7D32" : "#757575"}
        />
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
        />
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemName, item.gotIt && styles.itemNameGotIt]}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );

  if (myList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-remove" size={64} color="#BDBDBD" />
        <Text style={styles.emptyText}>Sua lista está vazia!</Text>
        <Text style={styles.emptySubtext}>Vá para 'Produtos' e adicione o que precisa comprar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Contador */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {completedCount} de {myList.length} itens pegos
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: myList.length > 0 ? `${(completedCount / myList.length) * 100}%` : '0%' }]} />
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.headerButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShareList}>
          <MaterialCommunityIcons name="whatsapp" size={18} color="#FFF" />
          <Text style={styles.actionButtonText}>Compartilhar no WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleFinishPurchase}>
          <MaterialCommunityIcons name="check-bold" size={18} color="#FFF" />
          <Text style={styles.actionButtonText}>Finalizar Compra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearAll}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FFF" />
          <Text style={styles.actionButtonText}>Esvaziar</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  headerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: '#1B5E20',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  shareButton: {
    flexBasis: '100%',
    backgroundColor: '#128C7E',
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F7',
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#A5D6A7',
    marginLeft: 10,
    opacity: 0.5,
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
  itemContainerGotIt: {
    backgroundColor: '#E8F5E9',
    opacity: 0.75,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F4F1',
    marginLeft: 10,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemNameGotIt: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9F7',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  }
});