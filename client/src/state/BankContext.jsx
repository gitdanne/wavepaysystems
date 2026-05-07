import { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const BankContext = createContext();

const TOKEN_KEY = 'wavepay_token';
const API_BASE_URL = 'https://wavepay-backend.onrender.com';

export const BankProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [activePhone, setActivePhone] = useState(null);
  const [fiatCurrency] = useState('wcT');
  const [fiatRateToUsd] = useState(450);
  const [socket, setSocket] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
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

      // Initialize Socket connection
      const newSocket = io(API_BASE_URL, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
      });

      newSocket.on('balance_update', (data) => {
        console.log('💰 Real-time balance update received:', data);
        fetchProfile(); // Refresh profile to get new balance and transactions
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setCurrentUser(null);
      setActivePhone(null);
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token, fetchProfile]);

  const apiCall = async (url, method, body) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      const res = await fetch(fullUrl, {
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
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

  const register = async (phone, password, iin, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, iin, name })
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
      const res = await fetch(`${API_BASE_URL}/api/transfers/find?q=${encodeURIComponent(query)}`, {
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

  const internalTransfer = async (toIdentifier, amount, fromCardIndex) => {
    const res = await apiCall('/api/transfers/internal', 'POST', { identifier: toIdentifier, amount, fromCardIndex });
    return res.success;
  };

  const externalTransfer = async (cardNumber, amount, fromCardIndex) => {
    const res = await apiCall('/api/transfers/external', 'POST', { cardNumber, amount, fromCardIndex });
    return res.success;
  };

  const ownTransfer = async (fromCardIndex, toCardIndex, amount) => {
    const res = await apiCall('/api/transfers/own', 'POST', { fromCardIndex, toCardIndex, amount });
    return res.success;
  };

  const buyCrypto = async (coin, coinAmount) => {
    const res = await apiCall('/api/crypto/buy', 'POST', { coin, coinAmount });
    return res.success;
  };

  const sellCrypto = async (coin, coinAmount) => {
    const res = await apiCall('/api/crypto/sell', 'POST', { coin, coinAmount });
    return res.success;
  };

  const topUpBalance = async (amount, cardIndex) => {
    const res = await apiCall('/api/user/topup', 'POST', { amount, cardIndex });
    return res.success;
  };

  const addCard = async (cardType, cardName, typeName) => {
    const res = await apiCall('/api/cards/add', 'POST', { cardType, cardName, typeName });
    if (res.success) {
      return res.card;
    }
    return false;
  };

  const updateCardSettings = async (cardIndex, settings) => {
    const res = await apiCall('/api/cards/settings', 'POST', { cardIndex, settings });
    return res.success;
  };

  const closeCard = async (cardIndex) => {
    const res = await apiCall('/api/cards/close', 'POST', { cardIndex });
    return res.success;
  };

  const withdrawCashback = async () => {
    const res = await apiCall('/api/cashback/withdraw', 'POST', {});
    return res.success;
  };

  const applyCredit = async (amount, term) => {
    const res = await apiCall('/api/credits/apply', 'POST', { amount, term });
    return res.success;
  };

  const payCredit = async (creditId, amount, fromCardIndex) => {
    const res = await apiCall('/api/credits/pay', 'POST', { creditId, amount, fromCardIndex });
    return res.success;
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
      ownTransfer,
      buyCrypto,
      sellCrypto,
      findRecipient,
      topUpBalance,
      getUserPin,
      setUserPin,
      verifyPin,
      addCard,
      updateCardSettings,
      closeCard,
      withdrawCashback,
      applyCredit,
      payCredit
    }}>
      {children}
    </BankContext.Provider>
  );
};
