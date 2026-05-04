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
import Payments from './components/Payments';
import Credits from './components/Credits';
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
      case 'payments': return <Payments />;
      case 'profile': return <Profile />;
      case 'credits': return <Credits navigateTo={navigateTo} />;
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V14h6v7"/></svg>
          <span>Главная</span>
        </button>
        <button className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => navigateTo('cards')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
          <span>Карты</span>
        </button>
        <button className={`nav-item ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => navigateTo('transfers')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5l7 7-7 7"/><path d="M19 12H5"/></svg>
          <span>Переводы</span>
        </button>
        <button className={`nav-item ${activeTab === 'piggy' ? 'active' : ''}`} onClick={() => navigateTo('piggy')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 C 8 3 5 4.5 4 6 V 11 C 4 16 8 20 12 22 C 16 20 20 16 20 11 V 6 C 19 4.5 16 3 12 3 Z" />
            <path d="M8.5 12.5 L 11.5 15.5 L 16.5 9.5" />
          </svg>
          <span>Сбережения</span>
        </button>
        <button className={`nav-item ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => navigateTo('crypto')}>
          <svg viewBox="0 0 42 24" style={{ width: '42px', height: '24px' }} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <mask id="crypto-mask">
                <rect width="42" height="24" fill="white" />
                <circle cx="21" cy="12" r="8" fill="black" stroke="black" strokeWidth="1.5" />
              </mask>
            </defs>
            <g mask="url(#crypto-mask)">
              <circle cx="10" cy="12" r="8" />
              <circle cx="32" cy="12" r="8" />
            </g>
            <circle cx="21" cy="12" r="8" />
            <path d="M8.5 8.5h2a1.5 1.5 0 0 1 0 3h-2v-3z" />
            <path d="M8.5 11.5h2.5a1.5 1.5 0 0 1 0 3h-2.5v-3z" />
            <path d="M9.5 7.5v8 M11 7.5v8" />
            <path d="M21 7l-2.5 4 2.5 1.5 2.5-1.5L21 7z" />
            <path d="M21 13.5l-2.5-1 2.5 4 2.5-4-2.5 1z" />
            <ellipse cx="32" cy="11.5" rx="3.5" ry="1.5" />
            <path d="M29.5 9h5 M32 9v6" />
          </svg>
          <span>CryptoWallet</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
