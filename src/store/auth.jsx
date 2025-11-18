import { createContext, useContext, useState } from "react";

const SHOULD_RESET_AUTH_ON_DEV_BOOT =
  import.meta.env.DEV &&
  import.meta.env.VITE_KEEP_AUTH_BETWEEN_RUNS !== "true";

function ensureFreshAuthForDevSession() {
  if (!SHOULD_RESET_AUTH_ON_DEV_BOOT) return;
  try {
    const bootedKey = "__auth_bootstrapped__";
    if (!sessionStorage.getItem(bootedKey)) {
      localStorage.removeItem("auth");
      sessionStorage.setItem(bootedKey, "1");
    }
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}
ensureFreshAuthForDevSession();

const AuthCtx = createContext(null);

function readPersistedAuth() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readPersistedAuth()); // { token, accountId, fullName, role }

  const login = (payload) => {
    setUser(payload);
    localStorage.setItem("auth", JSON.stringify(payload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("auth", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);



