import { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { BankContext } from '../state/BankContext';

/* ──────────────────────── Mock Face-Scan Component ──────────────────────── */
const FaceScan = ({ onSuccess }) => {
  const videoRef = useRef(null);
  const [instruction, setInstruction] = useState('Смотрите прямо...');
  const [progress, setProgress] = useState(0);
  const [noCamera, setNoCamera] = useState(false);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setNoCamera(true);
      }
    };
    startCamera();

    const steps = [
      { at: 0,    text: 'Смотрите прямо...',  pct: 10 },
      { at: 2500, text: 'Повернитесь влево...', pct: 35 },
      { at: 5000, text: 'Повернитесь вправо...', pct: 60 },
      { at: 7500, text: 'Улыбнитесь 😊',       pct: 85 },
      { at: 10000, text: 'Проверка завершена ✓', pct: 100 },
    ];

    const timers = steps.map(s =>
      setTimeout(() => {
        setInstruction(s.text);
        setProgress(s.pct);
        if (s.pct === 100) {
          setTimeout(() => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            onSuccess();
          }, 800);
        }
      }, s.at)
    );

    return () => {
      timers.forEach(clearTimeout);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [onSuccess]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '8px 0' }}>
      {/* Circular camera viewport */}
      <div style={{
        width: 200, height: 200, borderRadius: '50%',
        overflow: 'hidden', position: 'relative',
        border: '3px solid var(--accent-color)',
        boxShadow: '0 0 40px rgba(14,165,233,.35)',
        background: '#0d1117'
      }}>
        {!noCamera ? (
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        {/* scan-line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 3,
          background: 'var(--accent-color)', boxShadow: '0 0 12px var(--accent-color)',
          animation: 'faceScanLine 2.5s ease-in-out infinite alternate',
          top: 0
        }} />
        <style>{`@keyframes faceScanLine{0%{top:0}100%{top:calc(100% - 3px)}}`}</style>
      </div>

      {/* Progress bar */}
      <div style={{ width: '80%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: 'var(--accent-gradient)',
          width: `${progress}%`,
          transition: 'width .6s ease'
        }} />
      </div>

      <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, textAlign: 'center' }}>{instruction}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
        Пожалуйста, следуйте инструкциям для биометрической проверки
      </p>
    </div>
  );
};

/* ──────────────────────── Login / Register Component ──────────────────────── */
export default function Login() {
  const { login, register } = useContext(BankContext);
  const [mode, setMode] = useState('login');

  /* Registration wizard state */
  const [regStep, setRegStep] = useState(1);   // 1=data  2=face  3=name
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [iin, setIin] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ─── Login handler ─── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) { setError('Заполните все поля'); return; }
    setLoading(true);
    const ok = await login(phone, password);
    setLoading(false);
    if (!ok) setError('Неверный логин или пароль');
  };

  /* ─── Step 1 → Step 2 ─── */
  const goToScan = (e) => {
    e.preventDefault();
    setError('');
    if (!iin || iin.length !== 12 || !/^\d+$/.test(iin)) { setError('ИИН должен состоять ровно из 12 цифр'); return; }
    if (!phone) { setError('Введите номер телефона'); return; }
    if (!password) { setError('Введите пароль'); return; }
    if (password !== password2) { setError('Пароли не совпадают'); return; }
    if (password.length < 4) { setError('Пароль слишком короткий'); return; }
    setRegStep(2);
  };

  /* ─── Face scan done → Step 3 ─── */
  const onFaceDone = useCallback(() => setRegStep(3), []);

  /* ─── Final register ─── */
  const handleFinish = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) { setError('Введите имя для аккаунта'); return; }
    setLoading(true);
    const ok = await register(phone, password, iin, accountName.trim());
    setLoading(false);
    if (!ok) { setError('Этот номер уже зарегистрирован'); setRegStep(1); }
  };

  /* ─── Reset when switching mode ─── */
  const switchMode = (m) => {
    setMode(m);
    setRegStep(1);
    setError('');
    setPhone(''); setPassword(''); setPassword2(''); setIin(''); setAccountName('');
  };

  /* shared label style */
  const label = { fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, minHeight: '100vh', background: 'radial-gradient(ellipse at top, rgba(14,165,233,.15), transparent 50%)' }}>

      {/* ──── Logo ──── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent-gradient)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(14,165,233,.4)', overflow: 'hidden', position: 'relative' }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', bottom: 0, opacity: .2 }}>
            <path d="M0 60 Q10 50 20 55 T40 55 T60 50 T80 55 V80 H0 Z" fill="white"/>
            <path d="M0 65 Q10 58 20 62 T40 60 T60 58 T80 62 V80 H0 Z" fill="white"/>
          </svg>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M6 14 L11 34 Q12 38 13 34 L18 20 L23 34 Q24 38 25 34 L30 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M33 34 V14 H38 Q43 14 43 20.5 Q43 27 38 27 H33" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <h1 className="h1 text-gradient" style={{ fontSize: 36 }}>WavePay</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ваш финансовый океан</p>
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
              fontWeight: 600, fontSize: 16, transition: 'all .3s'
            }}>
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        {/* ─────────── LOGIN ─────────── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={label}>Номер телефона</label>
              <input type="text" className="input-field" placeholder="+7 (___) ___-__-__"
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label style={label}>Пароль</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--danger-color)', fontSize: 14, textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти в WavePay'}
            </button>
          </form>
        )}

        {/* ─────────── REGISTER ─────────── */}
        {mode === 'register' && (
          <div>
            {/* Step indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  width: '30%', height: 4, borderRadius: 2,
                  background: regStep >= s ? 'var(--accent-color)' : 'rgba(255,255,255,.1)',
                  transition: 'background .3s'
                }} />
              ))}
            </div>

            {/* ── Step 1: Data ── */}
            {regStep === 1 && (
              <form onSubmit={goToScan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={label}>ИИН</label>
                  <input type="text" className="input-field" placeholder="12 цифр"
                    value={iin} maxLength={12}
                    onChange={e => setIin(e.target.value.replace(/\D/g, ''))} />
                </div>
                <div>
                  <label style={label}>Номер телефона</label>
                  <input type="text" className="input-field" placeholder="+7 (___) ___-__-__"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Пароль</label>
                  <input type="password" className="input-field" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Повторите пароль</label>
                  <input type="password" className="input-field" placeholder="••••••••"
                    value={password2} onChange={e => setPassword2(e.target.value)} />
                </div>

                {error && <p style={{ color: 'var(--danger-color)', fontSize: 14, textAlign: 'center' }}>{error}</p>}

                <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
                  Продолжить
                </button>
              </form>
            )}

            {/* ── Step 2: Face Scan ── */}
            {regStep === 2 && (
              <div>
                <FaceScan onSuccess={onFaceDone} />
                <button type="button" className="btn glass-panel"
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => { setRegStep(1); setError(''); }}>
                  Назад
                </button>
              </div>
            )}

            {/* ── Step 3: Account Name ── */}
            {regStep === 3 && (
              <form onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Биометрия подтверждена ✓</p>
                </div>
                <div>
                  <label style={label}>Имя для аккаунта</label>
                  <input type="text" className="input-field" placeholder="Например: Данияр"
                    value={accountName} onChange={e => setAccountName(e.target.value)} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center' }}>
                    Это имя будет видно другим пользователям при переводах
                  </p>
                </div>

                {error && <p style={{ color: 'var(--danger-color)', fontSize: 14, textAlign: 'center' }}>{error}</p>}

                <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={loading}>
                  {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                </button>
                <button type="button" className="btn glass-panel" style={{ width: '100%' }}
                  onClick={() => { setRegStep(1); setError(''); }}>
                  Начать сначала
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
