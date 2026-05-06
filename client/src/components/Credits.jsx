import { useState, useContext } from 'react';
import { BankContext } from '../state/BankContext';

export default function Credits({ navigateTo }) {
  const { currentUser, fiatCurrency, applyCredit, payCredit } = useContext(BankContext);
  
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'new'
  const [amount, setAmount] = useState(100000);
  const [term, setTerm] = useState(12);
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [payModal, setPayModal] = useState(null); // { creditId, remainingAmount }
  const [payAmount, setPayAmount] = useState('');
  const [fromCard, setFromCard] = useState('');

  const formatMoney = (val) => (val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' WC';

  // Калькулятор аннуитета
  const annualRate = 18;
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = Math.round(
    amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
  );

  const handleApply = async () => {
    setIsApplying(true);
    const res = await applyCredit(amount, term);
    setIsApplying(false);
    if (res) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('list');
      }, 2500);
    } else {
      alert('Ошибка при оформлении кредита');
    }
  };

  const handlePay = async () => {
    if (!fromCard || !payAmount || parseFloat(payAmount) <= 0) {
      alert('Заполните все поля');
      return;
    }
    const res = await payCredit(payModal.creditId, parseFloat(payAmount), parseInt(fromCard, 10));
    if (res) {
      setPayModal(null);
      setPayAmount('');
      setFromCard('');
    } else {
      alert('Ошибка при оплате (недостаточно средств?)');
    }
  };

  const credits = currentUser?.credits || [];
  const activeCredits = credits.filter(c => c.status === 'active');
  const paidCredits = credits.filter(c => c.status === 'paid');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h2 className="h2" style={{ margin: 0 }}>Кредиты</h2>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', borderRadius: '16px', padding: '4px', border: '1px solid var(--border-glass)' }}>
        <button 
          onClick={() => setActiveTab('list')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'list' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'list' ? 'white' : 'var(--text-secondary)' }}
        >
          Мои кредиты
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'new' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'new' ? 'white' : 'var(--text-secondary)' }}
        >
          Оформить
        </button>
      </div>

      {activeTab === 'list' && (
        <div style={{ animation: 'slideDown 0.3s ease-out' }}>
          {activeCredits.length === 0 && paidCredits.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Нет кредитов</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Оформите кредит наличными онлайн за пару минут</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('new')}>Оформить кредит</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeCredits.map(c => {
                const total = c.monthlyPayment * c.term;
                const paid = total - c.remainingAmount;
                const progress = (paid / total) * 100;
                
                return (
                  <div key={c._id} className="glass-panel" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: 1 }}>Активный кредит</span>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{formatMoney(c.amount)}</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ставка</span>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{c.interestRate}%</p>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Остаток долга</span>
                        <span style={{ fontWeight: 600 }}>{formatMoney(c.remainingAmount)}</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
                        <span>Выплачено: {formatMoney(paid)}</span>
                        <span>Всего: {formatMoney(total)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ежемесячный платёж</span>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#f59e0b' }}>{formatMoney(c.monthlyPayment)}</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setPayModal({ creditId: c._id, remainingAmount: c.remainingAmount, monthlyPayment: c.monthlyPayment })}>
                        Оплатить
                      </button>
                    </div>
                  </div>
                );
              })}

              {paidCredits.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, marginTop: 8 }}>Погашенные</h3>
                  {paidCredits.map(c => (
                    <div key={c._id} className="glass-panel" style={{ padding: 16, opacity: 0.7 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 600 }}>Кредит {formatMoney(c.amount)}</h4>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Погашен</span>
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div style={{ animation: 'slideDown 0.3s ease-out' }}>
          {success ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.3s' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Кредит одобрен!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Деньги зачислены на вашу Electronic карту</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24 }}>Кредит наличными</h3>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Сумма кредита</span>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{amount.toLocaleString()} ₸</span>
                </div>
                <input 
                  type="range" 
                  min="50000" 
                  max="5000000" 
                  step="50000" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>50 000 ₸</span>
                  <span>5 000 000 ₸</span>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Срок кредита</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{term} мес.</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="60" 
                  step="3" 
                  value={term} 
                  onChange={(e) => setTerm(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>3 мес</span>
                  <span>60 мес</span>
                </div>
              </div>

              <div style={{ background: 'rgba(14, 165, 233, 0.05)', borderRadius: 16, padding: 16, marginBottom: 24, border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Ежемесячный платёж</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>{formatMoney(monthlyPayment)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Ставка</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{annualRate}% годовых</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Общая выплата</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{formatMoney(monthlyPayment * term)}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: 16, fontSize: 16 }} 
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? 'Оформляем...' : 'Получить деньги'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', marginTop: 12 }}>
                Одобряем 98% заявок за 1 минуту
              </p>
            </div>
          )}
        </div>
      )}

      {/* Модалка оплаты */}
      {payModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: 'var(--bg-glass)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Оплата кредита</h3>
              <button onClick={() => setPayModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 24 }}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Списать с карты</label>
              <select className="input-field" value={fromCard} onChange={e => setFromCard(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: 'black' }}>
                <option value="" disabled>Выберите карту</option>
                {currentUser.cards.map((card, i) => (
                  <option key={i} value={i}>{card.name} (Доступно: {formatMoney(card.balance)})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Сумма оплаты (Остаток долга: {formatMoney(payModal.remainingAmount)})</label>
              <input type="number" className="input-field" placeholder="0 ₸" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 8px', fontSize: 11 }} onClick={() => setPayAmount(payModal.monthlyPayment)}>Ежемесячный платёж</button>
                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 8px', fontSize: 11 }} onClick={() => setPayAmount(payModal.remainingAmount)}>Погасить полностью</button>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 8 }} onClick={handlePay}>
              Оплатить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
