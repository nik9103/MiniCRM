import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { CompetitionsPage } from './components/pages/CompetitionsPage';
import { MyApplicationsPage } from './components/pages/MyApplicationsPage';
import { UsersPage } from './components/pages/UsersPage';
import { ApplicationsPage } from './components/pages/ApplicationsPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { JudgeProfilePage } from './components/pages/JudgeProfilePage';
import { ManagerProfilePage } from './components/pages/ManagerProfilePage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Toaster } from 'sonner@2.0.3';
import { toast } from 'sonner@2.0.3';

export type Role = 'athlete' | 'judge' | 'manager' | 'admin';

export type Page = 
  | 'home' 
  | 'competitions' 
  | 'myApplications' 
  | 'users' 
  | 'applications' 
  | 'documents'
  | 'profile'
  | 'login'
  | 'register';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State для открытия модальных окон через уведомления
  const [modalToOpen, setModalToOpen] = useState<{
    type: 'user' | 'application' | 'competition';
    id: string;
  } | null>(null);

  const handleOpenUserModal = (userId: string) => {
    setModalToOpen({ type: 'user', id: userId });
  };

  const handleOpenApplicationModal = (applicationId: string) => {
    setModalToOpen({ type: 'application', id: applicationId });
  };

  const handleOpenCompetitionModal = (competitionId: string) => {
    setModalToOpen({ type: 'competition', id: competitionId });
  };

  const clearModalToOpen = () => {
    setModalToOpen(null);
  };

  const handleLogin = (email: string, password: string) => {
    // Имитация логина - устанавливаем роль спортсмена
    toast.success('Вход выполнен успешно!');
    setCurrentRole('athlete');
    setCurrentPage('home');
  };

  const handleRegister = (data: {
    role: 'athlete' | 'judge' | 'manager';
    email: string;
    phone: string;
    password: string;
  }) => {
    // Имитация регистрации
    toast.success('Регистрация прошла успешно! Теперь вы можете войти.');
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentPage('login');
    toast.info('Вы вышли из системы');
  };

  const handleRoleSwitch = () => {
    // Устанавливаем роль спортсмена по умолчанию
    setCurrentRole('athlete');
    setCurrentPage('home');
  };

  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage role={currentRole} />;
      case 'competitions':
        return (
          <CompetitionsPage 
            role={currentRole} 
            modalToOpen={modalToOpen?.type === 'competition' ? modalToOpen.id : undefined}
            onModalOpened={clearModalToOpen}
          />
        );
      case 'myApplications':
        return (
          <MyApplicationsPage 
            role={currentRole} 
            onNavigate={setCurrentPage}
            modalToOpen={modalToOpen?.type === 'application' ? modalToOpen.id : undefined}
            onModalOpened={clearModalToOpen}
          />
        );
      case 'users':
        return (
          <UsersPage 
            role={currentRole === 'admin' || currentRole === 'manager' ? currentRole : 'manager'}
            modalToOpen={modalToOpen?.type === 'user' ? modalToOpen.id : undefined}
            onModalOpened={clearModalToOpen}
          />
        );
      case 'applications':
        return (
          <ApplicationsPage 
            role={currentRole}
            modalToOpen={modalToOpen?.type === 'application' ? modalToOpen.id : undefined}
            onModalOpened={clearModalToOpen}
          />
        );
      case 'documents':
        return <DocumentsPage />;
      case 'profile':
        if (currentRole === 'athlete') return <ProfilePage />;
        if (currentRole === 'judge') return <JudgeProfilePage />;
        if (currentRole === 'manager') return <ManagerProfilePage />;
        // У администратора нет профиля - редирект на главную
        return <HomePage role={currentRole} />;
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onNavigateToRegister={() => setCurrentPage('register')}
            onNavigateToRoleSwitch={handleRoleSwitch}
          />
        );
      case 'register':
        return (
          <RegisterPage 
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentPage('login')}
            onNavigateToRoleSwitch={handleRoleSwitch}
          />
        );
      default:
        return <HomePage role={currentRole} />;
    }
  };

  // Если это страница авторизации, показываем только контент без sidebar и header
  if (isAuthPage) {
    return (
      <div className="h-screen bg-gray-50">
        <Toaster position="top-right" richColors />
        {renderPage()}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {!isAuthPage && (
        <Sidebar
          currentRole={currentRole}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isAuthPage && (
          <Header
            currentRole={currentRole}
            currentPage={currentPage}
            onRoleChange={setCurrentRole}
            onPageChange={setCurrentPage}
            onOpenUserModal={handleOpenUserModal}
            onOpenApplicationModal={handleOpenApplicationModal}
            onOpenCompetitionModal={handleOpenCompetitionModal}
            onLogout={handleLogout}
          />
        )}
        <main className={`flex-1 overflow-y-auto ${!isAuthPage && currentPage === 'profile' ? 'p-0' : !isAuthPage ? 'p-6' : ''}`}>
          <div className={!isAuthPage && currentPage === 'profile' ? 'h-full px-6 pt-6' : ''}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}