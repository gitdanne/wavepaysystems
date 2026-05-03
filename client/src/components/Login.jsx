import { useState, useContext, useRef, useEffect } from 'react';
import { BankContext } from '../state/BankContext';

const FaceScan = ({ onSuccess }) => {
  const videoRef = useRef(null);
  const [instruction, setInstruction] = useState('Смотрите прямо...');
  const [error, setError] = useState(false);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable', err);
        setError(true);
      }
    };
    startCamera();

    const sequence = [
      { time: 3000, text: 'Повернитесь...' },
      { time: 6000, text: 'Улыбнитесь...' },
      { time: 9000, text: 'Успешно!' }
    ];

    const timeouts = sequence.map(seq => 
      setTimeout(() => {
        setInstruction(seq.text);
        if (seq.text === 'Успешно!') {
          setTimeout(() => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            onSuccess();
          }, 1000);
        }
      }, seq.time)
    );

    return () => {
      timeouts.forEach(clearTimeout);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [onSuccess]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
      <div style={{ 
        width: '200px', height: '200px', borderRadius: '50%', 
        overflow: 'hidden', background: '#1a1a2e', 
        border: '4px solid var(--accent-color)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative',
        boxShadow: '0 0 30px rgba(14, 165, 233, 0.3)'
      }}>
        {!error ? (
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        ) : (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        )}
        {/* Scanner line overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-color)',
          boxShadow: '0 0 10px var(--accent-color)',
          animation: 'scan 2.5s infinite ease-in-out alternate'
        }}></div>
        <style>
          {`@keyframes scan { from { top: 0%; } to { top: 100%; } }`}
        </style>
      </div>
      <h3 style={{ color: 'white', fontSize: '20px', textAlign: 'center', fontWeight: 'bold' }}>{instruction}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', maxWidth: '250px' }}>
        Пожалуйста, следуйте инструкциям на экране для подтверждения личности.
      </p>
    </div>
  );
};

export default function Login() {
  const { login, register } = useContext(BankContext);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [regStep, setRegStep] = useState(1); // 1: phone/pass, 2: iin, 3: scan
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [iin, setIin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    const success = await login(phone, password);
    setLoading(false);
    if (!success) setError('Неверный логин или пароль');
  };

  const handleRegisterNext = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (regStep === 1) {
      if (!phone || !password) {
        setError('Заполните все поля');
        return;
      }
      setRegStep(2);
    } else if (regStep === 2) {
      if (!iin || iin.length !== 12 || !/^\d+$/.test(iin)) {
        setError('ИИН должен состоять ровно из 12 цифр');
        return;
      }
      setRegStep(3);
    }
  };

  const handleScanSuccess = async () => {
    setLoading(true);
    const success = await register(phone, password, iin);
    setLoading(false);
    if (!success) {
      setError('Этот номер уже зарегистрирован или произошла ошибка');
      setRegStep(1); // Reset back to step 1 on failure
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

      <div className="glass-panel" style={{ padding: '32px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: mode === 'login' ? '2px solid var(--accent-color)' : '2px solid transparent', color: mode === 'login' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '16px', transition: 'all 0.3s' }} onClick={() => { setMode('login'); setError(''); }}>
            Вход
          </button>
          <button style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: mode === 'register' ? '2px solid var(--accent-color)' : '2px solid transparent', color: mode === 'register' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '16px', transition: 'all 0.3s' }} onClick={() => { setMode('register'); setRegStep(1); setError(''); setPhone(''); setPassword(''); setIin(''); }}>
            Регистрация
          </button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }} disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти в WavePay'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <div>
            {/* Steps indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ 
                  width: '30%', height: '4px', borderRadius: '2px', 
                  background: regStep >= s ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s'
                }}></div>
              ))}
            </div>

            {regStep === 1 && (
              <form onSubmit={handleRegisterNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Придумайте пароль</label>
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
                  Продолжить
                </button>
              </form>
            )}

            {regStep === 2 && (
              <form onSubmit={handleRegisterNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Ваш ИИН</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="12 цифр" 
                    value={iin}
                    maxLength={12}
                    onChange={(e) => setIin(e.target.value.replace(/\D/g, ''))}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                    Необходим для идентификации согласно законодательству
                  </p>
                </div>
                
                {error && <p style={{ color: 'var(--danger-color)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn glass-panel" style={{ flex: 1 }} onClick={() => setRegStep(1)}>
                    Назад
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    К сканированию
                  </button>
                </div>
              </form>
            )}

            {regStep === 3 && (
              <div>
                <FaceScan onSuccess={handleScanSuccess} />
                {loading && <p style={{ textAlign: 'center', color: 'var(--accent-color)', marginTop: '16px' }}>Создание аккаунта...</p>}
                {error && <p style={{ color: 'var(--danger-color)', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>{error}</p>}
                <button type="button" className="btn glass-panel" style={{ width: '100%', marginTop: '24px' }} onClick={() => setRegStep(2)} disabled={loading}>
                  Назад к вводу ИИН
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
