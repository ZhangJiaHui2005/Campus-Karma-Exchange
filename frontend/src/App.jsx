import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/auth/Login";
import Admin from "./pages/admin/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Profile from "./pages/users/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
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
              path="/admin"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/items"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/borrow-requests"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <PrivateRoute>
                  <Admin />
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
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
