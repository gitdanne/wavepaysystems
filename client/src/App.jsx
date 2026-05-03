import { useState, useContext, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Cards from './components/Cards';
import PiggyBank from './components/PiggyBank';
import CryptoWallet from './components/CryptoWallet';
import Transfers from './components/Transfers';
import Login from './components/Login';
import PinCode from './components/PinCode';
import Profile from './components/Profile';
import { BankContext } from './state/BankContext';

function App() {
  const { currentUser, activePhone, logout, getUserPin, setUserPin, verifyPin } = useContext(BankContext);
  const [activeTab, setActiveTab] = useState('home');
  const [navParams, setNavParams] = useState({});
  const [pinState, setPinState] = useState('idle'); // idle | create | confirm | verify | done
  const [tempPin, setTempPin] = useState('');

  // After login, check if PIN exists
  const isPinRequired = currentUser && pinState !== 'done';

  // Determine PIN mode
  const getPinMode = useCallback(() => {
    if (!currentUser) return null;
    const existingPin = getUserPin();
    
    if (existingPin) {
      // PIN exists → need to verify
      if (pinState === 'idle' || pinState === 'verify') return 'verify';
    } else {
      // No PIN → create flow
      if (pinState === 'idle' || pinState === 'create') return 'create';
      if (pinState === 'confirm') return 'confirm';
    }
    return null;
  }, [currentUser, pinState, getUserPin]);

  const handlePinComplete = useCallback(async (enteredPin) => {
    const existingPin = getUserPin();
    
    if (!existingPin) {
      // Creating new PIN
      if (pinState === 'idle' || pinState === 'create') {
        setTempPin(enteredPin);
        setPinState('confirm');
        return true;
      }
      if (pinState === 'confirm') {
        if (enteredPin === tempPin) {
          await setUserPin(enteredPin);
          setPinState('done');
          setTempPin('');
          return true;
        }
        return false; // PINs don't match
      }
    } else {
      // Verifying existing PIN
      const isValid = await verifyPin(enteredPin);
      if (isValid) {
        setPinState('done');
        return true;
      }
      return false; // Wrong PIN
    }
  }, [pinState, tempPin, getUserPin, setUserPin, verifyPin]);

  const handlePinBack = useCallback(() => {
    if (pinState === 'confirm') {
      setPinState('create');
      setTempPin('');
    } else {
      // Logout completely
      setPinState('idle');
      setTempPin('');
      logout();
    }
  }, [pinState, logout]);

  // Reset pin state when user logs out
  if (!currentUser && pinState !== 'idle') {
    setPinState('idle');
    setTempPin('');
  }

  if (!currentUser) {
    return (
      <div className="mobile-container">
        <Login />
      </div>
    );
  }

  // Show PIN screen
  const pinMode = getPinMode();
  if (isPinRequired && pinMode) {
    return (
      <div className="mobile-container">
        <PinCode
          mode={pinMode}
          onComplete={handlePinComplete}
          onBack={handlePinBack}
        />
      </div>
    );
  }

  const navigateTo = (tab, params = {}) => {
    setNavParams(params);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard navigateTo={navigateTo} />;
      case 'cards': return <Cards navigateTo={navigateTo} />;
      case 'transfers': return <Transfers navigateTo={navigateTo} navParams={navParams} />;
      case 'piggy': return <PiggyBank />;
      case 'crypto': return <CryptoWallet />;
      case 'profile': return <Profile />;
      default: return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="mobile-container">
      <div className="app-content">
        {renderContent()}
      </div>

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Главная</span>
        </button>
        <button className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => navigateTo('cards')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Карты</span>
        </button>
        <button className={`nav-item ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => navigateTo('transfers')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>
          <span>Перевести</span>
        </button>
        <button className={`nav-item ${activeTab === 'piggy' ? 'active' : ''}`} onClick={() => navigateTo('piggy')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2 .5-.5.7-1 .5-2.5z"/><path d="M7 11c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3z"/></svg>
          <span>Сбережения</span>
        </button>
        <button className={`nav-item ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => navigateTo('crypto')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.17 6H13.5a3.5 3.5 0 1 1 0 7H9.17"/><path d="M9.17 13H14.5a3.5 3.5 0 1 1 0 7H9.17"/><line x1="11" x2="11" y1="4" y2="6"/><line x1="14" x2="14" y1="4" y2="6"/><line x1="11" x2="11" y1="20" y2="22"/><line x1="14" x2="14" y1="20" y2="22"/></svg>
          <span>CryptoWallet</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
