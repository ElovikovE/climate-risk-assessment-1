import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { vulnerableObjects, emergencyEvents } from '@/data/mockData';

const riskColor = {
  critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400',
};
const riskBg = {
  critical: 'bg-red-500/10 border-red-500/30',
  high: 'bg-orange-500/10 border-orange-500/30',
  medium: 'bg-yellow-500/10 border-yellow-500/30',
  low: 'bg-green-500/10 border-green-500/30',
};
const riskLabel = { critical: 'Критический', high: 'Высокий', medium: 'Средний', low: 'Низкий' };

export default function ObjectsAnalysisPage() {
  const [selectedObj, setSelectedObj] = useState(vulnerableObjects[0]);

  const objEmergencies = emergencyEvents.filter(e => e.affectedObjects.includes(selectedObj.id));
  const totalDamage = objEmergencies.reduce((s, e) => s + e.economicDamage, 0);

  const typeStats = vulnerableObjects.reduce((acc, o) => {
    acc[o.type] = (acc[o.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxTypeCount = Math.max(...Object.values(typeStats));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold">Анализ по КУО</h1>
        <p className="text-xs text-muted-foreground">Детальный анализ климатических рисков по объекту</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Object selector */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Выберите объект</p>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {vulnerableObjects.map(obj => (
              <button
                key={obj.id}
                onClick={() => setSelectedObj(obj)}
                className={`w-full text-left px-3 py-2.5 transition-colors ${
                  selectedObj.id === obj.id ? 'bg-primary/10' : 'hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    obj.riskLevel === 'critical' ? 'bg-red-400' :
                    obj.riskLevel === 'high' ? 'bg-orange-400' :
                    obj.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{obj.name}</p>
                    <p className="text-[10px] text-muted-foreground">{obj.type}</p>
                  </div>
                  <span className={`mono text-xs ml-auto shrink-0 ${riskColor[obj.riskLevel]}`}>{obj.riskScore}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis panel */}
        <div className="col-span-2 space-y-4">
          {/* Object card */}
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">{selectedObj.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedObj.type} · {selectedObj.region}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-md">{selectedObj.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-3xl font-semibold mono ${riskColor[selectedObj.riskLevel]}`}>{selectedObj.riskScore}</p>
                <span className={`text-xs px-2 py-0.5 rounded border ${riskBg[selectedObj.riskLevel]} ${riskColor[selectedObj.riskLevel]}`}>
                  {riskLabel[selectedObj.riskLevel]}
                </span>
              </div>
            </div>

            {/* Risk meter */}
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    selectedObj.riskLevel === 'critical' ? 'bg-red-400' :
                    selectedObj.riskLevel === 'high' ? 'bg-orange-400' :
                    selectedObj.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${selectedObj.riskScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">0</span>
                <span className="text-[10px] text-muted-foreground">100</span>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ЧС за период', value: objEmergencies.length, icon: 'AlertTriangle' },
              { label: 'Ущерб, млн ₽', value: totalDamage || '—', icon: 'TrendingDown' },
              { label: 'Последняя проверка', value: selectedObj.lastInspection, icon: 'Calendar' },
            ].map((k, i) => (
              <div key={i} className="bg-card border border-border rounded p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name={k.icon} size={12} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                </div>
                <p className="text-xl font-semibold mono">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Threats */}
          <div className="bg-card border border-border rounded p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Профиль угроз</p>
            <div className="space-y-2">
              {selectedObj.threats.map((t, i) => {
                const intensity = 90 - i * 15;
                return (
                  <div key={t} className="flex items-center gap-3">
                    <span className="text-xs w-32 truncate">{t}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${intensity}%` }}
                      />
                    </div>
                    <span className="text-[10px] mono text-muted-foreground w-6 text-right">{intensity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Related emergencies */}
          {objEmergencies.length > 0 && (
            <div className="bg-card border border-border rounded p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Связанные ЧС</p>
              <div className="space-y-2">
                {objEmergencies.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 py-1">
                    <div className={`w-1 h-8 rounded-full shrink-0 ${
                      ev.severity === 'critical' ? 'bg-red-400' :
                      ev.severity === 'high' ? 'bg-orange-400' :
                      'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{ev.title}</p>
                      <p className="text-[10px] text-muted-foreground">{ev.date} · {ev.type}</p>
                    </div>
                    <span className="text-xs mono text-muted-foreground">{ev.economicDamage} млн ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Type distribution */}
      <div className="bg-card border border-border rounded p-5">
        <p className="text-sm font-medium mb-4">Распределение КУО по типу</p>
        <div className="space-y-2.5">
          {Object.entries(typeStats).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-xs w-36 truncate">{type}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/50 rounded-full"
                  style={{ width: `${(count / maxTypeCount) * 100}%` }}
                />
              </div>
              <span className="text-xs mono text-muted-foreground w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
