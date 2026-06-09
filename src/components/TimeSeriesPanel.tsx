import { useMemo, useState } from 'react';
import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Label,
} from 'recharts';
import Icon from '@/components/ui/icon';
import {
  timeSeriesData, metricConfigs, vulnerableObjects,
  type MetricKey, type TimeSeriesPoint,
} from '@/data/mockData';

const METRIC_KEYS: MetricKey[] = ['waterLevel', 'temperature', 'precipitation', 'riskScore'];
const DANGER_COLORS: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#facc15',
};

function dangerLevel(value: number, threshold: number): 'critical' | 'high' | 'medium' | null {
  const ratio = value / threshold;
  if (ratio >= 1.3) return 'critical';
  if (ratio >= 1.0) return 'high';
  if (ratio >= 0.85) return 'medium';
  return null;
}

interface ExceedanceEvent {
  date: string;
  value: number;
  threshold: number;
  danger: 'critical' | 'high' | 'medium';
  duration: number;
}

function findExceedances(series: TimeSeriesPoint[], metric: MetricKey, threshold: number): ExceedanceEvent[] {
  const events: ExceedanceEvent[] = [];
  let streak = 0;
  let streakStart = '';
  let streakMax = 0;

  for (let i = 0; i < series.length; i++) {
    const val = series[i][metric] as number;
    const d = dangerLevel(val, threshold);
    if (d) {
      if (streak === 0) streakStart = series[i].date;
      streak++;
      if (val > streakMax) streakMax = val;
    } else if (streak > 0) {
      const dl = dangerLevel(streakMax, threshold)!;
      events.push({ date: streakStart, value: +streakMax.toFixed(2), threshold, danger: dl, duration: streak });
      streak = 0; streakMax = 0;
    }
  }
  if (streak > 0) {
    const dl = dangerLevel(streakMax, threshold)!;
    events.push({ date: streakStart, value: +streakMax.toFixed(2), threshold, danger: dl, duration: streak });
  }
  return events;
}

function calcExceedanceProbability(series: TimeSeriesPoint[], metric: MetricKey, threshold: number): number {
  const above = series.filter(p => (p[metric] as number) >= threshold).length;
  return above / series.length;
}

function buildCdfData(series: TimeSeriesPoint[], metric: MetricKey) {
  const vals = series.map(p => p[metric] as number).sort((a, b) => a - b);
  const n = vals.length;
  const step = Math.ceil(n / 40);
  const points: { x: number; cdf: number }[] = [];
  for (let i = 0; i < n; i += step) {
    points.push({ x: +vals[i].toFixed(2), cdf: +((i + 1) / n * 100).toFixed(1) });
  }
  points.push({ x: +vals[n - 1].toFixed(2), cdf: 100 });
  return points;
}

const CustomTooltip = ({ active, payload, label, unit, threshold }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string; threshold: number }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const danger = val != null ? dangerLevel(val, threshold) : null;
  return (
    <div className="bg-background border border-border rounded p-2.5 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold" style={{ color: danger ? DANGER_COLORS[danger] : '#e2e8f0' }}>
        {val} {unit}
      </p>
      {danger && <p className="mt-1" style={{ color: DANGER_COLORS[danger] }}>⚠ Превышение порога</p>}
    </div>
  );
};

export default function TimeSeriesPanel() {
  const [selectedObj, setSelectedObj] = useState(vulnerableObjects[0].id);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('waterLevel');

  const series = useMemo(() => timeSeriesData[selectedObj] ?? [], [selectedObj]);
  const cfg = metricConfigs[selectedMetric];
  const exceedances = useMemo(() => findExceedances(series, selectedMetric, cfg.threshold), [series, selectedMetric, cfg.threshold]);
  const exceedProb = useMemo(() => calcExceedanceProbability(series, selectedMetric, cfg.threshold), [series, selectedMetric, cfg.threshold]);
  const cdfData = useMemo(() => buildCdfData(series, selectedMetric), [series, selectedMetric]);

  const chartColor = cfg.color;

  return (
    <div className="space-y-6">
      {/* Заголовок + выбор объекта/показателя */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon name="TrendingUp" size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold">Анализ временного ряда</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={selectedObj}
            onChange={e => setSelectedObj(e.target.value)}
            className="text-xs bg-secondary border border-border rounded px-3 py-1.5 text-foreground"
          >
            {vulnerableObjects.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <div className="flex rounded border border-border overflow-hidden">
            {METRIC_KEYS.map(k => (
              <button
                key={k}
                onClick={() => setSelectedMetric(k)}
                className={`px-3 py-1.5 text-xs transition-colors border-r border-border last:border-r-0 ${
                  selectedMetric === k
                    ? 'text-background font-medium'
                    : 'text-muted-foreground hover:text-foreground bg-transparent'
                }`}
                style={selectedMetric === k ? { background: metricConfigs[k].color } : {}}
              >
                {metricConfigs[k].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Временной ряд */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">{cfg.label} — 2021–2025</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Пороговое значение: <span style={{ color: chartColor }}>{cfg.threshold} {cfg.unit}</span> ({cfg.thresholdLabel})
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Превышений</p>
            <p className="text-xl font-bold mono" style={{ color: exceedances.length > 0 ? '#f87171' : '#4ade80' }}>{exceedances.length}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2533" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={v => v.slice(0, 7)}
              interval={5}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit={cfg.unit ? ` ${cfg.unit}` : ''} width={52} />
            <Tooltip content={<CustomTooltip unit={cfg.unit} threshold={cfg.threshold} />} />
            <ReferenceLine y={cfg.threshold} stroke="#f87171" strokeDasharray="5 3" strokeWidth={1.5}>
              <Label value={cfg.thresholdLabel} position="insideTopRight" style={{ fill: '#f87171', fontSize: 10 }} />
            </ReferenceLine>
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={chartColor}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Таблица событий */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Icon name="AlertTriangle" size={14} className="text-orange-400" />
          <span className="text-sm font-medium">События превышения порога</span>
          <span className="ml-auto text-xs text-muted-foreground">{exceedances.length} событий</span>
        </div>
        {exceedances.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Icon name="CheckCircle" size={20} className="text-green-400" />
            Превышений порога не выявлено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Дата начала</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Макс. значение</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Порог</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Продолжительность</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Уровень опасности</th>
                </tr>
              </thead>
              <tbody>
                {exceedances.map((ev, i) => {
                  const dc = DANGER_COLORS[ev.danger];
                  const dangerLabel = ev.danger === 'critical' ? 'Критический' : ev.danger === 'high' ? 'Высокий' : 'Средний';
                  return (
                    <tr key={i} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="py-2.5 px-4 text-xs mono">{ev.date}</td>
                      <td className="py-2.5 px-4 text-xs mono text-right font-medium" style={{ color: dc }}>
                        {ev.value} {cfg.unit}
                      </td>
                      <td className="py-2.5 px-4 text-xs mono text-right text-muted-foreground">
                        {ev.threshold} {cfg.unit}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-right text-muted-foreground">
                        {ev.duration} мес.
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ color: dc, background: dc + '22', border: `1px solid ${dc}44` }}
                        >
                          {dangerLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Функция распределения + вероятность */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="BarChart2" size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium">Функция распределения</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cdfData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2533" />
              <XAxis dataKey="x" tick={{ fill: '#64748b', fontSize: 10 }} unit={cfg.unit ? ` ${cfg.unit}` : ''} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit="%" width={38} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'CDF']}
                contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <ReferenceLine x={cfg.threshold} stroke="#f87171" strokeDasharray="4 2" strokeWidth={1.5}>
                <Label value="Порог" position="top" style={{ fill: '#f87171', fontSize: 10 }} />
              </ReferenceLine>
              <Area
                type="monotone"
                dataKey="cdf"
                stroke={chartColor}
                fill={chartColor + '22'}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Percent" size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium">Вероятность превышения</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">На следующий год (оценка)</p>
              <div
                className="text-4xl font-bold mono"
                style={{ color: exceedProb > 0.4 ? '#f87171' : exceedProb > 0.2 ? '#fb923c' : '#4ade80' }}
              >
                {(exceedProb * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                на основе 60 мес. исторических наблюдений
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Месяцев выше порога', value: `${series.filter(p => (p[selectedMetric] as number) >= cfg.threshold).length} из ${series.length}` },
                { label: 'Макс. значение за период', value: `${Math.max(...series.map(p => p[selectedMetric] as number)).toFixed(2)} ${cfg.unit}` },
                { label: 'Среднее значение', value: `${(series.reduce((s, p) => s + (p[selectedMetric] as number), 0) / series.length).toFixed(2)} ${cfg.unit}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="mono font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div
              className="rounded p-3 text-xs leading-relaxed"
              style={{
                background: exceedProb > 0.4 ? '#f8717120' : exceedProb > 0.2 ? '#fb923c20' : '#4ade8020',
                color: exceedProb > 0.4 ? '#f87171' : exceedProb > 0.2 ? '#fb923c' : '#4ade80',
              }}
            >
              {exceedProb > 0.4
                ? 'Высокая вероятность превышения — рекомендуется заблаговременная подготовка.'
                : exceedProb > 0.2
                ? 'Умеренная вероятность — усиленный мониторинг в пиковые периоды.'
                : 'Низкая вероятность превышения порога в следующем году.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}