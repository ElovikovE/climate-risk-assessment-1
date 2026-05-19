import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '@/components/ui/icon';
import { vulnerableObjects, emergencyEvents, type VulnerableObject, type EmergencyEvent, type RiskLevel } from '@/data/mockData';

const riskColor: Record<RiskLevel, string> = {
  critical: '#f87171',
  high:     '#fb923c',
  medium:   '#facc15',
  low:      '#4ade80',
};
const riskLabel: Record<RiskLevel, string> = {
  critical: 'Критический',
  high:     'Высокий',
  medium:   'Средний',
  low:      'Низкий',
};
const statusLabel: Record<string, string> = {
  active:    'Активная',
  contained: 'Локализована',
  resolved:  'Ликвидирована',
};
const statusColor: Record<string, string> = {
  active:    '#f87171',
  contained: '#fb923c',
  resolved:  '#4ade80',
};

function makeObjIcon(level: RiskLevel) {
  const color = riskColor[level];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <rect x="4" y="4" width="20" height="20" rx="3" fill="${color}" fill-opacity="0.95" stroke="#000" stroke-opacity="0.25" stroke-width="1"/>
    <rect x="8" y="8" width="12" height="12" rx="1.5" fill="#fff" fill-opacity="0.35"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function makeEvIcon(level: RiskLevel, active: boolean) {
  const color = riskColor[level];
  const pulse = active ? `<circle cx="14" cy="14" r="12" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1" stroke-dasharray="3 2"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    ${pulse}
    <circle cx="14" cy="14" r="7" fill="${color}" fill-opacity="${active ? 0.95 : 0.6}" stroke="#000" stroke-opacity="0.2" stroke-width="1"/>
    <circle cx="14" cy="14" r="3" fill="#fff" fill-opacity="0.5"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function objPopup(obj: VulnerableObject): string {
  const color = riskColor[obj.riskLevel];
  const bar = `<div style="height:4px;background:#1e2533;border-radius:2px;overflow:hidden;margin-top:6px">
    <div style="height:100%;width:${obj.riskScore}%;background:${color};border-radius:2px"></div>
  </div>`;
  const threats = obj.threats.map(t =>
    `<span style="display:inline-block;background:#1e2533;color:#94a3b8;font-size:10px;padding:2px 6px;border-radius:3px;margin:2px 2px 0 0">${t}</span>`
  ).join('');
  return `
    <div style="font-family:'IBM Plex Sans',sans-serif;min-width:220px;max-width:280px;color:#e2e8f0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">КУО</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:3px;background:${color}22;color:${color};font-weight:500">${riskLabel[obj.riskLevel]}</span>
      </div>
      <div style="font-size:13px;font-weight:600;line-height:1.3">${obj.name}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:2px">${obj.type} · ${obj.region}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${obj.address}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
        <div style="flex:1">${bar}</div>
        <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:${color}">${obj.riskScore}</span>
      </div>
      <div style="font-size:11px;color:#94a3b8;margin-top:8px;line-height:1.5">${obj.description}</div>
      <div style="margin-top:8px">${threats}</div>
      <div style="font-size:10px;color:#475569;margin-top:8px">Последняя проверка: ${obj.lastInspection}</div>
    </div>`;
}

function evPopup(ev: EmergencyEvent): string {
  const color = riskColor[ev.severity];
  const sc = statusColor[ev.status];
  const affected = ev.affectedObjects.map(id => {
    const o = vulnerableObjects.find(x => x.id === id);
    return o ? `<span style="display:inline-block;background:#1e2533;color:#94a3b8;font-size:10px;padding:2px 6px;border-radius:3px;margin:2px 2px 0 0">${o.name}</span>` : '';
  }).join('');
  return `
    <div style="font-family:'IBM Plex Sans',sans-serif;min-width:220px;max-width:280px;color:#e2e8f0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">ЧС</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:3px;background:${sc}22;color:${sc};font-weight:500">${statusLabel[ev.status]}</span>
      </div>
      <div style="font-size:13px;font-weight:600;line-height:1.3">${ev.title}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:2px">${ev.type} · ${ev.region}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${ev.date}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:8px;line-height:1.5">${ev.description}</div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <div style="font-size:11px;color:#64748b">Ущерб: <span style="color:#e2e8f0;font-family:'IBM Plex Mono',monospace">${ev.economicDamage} млн ₽</span></div>
        ${ev.casualties > 0 ? `<div style="font-size:11px;color:#f87171">Погибших: ${ev.casualties}</div>` : ''}
      </div>
      ${affected ? `<div style="margin-top:8px"><div style="font-size:10px;color:#64748b;margin-bottom:4px">Затронутые объекты:</div>${affected}</div>` : ''}
    </div>`;
}

interface MapPageProps {
  initialFilter?: 'objects' | 'emergencies';
}

export default function MapPage({ initialFilter = 'objects' }: MapPageProps) {
  const [filter, setFilter] = useState<'objects' | 'emergencies' | 'both'>(initialFilter === 'objects' ? 'objects' : 'emergencies');
  const mapRef = useRef<L.Map | null>(null);
  const objLayerRef = useRef<L.LayerGroup | null>(null);
  const evLayerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [44.6, 40.1],
      zoom: 9,
      zoomControl: false,
    });

    // Тайлы КБ «Панорама» — публичный тайловый сервер
    L.tileLayer('https://maps.gisserver.ru/tiles/osm/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://gisserver.ru" target="_blank">КБ Панорама</a> · © OpenStreetMap',
      maxZoom: 18,
      minZoom: 7,
    }).addTo(map);

    // Резервная подложка если Панорама недоступна
    const fallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    });

    // Проверяем доступность тайлов Панорамы
    const testImg = new Image();
    testImg.onerror = () => { fallback.addTo(map); };
    testImg.src = 'https://maps.gisserver.ru/tiles/osm/9/300/190.png';

    // Контролы зума
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Граница Адыгеи — приблизительный полигон
    const adygeaBounds: L.LatLngTuple[] = [
      [44.17, 38.92], [44.40, 39.00], [44.72, 39.00], [44.98, 39.22],
      [45.10, 39.45], [45.05, 39.85], [44.92, 40.22], [44.73, 40.52],
      [44.52, 40.60], [44.30, 40.45], [44.10, 40.20], [43.90, 40.00],
      [43.85, 39.60], [43.90, 39.20], [44.05, 38.95], [44.17, 38.92],
    ];
    L.polygon(adygeaBounds, {
      color: '#3b82f6',
      weight: 2,
      opacity: 0.6,
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      dashArray: '6 4',
    }).addTo(map);

    // Слои
    const objLayer = L.layerGroup();
    const evLayer = L.layerGroup();

    vulnerableObjects.forEach(obj => {
      const marker = L.marker([obj.lat, obj.lng], { icon: makeObjIcon(obj.riskLevel) });
      marker.bindPopup(objPopup(obj), {
        className: 'panorama-popup',
        maxWidth: 300,
        minWidth: 220,
      });
      marker.addTo(objLayer);
    });

    emergencyEvents.forEach(ev => {
      const marker = L.marker([ev.lat, ev.lng], { icon: makeEvIcon(ev.severity, ev.status === 'active') });
      marker.bindPopup(evPopup(ev), {
        className: 'panorama-popup',
        maxWidth: 300,
        minWidth: 220,
      });
      marker.addTo(evLayer);
    });

    objLayer.addTo(map);
    evLayer.addTo(map);

    mapRef.current = map;
    objLayerRef.current = objLayer;
    evLayerRef.current = evLayer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Управление слоями при смене фильтра
  useEffect(() => {
    const map = mapRef.current;
    const objLayer = objLayerRef.current;
    const evLayer = evLayerRef.current;
    if (!map || !objLayer || !evLayer) return;

    if (filter === 'objects') {
      map.addLayer(objLayer);
      map.removeLayer(evLayer);
    } else if (filter === 'emergencies') {
      map.removeLayer(objLayer);
      map.addLayer(evLayer);
    } else {
      map.addLayer(objLayer);
      map.addLayer(evLayer);
    }
  }, [filter]);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold">Карта объектов и ЧС</h1>
          <p className="text-xs text-muted-foreground">Республика Адыгея · ГИС Сервер КБ «Панорама»</p>
        </div>
        <div className="flex gap-1.5">
          {([
            { id: 'objects',     label: `КУО (${vulnerableObjects.length})`,    icon: 'MapPin' },
            { id: 'emergencies', label: `ЧС (${emergencyEvents.length})`,        icon: 'AlertTriangle' },
            { id: 'both',        label: 'Всё',                                   icon: 'Layers' },
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

      {/* Map container */}
      <div className="relative rounded overflow-hidden border border-border" style={{ height: '580px' }}>
        <div ref={containerRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 border border-border rounded p-3 space-y-2 shadow-lg">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Уровень риска</p>
          {(['critical', 'high', 'medium', 'low'] as const).map(level => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: riskColor[level] }} />
              <span className="text-[10px] text-muted-foreground">{riskLabel[level]}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-400/60 border border-blue-400/30" />
              <span className="text-[10px] text-muted-foreground">КУО (квадрат)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/40 border border-white/20" />
              <span className="text-[10px] text-muted-foreground">ЧС (круг)</span>
            </div>
          </div>
        </div>

        {/* Attribution badge */}
        <div className="absolute top-3 left-3 z-[1000] bg-background/85 border border-border rounded px-2 py-1 text-[10px] mono text-muted-foreground">
          КБ «Панорама» · GIS WebService SE
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Критических КУО', value: vulnerableObjects.filter(o => o.riskLevel === 'critical').length, color: riskColor.critical },
          { label: 'Высокий риск',    value: vulnerableObjects.filter(o => o.riskLevel === 'high').length,     color: riskColor.high },
          { label: 'Активных ЧС',     value: emergencyEvents.filter(e => e.status === 'active').length,         color: riskColor.critical },
          { label: 'Всего объектов',  value: vulnerableObjects.length,                                          color: '#94a3b8' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded p-3">
            <div className="text-xl font-semibold mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
