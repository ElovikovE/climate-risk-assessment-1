import { useState } from 'react';
import Icon from '@/components/ui/icon';

const threatOptions = ['Паводок', 'Ледоход', 'Экстремальные морозы', 'Экстремальная жара', 'Лесные пожары', 'Засуха', 'Эрозия берегов', 'Таяние мерзлоты', 'Просадка грунта', 'Загрязнение воды', 'Метель', 'Гололёд'];

export default function ObjectsAddPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [form, setForm] = useState({
    name: '', type: '', address: '', region: '', lat: '', lng: '',
    riskLevel: 'medium', description: '',
  });
  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const toggleThreat = (t: string) =>
    setSelectedThreats(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onNavigate('objects-list'); }, 1800);
  };

  const inputClass = "w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40";

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('objects-list')} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Добавить климатически уязвимый объект</h1>
          <p className="text-xs text-muted-foreground">Заполните форму для регистрации нового КУО</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-6 text-center animate-slide-up">
          <Icon name="CheckCircle" size={32} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-green-400">Объект успешно зарегистрирован</p>
          <p className="text-xs text-muted-foreground mt-1">Перенаправление в каталог...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="bg-card border border-border rounded p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Icon name="Building2" size={14} className="text-muted-foreground" />
              Основная информация
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Наименование объекта *</label>
                <input value={form.name} onChange={set('name')} required placeholder="Например: ТЭЦ-5 Восточная" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Тип объекта *</label>
                <select value={form.type} onChange={set('type')} required className={inputClass}>
                  <option value="">Выберите тип</option>
                  {['Энергетика', 'Транспорт', 'ЖКХ', 'Здравоохранение', 'Образование', 'Промышленность', 'Сельское хозяйство'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Уровень риска *</label>
                <select value={form.riskLevel} onChange={set('riskLevel')} className={inputClass}>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критический</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Icon name="MapPin" size={14} className="text-muted-foreground" />
              Местоположение
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Регион *</label>
                <input value={form.region} onChange={set('region')} required placeholder="Например: Новосибирская область" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Адрес</label>
                <input value={form.address} onChange={set('address')} placeholder="Улица, дом" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Широта</label>
                <input value={form.lat} onChange={set('lat')} placeholder="55.012345" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Долгота</label>
                <input value={form.lng} onChange={set('lng')} placeholder="82.934567" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Threats */}
          <div className="bg-card border border-border rounded p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Icon name="AlertTriangle" size={14} className="text-muted-foreground" />
              Климатические угрозы
            </h2>
            <div className="flex flex-wrap gap-2">
              {threatOptions.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleThreat(t)}
                  className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                    selectedThreats.includes(t)
                      ? 'border-primary/60 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded p-5">
            <h2 className="text-sm font-medium mb-3">Описание</h2>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Краткое описание объекта и его климатической уязвимости..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Зарегистрировать объект
            </button>
            <button
              type="button"
              onClick={() => onNavigate('objects-list')}
              className="px-6 border border-border text-sm rounded hover:bg-secondary/50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
