import { Home, Trophy, FileText, Users, Clipboard, FolderOpen, LogOut, ChevronLeft } from 'lucide-react';
import { Role, Page } from '../App';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentRole: Role | null;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const rolePages: Record<Role, { id: Page; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  athlete: [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'competitions', label: 'Соревнования', icon: Trophy },
    { id: 'myApplications', label: 'Мои заявки', icon: FileText },
  ],
  judge: [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'competitions', label: 'Соревнования', icon: Trophy },
  ],
  manager: [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'competitions', label: 'Соревнования', icon: Trophy },
    { id: 'applications', label: 'Заявки', icon: Clipboard },
    { id: 'documents', label: 'Документы', icon: FolderOpen },
  ],
  admin: [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'competitions', label: 'Соревнования', icon: Trophy },
    { id: 'applications', label: 'Заявки', icon: Clipboard },
    { id: 'documents', label: 'Документы', icon: FolderOpen },
  ],
};

export function Sidebar({ currentRole, currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  const pages = rolePages[currentRole || 'athlete'];

  return (
    <>
      <div
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
          isOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-blue-600">Спортивная CRM</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  currentPage === page.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{page.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700"
            onClick={() => console.log('Выход')}
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </Button>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-r-lg p-2 hover:bg-gray-50 transition-colors z-10"
        style={{ left: isOpen ? '256px' : '0' }}
      >
        <ChevronLeft className={cn('w-4 h-4 transition-transform', !isOpen && 'rotate-180')} />
      </button>
    </>
  );
}