import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/auth/Login";
import Admin from "./pages/admin/Admin";
import PrivateRoute from "./routes/PrivateRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
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
          <Route path="/admin/items" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/borrow-requests" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/activity" element={<PrivateRoute><Admin /></PrivateRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
