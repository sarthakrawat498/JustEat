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

  // Loads the latest cart from the backend and updates context state
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

  // Adds an item to the cart then refreshes cart state
  const addToCart = useCallback(
    async (menuItemId, quantity = 1) => {
      await addToCartApi(menuItemId, quantity);
      await fetchCart();
    },
    [fetchCart],
  );

  // Sets a new quantity for a cart item; removes it if quantity is 0, then refreshes cart state
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

  // Removes an item from the cart then refreshes cart state
  const removeCartItem = useCallback(
    async (menuItemId) => {
      await removeCartItemApi(menuItemId);
      await fetchCart();
    },
    [fetchCart],
  );

  // Resets the cart state to null (used after checkout)
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
