import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Home Page</h1>
      <p>Welcome to Campus Karma Exchange</p>

      {user && (
        <div className="user-info">
          <p><strong>{user.full_name}</strong> ({user.email})</p>
          <p>Karma: {user.karma_balance}</p>
        </div>
      )}

      <Button onClick={handleLogout} disabled={loading} color="failure">
        {loading ? "Đang đăng xuất..." : "Đăng xuất"}
      </Button>
    </div>
  );
}

export default Home;
