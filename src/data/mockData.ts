export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

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
    name: 'ТЭЦ-3 Северная',
    type: 'Энергетика',
    address: 'ул. Промышленная, 14',
    region: 'Западная Сибирь',
    lat: 55.01,
    lng: 73.38,
    riskLevel: 'critical',
    riskScore: 92,
    lastInspection: '2026-03-12',
    description: 'Тепловая электростанция в зоне паводковых рисков р. Оми',
    threats: ['Паводок', 'Экстремальные морозы', 'Засуха'],
  },
  {
    id: 'obj-002',
    name: 'Мост через р. Обь',
    type: 'Транспорт',
    address: 'Трасса М-51, км 812',
    region: 'Новосибирская область',
    lat: 54.89,
    lng: 82.97,
    riskLevel: 'high',
    riskScore: 76,
    lastInspection: '2026-01-20',
    description: 'Автомобильный мост, подверженный ледовым нагрузкам',
    threats: ['Паводок', 'Ледоход', 'Эрозия берегов'],
  },
  {
    id: 'obj-003',
    name: 'Водозабор «Центральный»',
    type: 'ЖКХ',
    address: 'пр. Речной, 2',
    region: 'Красноярский край',
    lat: 56.01,
    lng: 92.86,
    riskLevel: 'high',
    riskScore: 68,
    lastInspection: '2025-11-05',
    description: 'Основной источник водоснабжения для 200 000 жителей',
    threats: ['Загрязнение воды', 'Обмеление', 'Паводок'],
  },
  {
    id: 'obj-004',
    name: 'Госпиталь им. Пирогова',
    type: 'Здравоохранение',
    address: 'ул. Медицинская, 7',
    region: 'Кемеровская область',
    lat: 54.34,
    lng: 86.09,
    riskLevel: 'medium',
    riskScore: 54,
    lastInspection: '2026-02-28',
    description: 'Региональный медицинский центр на 600 коек',
    threats: ['Экстремальная жара', 'Пожар'],
  },
  {
    id: 'obj-005',
    name: 'Газопровод «Сибирь-2»',
    type: 'Энергетика',
    address: 'Маршрут 1840 км',
    region: 'ЯНАО',
    lat: 66.55,
    lng: 76.67,
    riskLevel: 'critical',
    riskScore: 88,
    lastInspection: '2025-09-14',
    description: 'Магистральный газопровод в зоне вечной мерзлоты',
    threats: ['Таяние мерзлоты', 'Просадка грунта', 'Экстремальный мороз'],
  },
  {
    id: 'obj-006',
    name: 'Аэропорт Толмачёво',
    type: 'Транспорт',
    address: 'Аэропорт Толмачёво',
    region: 'Новосибирская область',
    lat: 55.01,
    lng: 82.65,
    riskLevel: 'low',
    riskScore: 31,
    lastInspection: '2026-04-10',
    description: 'Международный аэропорт, риски метеорологических экстремумов',
    threats: ['Метель', 'Гололёд'],
  },
];

export const emergencyEvents: EmergencyEvent[] = [
  {
    id: 'em-001',
    title: 'Паводок на р. Обь',
    type: 'Гидрологическая ЧС',
    date: '2026-04-18',
    region: 'Новосибирская область',
    lat: 54.89,
    lng: 82.97,
    severity: 'critical',
    affectedObjects: ['obj-002', 'obj-006'],
    casualties: 0,
    economicDamage: 820,
    description: 'Весенний паводок превысил исторические максимумы на 2.3 м',
    status: 'contained',
  },
  {
    id: 'em-002',
    title: 'Аномальные морозы',
    type: 'Метеорологическая ЧС',
    date: '2026-01-08',
    region: 'ЯНАО',
    lat: 66.55,
    lng: 76.67,
    severity: 'high',
    affectedObjects: ['obj-005'],
    casualties: 2,
    economicDamage: 340,
    description: 'Температура опустилась до -52°C, повреждения теплосетей',
    status: 'resolved',
  },
  {
    id: 'em-003',
    title: 'Лесные пожары',
    type: 'Природный пожар',
    date: '2026-07-22',
    region: 'Красноярский край',
    lat: 56.01,
    lng: 92.86,
    severity: 'high',
    affectedObjects: ['obj-003'],
    casualties: 0,
    economicDamage: 1200,
    description: 'Площадь возгорания 48 тыс. га, угроза водозабору',
    status: 'active',
  },
  {
    id: 'em-004',
    title: 'Просадка грунта',
    type: 'Геологическая ЧС',
    date: '2025-08-03',
    region: 'ЯНАО',
    lat: 67.1,
    lng: 77.2,
    severity: 'critical',
    affectedObjects: ['obj-005'],
    casualties: 0,
    economicDamage: 2100,
    description: 'Деформация трубопровода из-за таяния вечной мерзлоты',
    status: 'resolved',
  },
  {
    id: 'em-005',
    title: 'Пылевая буря',
    type: 'Метеорологическая ЧС',
    date: '2026-05-10',
    region: 'Западная Сибирь',
    lat: 55.2,
    lng: 73.5,
    severity: 'medium',
    affectedObjects: ['obj-001'],
    casualties: 0,
    economicDamage: 45,
    description: 'Снижение видимости до 50 м, загрязнение оборудования ТЭЦ',
    status: 'resolved',
  },
];

export const referenceData = {
  riskTypes: [
    {
      id: 'flood',
      name: 'Паводки и наводнения',
      icon: '🌊',
      description: 'Сезонное затопление территорий вследствие подъёма уровня рек, таяния снегов или обильных осадков.',
      indicators: ['Уровень воды в реке', 'Площадь затопления', 'Скорость нарастания', 'Предупредительный уровень'],
      frequency: 'Ежегодно (апрель–май)',
      regions: ['Западная Сибирь', 'Приволжье', 'Дальний Восток'],
    },
    {
      id: 'permafrost',
      name: 'Деградация вечной мерзлоты',
      icon: '🧊',
      description: 'Оттаивание многолетнемёрзлых грунтов вследствие потепления климата, ведущее к просадке зданий и инфраструктуры.',
      indicators: ['Глубина сезонного оттаивания', 'Температура грунта', 'Деформация поверхности'],
      frequency: 'Нарастающий процесс',
      regions: ['ЯНАО', 'Якутия', 'Таймыр'],
    },
    {
      id: 'wildfire',
      name: 'Природные пожары',
      icon: '🔥',
      description: 'Неконтролируемое горение растительности, усиливающееся в условиях засухи и высоких температур.',
      indicators: ['Индекс горимости', 'Площадь пожара', 'Скорость распространения'],
      frequency: 'Июнь–сентябрь',
      regions: ['Красноярский край', 'Иркутская область', 'Якутия'],
    },
    {
      id: 'heatwave',
      name: 'Волны жары',
      icon: '🌡️',
      description: 'Периоды аномально высоких температур, создающих риски для здоровья населения и инфраструктуры.',
      indicators: ['Максимальная температура', 'Ночной температурный минимум', 'Индекс теплового стресса'],
      frequency: 'Июль–август',
      regions: ['Поволжье', 'Южный Урал', 'Западная Сибирь'],
    },
  ],
  climateProjections: [
    { year: 2025, tempAnomaly: 1.8, precipChange: -8 },
    { year: 2030, tempAnomaly: 2.1, precipChange: -12 },
    { year: 2035, tempAnomaly: 2.5, precipChange: -15 },
    { year: 2040, tempAnomaly: 2.9, precipChange: -18 },
    { year: 2050, tempAnomaly: 3.4, precipChange: -22 },
  ],
};
