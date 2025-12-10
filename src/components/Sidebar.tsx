import type { ComponentType } from 'react';
import { Home, Trophy, FileText, Users, Clipboard, FolderOpen, LogOut } from 'lucide-react';
import { Role, Page } from '../App';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentRole: Role | null;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen?: boolean;
}

const rolePages: Record<Role, { id: Page; label: string; icon: ComponentType<{ className?: string }> }[]> = {
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

export function Sidebar({ currentRole, currentPage, onPageChange, isOpen = true }: SidebarProps) {
  const pages = rolePages[currentRole || 'athlete'];

  return (
    <div
      className={cn(
        'bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-300',
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      <div className="px-6 pb-1 pt-5 border-b border-[#E5E7EB]">
        <h1 className="text-[24px] leading-[36px] font-medium tracking-[0.00293em] text-[#155DFC]">
          Спортивная CRM
        </h1>
      </div>

      <nav className="flex-1 px-4 pt-4 space-y-2">
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = currentPage === page.id;

          return (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={cn(
                'w-full flex items-center gap-3 h-12 px-4 rounded-[10px] text-[16px] leading-[24px] tracking-[-0.0195em] transition-colors',
                isActive
                  ? 'bg-[#EFF6FF] text-[#155DFC] font-medium'
                  : 'text-[#364153] hover:bg-[#F5F6F7]'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-[#155DFC]' : 'text-[#364153]')} />
              <span>{page.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-4 pt-3 border-t border-[#E5E7EB]">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-[#364153] h-10 px-4 py-2 rounded-lg hover:bg-[#F5F6F7]"
          onClick={() => console.log('Выход')}
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </Button>
      </div>
    </div>
  );
}