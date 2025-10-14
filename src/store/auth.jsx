import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { token, accountId, fullName, role }

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = (payload) => {
    setUser(payload);
    localStorage.setItem("auth", JSON.stringify(payload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);



