import { useState, useContext } from 'react';
import { BankContext } from '../state/BankContext';

export default function Vaults() {
  const { currentUser, fiatCurrency, createDeposit, transferToDeposit, withdrawFromDeposit } = useContext(BankContext);
  
  const [view, setView] = useState('list'); // 'list', 'create', 'agreement', 'detail'
  const [selectedDepId, setSelectedDepId] = useState(null);

  // Detail view state
  const [topupAmount, setTopupAmount] = useState('');

  // Create form state
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);

  const formatMoney = (amount) => {
    return (amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' wcT';
  };

  const deposits = currentUser.deposits || [];
  const selectedDep = deposits.find(d => d.id === selectedDepId);

  // Handlers
  const handleTopup = () => {
    const val = parseFloat(topupAmount);
    if (!isNaN(val) && val > 0 && selectedDepId) {
      if (transferToDeposit(selectedDepId, val)) {
        setTopupAmount('');
      } else {
        alert('Недостаточно средств (WaveCash)!');
      }
    }
  };

  const handleWithdraw = () => {
    if (withdrawFromDeposit(selectedDepId)) {
      setView('list');
      setSelectedDepId(null);
      alert('Средства успешно возвращены на ваш основной кошелек!');
    }
  };

  const startCreate = () => {
    setNewName('');
    setNewTarget('');
    setAgreementChecked(false);
    setView('create');
  };

  const proceedToAgreement = () => {
    if (!newName.trim() || !newTarget || parseFloat(newTarget) <= 0) {
      alert('Введите корректное название и квоту пула');
      return;
    }
    setView('agreement');
  };

  const finalizeCreate = () => {
    if (agreementChecked) {
      createDeposit(newName, newTarget);
      setView('list');
    }
  };

  if (view === 'create') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '15px', fontWeight: 600, textAlign: 'left', padding: 0, cursor: 'pointer' }}>
          ← Назад
        </button>
        <h2 className="h2">Новый DeFi Vault</h2>
        
        <div className="glass-panel">
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Название пула</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Напр., wcT/USDT Liquidity" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Квота пула (wcT)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="50000" 
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Смарт-контракт будет заблокирован до заполнения квоты.</p>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={proceedToAgreement}>Продолжить конфигурацию</button>
        </div>
      </div>
    );
  }

  if (view === 'agreement') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button onClick={() => setView('create')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '15px', fontWeight: 600, textAlign: 'left', padding: 0, cursor: 'pointer' }}>
          ← Назад к параметрам
        </button>
        <h2 className="h2">Vault Contract Terms</h2>
        
        <div className="glass-panel" style={{ border: '1px solid var(--danger-color)', background: 'rgba(244, 63, 94, 0.05)' }}>
          <h3 style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Smart Contract Lock Warning
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            Подписывая этот контракт, вы соглашаетесь с блокировкой ликвидности до достижения целевой квоты.
          </p>
          <ul style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
            <li>Частичное или полное изъятие средств до достижения квоты пула ({formatMoney(newTarget)}) <b>невозможно на уровне контракта</b>.</li>
            <li>Токены остаются заблокированными (Locked) до тех пор, пока прогресс не составит 100%.</li>
            <li>WaveCoin Network не имеет доступа к вашим заблокированным средствам и не может отменить контракт вручную.</li>
          </ul>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
            <input 
              type="checkbox" 
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              style={{ marginTop: '4px', width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              Я полностью осознаю условия и подписываю транзакцию блокировки (Lock-up).
            </span>
          </label>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', opacity: agreementChecked ? 1 : 0.5 }} 
            onClick={finalizeCreate}
            disabled={!agreementChecked}
          >
            Подписать контракт (Deploy)
          </button>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedDep) {
    const progress = Math.min(100, (selectedDep.current / selectedDep.target) * 100);
    const isLocked = selectedDep.current < selectedDep.target;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '15px', fontWeight: 600, textAlign: 'left', padding: 0, cursor: 'pointer' }}>
            ← К списку Vaults
          </button>
        </div>
        
        <div>
          <h2 className="h2" style={{ marginBottom: '4px' }}>{selectedDep.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Smart Contract Status: {isLocked ? 'Locked 🔒' : 'Matured 🔓'}</p>
        </div>

        {/* Target Card */}
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', background: 'var(--accent-gradient)', width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Заблокировано (TVL)</p>
              <h1 className="h1 text-gradient" style={{ fontSize: '28px' }}>{formatMoney(selectedDep.current)}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Квота пула</p>
              <h3 style={{ fontSize: '18px' }}>{formatMoney(selectedDep.target)}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Прогресс: {Math.floor(progress)}%</span>
            <span>Осталось для разлока: {formatMoney(Math.max(0, selectedDep.target - selectedDep.current))}</span>
          </div>
        </div>

        {/* Topup Section */}
        {!isLocked ? null : (
          <div className="glass-panel">
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Добавить ликвидность</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="number" 
                className="input-field" 
                placeholder="Сумма wcT" 
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleTopup}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>
        )}

        {/* Withdraw Section */}
        <div className="glass-panel" style={{ border: isLocked ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Снятие ликвидности</h3>
            {isLocked ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
            )}
          </div>
          
          {isLocked ? (
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', marginBottom: '0' }}>
              Контракт заблокирован. Для разблокировки (Un-lock) необходимо полностью заполнить квоту. Ликвидность недоступна для вывода.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <p style={{ color: 'var(--success-color)', fontSize: '14px' }}>Квота достигнута! Смарт-контракт завершен, средства можно перевести на основной кошелек.</p>
              <button className="btn btn-primary" onClick={handleWithdraw} style={{ width: '100%', background: 'var(--success-color)', borderColor: 'var(--success-color)' }}>Harvest & Withdraw</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // list view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="h2">DeFi Vaults</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-16px' }}>
        Блокируйте средства в смарт-контрактах с целевой квотой.
      </p>

      {deposits.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-color)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>У вас еще нет активных хранилищ</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deposits.map(dep => {
            const progress = Math.min(100, (dep.current / dep.target) * 100);
            return (
              <div key={dep.id} className="glass-panel" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => { setSelectedDepId(dep.id); setView('detail'); setTopupAmount(''); }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', background: 'var(--accent-gradient)', width: `${progress}%` }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{dep.name}</h3>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: progress >= 100 ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {Math.floor(progress)}%
                  </span>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{formatMoney(dep.current)}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>из {formatMoney(dep.target)}</p>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn btn-primary" onClick={startCreate} style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        Создать новый Vault
      </button>
    </div>
  );
}
