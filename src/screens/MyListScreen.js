import { useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Image, Alert, Share, Platform, Modal } from 'react-native';
import useStore from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Modal customizado que funciona na web e no celular
function ConfirmModal({ visible, title, message, buttons, onClose }) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.box}>
          <Text style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.message}>{message}</Text>
          <View style={modalStyles.buttonsContainer}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  modalStyles.button,
                  btn.style === 'cancel' && modalStyles.cancelButton,
                  btn.style === 'destructive' && modalStyles.destructiveButton,
                  btn.style === 'primary' && modalStyles.primaryButton,
                ]}
                onPress={() => {
                  onClose();
                  btn.onPress?.();
                }}
              >
                <Text style={[
                  modalStyles.buttonText,
                  btn.style === 'cancel' && modalStyles.cancelButtonText,
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function MyListScreen() {
  const { myList, toggleGotIt, finishPurchase, clearCompleted, clearAll } = useStore();

  const [modal, setModal] = useState({ visible: false, title: '', message: '', buttons: [] });

  const completedCount = myList.filter(p => p.gotIt).length;

  const showModal = (title, message, buttons) => {
    setModal({ visible: true, title, message, buttons });
  };

  const closeModal = () => {
    setModal(m => ({ ...m, visible: false }));
  };

  const sections = useMemo(() => {
    const groups = myList.reduce((acc, item) => {
      const category = item.category || 'Outros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    return Object.keys(groups).sort().map(category => ({
      title: category,
      data: groups[category],
    }));
  }, [myList]);

  const handleFinishPurchase = () => {
    const pegoCount = myList.filter(p => p.gotIt).length;

    if (pegoCount === 0) {
      showModal("Atenção", "Você não marcou nenhum item como pego.", [
        { text: "OK", style: "primary" }
      ]);
      return;
    }

    showModal(
      "Finalizar Compra",
      `O que deseja fazer com os ${pegoCount} itens marcados?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apenas Limpar",
          style: "destructive",
          onPress: () => {
            clearCompleted();
            showModal("Sucesso", "Lista limpa!", [{ text: "OK", style: "primary" }]);
          }
        },
        {
          text: "Salvar e Finalizar",
          style: "primary",
          onPress: () => {
            finishPurchase();
            showModal("Sucesso", "Compra salva no histórico!", [{ text: "OK", style: "primary" }]);
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    showModal(
      "Esvaziar Lista",
      "Tem certeza que deseja remover todos os itens?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Esvaziar Tudo", style: "destructive", onPress: clearAll }
      ]
    );
  };

  const handleShareList = () => {
    if (myList.length === 0) {
      showModal('Atenção', 'Sua lista está vazia para compartilhar.', [{ text: "OK", style: "primary" }]);
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
        showModal("Compartilhar", "Lista copiada! Cole no WhatsApp ou onde quiser.", [{ text: "OK", style: "primary" }]);
      }).catch(() => {
        showModal("Lista de Compras", mensagem, [{ text: "OK", style: "primary" }]);
      });
    } else {
      Share.share({ message: mensagem });
    }
  };

  const renderItem = ({ item }) => (
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
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemName, item.gotIt && styles.itemNameGotIt]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      <ConfirmModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={modal.buttons}
        onClose={closeModal}
      />

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {completedCount} de {myList.length} itens pegos
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: myList.length > 0 ? `${(completedCount / myList.length) * 100}%` : '0%' }]} />
        </View>
      </View>

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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  primaryButton: {
    backgroundColor: '#1B5E20',
  },
  destructiveButton: {
    backgroundColor: '#D32F2F',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cancelButtonText: {
    color: '#888',
  },
});

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