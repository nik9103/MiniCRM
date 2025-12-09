import { User } from 'lucide-react';
import { Role, Page } from '../App';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { NotificationsPopover } from './notifications/NotificationsPopover';

interface HeaderProps {
  currentRole: Role | null;
  currentPage: Page;
  onRoleChange: (role: Role) => void;
  onPageChange?: (page: Page) => void;
  onOpenUserModal?: (userId: string) => void;
  onOpenApplicationModal?: (applicationId: string) => void;
  onOpenCompetitionModal?: (competitionId: string) => void;
  onLogout?: () => void;
}

const roleLabels: Record<Role, string> = {
  athlete: 'Спортсмен',
  judge: 'Судья',
  manager: 'Спортивный менеджер',
  admin: 'Администратор',
};

const pageLabels: Record<Page, string> = {
  home: 'Главная',
  competitions: 'Соревнования',
  myApplications: 'Мои заявки',
  users: 'Пользователи',
  applications: 'Заявки',
  documents: 'Документы',
  profile: 'Мой профиль',
};

export function Header({
  currentRole,
  onRoleChange,
  onPageChange,
  onOpenUserModal,
  onOpenApplicationModal,
  onOpenCompetitionModal,
  onLogout,
}: HeaderProps) {
  const handleValueChange = (value: string) => {
    if (value === 'logout') {
      onLogout?.();
    } else {
      onRoleChange(value as Role);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Роль:</span>
          <Select value={currentRole || undefined} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="athlete">{roleLabels.athlete}</SelectItem>
              <SelectItem value="judge">{roleLabels.judge}</SelectItem>
              <SelectItem value="manager">{roleLabels.manager}</SelectItem>
              <SelectItem value="admin">{roleLabels.admin}</SelectItem>
              <SelectItem value="logout" className="text-red-600 border-t mt-2 pt-2">
                Выйти
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentRole && (
          <NotificationsPopover 
            role={currentRole} 
            onNavigate={onPageChange}
            onOpenUserModal={onOpenUserModal}
            onOpenApplicationModal={onOpenApplicationModal}
            onOpenCompetitionModal={onOpenCompetitionModal}
          />
        )}

        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full"
          onClick={() => onPageChange?.('profile')}
        >
          <Avatar>
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}