import { useState } from 'react';
import LoginPage from './LoginPage';
import Layout from '@/components/Layout';
import DashboardPage from './DashboardPage';
import ObjectsListPage from './ObjectsListPage';
import ObjectsAddPage from './ObjectsAddPage';
import ObjectsAnalysisPage from './ObjectsAnalysisPage';
import EmergenciesListPage from './EmergenciesListPage';
import EmergenciesAddPage from './EmergenciesAddPage';
import EmergenciesAnalysisPage from './EmergenciesAnalysisPage';
import ReferencePage from './ReferencePage';
import MapPage from './MapPage';

type Page =
  | 'dashboard'
  | 'objects-list'
  | 'objects-add'
  | 'objects-analysis'
  | 'emergencies-list'
  | 'emergencies-add'
  | 'emergencies-analysis'
  | 'reference'
  | 'map';

export default function Index() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'objects-list': return <ObjectsListPage onNavigate={p => setCurrentPage(p as Page)} />;
      case 'objects-add': return <ObjectsAddPage onNavigate={p => setCurrentPage(p as Page)} />;
      case 'objects-analysis': return <ObjectsAnalysisPage />;
      case 'emergencies-list': return <EmergenciesListPage onNavigate={p => setCurrentPage(p as Page)} />;
      case 'emergencies-add': return <EmergenciesAddPage onNavigate={p => setCurrentPage(p as Page)} />;
      case 'emergencies-analysis': return <EmergenciesAnalysisPage />;
      case 'reference': return <ReferencePage />;
      case 'map': return <MapPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={p => setCurrentPage(p as Page)}
      user={user}
      onLogout={() => setUser(null)}
    >
      {renderPage()}
    </Layout>
  );
}
