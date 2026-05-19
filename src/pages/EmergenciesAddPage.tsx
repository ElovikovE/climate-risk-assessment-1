import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { vulnerableObjects } from '@/data/mockData';

export default function EmergenciesAddPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [form, setForm] = useState({
    title: '', type: '', date: '', region: '', lat: '', lng: '',
    severity: 'high', status: 'active', casualties: '', economicDamage: '', description: '',
  });
  const [affectedObjects, setAffectedObjects] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const toggleObj = (id: string) =>
    setAffectedObjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onNavigate('emergencies-list'); }, 1800);
  };

  const inputClass = "w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40";

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('emergencies-list')} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Зарегистрировать ЧС</h1>
          <p className="text-xs text-muted-foreground">Внесение данных о новой чрезвычайной ситуации</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-6 text-center animate-slide-up">
          <Icon name="CheckCircle" size={32} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-green-400">ЧС успешно зарегистрирована</p>
          <p className="text-xs text-muted-foreground mt-1">Перенаправление в реестр...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-card border border-border rounded p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Icon name="AlertTriangle" size={14} className="text-muted-foreground" />
              Основная информация
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Наименование ЧС *</label>
                <input value={form.title} onChange={set('title')} required placeholder="Например: Паводок на р. Иртыш" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Тип ЧС *</label>
                <select value={form.type} onChange={set('type')} required className={inputClass}>
                  <option value="">Выберите тип</option>
                  {['Гидрологическая ЧС', 'Метеорологическая ЧС', 'Природный пожар', 'Геологическая ЧС', 'Биологическая ЧС', 'Комплексная ЧС'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Дата события *</label>
                <input type="date" value={form.date} onChange={set('date')} required className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Тяжесть *</label>
                <select value={form.severity} onChange={set('severity')} className={inputClass}>
                  <option value="low">Низкая</option>
                  <option value="medium">Средняя</option>
                  <option value="high">Высокая</option>
                  <option value="critical">Критическая</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Статус</label>
                <select value={form.status} onChange={set('status')} className={inputClass}>
                  <option value="active">Активна</option>
                  <option value="contained">Локализована</option>
                  <option value="resolved">Ликвидирована</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Icon name="MapPin" size={14} className="text-muted-foreground" />
              Локация
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Регион *</label>
                <input value={form.region} onChange={set('region')} required placeholder="Регион" className={inputClass} />
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

          {/* Damage */}
          <div className="bg-card border border-border rounded p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Icon name="TrendingDown" size={14} className="text-muted-foreground" />
              Последствия
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Пострадавших (чел.)</label>
                <input type="number" value={form.casualties} onChange={set('casualties')} placeholder="0" min="0" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Экономический ущерб (млн ₽)</label>
                <input type="number" value={form.economicDamage} onChange={set('economicDamage')} placeholder="0" min="0" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Affected KUO */}
          <div className="bg-card border border-border rounded p-5">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Icon name="Building2" size={14} className="text-muted-foreground" />
              Объекты КУО в зоне ЧС
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {vulnerableObjects.map(obj => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => toggleObj(obj.id)}
                  className={`text-left text-xs px-3 py-2 rounded border transition-colors ${
                    affectedObjects.includes(obj.id)
                      ? 'border-primary/60 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                  }`}
                >
                  <p className="font-medium truncate">{obj.name}</p>
                  <p className="text-[10px] opacity-70">{obj.type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded p-5">
            <h2 className="text-sm font-medium mb-3">Описание ситуации</h2>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Хронология событий, принятые меры, прогноз..."
              rows={4}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity">
              Зарегистрировать ЧС
            </button>
            <button type="button" onClick={() => onNavigate('emergencies-list')} className="px-6 border border-border text-sm rounded hover:bg-secondary/50 transition-colors">
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
