import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { vulnerableObjects, calcPeu, peuLabel, peuColor, type VulnerableObject } from '@/data/mockData';
import TimeSeriesPanel from '@/components/TimeSeriesPanel';

const typeOptions = ['Все', ...Array.from(new Set(vulnerableObjects.map(o => o.type)))];
const regionOptions = ['Все', ...Array.from(new Set(vulnerableObjects.map(o => o.region)))];

function PeuBadge({ peu }: { peu: number }) {
  const color = peuColor(peu);
  const label = peuLabel(peu);
  return (
    <span
      style={{ color, background: color + '22', border: `1px solid ${color}44` }}
      className="text-xs px-2 py-0.5 rounded font-medium"
    >
      {label}
    </span>
  );
}

function ObjectRow({ obj, onClick }: { obj: VulnerableObject; onClick: () => void }) {
  const peu = calcPeu(obj.economics);
  const pc = peuColor(peu);
  return (
    <tr
      className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="font-medium text-sm">{obj.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{obj.address}</div>
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{obj.type}</td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{obj.region}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${obj.riskScore}%`, background: pc }} />
          </div>
          <span className="text-xs mono" style={{ color: pc }}>{obj.riskScore}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs mono text-right">{peu.toFixed(2)}</td>
      <td className="py-3 px-4"><PeuBadge peu={peu} /></td>
      <td className="py-3 px-4 text-xs text-muted-foreground text-right">{obj.economics.maxDamage.toLocaleString('ru-RU')} млн ₽</td>
      <td className="py-3 px-4 text-xs text-muted-foreground text-right">{obj.economics.insuredDamage.toLocaleString('ru-RU')} млн ₽</td>
    </tr>
  );
}

function DetailModal({ obj, onClose }: { obj: VulnerableObject; onClose: () => void }) {
  const peu = calcPeu(obj.economics);
  const pc = peuColor(peu);
  const e = obj.economics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-lg w-full max-w-lg mx-4 overflow-hidden shadow-2xl"
        onClick={ev => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="font-semibold text-sm">{obj.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{obj.type} · {obj.region}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ПЭУ hero */}
          <div className="rounded-lg border p-4 flex items-center justify-between" style={{ borderColor: pc + '44', background: pc + '0d' }}>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Показатель экономической уязвимости</div>
              <div className="text-3xl font-bold mono" style={{ color: pc }}>{peu.toFixed(3)}</div>
              <div className="text-xs mt-1" style={{ color: pc }}>{peuLabel(peu)} уязвимость</div>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-0.5">
              <div>ПЭУ = (У − С) / (Р + В)</div>
              <div>= ({e.maxDamage} − {e.insuredDamage}) / ({e.reserves} + {e.annualRevenue})</div>
              <div className="font-medium" style={{ color: pc }}>= {(e.maxDamage - e.insuredDamage)} / {e.reserves + e.annualRevenue}</div>
            </div>
          </div>

          {/* Параметры */}
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Параметры расчёта</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'У — максимально возможный ущерб', value: e.maxDamage, unit: 'млн ₽', color: '#f87171' },
                { label: 'С — застрахованный ущерб', value: e.insuredDamage, unit: 'млн ₽', color: '#4ade80' },
                { label: 'Р — финансовые резервы', value: e.reserves, unit: 'млн ₽', color: '#60a5fa' },
                { label: 'В — годовая выручка / финансирование', value: e.annualRevenue, unit: 'млн ₽', color: '#a78bfa' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="bg-secondary/30 rounded p-3">
                  <div className="text-[10px] text-muted-foreground leading-tight mb-1.5">{label}</div>
                  <div className="text-lg font-semibold mono" style={{ color }}>{value.toLocaleString('ru-RU')}</div>
                  <div className="text-[10px] text-muted-foreground">{unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Угрозы */}
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Климатические угрозы</div>
            <div className="flex flex-wrap gap-1.5">
              {obj.threats.map(t => (
                <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>

          {/* Описание */}
          <div className="text-xs text-muted-foreground leading-relaxed">{obj.description}</div>
        </div>
      </div>
    </div>
  );
}

export default function RiskAssessmentPage() {
  const [typeFilter, setTypeFilter] = useState('Все');
  const [regionFilter, setRegionFilter] = useState('Все');
  const [sortBy, setSortBy] = useState<'peu' | 'risk'>('peu');
  const [selectedObj, setSelectedObj] = useState<VulnerableObject | null>(null);

  const rows = useMemo(() => {
    return vulnerableObjects
      .filter(o => (typeFilter === 'Все' || o.type === typeFilter) && (regionFilter === 'Все' || o.region === regionFilter))
      .sort((a, b) => sortBy === 'peu'
        ? calcPeu(b.economics) - calcPeu(a.economics)
        : b.riskScore - a.riskScore
      );
  }, [typeFilter, regionFilter, sortBy]);

  const avgPeu = useMemo(() => {
    if (!rows.length) return 0;
    return rows.reduce((s, o) => s + calcPeu(o.economics), 0) / rows.length;
  }, [rows]);

  const peuGroups = useMemo(() => ({
    critical: rows.filter(o => calcPeu(o.economics) >= 1.5).length,
    high: rows.filter(o => { const p = calcPeu(o.economics); return p >= 0.8 && p < 1.5; }).length,
    medium: rows.filter(o => { const p = calcPeu(o.economics); return p >= 0.3 && p < 0.8; }).length,
    low: rows.filter(o => calcPeu(o.economics) < 0.3).length,
  }), [rows]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Объектов КУО', value: rows.length, color: '#94a3b8', icon: 'MapPin' },
          { label: 'Средний ПЭУ', value: avgPeu.toFixed(2), color: peuColor(avgPeu), icon: 'TrendingUp' },
          { label: 'Критическая уязвимость', value: peuGroups.critical, color: '#f87171', icon: 'AlertOctagon' },
          { label: 'Высокая уязвимость', value: peuGroups.high, color: '#fb923c', icon: 'AlertTriangle' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon name={icon} size={14} style={{ color }} />
            </div>
            <div className="text-2xl font-bold mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="text-xs bg-secondary border border-border rounded px-3 py-1.5 text-foreground"
        >
          {typeOptions.map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          className="text-xs bg-secondary border border-border rounded px-3 py-1.5 text-foreground"
        >
          {regionOptions.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          Сортировать:
          <button
            onClick={() => setSortBy('peu')}
            className={`px-3 py-1.5 rounded border transition-colors ${sortBy === 'peu' ? 'bg-primary/10 text-primary border-primary/30' : 'border-border hover:text-foreground'}`}
          >
            по ПЭУ
          </button>
          <button
            onClick={() => setSortBy('risk')}
            className={`px-3 py-1.5 rounded border transition-colors ${sortBy === 'risk' ? 'bg-primary/10 text-primary border-primary/30' : 'border-border hover:text-foreground'}`}
          >
            по риску
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Объект</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Тип</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Район</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Балл риска</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">ПЭУ</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Уязвимость</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Макс. ущерб (У)</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Страховка (С)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(obj => (
                <ObjectRow key={obj.id} obj={obj} onClick={() => setSelectedObj(obj)} />
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">Нет объектов по выбранным фильтрам</div>
        )}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">ПЭУ = (У − С) / (Р + В)</span>
        {[
          { label: 'Критическая ≥ 1.5', color: '#f87171' },
          { label: 'Высокая ≥ 0.8', color: '#fb923c' },
          { label: 'Средняя ≥ 0.3', color: '#facc15' },
          { label: 'Низкая < 0.3', color: '#4ade80' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Временной ряд */}
      <div className="border-t border-border pt-6">
        <TimeSeriesPanel />
      </div>

      {selectedObj && <DetailModal obj={selectedObj} onClose={() => setSelectedObj(null)} />}
    </div>
  );
}