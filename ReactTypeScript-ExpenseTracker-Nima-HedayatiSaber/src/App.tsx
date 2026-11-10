import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { actions } from "./store/financeSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const uid = useAppSelector((s) => s.finance.userId);

  // load this user's data into Redux whenever the signed-in user changes
  useEffect(() => {
    dispatch(actions.setUser(user ? user.id : null));
  }, [user?.id, dispatch]);

  if (!user) return <Login />;
  return uid === user.id ? <Dashboard /> : null;
}
