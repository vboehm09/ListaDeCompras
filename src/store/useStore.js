import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set, get) => ({
      myList: [], // Array de objetos: { id, name, category, gotIt: boolean }
      favorites: [], // Array de objetos de produtos favoritos
      purchaseHistory: [], // Array de objetos: { id, date, items: [] }

      // Adicionar produto à minha lista
      addProduct: (product) => {
        const { myList } = get();
        // Verifica se já existe
        if (!myList.find(p => p.id === product.id)) {
          set({ myList: [...myList, { ...product, gotIt: false }] });
        }
      },

      // Remover produto da minha lista
      removeProduct: (productId) => {
        set({ myList: get().myList.filter(p => p.id !== productId) });
      },

      // Alternar o status do checkbox (pegou/não pegou ainda)
      toggleGotIt: (productId) => {
        set({
          myList: get().myList.map(p =>
            p.id === productId ? { ...p, gotIt: !p.gotIt } : p
          )
        });
      },

      // Limpar todos os produtos que já foram pegos (gotIt = true)
      clearCompleted: () => {
        set({ myList: get().myList.filter(p => !p.gotIt) });
      },

      // Finalizar a compra (Salvar no histórico e limpar pegos)
      finishPurchase: () => {
        const { myList, purchaseHistory } = get();
        const itemsToSave = myList.filter(p => p.gotIt);
        
        if (itemsToSave.length === 0) return;

        const newEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          items: itemsToSave,
        };

        set({
          purchaseHistory: [newEntry, ...purchaseHistory],
          myList: myList.filter(p => !p.gotIt),
        });
      },

      // Esvaziar toda a lista
      clearAll: () => {
        set({ myList: [] });
      },
      
      // Alternar favorito
      toggleFavorite: (product) => {
        const { favorites } = get();
        const isFav = favorites.find(p => p.id === product.id);
        if (isFav) {
          set({ favorites: favorites.filter(p => p.id !== product.id) });
        } else {
          set({ favorites: [...favorites, product] });
        }
      }
    }),
    {
      name: 'listai-storage', // Nome da chave no AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStore;
