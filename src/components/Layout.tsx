import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Обзор', icon: 'LayoutDashboard' },
  { id: 'objects', label: 'КУО', icon: 'MapPin', children: [
    { id: 'objects-list', label: 'Каталог объектов' },
    { id: 'objects-add', label: 'Добавить объект' },
    { id: 'objects-analysis', label: 'Анализ по КУО' },
    { id: 'risk-assessment', label: 'Оценка рисков КУО' },
  ]},
  { id: 'emergencies', label: 'ЧС', icon: 'AlertTriangle', children: [
    { id: 'emergencies-list', label: 'Список ЧС' },
    { id: 'emergencies-add', label: 'Добавить ЧС' },
    { id: 'emergencies-analysis', label: 'Анализ КУО в зоне ЧС' },
  ]},
  { id: 'map', label: 'Карта', icon: 'Map' },
  { id: 'reference', label: 'Справочник', icon: 'BookOpen' },
];

export default function Layout({ children, currentPage, onNavigate, user, onLogout }: LayoutProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['objects', 'emergencies']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isActive = (id: string) => currentPage === id || currentPage.startsWith(id + '-');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Icon name="Activity" size={13} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-wide">КлиматРиск</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 mono">v1.0 · 2026</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(item => (
            <div key={item.id} className="mb-0.5">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                      isActive(item.id)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={item.icon} size={15} />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <Icon
                      name="ChevronDown"
                      size={12}
                      className={`transition-transform ${expandedSections.includes(item.id) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedSections.includes(item.id) && (
                    <div className="ml-6 border-l border-border pl-3 mt-0.5 space-y-0.5">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => onNavigate(child.id)}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                            currentPage === child.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Icon name="User" size={13} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role}</p>
            </div>
            <button onClick={onLogout} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="LogOut" size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}