import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ----- Tipos -----

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextValue {
  /** Lista de items en el carrito */
  items: CartItem[];
  /** Cantidad total de productos (sumando cantidades) */
  totalItems: number;
  /** Precio total del carrito */
  totalPrice: number;
  /** Si el drawer del carrito esta abierto */
  isOpen: boolean;
  /** Abrir el drawer */
  openCart: () => void;
  /** Cerrar el drawer */
  closeCart: () => void;
  /** Agregar un producto al carrito (si ya existe, incrementa cantidad) */
  addItem: (product: CartProduct) => void;
  /** Remover una unidad de un producto */
  removeItem: (productId: string) => void;
  /** Eliminar un producto completamente del carrito */
  deleteItem: (productId: string) => void;
  /** Cambiar la cantidad de un producto directamente */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Vaciar el carrito */
  clearCart: () => void;
}

// ----- Context -----

const CartContext = createContext<CartContextValue | null>(null);

// ----- Hook -----

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>');
  }
  return context;
}

// ----- Provider -----

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: CartProduct) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Abrir el drawer al agregar un producto
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  }, []);

  const deleteItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        deleteItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
