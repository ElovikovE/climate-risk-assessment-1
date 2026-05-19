import Icon from '@/components/ui/icon';
import { vulnerableObjects, emergencyEvents } from '@/data/mockData';

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

const criticalCount = vulnerableObjects.filter(o => o.riskLevel === 'critical').length;
const highCount = vulnerableObjects.filter(o => o.riskLevel === 'high').length;
const activeEmergencies = emergencyEvents.filter(e => e.status === 'active').length;
const totalDamage = emergencyEvents.reduce((s, e) => s + e.economicDamage, 0);

export default function DashboardPage() {
  const recentEvents = [...emergencyEvents].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const topRisk = [...vulnerableObjects].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Обзор системы</h1>
          <p className="text-sm text-muted-foreground mono">19 мая 2026 · 09:41 МСК</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Система активна
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Объектов КУО', value: vulnerableObjects.length, icon: 'MapPin', sub: `${criticalCount} критических` },
          { label: 'Активных ЧС', value: activeEmergencies, icon: 'AlertTriangle', sub: 'требуют внимания', alert: true },
          { label: 'Ущерб, млн ₽', value: totalDamage.toLocaleString(), icon: 'TrendingDown', sub: 'за текущий период' },
          { label: 'Высокий риск', value: criticalCount + highCount, icon: 'ShieldAlert', sub: 'объектов приоритета 1-2' },
        ].map((kpi, i) => (
          <div key={i} className={`bg-card border ${kpi.alert ? 'border-orange-500/40' : 'border-border'} rounded p-4`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <Icon name={kpi.icon} size={14} className={kpi.alert ? 'text-orange-400' : 'text-muted-foreground'} />
            </div>
            <p className={`text-2xl font-semibold mono ${kpi.alert ? 'text-orange-400' : ''}`}>{kpi.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Recent emergencies */}
        <div className="col-span-3 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium">Последние ЧС</h2>
            <span className="text-[10px] text-muted-foreground mono">{emergencyEvents.length} всего</span>
          </div>
          <div className="divide-y divide-border">
            {recentEvents.map(ev => (
              <div key={ev.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-1.5 h-8 rounded-full shrink-0 ${
                  ev.severity === 'critical' ? 'bg-red-400' :
                  ev.severity === 'high' ? 'bg-orange-400' :
                  ev.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.title}</p>
                  <p className="text-[11px] text-muted-foreground">{ev.region} · {ev.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded border ${riskBg[ev.severity]} ${riskColor[ev.severity]}`}>
                    {ev.status === 'active' ? 'Активна' : ev.status === 'contained' ? 'Локализована' : 'Ликвидирована'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top risk objects */}
        <div className="col-span-2 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Приоритет реагирования</h2>
          </div>
          <div className="p-3 space-y-2">
            {topRisk.map((obj, i) => (
              <div key={obj.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground mono w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{obj.name}</p>
                  <p className="text-[10px] text-muted-foreground">{obj.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        obj.riskLevel === 'critical' ? 'bg-red-400' :
                        obj.riskLevel === 'high' ? 'bg-orange-400' :
                        'bg-yellow-400'
                      }`}
                      style={{ width: `${obj.riskScore}%` }}
                    />
                  </div>
                  <span className={`text-xs mono font-medium ${riskColor[obj.riskLevel]}`}>{obj.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk distribution */}
      <div className="bg-card border border-border rounded p-4">
        <h2 className="text-sm font-medium mb-4">Распределение объектов по уровню риска</h2>
        <div className="flex items-end gap-2 h-24">
          {(['critical', 'high', 'medium', 'low'] as const).map(level => {
            const count = vulnerableObjects.filter(o => o.riskLevel === level).length;
            const pct = (count / vulnerableObjects.length) * 100;
            return (
              <div key={level} className="flex-1 flex flex-col items-center gap-1.5">
                <span className={`text-sm font-semibold mono ${riskColor[level]}`}>{count}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '60px' }}>
                  <div
                    className={`w-full rounded-t ${
                      level === 'critical' ? 'bg-red-400/70' :
                      level === 'high' ? 'bg-orange-400/70' :
                      level === 'medium' ? 'bg-yellow-400/70' : 'bg-green-400/70'
                    }`}
                    style={{ height: `${pct}%`, minHeight: '4px' }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{riskLabel[level]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
