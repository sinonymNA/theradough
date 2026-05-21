import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart_items') || '[]');
    } catch {
      return [];
    }
  });

  const [dropId, setDropId] = useState(() => {
    try {
      return localStorage.getItem('cart_drop_id') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (dropId) localStorage.setItem('cart_drop_id', dropId);
    else localStorage.removeItem('cart_drop_id');
  }, [dropId]);

  function addItem(menuItem, currentDropId) {
    // Clear cart if drop changed
    if (currentDropId && dropId && currentDropId !== dropId) {
      setItems([]);
      setDropId(currentDropId);
    } else if (!dropId && currentDropId) {
      setDropId(currentDropId);
    }

    setItems(prev => {
      const existing = prev.find(i => i.menu_item_id === menuItem.id);
      if (existing) {
        return prev.map(i =>
          i.menu_item_id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price_cents: menuItem.price_cents,
        quantity: 1,
        quantity_available: menuItem.quantity_available,
        quantity_ordered: menuItem.quantity_ordered,
      }];
    });
  }

  function removeItem(menuItemId) {
    setItems(prev => prev.filter(i => i.menu_item_id !== menuItemId));
  }

  function updateQty(menuItemId, qty) {
    if (qty <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems(prev =>
      prev.map(i => i.menu_item_id === menuItemId ? { ...i, quantity: qty } : i)
    );
  }

  function clearCart() {
    setItems([]);
    setDropId(null);
  }

  function setCurrentDrop(id) {
    const idStr = String(id);
    if (dropId && dropId !== idStr) {
      setItems([]);
    }
    setDropId(idStr);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, dropId, itemCount, subtotalCents,
      addItem, removeItem, updateQty, clearCart, setCurrentDrop
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
