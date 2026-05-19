import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { referenceData } from '@/data/mockData';

export default function ReferencePage() {
  const [activeTab, setActiveTab] = useState<'risks' | 'projections'>('risks');
  const [expandedRisk, setExpandedRisk] = useState<string | null>('flood');

  const maxTemp = Math.max(...referenceData.climateProjections.map(p => p.tempAnomaly));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold">Справочник климатических рисков</h1>
        <p className="text-xs text-muted-foreground">Базы знаний по климатическим угрозам и прогнозы изменения климата</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/40 p-1 rounded w-fit">
        {[
          { id: 'risks', label: 'Типы рисков', icon: 'AlertTriangle' },
          { id: 'projections', label: 'Климатические прогнозы', icon: 'TrendingUp' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon} size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'risks' && (
        <div className="space-y-3 animate-fade-in">
          {referenceData.riskTypes.map(risk => (
            <div key={risk.id} className="bg-card border border-border rounded overflow-hidden">
              <button
                onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors"
              >
                <span className="text-2xl">{risk.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{risk.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{risk.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Сезонность</p>
                    <p className="text-xs">{risk.frequency}</p>
                  </div>
                  <Icon
                    name="ChevronDown"
                    size={14}
                    className={`text-muted-foreground transition-transform ${expandedRisk === risk.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {expandedRisk === risk.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-border pt-4 animate-fade-in">
                  <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Индикаторы</p>
                      <ul className="space-y-1.5">
                        {risk.indicators.map(ind => (
                          <li key={ind} className="flex items-center gap-2 text-xs">
                            <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                            {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Зоны риска</p>
                      <div className="flex flex-wrap gap-1.5">
                        {risk.regions.map(r => (
                          <span key={r} className="text-xs bg-secondary text-foreground px-2 py-1 rounded">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'projections' && (
        <div className="space-y-5 animate-fade-in">
          {/* Temp anomaly chart */}
          <div className="bg-card border border-border rounded p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium">Прогноз температурной аномалии</p>
                <p className="text-xs text-muted-foreground">Относительно климатической нормы 1961–1990, °C</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded">
                <Icon name="TrendingUp" size={12} />
                +{referenceData.climateProjections[referenceData.climateProjections.length - 1].tempAnomaly}°C к 2050
              </div>
            </div>
            <div className="flex items-end gap-4 h-40">
              {referenceData.climateProjections.map((p, i) => {
                const height = (p.tempAnomaly / maxTemp) * 100;
                return (
                  <div key={p.year} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs mono text-orange-400">+{p.tempAnomaly}°</span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-orange-600/80 to-orange-400/50"
                        style={{ height: `${height}%`, minHeight: '8px', transition: 'height 0.5s ease' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mono">{p.year}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Precip chart */}
          <div className="bg-card border border-border rounded p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium">Изменение годового количества осадков</p>
                <p className="text-xs text-muted-foreground">% относительно нормы</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded">
                <Icon name="TrendingDown" size={12} />
                {referenceData.climateProjections[referenceData.climateProjections.length - 1].precipChange}% к 2050
              </div>
            </div>
            <div className="flex items-center gap-4">
              {referenceData.climateProjections.map(p => (
                <div key={p.year} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-24 flex flex-col justify-end items-center relative">
                    <div className="w-full absolute top-1/2 border-t border-dashed border-border" />
                    <div
                      className="w-full rounded bg-blue-500/30 border border-blue-500/40 absolute"
                      style={{
                        height: `${Math.abs(p.precipChange) * 2}%`,
                        bottom: '50%',
                      }}
                    />
                  </div>
                  <span className={`text-xs mono ${p.precipChange < 0 ? 'text-blue-400' : 'text-green-400'}`}>{p.precipChange}%</span>
                  <span className="text-[10px] text-muted-foreground mono">{p.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary table */}
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium">Сводная таблица прогнозов</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Год', 'Темп. аномалия, °C', 'Осадки, %', 'Уровень угрозы'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referenceData.climateProjections.map(p => {
                  const threat = p.tempAnomaly >= 3 ? 'Критический' : p.tempAnomaly >= 2.5 ? 'Высокий' : p.tempAnomaly >= 2 ? 'Средний' : 'Умеренный';
                  const threatColor = p.tempAnomaly >= 3 ? 'text-red-400' : p.tempAnomaly >= 2.5 ? 'text-orange-400' : p.tempAnomaly >= 2 ? 'text-yellow-400' : 'text-green-400';
                  return (
                    <tr key={p.year} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 text-sm font-medium mono">{p.year}</td>
                      <td className="px-4 py-3 text-sm mono text-orange-400">+{p.tempAnomaly}</td>
                      <td className="px-4 py-3 text-sm mono text-blue-400">{p.precipChange}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${threatColor}`}>{threat}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
