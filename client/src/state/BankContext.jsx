import { createContext, useState, useEffect, useCallback } from 'react';

export const BankContext = createContext();

const TOKEN_KEY = 'wavepay_token';

export const BankProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [activePhone, setActivePhone] = useState(null);
  const [fiatCurrency] = useState('KZT');
  const [fiatRateToUsd] = useState(450);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setActivePhone(data.phone);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      fetchProfile();
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setCurrentUser(null);
      setActivePhone(null);
    }
  }, [token, fetchProfile]);

  const apiCall = async (url, method, body) => {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        // Optimistically refresh profile to get updated balances/transactions
        await fetchProfile();
        return { success: true, ...data };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error(`API Error on ${method} ${url}:`, err);
      return { success: false, error: 'Network error' };
    }
  };

  const login = async (phone, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (phone, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
  };

  const createDeposit = async (name, target) => {
    const res = await apiCall('/api/deposits/create', 'POST', { name, target });
    return res.success;
  };

  const transferToDeposit = async (id, amount) => {
    const res = await apiCall('/api/deposits/topup', 'POST', { id, amount });
    return res.success;
  };

  const withdrawFromDeposit = async (id) => {
    const res = await apiCall('/api/deposits/withdraw', 'POST', { id });
    return res.success;
  };

  const findRecipient = async (query) => {
    try {
      const res = await fetch(`/api/transfers/find?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.found) {
        return { name: data.name };
      }
      return null;
    } catch (err) {
      console.error('Find recipient error:', err);
      return null;
    }
  };

  const internalTransfer = async (toIdentifier, amount) => {
    const res = await apiCall('/api/transfers/internal', 'POST', { identifier: toIdentifier, amount });
    return res.success;
  };

  const externalTransfer = async (cardNumber, amount) => {
    const res = await apiCall('/api/transfers/external', 'POST', { cardNumber, amount });
    return res.success;
  };

  const buyCrypto = async (coin, fiatAmount) => {
    const res = await apiCall('/api/crypto/buy', 'POST', { coin, fiatAmount });
    return res.success;
  };

  const sellCrypto = async (coin, coinAmount) => {
    const res = await apiCall('/api/crypto/sell', 'POST', { coin, coinAmount });
    return res.success;
  };

  const topUpBalance = async (amount) => {
    const res = await apiCall('/api/user/topup', 'POST', { amount });
    return res.success;
  };

  const addCard = async (cardType, cardName, typeName) => {
    const res = await apiCall('/api/cards/add', 'POST', { cardType, cardName, typeName });
    if (res.success) {
      return res.card;
    }
    return false;
  };

  const getUserPin = () => {
    return currentUser ? currentUser.pin : null;
  };

  const setUserPin = async (pin) => {
    const res = await apiCall('/api/auth/pin/set', 'POST', { pin });
    if (res.success) {
      setCurrentUser(prev => ({ ...prev, pin }));
    }
  };

  const verifyPin = async (pin) => {
    const res = await apiCall('/api/auth/pin/verify', 'POST', { pin });
    return res.success;
  };

  return (
    <BankContext.Provider value={{
      currentUser,
      activePhone,
      fiatCurrency,
      fiatRateToUsd,
      login,
      register,
      logout,
      createDeposit,
      transferToDeposit,
      withdrawFromDeposit,
      internalTransfer,
      externalTransfer,
      buyCrypto,
      sellCrypto,
      findRecipient,
      topUpBalance,
      getUserPin,
      setUserPin,
      verifyPin,
      addCard
    }}>
      {children}
    </BankContext.Provider>
  );
};
