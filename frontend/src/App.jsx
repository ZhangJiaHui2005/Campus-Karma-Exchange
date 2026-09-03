import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/Admindashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Profile from "./pages/users/Profile";
import BrowseItems from "./pages/items/BrowseItems";
import ItemDetail from "./pages/items/ItemDetail";
import MyTransactions from "./pages/transactions/MyTransactions";
import TransactionDetail from "./pages/transactions/TransactionDetail";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import Wallet from "./pages/wallet/Wallet";
import TopUp from "./pages/wallet/TopUp";
import TopUpResult from "./pages/wallet/TopUpResult";
import KarmaPass from "./pages/membership/KarmaPass";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route
              path="/wallet"
              element={
                <PrivateRoute>
                  <Wallet />
                </PrivateRoute>
              }
            />
            <Route
              path="/wallet/topup"
              element={
                <PrivateRoute>
                  <TopUp />
                </PrivateRoute>
              }
            />
            <Route
              path="/wallet/topup/result"
              element={
                <PrivateRoute>
                  <TopUpResult />
                </PrivateRoute>
              }
            />
            <Route
              path="/membership"
              element={
                <PrivateRoute>
                  <KarmaPass />
                </PrivateRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <PrivateRoute>
                  <BrowseItems />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/items"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/borrow-requests"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payment-archive"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
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
              path="/items/:id"
              element={
                <PrivateRoute>
                  <ItemDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <MyTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <PrivateRoute>
                  <TransactionDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
