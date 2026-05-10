import { useState, useContext } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';

export default function Staking() {
  const { currentUser } = useContext(BankContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');

  const stakingPools = [
    { id: 'eth_pool', coin: 'ETH', name: 'Ethereum 2.0', apy: 4.5, locked: '30 дней', min: 0.1, color: '#627eea' },
    { id: 'sol_pool', coin: 'SOL', name: 'Solana Validator', apy: 7.2, locked: 'Гибкий', min: 1, color: '#14f195' },
    { id: 'ada_pool', coin: 'ADA', name: 'Cardano Staking', apy: 5.1, locked: 'Гибкий', min: 100, color: '#0033ad' },
    { id: 'dot_pool', coin: 'DOT', name: 'Polkadot Node', apy: 12.5, locked: '60 дней', min: 10, color: '#e6007a' },
    { id: 'wct_pool', coin: 'wcT', name: 'WaveCash Vault', apy: 15.0, locked: '90 дней', min: 1000, color: '#00d4aa' },
  ];

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if (!amount || amount < selectedPool.min) {
      alert(`Минимальная сумма стейкинга: ${selectedPool.min} ${selectedPool.coin}`);
      return;
    }
    // Mocking stake functionality
    alert(`Успешно вложено ${amount} ${selectedPool.coin} под ${selectedPool.apy}% годовых!`);
    setSelectedPool(null);
    setStakeAmount('');
  };

  const activeStakes = [
    { id: 1, pool: stakingPools[4], amount: 5000, earned: 12.5, daysLeft: 45 },
    { id: 2, pool: stakingPools[1], amount: 15.4, earned: 0.03, daysLeft: 0 }, // flexible
  ];

  const formatCrypto = (amount, coin) => Number(amount).toLocaleString('en-US', { maximumFractionDigits: coin === 'wcT' ? 2 : 6 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="h2 text-gradient" style={{ margin: 0 }}>Стейкинг</h2>

      {/* Stats Overview */}
      <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.15), rgba(0, 212, 170, 0.05))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(123, 97, 255, 0.2)', filter: 'blur(30px)' }}></div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Всего в стейкинге (прибл.)</p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>5,240.50 wcT</h1>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Заработано</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success-color)' }}>+ 14.8 wcT</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ср. APY</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>11.4%</p>
          </div>
        </div>
      </div>

      {/* Active Stakes */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Ваши активы</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeStakes.map(stake => (
            <div key={stake.id} className="glass-panel" style={{ padding: '16px', borderLeft: `3px solid ${stake.pool.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${stake.pool.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: stake.pool.color }}>{stake.pool.coin[0]}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{stake.pool.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--success-color)', fontWeight: 600 }}>{stake.pool.apy}% APY</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>{formatCrypto(stake.amount, stake.pool.coin)} {stake.pool.coin}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>≈ {(stake.amount * 1.05).toFixed(2)} wcT</p>
                </div>
              </div>
              <div style={{ background: 'var(--bg-dark)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Заработано</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success-color)' }}>+{formatCrypto(stake.earned, stake.pool.coin)} {stake.pool.coin}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Блокировка</p>
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>{stake.daysLeft > 0 ? `${stake.daysLeft} дн.` : 'Доступно'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Pools */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Доступные пулы</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {stakingPools.map(pool => (
            <div 
              key={pool.id} 
              className="glass-panel" 
              style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', border: selectedPool?.id === pool.id ? `1.5px solid ${pool.color}` : '1px solid var(--border-glass)' }}
              onClick={() => setSelectedPool(pool)}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${pool.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: pool.color }}>{pool.coin[0]}</span>
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>{pool.coin}</h4>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success-color)' }}>{pool.apy}%</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pool.locked}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Staking Modal */}
      {selectedPool && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={(e) => { if(e.target === e.currentTarget) setSelectedPool(null) }}>
          <div style={{ width: '100%', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${selectedPool.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: selectedPool.color }}>{selectedPool.coin[0]}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedPool.name}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--success-color)', fontWeight: 600 }}>{selectedPool.apy}% APY</p>
                </div>
              </div>
              <button onClick={() => setSelectedPool(null)} style={{ background: 'var(--bg-glass)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Блокировка</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedPool.locked}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Мин. сумма</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedPool.min} {selectedPool.coin}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Мой баланс</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  {selectedPool.coin === 'wcT' ? formatCrypto(currentUser.internalBalance, 'wcT') : '0.00'} {selectedPool.coin}
                </span>
              </div>
            </div>

            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Сумма стейкинга ({selectedPool.coin})</label>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input 
                type="number" 
                className="input-field" 
                placeholder={`Мин. ${selectedPool.min}`} 
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                style={{ padding: '16px', fontSize: '20px', fontWeight: 600 }}
              />
              <button 
                onClick={() => setStakeAmount(String(selectedPool.coin === 'wcT' ? currentUser.internalBalance : 0))}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: `${selectedPool.color}30`, border: 'none', color: selectedPool.color, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >МАКС</button>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }} onClick={handleStake}>
              Стейкать {selectedPool.coin}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
