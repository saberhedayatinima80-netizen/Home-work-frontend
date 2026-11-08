import { useAuth } from "./context/AuthContext.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
}
