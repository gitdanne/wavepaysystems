import { useState, useContext } from 'react';
import { BankContext } from '../state/BankContext';

export default function Login() {
  const { login, register } = useContext(BankContext);
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState(isRegister ? '' : '+77770000000');
  const [password, setPassword] = useState(isRegister ? '' : 'wave1234');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Заполните все поля');
      return;
    }

    if (isRegister) {
      const success = register(phone, password);
      if (!success) setError('Этот номер уже зарегистрирован');
    } else {
      const success = login(phone, password);
      if (!success) setError('Неверный логин или пароль');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', minHeight: '100vh', background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.15), transparent 50%)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--accent-gradient)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.4)', overflow: 'hidden', position: 'relative' }}>
          {/* Wave background */}
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', bottom: 0, opacity: 0.2 }}>
            <path d="M0 60 Q10 50 20 55 T40 55 T60 50 T80 55 V80 H0 Z" fill="white"/>
            <path d="M0 65 Q10 58 20 62 T40 60 T60 58 T80 62 V80 H0 Z" fill="white"/>
          </svg>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            {/* W */}
            <path d="M6 14 L11 34 Q12 38 13 34 L18 20 L23 34 Q24 38 25 34 L30 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* P */}
            <path d="M33 34 V14 H38 Q43 14 43 20.5 Q43 27 38 27 H33" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <h1 className="h1 text-gradient" style={{ fontSize: '36px' }}>WavePay</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ваш финансовый океан</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: !isRegister ? '2px solid var(--accent-color)' : '2px solid transparent', color: !isRegister ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '16px', transition: 'all 0.3s' }} onClick={() => { setIsRegister(false); setError(''); }}>
            Вход
          </button>
          <button style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: isRegister ? '2px solid var(--accent-color)' : '2px solid transparent', color: isRegister ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '16px', transition: 'all 0.3s' }} onClick={() => { setIsRegister(true); setError(''); setPhone(''); setPassword(''); }}>
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Номер телефона</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="+7 (___) ___-__-__" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Пароль</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p style={{ color: 'var(--danger-color)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
            {isRegister ? 'Создать аккаунт' : 'Войти в WavePay'}
          </button>
        </form>
      </div>
    </div>
  );
}
