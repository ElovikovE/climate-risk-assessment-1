import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { vulnerableObjects, VulnerableObject } from '@/data/mockData';

const riskColor = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};
const riskBg = {
  critical: 'bg-red-500/10 border-red-500/30',
  high: 'bg-orange-500/10 border-orange-500/30',
  medium: 'bg-yellow-500/10 border-yellow-500/30',
  low: 'bg-green-500/10 border-green-500/30',
};
const riskLabel = { critical: 'Критический', high: 'Высокий', medium: 'Средний', low: 'Низкий' };

export default function ObjectsListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selected, setSelected] = useState<VulnerableObject | null>(null);

  const filtered = vulnerableObjects.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.region.toLowerCase().includes(search.toLowerCase()) ||
      o.type.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === 'all' || o.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  return (
    <div className="flex h-full animate-fade-in">
      {/* List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Климатически уязвимые объекты</h1>
            <p className="text-xs text-muted-foreground">Каталог объектов с оценкой риска</p>
          </div>
          <button
            onClick={() => onNavigate('objects-add')}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            <Icon name="Plus" size={14} />
            Добавить КУО
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск объектов..."
              className="w-full bg-background border border-border rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  filterRisk === r
                    ? r === 'all' ? 'bg-primary/20 text-primary border border-primary/40'
                    : `border ${riskBg[r as keyof typeof riskBg]} ${riskColor[r as keyof typeof riskColor]}`
                    : 'text-muted-foreground border border-transparent hover:border-border'
                }`}
              >
                {r === 'all' ? 'Все' : riskLabel[r]}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground mono ml-auto">{filtered.length} объектов</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b border-border">
                {['Объект', 'Тип', 'Регион', 'Угрозы', 'Индекс риска', 'Уровень'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(obj => (
                <tr
                  key={obj.id}
                  onClick={() => setSelected(selected?.id === obj.id ? null : obj)}
                  className={`cursor-pointer transition-colors ${
                    selected?.id === obj.id ? 'bg-primary/5' : 'hover:bg-secondary/40'
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{obj.name}</p>
                    <p className="text-[11px] text-muted-foreground">{obj.address}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{obj.type}</td>
                  <td className="px-4 py-3 text-xs">{obj.region}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {obj.threats.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                      {obj.threats.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{obj.threats.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            obj.riskLevel === 'critical' ? 'bg-red-400' :
                            obj.riskLevel === 'high' ? 'bg-orange-400' :
                            obj.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${obj.riskScore}%` }}
                        />
                      </div>
                      <span className={`text-sm mono font-medium ${riskColor[obj.riskLevel]}`}>{obj.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded border ${riskBg[obj.riskLevel]} ${riskColor[obj.riskLevel]}`}>
                      {riskLabel[obj.riskLevel]}
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
            <h3 className="text-sm font-medium">Детали объекта</h3>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-base font-semibold leading-tight">{selected.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded border inline-block mt-1.5 ${riskBg[selected.riskLevel]} ${riskColor[selected.riskLevel]}`}>
                {riskLabel[selected.riskLevel]} риск
              </span>
            </div>

            <div className="space-y-1.5">
              {[
                { label: 'Тип', value: selected.type },
                { label: 'Регион', value: selected.region },
                { label: 'Адрес', value: selected.address },
                { label: 'Проверка', value: selected.lastInspection },
              ].map(row => (
                <div key={row.label} className="flex gap-2">
                  <span className="text-[11px] text-muted-foreground w-20 shrink-0">{row.label}</span>
                  <span className="text-[11px]">{row.value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Индекс риска</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selected.riskLevel === 'critical' ? 'bg-red-400' :
                      selected.riskLevel === 'high' ? 'bg-orange-400' :
                      selected.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${selected.riskScore}%` }}
                  />
                </div>
                <span className={`text-lg mono font-semibold ${riskColor[selected.riskLevel]}`}>{selected.riskScore}</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Угрозы</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.threats.map(t => (
                  <span key={t} className="text-xs bg-secondary text-foreground px-2 py-1 rounded">{t}</span>
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
