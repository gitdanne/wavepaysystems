import { useState, useContext } from 'react';
import { BankContext } from '../state/BankContext';

export default function Login() {
  const { login, register } = useContext(BankContext);
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accountName, setAccountName] = useState(''); // Only used for registration
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const ok = await login(username.trim(), password);
      if (!ok) setError('Неверный логин или пароль');
    } else {
      if (!accountName.trim()) {
        setError('Введите имя аккаунта');
        setLoading(false);
        return;
      }
      if (password.length < 4) {
        setError('Пароль должен быть не менее 4 символов');
        setLoading(false);
        return;
      }
      
      // Pass username into the phone field since DB uses phone as unique identifier
      const ok = await register(username.trim(), password, '', accountName.trim());
      if (!ok) setError('Этот логин уже занят');
    }

    setLoading(false);
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setUsername('');
    setPassword('');
    setAccountName('');
  };

  const label = { fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, minHeight: '100vh', background: 'radial-gradient(ellipse at top, rgba(0, 212, 170, 0.1), transparent 50%), radial-gradient(ellipse at bottom right, rgba(123, 97, 255, 0.08), transparent 50%)' }}>

      {/* ──── Logo ──── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent-gradient-multi)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(0, 212, 170, 0.35)', overflow: 'hidden', position: 'relative' }}>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <circle cx="24" cy="24" r="18" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M24 12 v24 M18 18 h12 M16 24 h16 M18 30 h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 60%)' }} />
        </div>
        <h1 className="h1 text-gradient" style={{ fontSize: 34 }}>WaveCoin</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Авторизация</p>
      </div>

      {/* ──── Card ──── */}
      <div className="glass-panel" style={{ padding: '32px 24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: 12, background: 'none', border: 'none',
              borderBottom: mode === m ? '2px solid var(--accent-color)' : '2px solid transparent',
              color: mode === m ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 16, transition: 'all .3s', cursor: 'pointer'
            }}>
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={label}>Логин (Username)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Введите логин"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={label}>Имя для аккаунта (Отображаемое имя)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Например: Satoshi"
                value={accountName} 
                onChange={e => setAccountName(e.target.value)} 
              />
            </div>
          )}

          <div>
            <label style={label}>Пароль</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {error && <p style={{ color: 'var(--danger-color)', fontSize: 14, textAlign: 'center' }}>{error}</p>}
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={loading}>
            {loading ? 'Загрузка...' : (mode === 'login' ? 'Войти в WaveCoin' : 'Зарегистрироваться')}
          </button>
        </form>
      </div>
    </div>
  );
}
