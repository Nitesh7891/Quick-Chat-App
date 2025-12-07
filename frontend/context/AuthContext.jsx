import { useState, createContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // connect socket
  const connectSocket = (user) => {
  if (!user) return;
  if (socket?.connected) return; // prevent duplicate connections

  const newSocket = io(backendUrl, {
    query: { userId: user._id },
    transports: ["websocket"], // no polling fallback
    withCredentials: true
  });

  setSocket(newSocket);

  newSocket.on("connect_error", (err) => {
    console.log("Socket connect error:", err.message);
  });

  newSocket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  newSocket.on("getOnlineUsers", (userIds) => {
    setOnlineUsers(userIds);
  });
};


  // 🔹 Check authentication status
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login or Signup user
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        localStorage.setItem("token", data.token);
        setToken(data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);

      socket?.disconnect();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 🔹 Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    checkAuth();  // only run when token is ready
  } else {
    setLoading(false);
  }
}, [token]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <p className="text-white text-center p-4">Loading…</p> : children}
    </AuthContext.Provider>
  );
};
