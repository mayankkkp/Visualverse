import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return null;
}