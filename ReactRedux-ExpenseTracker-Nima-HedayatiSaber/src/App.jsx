import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "./context/AuthContext.jsx";
import { actions } from "./store/financeSlice.js";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const uid = useSelector((s) => s.finance.userId);

  // load this user's data into Redux whenever the signed-in user changes
  useEffect(() => {
    dispatch(actions.setUser(user ? user.id : null));
  }, [user?.id, dispatch]);

  if (!user) return <Login />;
  return uid === user.id ? <Dashboard /> : null;
}
