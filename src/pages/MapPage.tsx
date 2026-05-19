import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { vulnerableObjects, emergencyEvents } from '@/data/mockData';

const riskColor = { critical: '#f87171', high: '#fb923c', medium: '#facc15', low: '#4ade80' };
const riskLabel = { critical: 'Критический', high: 'Высокий', medium: 'Средний', low: 'Низкий' };

interface MapPageProps {
  initialFilter?: 'objects' | 'emergencies';
}

export default function MapPage({ initialFilter = 'objects' }: MapPageProps) {
  const [filter, setFilter] = useState<'objects' | 'emergencies' | 'both'>(initialFilter);
  const [selected, setSelected] = useState<string | null>(null);

  // Bounding box: Республика Адыгея — lat 43.8-45.2, lng 38.8-40.6
  const mapW = 100, mapH = 60;
  const toX = (lng: number) => ((lng - 38.8) / 1.8) * mapW;
  const toY = (lat: number) => ((45.2 - lat) / 1.4) * mapH;

  const selectedObj = vulnerableObjects.find(o => o.id === selected);
  const selectedEv = emergencyEvents.find(e => e.id === selected);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Карта объектов и ЧС</h1>
          <p className="text-xs text-muted-foreground">Пространственная визуализация климатических рисков</p>
        </div>
        <div className="flex gap-1.5">
          {([
            { id: 'objects', label: 'КУО', icon: 'MapPin' },
            { id: 'emergencies', label: 'ЧС', icon: 'AlertTriangle' },
            { id: 'both', label: 'Всё', icon: 'Layers' },
          ] as const).map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors ${
                filter === f.id
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={f.icon} size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Map */}
        <div className="col-span-3">
          <div className="bg-card border border-border rounded overflow-hidden relative" style={{ height: '500px' }}>
            {/* Grid lines */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* SVG Map */}
            <svg
              viewBox={`0 0 ${mapW} ${mapH}`}
              className="w-full h-full"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {/* Coord grid */}
              {[39.0, 39.5, 40.0, 40.5].map(lng => (
                <line key={lng} x1={toX(lng)} y1={0} x2={toX(lng)} y2={mapH}
                  stroke="hsl(220 15% 16%)" strokeWidth="0.3" />
              ))}
              {[44.0, 44.5, 45.0].map(lat => (
                <line key={lat} x1={0} y1={toY(lat)} x2={mapW} y2={toY(lat)}
                  stroke="hsl(220 15% 16%)" strokeWidth="0.3" />
              ))}

              {/* Emergency zones */}
              {(filter === 'emergencies' || filter === 'both') && emergencyEvents.map(ev => (
                <g key={ev.id}>
                  <circle
                    cx={toX(ev.lng)} cy={toY(ev.lat)}
                    r={3}
                    fill={riskColor[ev.severity]}
                    fillOpacity={0.12}
                    stroke={riskColor[ev.severity]}
                    strokeWidth="0.2"
                    strokeDasharray="0.5 0.5"
                  />
                  <circle
                    cx={toX(ev.lng)} cy={toY(ev.lat)}
                    r={0.8}
                    fill={riskColor[ev.severity]}
                    fillOpacity={ev.status === 'active' ? 0.9 : 0.5}
                    className="cursor-pointer"
                    onClick={() => setSelected(selected === ev.id ? null : ev.id)}
                  />
                  {selected === ev.id && (
                    <circle cx={toX(ev.lng)} cy={toY(ev.lat)} r={1.4}
                      fill="none" stroke={riskColor[ev.severity]} strokeWidth="0.4" />
                  )}
                </g>
              ))}

              {/* Vulnerable objects */}
              {(filter === 'objects' || filter === 'both') && vulnerableObjects.map(obj => (
                <g key={obj.id}>
                  <rect
                    x={toX(obj.lng) - 0.7} y={toY(obj.lat) - 0.7}
                    width={1.4} height={1.4}
                    fill={riskColor[obj.riskLevel]}
                    fillOpacity={obj.riskLevel === 'critical' || obj.riskLevel === 'high' ? 0.9 : 0.6}
                    className="cursor-pointer"
                    onClick={() => setSelected(selected === obj.id ? null : obj.id)}
                  />
                  {selected === obj.id && (
                    <rect
                      x={toX(obj.lng) - 1.2} y={toY(obj.lat) - 1.2}
                      width={2.4} height={2.4}
                      fill="none"
                      stroke={riskColor[obj.riskLevel]}
                      strokeWidth="0.4"
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-background/90 border border-border rounded p-3 space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Уровень риска</p>
              {(['critical', 'high', 'medium', 'low'] as const).map(level => (
                <div key={level} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: riskColor[level] }} />
                  <span className="text-[10px] text-muted-foreground">{riskLabel[level]}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-white/60" />
                  <span className="text-[10px] text-muted-foreground">КУО</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                  <span className="text-[10px] text-muted-foreground">Зона ЧС</span>
                </div>
              </div>
            </div>

            {/* Coordinates label */}
            <div className="absolute top-3 right-3 text-[10px] mono text-muted-foreground bg-background/80 px-2 py-1 rounded">
              Республика Адыгея · 38.8°–40.6° в.д. · 43.8°–45.2° с.ш.
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Selected item */}
          {(selectedObj || selectedEv) && (
            <div className="bg-card border border-border rounded p-3 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {selectedObj ? 'Объект КУО' : 'Событие ЧС'}
                </p>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={12} />
                </button>
              </div>
              {selectedObj && (
                <div>
                  <p className="text-sm font-medium">{selectedObj.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedObj.type}</p>
                  <p className="text-xs mt-2">{selectedObj.region}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${selectedObj.riskScore}%`,
                        backgroundColor: riskColor[selectedObj.riskLevel],
                      }} />
                    </div>
                    <span className="text-xs mono" style={{ color: riskColor[selectedObj.riskLevel] }}>
                      {selectedObj.riskScore}
                    </span>
                  </div>
                </div>
              )}
              {selectedEv && (
                <div>
                  <p className="text-sm font-medium">{selectedEv.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedEv.type}</p>
                  <p className="text-xs mt-1">{selectedEv.date} · {selectedEv.region}</p>
                  <p className="text-xs text-muted-foreground mt-2">{selectedEv.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Object list */}
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {filter === 'emergencies' ? 'ЧС' : 'КУО на карте'}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {(filter !== 'emergencies' ? vulnerableObjects : []).map(obj => (
                <button
                  key={obj.id}
                  onClick={() => setSelected(selected === obj.id ? null : obj.id)}
                  className={`w-full text-left px-3 py-2 transition-colors ${selected === obj.id ? 'bg-primary/10' : 'hover:bg-secondary/40'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: riskColor[obj.riskLevel] }} />
                    <p className="text-[11px] truncate">{obj.name}</p>
                  </div>
                </button>
              ))}
              {(filter !== 'objects' ? emergencyEvents : []).map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelected(selected === ev.id ? null : ev.id)}
                  className={`w-full text-left px-3 py-2 transition-colors ${selected === ev.id ? 'bg-primary/10' : 'hover:bg-secondary/40'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: riskColor[ev.severity] }} />
                    <p className="text-[11px] truncate">{ev.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}