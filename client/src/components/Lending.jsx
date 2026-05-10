import { useState, useContext } from 'react';
import { BankContext, COIN_META } from '../state/BankContext';

export default function Lending({ navigateTo }) {
  const { currentUser, internalBalance } = useContext(BankContext);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAsset, setCollateralAsset] = useState('wcT');
  const [showModal, setShowModal] = useState(false);

  const ltvRatio = 0.6; // 60% Loan to Value
  const borrowRate = 8.5; // 8.5% APR

  const myAssets = [
    { coin: 'wcT', balance: internalBalance || 0, price: 1 },
    ...Object.entries(currentUser?.cryptoWallets || {}).map(([coin, wallet]) => ({
      coin,
      balance: wallet.balance || 0,
      price: wallet.rate || 0
    }))
  ].filter(a => a.balance > 0);

  const selectedCollateral = myAssets.find(a => a.coin === collateralAsset) || myAssets[0];
  const maxBorrow = selectedCollateral ? (selectedCollateral.balance * selectedCollateral.price * ltvRatio) : 0;

  const handleBorrow = () => {
    const amount = parseFloat(borrowAmount);
    if (!amount || amount <= 0) { alert('Введите сумму займа'); return; }
    if (amount > maxBorrow) { alert('Сумма превышает максимально доступную под залог'); return; }
    
    alert(`Вы успешно заняли ${amount} wcT под залог ${((amount / ltvRatio) / selectedCollateral.price).toFixed(4)} ${selectedCollateral.coin}`);
    setBorrowAmount('');
    setShowModal(false);
  };

  const activeLoans = [
    { id: 1, borrowed: 15000, asset: 'wcT', collateral: 0.15, collateralAsset: 'ETH', rate: 8.5, health: 1.8 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 className="h2" style={{ margin: 0 }}>DeFi Займы</h2>
      </header>

      {/* Main Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.15), rgba(255, 107, 129, 0.05))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 165, 2, 0.2)', filter: 'blur(30px)' }}></div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Мгновенные займы под залог крипты</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '80%' }}>Не продавайте активы. Получите WaveCash прямо сейчас под залог вашей криптовалюты.</p>
        <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ffa502, #ff7f50)', boxShadow: '0 4px 15px rgba(255, 165, 2, 0.3)' }} onClick={() => setShowModal(true)}>Взять займ</button>
      </div>

      {/* Active Loans */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Активные займы</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeLoans.map(loan => (
            <div key={loan.id} className="glass-panel" style={{ padding: '16px', borderLeft: '3px solid #ffa502' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Вы заняли</p>
                  <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{loan.borrowed.toLocaleString()} {loan.asset}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Залог</p>
                  <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{loan.collateral} {loan.collateralAsset}</h4>
                </div>
              </div>
              <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ставка (APR)</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffa502' }}>{loan.rate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Фактор здоровья</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '80px', height: '6px', background: 'var(--bg-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, loan.health * 50)}%`, height: '100%', background: loan.health > 1.5 ? 'var(--success-color)' : 'var(--danger-color)' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: loan.health > 1.5 ? 'var(--success-color)' : 'var(--danger-color)' }}>{loan.health}</span>
                  </div>
                </div>
              </div>
              <button style={{ width: '100%', padding: '10px', marginTop: '12px', background: 'rgba(255, 165, 2, 0.1)', color: '#ffa502', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Погасить займ</button>
            </div>
          ))}
        </div>
      </div>

      {/* Borrow Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ width: '100%', background: 'var(--bg-dark)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Новый займ</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--bg-glass)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
            </div>

            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Актив для залога</label>
            <select 
              value={collateralAsset} 
              onChange={e => setCollateralAsset(e.target.value)} 
              className="input-field" 
              style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-glass)', color: 'white' }}
            >
              {myAssets.map(a => (
                <option key={a.coin} value={a.coin} style={{ color: 'black' }}>
                  {a.coin} — Доступно: {a.balance.toFixed(a.coin === 'wcT' ? 2 : 4)}
                </option>
              ))}
            </select>

            <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Макс. займ (60% LTV)</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{maxBorrow.toFixed(2)} wcT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Процентная ставка</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffa502' }}>{borrowRate}% APR</span>
              </div>
            </div>

            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Сумма займа (wcT)</label>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0.00" 
                value={borrowAmount}
                onChange={e => setBorrowAmount(e.target.value)}
                style={{ padding: '16px', fontSize: '20px', fontWeight: 600 }}
              />
              <button 
                onClick={() => setBorrowAmount(maxBorrow.toFixed(2))}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 165, 2, 0.2)', border: 'none', color: '#ffa502', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >МАКС</button>
            </div>

            {borrowAmount > 0 && borrowAmount <= maxBorrow && (
              <p style={{ fontSize: '12px', color: 'var(--success-color)', textAlign: 'center', marginBottom: '16px' }}>
                Будет заблокировано: {((borrowAmount / ltvRatio) / selectedCollateral.price).toFixed(6)} {selectedCollateral.coin}
              </p>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #ffa502, #ff7f50)', boxShadow: '0 4px 15px rgba(255, 165, 2, 0.3)' }} onClick={handleBorrow}>
              Получить займ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
