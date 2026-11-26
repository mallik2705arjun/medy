import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any persistent legacy localStorage so opening browser starts at login
    try {
      localStorage.removeItem('medy_admin');
    } catch (e) {}

    // Check active browser session
    const storedAdmin = sessionStorage.getItem('medy_admin');
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        if (parsed?.avatar && parsed.avatar.includes('unsplash.com')) {
          parsed.avatar = '';
        }
        setAdmin(parsed);
        // Refresh profile in background if token exists
        if (parsed?.token) {
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${parsed.token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((fresh) => {
              if (fresh) {
                const merged = { ...parsed, ...fresh };
                setAdmin(merged);
                sessionStorage.setItem('medy_admin', JSON.stringify(merged));
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        sessionStorage.removeItem('medy_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    let response;
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
    } catch (networkErr) {
      throw new Error('Unable to connect to the backend server. Please ensure the server is running on port 5000.');
    }

    let data = null;
    try {
      const rawText = await response.text();
      data = rawText ? JSON.parse(rawText) : {};
    } catch (parseErr) {
      data = { message: `Server error (${response.status || 'unknown'}: ${response.statusText || 'Unexpected response'})` };
    }

    if (!response.ok) {
      throw new Error(data?.message || `Login failed (Status: ${response.status})`);
    }

    setAdmin(data);
    sessionStorage.setItem('medy_admin', JSON.stringify(data));
    return data;
  };

  const updateProfileState = (updatedFields) => {
    setAdmin((prev) => {
      const merged = { ...prev, ...updatedFields };
      sessionStorage.setItem('medy_admin', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem('medy_admin');
    localStorage.removeItem('medy_admin');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
