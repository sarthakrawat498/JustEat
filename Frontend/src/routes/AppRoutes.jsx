import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Home from "../pages/Home";
import RestaurantDetail from "../pages/RestaurantDetail";
import CreateRestaurant from "../pages/CreateRestaurant";
import OwnerDashboard from "../pages/OwnerDashboard";
import ManageRestaurant from "../pages/ManageRestaurant";
import Profile from "../pages/Profile";
import Cart from "../pages/Cart";
import OrderHistory from "../pages/OrderHistory";
import OwnerOrders from "../pages/OwnerOrders";
import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "../context/AuthContext";

const HomeOrDashboard = () => {
  const { role } = useAuth();
  return role === "OWNER" ? (
    <Navigate to="/owner-dashboard" replace />
  ) : (
    <Home />
  );
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomeOrDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/restaurant/:publicId"
        element={
          <PrivateRoute>
            <RestaurantDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-restaurant"
        element={
          <PrivateRoute>
            <CreateRestaurant />
          </PrivateRoute>
        }
      />
      <Route
        path="/owner-dashboard"
        element={
          <PrivateRoute>
            <OwnerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manage-restaurant/:publicId"
        element={
          <PrivateRoute>
            <ManageRestaurant />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrderHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/owner/orders"
        element={
          <PrivateRoute>
            <OwnerOrders />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
