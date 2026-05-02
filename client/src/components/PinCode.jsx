import { useState, useEffect, useCallback } from 'react';

const PIN_LENGTH = 4;

export default function PinCode({ mode, onComplete, onBack }) {
  // mode: 'create' | 'confirm' | 'verify'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const titles = {
    create: 'Придумайте ПИН-код',
    confirm: 'Подтвердите ПИН-код',
    verify: 'Введите ПИН-код',
  };

  const subtitles = {
    create: 'Используйте 4 цифры для быстрого входа',
    confirm: 'Повторите ваш ПИН-код',
    verify: 'Для входа в WavePay',
  };

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
    }, 500);
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const timer = setTimeout(async () => {
        const result = await onComplete(pin);
        if (result === false) {
          setError(mode === 'verify' ? 'Неверный ПИН-код' : 'ПИН-коды не совпадают');
          triggerShake();
        } else {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 300);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setError('');
    }
  }, [pin, onComplete, mode, triggerShake]);

  const handleDigit = (digit) => {
    if (pin.length < PIN_LENGTH) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.12), transparent 50%)',
    }}>
      {/* Lock Icon */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: success
          ? 'linear-gradient(135deg, #10b981, #34d399)'
          : 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05))',
        border: `2px solid ${success ? 'rgba(16, 185, 129, 0.5)' : 'rgba(14, 165, 233, 0.3)'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24px',
        transition: 'all 0.3s ease',
        boxShadow: success
          ? '0 0 30px rgba(16, 185, 129, 0.3)'
          : '0 0 30px rgba(14, 165, 233, 0.15)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={success ? '#fff' : '#0ea5e9'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {success ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          )}
        </svg>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        {titles[mode]}
      </h2>
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        {subtitles[mode]}
      </p>

      {/* PIN Dots */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '16px',
        animation: shake ? 'pinShake 0.4s ease-in-out' : 'none',
      }}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div key={i} style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `2px solid ${error ? 'var(--danger-color)' : pin.length > i ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)'}`,
            background: pin.length > i
              ? error
                ? 'var(--danger-color)'
                : 'var(--accent-color)'
              : 'transparent',
            transition: 'all 0.15s ease',
            transform: pin.length === i + 1 && !error ? 'scale(1.2)' : 'scale(1)',
            boxShadow: pin.length > i && !error ? '0 0 12px rgba(14, 165, 233, 0.5)' : 'none',
          }} />
        ))}
      </div>

      {/* Error Message */}
      <div style={{ height: '24px', marginBottom: '24px' }}>
        {error && (
          <p style={{
            color: 'var(--danger-color)',
            fontSize: '13px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease',
          }}>
            {error}
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        maxWidth: '280px',
        width: '100%',
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
          <button
            key={digit}
            onClick={() => handleDigit(String(digit))}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontSize: '28px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.15s ease',
              margin: '0 auto',
              WebkitTapHighlightColor: 'transparent',
              backdropFilter: 'blur(10px)',
            }}
            onMouseDown={e => {
              e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
              e.currentTarget.style.transform = 'scale(0.92)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onTouchStart={e => {
              e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
              e.currentTarget.style.transform = 'scale(0.92)';
            }}
            onTouchEnd={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: back / 0 / delete */}
        <button
          onClick={onBack}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            transition: 'all 0.15s ease',
          }}
        >
          {mode === 'confirm' ? 'Назад' : 'Выйти'}
        </button>

        <button
          onClick={() => handleDigit('0')}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.15s ease',
            margin: '0 auto',
            WebkitTapHighlightColor: 'transparent',
            backdropFilter: 'blur(10px)',
          }}
          onMouseDown={e => {
            e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
            e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onTouchStart={e => {
            e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
            e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onTouchEnd={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          0
        </button>

        <button
          onClick={handleDelete}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
