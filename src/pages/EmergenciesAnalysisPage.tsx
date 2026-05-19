import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { emergencyEvents, vulnerableObjects } from '@/data/mockData';

const riskColor = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' };
const riskBg = {
  critical: 'bg-red-500/10 border-red-500/30',
  high: 'bg-orange-500/10 border-orange-500/30',
  medium: 'bg-yellow-500/10 border-yellow-500/30',
  low: 'bg-green-500/10 border-green-500/30',
};
const statusLabel: Record<string, string> = { active: 'Активна', contained: 'Локализована', resolved: 'Ликвидирована' };

export default function EmergenciesAnalysisPage() {
  const [selectedEvent, setSelectedEvent] = useState(emergencyEvents[0]);

  const affectedObjs = selectedEvent.affectedObjects
    .map(id => vulnerableObjects.find(o => o.id === id))
    .filter(Boolean);

  const totalCasualties = emergencyEvents.reduce((s, e) => s + e.casualties, 0);
  const totalDamage = emergencyEvents.reduce((s, e) => s + e.economicDamage, 0);

  const typeStats = emergencyEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Анализ КУО в зоне ЧС</h1>
          <p className="text-xs text-muted-foreground">Оценка воздействия чрезвычайных ситуаций на уязвимые объекты</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'ЧС за период', value: emergencyEvents.length, icon: 'AlertTriangle' },
          { label: 'Активных ЧС', value: emergencyEvents.filter(e => e.status === 'active').length, icon: 'Zap', alert: true },
          { label: 'Суммарный ущерб', value: `${totalDamage} млн ₽`, icon: 'TrendingDown' },
          { label: 'Пострадавших', value: totalCasualties + ' чел.', icon: 'Users' },
        ].map((k, i) => (
          <div key={i} className={`bg-card border ${k.alert ? 'border-orange-500/30' : 'border-border'} rounded p-4`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name={k.icon} size={13} className={k.alert ? 'text-orange-400' : 'text-muted-foreground'} />
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </div>
            <p className={`text-2xl mono font-semibold ${k.alert ? 'text-orange-400' : ''}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Event selector */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Выберите ЧС</p>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {emergencyEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`w-full text-left px-3 py-3 transition-colors ${
                  selectedEvent.id === ev.id ? 'bg-primary/10' : 'hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-1 h-full min-h-8 rounded-full shrink-0 mt-0.5 ${
                    ev.severity === 'critical' ? 'bg-red-400' :
                    ev.severity === 'high' ? 'bg-orange-400' :
                    ev.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{ev.title}</p>
                    <p className="text-[10px] text-muted-foreground">{ev.date} · {ev.region}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ev.affectedObjects.length} КУО в зоне</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="col-span-2 space-y-4">
          {/* Event card */}
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">{selectedEvent.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedEvent.type} · {selectedEvent.date}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${riskBg[selectedEvent.severity]} ${riskColor[selectedEvent.severity]}`}>
                    {selectedEvent.severity === 'critical' ? 'Критическая' : selectedEvent.severity === 'high' ? 'Высокая тяжесть' : 'Средняя тяжесть'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    selectedEvent.status === 'active' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                    selectedEvent.status === 'contained' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                    'text-green-400 bg-green-500/10 border-green-500/30'
                  }`}>
                    {statusLabel[selectedEvent.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-sm">{selectedEvent.description}</p>
              </div>
              <div className="shrink-0 text-right space-y-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Ущерб</p>
                  <p className="text-xl mono font-semibold">{selectedEvent.economicDamage} <span className="text-sm font-normal">млн ₽</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Пострадавших</p>
                  <p className="text-xl mono font-semibold">{selectedEvent.casualties} <span className="text-sm font-normal">чел.</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Affected objects */}
          <div className="bg-card border border-border rounded p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              КУО в зоне поражения · {affectedObjs.length} объектов
            </p>
            {affectedObjs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Нет привязанных объектов КУО</p>
            ) : (
              <div className="space-y-3">
                {affectedObjs.map(obj => obj && (
                  <div key={obj.id} className="flex items-center gap-3 p-3 bg-background rounded border border-border">
                    <div className={`w-2 h-10 rounded-full shrink-0 ${
                      obj.riskLevel === 'critical' ? 'bg-red-400' :
                      obj.riskLevel === 'high' ? 'bg-orange-400' :
                      obj.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{obj.name}</p>
                      <p className="text-xs text-muted-foreground">{obj.type} · {obj.region}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg mono font-semibold ${riskColor[obj.riskLevel]}`}>{obj.riskScore}</p>
                      <p className="text-[10px] text-muted-foreground">индекс риска</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type stats */}
      <div className="bg-card border border-border rounded p-5">
        <p className="text-sm font-medium mb-4">Частота ЧС по типу</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
          {Object.entries(typeStats).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-xs w-44 truncate">{type}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full"
                  style={{ width: `${(count / emergencyEvents.length) * 100}%` }}
                />
              </div>
              <span className="text-xs mono text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
