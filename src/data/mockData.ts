export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type MetricKey = 'waterLevel' | 'temperature' | 'precipitation' | 'riskScore';

export interface TimeSeriesPoint {
  date: string;
  waterLevel: number;
  temperature: number;
  precipitation: number;
  riskScore: number;
}

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  threshold: number;
  thresholdLabel: string;
}

export const metricConfigs: Record<MetricKey, MetricConfig> = {
  waterLevel:    { key: 'waterLevel',    label: 'Уровень воды',  unit: 'м',    color: '#60a5fa', threshold: 3.5,  thresholdLabel: 'Опасный уровень' },
  temperature:   { key: 'temperature',   label: 'Температура',   unit: '°C',   color: '#f87171', threshold: 38,   thresholdLabel: 'Порог жары' },
  precipitation: { key: 'precipitation', label: 'Осадки',        unit: 'мм/сут', color: '#a78bfa', threshold: 60,   thresholdLabel: 'Критические осадки' },
  riskScore:     { key: 'riskScore',     label: 'Балл риска',    unit: '',     color: '#fb923c', threshold: 75,   thresholdLabel: 'Порог высокого риска' },
};

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function generateTimeSeries(objId: string, baseRiskScore: number): TimeSeriesPoint[] {
  const rng = seededRng(objId.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const points: TimeSeriesPoint[] = [];
  const start = new Date('2021-01-01');
  for (let m = 0; m < 60; m++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + m);
    const monthIdx = d.getMonth();
    const sinWave = Math.sin((monthIdx / 12) * Math.PI * 2);
    const noise = () => (rng() - 0.5) * 2;
    const waterBase = 1.2 + sinWave * 2.1 + noise() * 0.8;
    const tempBase = 13 + sinWave * 15 + noise() * 3;
    const precipBase = Math.max(0, 25 - sinWave * 10 + Math.abs(noise()) * 35);
    const riskBase = baseRiskScore + sinWave * 12 + noise() * 8;
    points.push({
      date: d.toISOString().slice(0, 7),
      waterLevel: +Math.max(0, waterBase).toFixed(2),
      temperature: +tempBase.toFixed(1),
      precipitation: +precipBase.toFixed(1),
      riskScore: +Math.min(100, Math.max(0, riskBase)).toFixed(0),
    });
  }
  return points;
}

export const timeSeriesData: Record<string, TimeSeriesPoint[]> = {};
const _objIds = ['obj-001','obj-002','obj-003','obj-004','obj-005','obj-006','obj-007','obj-008'];
const _baseScores: Record<string,number> = { 'obj-001':91,'obj-002':78,'obj-003':74,'obj-004':57,'obj-005':89,'obj-006':71,'obj-007':49,'obj-008':38 };
for (const id of _objIds) {
  timeSeriesData[id] = generateTimeSeries(id, _baseScores[id]);
}

export interface KuoEconomics {
  maxDamage: number;
  insuredDamage: number;
  reserves: number;
  annualRevenue: number;
}

export interface VulnerableObject {
  id: string;
  name: string;
  type: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  riskScore: number;
  lastInspection: string;
  description: string;
  threats: string[];
  economics: KuoEconomics;
}

export function calcPeu(e: KuoEconomics): number {
  const denominator = e.reserves + e.annualRevenue;
  if (denominator === 0) return 0;
  return (e.maxDamage - e.insuredDamage) / denominator;
}

export function peuLabel(peu: number): string {
  if (peu >= 1.5) return 'Критическая';
  if (peu >= 0.8) return 'Высокая';
  if (peu >= 0.3) return 'Средняя';
  return 'Низкая';
}

export function peuColor(peu: number): string {
  if (peu >= 1.5) return '#f87171';
  if (peu >= 0.8) return '#fb923c';
  if (peu >= 0.3) return '#facc15';
  return '#4ade80';
}

export interface EmergencyEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  region: string;
  lat: number;
  lng: number;
  severity: RiskLevel;
  affectedObjects: string[];
  casualties: number;
  economicDamage: number;
  description: string;
  status: 'active' | 'contained' | 'resolved';
}

export const vulnerableObjects: VulnerableObject[] = [
  {
    id: 'obj-001',
    name: 'Водозабор «Майкопский»',
    type: 'ЖКХ',
    address: 'ул. Набережная, 1, Майкоп',
    region: 'МО «Город Майкоп»',
    lat: 44.5925,
    lng: 40.1043,
    riskLevel: 'critical',
    riskScore: 91,
    lastInspection: '2026-02-14',
    description: 'Основной водозабор р. Белой, обеспечивает водоснабжение 145 000 жителей Майкопа. Высокий риск паводкового загрязнения и обмеления в засушливые периоды.',
    threats: ['Паводок', 'Загрязнение воды', 'Засуха', 'Обмеление'],
    economics: { maxDamage: 2400, insuredDamage: 480, reserves: 120, annualRevenue: 860 },
  },
  {
    id: 'obj-002',
    name: 'Мост через р. Белую (Майкоп)',
    type: 'Транспорт',
    address: 'ул. Краснооктябрьская, Майкоп',
    region: 'МО «Город Майкоп»',
    lat: 44.591713,
    lng: 40.105550,
    riskLevel: 'high',
    riskScore: 78,
    lastInspection: '2026-01-10',
    description: 'Автомобильный мост через р. Белую, критически важный для транспортной связности города. Подвержен паводковым нагрузкам при весеннем таянии снегов в горах.',
    threats: ['Паводок', 'Эрозия берегов', 'Сель'],
    economics: { maxDamage: 1800, insuredDamage: 600, reserves: 80, annualRevenue: 420 },
  },
  {
    id: 'obj-003',
    name: 'Майкопская ТЭС',
    type: 'Энергетика',
    address: 'пос. Тульский, Майкопский район',
    region: 'Майкопский район',
    lat: 44.618920,
    lng: 40.067045,
    riskLevel: 'high',
    riskScore: 74,
    lastInspection: '2025-12-20',
    description: 'Тепловая электростанция — основной источник теплоснабжения Майкопа. Расположена в долине с риском затопления при экстремальных паводках р. Белой.',
    threats: ['Паводок', 'Экстремальная жара', 'Засуха'],
    economics: { maxDamage: 3100, insuredDamage: 900, reserves: 350, annualRevenue: 1240 },
  },
  {
    id: 'obj-004',
    name: 'Республиканская клиническая больница',
    type: 'Здравоохранение',
    address: 'ул. Советская, 159, Майкоп',
    region: 'МО «Город Майкоп»',
    lat: 44.601158,
    lng: 40.106840,
    riskLevel: 'medium',
    riskScore: 57,
    lastInspection: '2026-03-05',
    description: 'Главное медицинское учреждение республики на 820 коек. Риски связаны с жарой, перебоями в водоснабжении и отключениями электроэнергии при ЧС.',
    threats: ['Экстремальная жара', 'Перебои водоснабжения', 'Ураганный ветер'],
    economics: { maxDamage: 950, insuredDamage: 310, reserves: 180, annualRevenue: 680 },
  },
  {
    id: 'obj-005',
    name: 'Дорога А-159 «Майкоп — Лагонаки»',
    type: 'Транспорт',
    address: 'Трасса А-159, Майкопский район',
    region: 'Майкопский район',
    lat: 44.285808,
    lng: 40.175336,
    riskLevel: 'critical',
    riskScore: 89,
    lastInspection: '2025-10-18',
    description: 'Горная дорога к плато Лагонаки — единственный путь к туристическим объектам и населённым пунктам нагорной части. Регулярно перекрывается из-за селей и оползней.',
    threats: ['Сель', 'Оползень', 'Снегопад', 'Ураганный ветер'],
    economics: { maxDamage: 2700, insuredDamage: 400, reserves: 60, annualRevenue: 310 },
  },
  {
    id: 'obj-006',
    name: 'Гидроузел Краснодарского вдхр. (верховья)',
    type: 'Энергетика',
    address: 'Теучежский район',
    region: 'Теучежский район',
    lat: 44.9231,
    lng: 39.3847,
    riskLevel: 'high',
    riskScore: 71,
    lastInspection: '2026-02-28',
    description: 'Верхний бьеф Краснодарского водохранилища. При экстремальных паводках на р. Кубани возникает риск сброса воды и затопления низинных районов Адыгеи.',
    threats: ['Паводок', 'Экстремальные осадки', 'Эрозия'],
    economics: { maxDamage: 4200, insuredDamage: 1100, reserves: 520, annualRevenue: 980 },
  },
  {
    id: 'obj-007',
    name: 'СОШ № 5 ст. Гиагинская',
    type: 'Образование',
    address: 'ул. Ленина, 32, ст. Гиагинская',
    region: 'Гиагинский район',
    lat: 44.877785,
    lng: 40.197042,
    riskLevel: 'medium',
    riskScore: 49,
    lastInspection: '2026-01-25',
    description: 'Школа в станице Гиагинской — расположена в пойме р. Гиаги, риск подтопления при весенних паводках.',
    threats: ['Паводок', 'Подтопление'],
    economics: { maxDamage: 280, insuredDamage: 40, reserves: 15, annualRevenue: 95 },
  },
  {
    id: 'obj-008',
    name: 'Элеватор «Адыгейский»',
    type: 'Сельское хозяйство',
    address: 'ул. Элеваторная, 8, Адыгейск',
    region: 'Теучежский район',
    lat: 44.8712,
    lng: 39.1903,
    riskLevel: 'low',
    riskScore: 38,
    lastInspection: '2026-04-01',
    description: 'Зернохранилище ёмкостью 60 000 т. Умеренный риск при экстремальных осадках и подтоплении.',
    threats: ['Подтопление', 'Экстремальная жара'],
    economics: { maxDamage: 180, insuredDamage: 60, reserves: 25, annualRevenue: 220 },
  },
];

export const emergencyEvents: EmergencyEvent[] = [
  {
    id: 'em-001',
    title: 'Паводок на р. Белой',
    type: 'Гидрологическая ЧС',
    date: '2026-04-03',
    region: 'МО «Город Майкоп»',
    lat: 44.5970,
    lng: 40.1070,
    severity: 'critical',
    affectedObjects: ['obj-001', 'obj-002', 'obj-003'],
    casualties: 0,
    economicDamage: 1140,
    description: 'Интенсивное таяние снега в горах Западного Кавказа вызвало подъём р. Белой на 3.1 м выше нормы. Частичное затопление прибрежных районов Майкопа.',
    status: 'contained',
  },
  {
    id: 'em-002',
    title: 'Сель на дороге А-159',
    type: 'Геологическая ЧС',
    date: '2026-05-17',
    region: 'Майкопский район',
    lat: 44.2658,
    lng: 40.0192,
    severity: 'high',
    affectedObjects: ['obj-005'],
    casualties: 0,
    economicDamage: 280,
    description: 'После затяжных ливней сошёл селевой поток на участке 14–19 км дороги А-159. Движение перекрыто, 38 туристов эвакуированы.',
    status: 'resolved',
  },
  {
    id: 'em-003',
    title: 'Волна жары в Майкопе',
    type: 'Метеорологическая ЧС',
    date: '2025-07-14',
    region: 'МО «Город Майкоп»',
    lat: 44.6087,
    lng: 40.0724,
    severity: 'high',
    affectedObjects: ['obj-004', 'obj-003'],
    casualties: 3,
    economicDamage: 95,
    description: 'Температура воздуха держалась выше +40°C в течение 9 суток. Зафиксировано 3 случая гибели от теплового удара. Перегрузка систем кондиционирования в больнице.',
    status: 'resolved',
  },
  {
    id: 'em-004',
    title: 'Подтопление ст. Гиагинской',
    type: 'Гидрологическая ЧС',
    date: '2026-03-22',
    region: 'Гиагинский район',
    lat: 44.877785,
    lng: 40.197042,
    severity: 'medium',
    affectedObjects: ['obj-007'],
    casualties: 0,
    economicDamage: 62,
    description: 'Весеннее половодье р. Гиаги привело к подтоплению 47 домовладений и школы. Введён режим ЧС муниципального уровня.',
    status: 'resolved',
  },
  {
    id: 'em-005',
    title: 'Оползень в Майкопском районе',
    type: 'Геологическая ЧС',
    date: '2025-11-09',
    region: 'Майкопский район',
    lat: 44.3124,
    lng: 40.0351,
    severity: 'high',
    affectedObjects: ['obj-005'],
    casualties: 0,
    economicDamage: 430,
    description: 'Активизация оползневого массива объёмом ~120 тыс. м³ на склоне хр. Азиш-Тау после аномальных осадков. Угроза перекрытия реки и подтопления.',
    status: 'resolved',
  },
];

export const referenceData = {
  riskTypes: [
    {
      id: 'flood',
      name: 'Паводки и наводнения',
      icon: '🌊',
      description: 'Характерны для горных и предгорных рек Адыгеи (Белая, Лаба, Пшиш, Курджипс). Весеннее таяние снегов в горах Западного Кавказа приводит к резкому подъёму уровня рек, угрожая населённым пунктам и инфраструктуре в поймах.',
      indicators: ['Уровень воды в р. Белой (Майкоп)', 'Площадь затопления пойм', 'Скорость нарастания паводка', 'Осадки в горной зоне'],
      frequency: 'Март–май (основной), ноябрь–декабрь (дождевой)',
      regions: ['МО «Город Майкоп»', 'Майкопский район', 'Гиагинский район', 'Кошехабльский район'],
    },
    {
      id: 'landslide',
      name: 'Сели и оползни',
      icon: '⛰️',
      description: 'Горная часть Адыгеи (Майкопский район, плато Лагонаки) подвержена активным гравитационным процессам. Сели на реках Белая, Сахрай, Цица возникают после интенсивных дождей и угрожают дорогам и посёлкам.',
      indicators: ['Суточное количество осадков', 'Уровень насыщения грунта', 'Активность склонов', 'Сейсмический фон'],
      frequency: 'Май–октябрь',
      regions: ['Майкопский район', 'Пос. Хамышки', 'Дорога А-159', 'Хребет Азиш-Тау'],
    },
    {
      id: 'heatwave',
      name: 'Волны жары и засуха',
      icon: '🌡️',
      description: 'На равнинной части Адыгеи наблюдается устойчивый тренд увеличения частоты и интенсивности жары. Температура выше +38°C создаёт риски для здоровья населения, сельского хозяйства и энергоснабжения.',
      indicators: ['Максимальная суточная температура', 'Индекс теплового стресса', 'Дефицит осадков', 'Уровень воды в водохранилищах'],
      frequency: 'Июнь–август',
      regions: ['МО «Город Майкоп»', 'Гиагинский район', 'Теучежский район', 'Шовгеновский район'],
    },
    {
      id: 'wildfire',
      name: 'Природные пожары',
      icon: '🔥',
      description: 'Лесные и травяные пожары в предгорных районах Адыгеи. Особую опасность представляют пожары в буферной зоне Кавказского биосферного заповедника и в районе туристических объектов плато Лагонаки.',
      indicators: ['Индекс пожарной опасности', 'Относительная влажность воздуха', 'Скорость ветра', 'Площадь очагов'],
      frequency: 'Июль–сентябрь',
      regions: ['Майкопский район', 'Зона КБЗ', 'Плато Лагонаки', 'Предгорья'],
    },
  ],
  climateProjections: [
    { year: 2025, tempAnomaly: 1.9, precipChange: -10 },
    { year: 2030, tempAnomaly: 2.3, precipChange: -14 },
    { year: 2035, tempAnomaly: 2.7, precipChange: -17 },
    { year: 2040, tempAnomaly: 3.1, precipChange: -21 },
    { year: 2050, tempAnomaly: 3.6, precipChange: -26 },
  ],
};