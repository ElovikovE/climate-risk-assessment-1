import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'admin' && password === '1234') {
      onLogin({ name: 'Иванов А.В.', role: 'Главный аналитик' });
    } else if (login && password) {
      onLogin({ name: login, role: 'Аналитик' });
    } else {
      setError('Введите логин и пароль');
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-4 animate-slide-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-card border border-border mb-4">
            <Icon name="Activity" size={22} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold">КлиматРиск</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Система анализа климатических рисков
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Республика Адыгея</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Логин
              </label>
              <input
                type="text"
                value={login}
                onChange={e => { setLogin(e.target.value); setError(''); }}
                placeholder="Введите логин"
                className="w-full bg-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <Icon name="AlertCircle" size={12} />
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-2"
            >
              Войти в систему
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Демо: логин <span className="mono text-foreground">admin</span> · пароль <span className="mono text-foreground">1234</span>
          </p>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Доступ ограничен · Только авторизованные пользователи
        </p>
      </div>
    </div>
  );
}