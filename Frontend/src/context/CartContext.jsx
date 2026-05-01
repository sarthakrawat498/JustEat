import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  getCart as getCartApi,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "../api/cartApi";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // { restaurantId, restaurantName, totalAmount, items[] }
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const res = await getCartApi();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (menuItemId, quantity = 1) => {
      await addToCartApi(menuItemId, quantity);
      await fetchCart();
    },
    [fetchCart],
  );

  const updateCartItem = useCallback(
    async (menuItemId, quantity) => {
      if (quantity === 0) {
        await removeCartItemApi(menuItemId);
      } else {
        await updateCartItemApi(menuItemId, quantity);
      }
      await fetchCart();
    },
    [fetchCart],
  );

  const removeCartItem = useCallback(
    async (menuItemId) => {
      await removeCartItemApi(menuItemId);
      await fetchCart();
    },
    [fetchCart],
  );

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  // Auto-fetch on mount for CUSTOMER users (restores count after page refresh)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "CUSTOMER") {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartItemCount =
    cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartItemCount,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
