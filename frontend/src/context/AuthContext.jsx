import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { auth as firebaseAuth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await authApi.getProfile();
          if (res.success && res.user) {
            setUser((prev) => ({ ...prev, ...res.user }));
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Firebase Authentication flow
  const loginWithFirebase = async (email, password) => {
    if (!firebaseAuth) {
      throw new Error(
        'Firebase Web SDK is not configured with VITE_FIREBASE_API_KEY in .env. Please configure it or use JWT login.'
      );
    }
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await credential.user.getIdToken();
    const profileRes = await authApi.getFirebaseProfile(idToken);
    setFirebaseUser(profileRes.firebaseUser || credential.user);
    return { credential, idToken, profile: profileRes.firebaseUser };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        loginWithFirebase
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
