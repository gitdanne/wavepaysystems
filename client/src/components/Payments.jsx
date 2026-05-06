import { useState } from 'react';

const categories = [
  { id: 'mobile', name: 'Мобильная связь', icon: '📱', color: '#0ea5e9', providers: ['Beeline', 'Activ', 'Tele2', 'Altel'] },
  { id: 'internet', name: 'Интернет', icon: '🌐', color: '#8b5cf6', providers: ['iDNet', 'Beeline Home', 'Казахтелеком'] },
  { id: 'utilities', name: 'Коммунальные', icon: '💡', color: '#f59e0b', providers: ['АЛЭС', 'Астана-Энергия', 'ТеплоТранзит'] },
  { id: 'transport', name: 'Транспорт', icon: '🚌', color: '#10b981', providers: ['Onay', 'Setpay'] },
  { id: 'education', name: 'Образование', icon: '🎓', color: '#ec4899', providers: ['Kaspi Uni', 'НИШ', 'SDU'] },
  { id: 'government', name: 'Гос. услуги', icon: '🏛️', color: '#6366f1', providers: ['eGov', 'Налоги', 'Штрафы'] },
];

export default function Payments() {
  const [selected, setSelected] = useState(null);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);

  const handlePay = () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setSelected(null);
      setAccount('');
      setAmount('');
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="h2">Платежи</h2>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input className="input-field" placeholder="Поиск услуги..." style={{ paddingLeft: 42 }} />
      </div>

      {/* Categories grid */}
      {!selected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat)}
              className="glass-panel"
              style={{
                padding: '20px 12px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '10px', cursor: 'pointer',
                border: '1px solid var(--border-glass)', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${cat.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 22
              }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected category */}
      {selected && !done && (
        <div style={{ animation: 'slideDown 0.25s ease-out' }}>
          <button
            onClick={() => { setSelected(null); setAccount(''); setAmount(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontWeight: 500 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Назад
          </button>

          <div className="glass-panel" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${selected.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {selected.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600 }}>{selected.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selected.providers.length} провайдеров</p>
              </div>
            </div>

            {/* Providers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {selected.providers.map(p => (
                <div key={p} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', fontSize: 14, fontWeight: 500 }}>
                  {p}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Номер счёта / Лицевой счёт</label>
                <input className="input-field" placeholder="Введите номер" value={account} onChange={e => setAccount(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Сумма</label>
                <input type="number" className="input-field" placeholder="0 WC" value={amount} onChange={e => setAmount(e.target.value)} style={{ fontSize: 20, fontWeight: 600, textAlign: 'center' }} />
              </div>
              <button className="btn btn-primary" style={{ padding: 16, fontSize: 16 }} onClick={handlePay}>
                Оплатить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 24px', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid #10b981' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Оплачено!</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selected?.name} — {amount} WC</p>
        </div>
      )}
    </div>
  );
}
