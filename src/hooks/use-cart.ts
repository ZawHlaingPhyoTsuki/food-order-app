"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialRequest?: string;
}

interface Session {
    sessionId: string;
    tableToken: string;
    tableNumber: string;
    organizationId: string;
}

interface CartStore {
    items: CartItem[];
    session: Session | null;

    // Actions
    initializeSession: (session: Session) => void;
    addItem: (item: Omit<CartItem, "quantity">) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;

    // Computed
    totalItems: number;
    subtotal: number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            session: null,

            initializeSession: (session) => set({ session }),

            addItem: (item) => {
                const items = get().items;
                const existingItem = items.find(
                    (i) => i.menuItemId === item.menuItemId,
                );

                if (existingItem) {
                    set({
                        items: items.map((i) =>
                            i.menuItemId === item.menuItemId
                                ? { ...i, quantity: i.quantity + 1 }
                                : i,
                        ),
                    });
                } else {
                    set({
                        items: [...items, { ...item, quantity: 1 }],
                    });
                }
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item,
                    ),
                });
            },

            removeItem: (itemId) => {
                set({
                    items: get().items.filter((item) => item.id !== itemId),
                });
            },

            clearCart: () => set({ items: [] }),

            get totalItems() {
                return get().items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                );
            },

            get subtotal() {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                );
            },
        }),
        {
            name: "cart-storage",
        },
    ),
);
