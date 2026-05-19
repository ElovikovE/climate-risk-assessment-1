import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { emergencyEvents, vulnerableObjects, EmergencyEvent } from '@/data/mockData';

const riskColor = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' };
const riskBg = {
  critical: 'bg-red-500/10 border-red-500/30',
  high: 'bg-orange-500/10 border-orange-500/30',
  medium: 'bg-yellow-500/10 border-yellow-500/30',
  low: 'bg-green-500/10 border-green-500/30',
};
const statusLabel: Record<string, string> = { active: 'Активна', contained: 'Локализована', resolved: 'Ликвидирована' };
const statusColor: Record<string, string> = {
  active: 'text-red-400 bg-red-500/10 border-red-500/30',
  contained: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  resolved: 'text-green-400 bg-green-500/10 border-green-500/30',
};

export default function EmergenciesListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<EmergencyEvent | null>(null);

  const filtered = emergencyEvents.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.region.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getAffectedNames = (ids: string[]) =>
    ids.map(id => vulnerableObjects.find(o => o.id === id)?.name || id);

  return (
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Чрезвычайные ситуации</h1>
            <p className="text-xs text-muted-foreground">Реестр климатических ЧС и их последствий</p>
          </div>
          <button
            onClick={() => onNavigate('emergencies-add')}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            <Icon name="Plus" size={14} />
            Добавить ЧС
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск ЧС..."
              className="w-full bg-background border border-border rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'contained', 'resolved'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded text-xs transition-colors border ${
                  filterStatus === s
                    ? s === 'all'
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : statusColor[s]
                    : 'text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                {s === 'all' ? 'Все' : statusLabel[s]}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground mono ml-auto">{filtered.length} событий</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b border-border">
                {['Событие', 'Тип', 'Дата', 'Регион', 'Тяжесть', 'Ущерб', 'Статус'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(ev => (
                <tr
                  key={ev.id}
                  onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                  className={`cursor-pointer transition-colors ${
                    selected?.id === ev.id ? 'bg-primary/5' : 'hover:bg-secondary/40'
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-[11px] text-muted-foreground">{ev.affectedObjects.length} объект(ов) КУО</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ev.type}</td>
                  <td className="px-4 py-3 text-xs mono">{ev.date}</td>
                  <td className="px-4 py-3 text-xs">{ev.region}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${riskBg[ev.severity]} ${riskColor[ev.severity]}`}>
                      {ev.severity === 'critical' ? 'Критич.' : ev.severity === 'high' ? 'Высокий' : ev.severity === 'medium' ? 'Средний' : 'Низкий'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs mono">{ev.economicDamage} млн ₽</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColor[ev.status]}`}>
                      {statusLabel[ev.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-72 border-l border-border flex flex-col shrink-0 animate-slide-up">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium">Детали ЧС</h3>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold leading-tight">{selected.title}</p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded border ${riskBg[selected.severity]} ${riskColor[selected.severity]}`}>
                  {selected.severity === 'critical' ? 'Критический' : selected.severity === 'high' ? 'Высокий' : 'Средний'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border ${statusColor[selected.status]}`}>
                  {statusLabel[selected.status]}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { label: 'Тип', value: selected.type },
                { label: 'Дата', value: selected.date },
                { label: 'Регион', value: selected.region },
                { label: 'Пострадавших', value: selected.casualties > 0 ? selected.casualties + ' чел.' : 'Нет' },
                { label: 'Ущерб', value: selected.economicDamage + ' млн ₽' },
              ].map(row => (
                <div key={row.label} className="flex gap-2">
                  <span className="text-[11px] text-muted-foreground w-24 shrink-0">{row.label}</span>
                  <span className="text-[11px]">{row.value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">КУО в зоне ЧС</p>
              <div className="space-y-1">
                {getAffectedNames(selected.affectedObjects).map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={11} className="text-orange-400 shrink-0" />
                    <p className="text-xs">{name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Описание</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Координаты</p>
              <p className="text-xs mono text-muted-foreground">{selected.lat}° с.ш., {selected.lng}° в.д.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
