import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from './api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    // Optional: validate token here if needed
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      const { token, ...user } = userData;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};