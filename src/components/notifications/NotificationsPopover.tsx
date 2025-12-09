import { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, FileText, AlertTriangle, Info, AlertCircle, Trophy, UserPlus, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Role, Page } from '../../App';
import { cn } from '../ui/utils';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionPage?: Page;
  actionLabel?: string;
  // Для открытия модальных окон
  modalType?: 'user' | 'application' | 'competition';
  modalData?: {
    userId?: string;
    applicationId?: string;
    competitionId?: string;
  };
}

interface NotificationsPopoverProps {
  role: Role;
  onNavigate?: (page: Page) => void;
  onOpenUserModal?: (userId: string) => void;
  onOpenApplicationModal?: (applicationId: string) => void;
  onOpenCompetitionModal?: (competitionId: string) => void;
}

// Моковые данные уведомлений для каждой роли
const mockNotifications: Record<Role, Notification[]> = {
  athlete: [
    {
      id: 'notif-1',
      type: 'success',
      title: 'Заявка принята',
      message: 'Ваша заявка на "Чемпионат России по киберспорту 2025" была принята. Необходимо подписать документы.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      isRead: false,
      actionPage: 'myApplications',
      actionLabel: 'Посмотреть заявку',
      modalType: 'application',
      modalData: {
        applicationId: 'application-chempionat-rf-2025',
      },
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Документы готовы к подписанию',
      message: 'Документы для участия в соревновании "Чемпионат России по киберспорту 2025" готовы к подписанию.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
      isRead: false,
      actionPage: 'myApplications',
      actionLabel: 'Скачать документы',
      modalType: 'application',
      modalData: {
        applicationId: 'application-chempionat-rf-2025',
      },
    },
    {
      id: 'notif-3',
      type: 'error',
      title: 'Заявка отклонена',
      message: 'Ваша заявка на "Кубок Москвы по плаванию 2025" отклонена.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
      isRead: true,
      actionPage: 'myApplications',
      actionLabel: 'Посмотреть детали',
      modalType: 'application',
      modalData: {
        applicationId: 'application-kubok-moskvy-2025',
      },
    },
  ],
  manager: [
    {
      id: 'notif-m-1',
      type: 'info',
      title: 'Новая заявка на рассмотрение',
      message: 'Поступила новая заявка от Петров Иван Сергеевич на "Чемпионат России по киберспорту 2025".',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
      isRead: false,
      actionPage: 'applications',
      actionLabel: 'Перейти к заявкам',
      modalType: 'application',
      modalData: {
        applicationId: 'application-petrov-2025',
      },
    },
    {
      id: 'notif-m-2',
      type: 'info',
      title: 'Данные спортсмена изменены',
      message: 'Иванов Иван Иванович изменил данные профиля: паспортные данные, контактный телефон.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
      isRead: false,
      actionPage: 'users',
      actionLabel: 'Посмотреть профиль',
      modalType: 'user',
      modalData: {
        userId: '1', // ID Иванова из mockUsers
      },
    },
    {
      id: 'notif-m-3',
      type: 'warning',
      title: 'Соревнование начинается завтра',
      message: 'Соревнование "Кубок Москвы по плаванию 2025" начинается завтра. Проверьте готовность.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      isRead: false,
      actionPage: 'competitions',
      actionLabel: 'Посмотреть соревнование',
      modalType: 'competition',
      modalData: {
        competitionId: '002', // ID из mockCompetitions
      },
    },
    {
      id: 'notif-m-4',
      type: 'warning',
      title: 'Не все документы подписаны',
      message: 'У 3 спортсменов не подписаны документы для "Чемпионат России по киберспорту 2025".',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 часов назад
      isRead: true,
      actionPage: 'documents',
      actionLabel: 'Перейти к документам',
    },
  ],
  admin: [
    {
      id: 'notif-a-1',
      type: 'info',
      title: 'Новый пользователь зарегистрирован',
      message: 'Зарегистрирован новый Спортсмен: Козлов Петр Дмитриевич, kozlov@example.com.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
      isRead: false,
      actionPage: 'users',
      actionLabel: 'Перейти к пользователям',
      modalType: 'user',
      modalData: {
        userId: '7', // ID Козлова Петра Дмитриевича из mockUsers
      },
    },
    {
      id: 'notif-a-2',
      type: 'info',
      title: 'Новая заявка на рассмотрение',
      message: 'Поступила новая заявка от Сидорова Мария Александровна на "Всероссийские соревнования по легкой атлетике".',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
      isRead: false,
      actionPage: 'applications',
      actionLabel: 'Перейти к заявкам',
      modalType: 'application',
      modalData: {
        applicationId: 'application-sidorova-2025',
      },
    },
    {
      id: 'notif-a-3',
      type: 'info',
      title: 'Данные спортсмена изменены',
      message: 'Васильев Сергей Петрович изменил данные профиля: дата рождения, адрес проживания.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
      isRead: false,
      actionPage: 'users',
      actionLabel: 'Посмотреть профиль',
      modalType: 'user',
      modalData: {
        userId: '8', // ID Васильева Сергея Петровича из mockUsers
      },
    },
    {
      id: 'notif-a-4',
      type: 'error',
      title: 'Системная ошибка',
      message: 'Обнаружена системная ошибка: Failed to generate documents for application #2025015.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
      isRead: false,
      actionPage: 'home',
      actionLabel: 'Посмотреть логи',
    },
    {
      id: 'notif-a-5',
      type: 'warning',
      title: 'Соревнование начинается завтра',
      message: 'Соревнование "Чемпионат России по киберспорту 2025" начинается завтра. Проверьте готовность.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
      isRead: true,
      actionPage: 'competitions',
      actionLabel: 'Посмотреть соревнование',
      modalType: 'competition',
      modalData: {
        competitionId: 'competition-championship-2025',
      },
    },
    {
      id: 'notif-a-6',
      type: 'warning',
      title: 'Не все документы подписаны',
      message: 'У 5 спортсменов не подписаны документы для "Кубок Москвы по плаванию 2025".',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
      isRead: true,
      actionPage: 'documents',
      actionLabel: 'Перейти к документам',
    },
  ],
  judge: [
    {
      id: 'notif-j-1',
      type: 'success',
      title: 'Назначение на соревнование',
      message: 'Вы назначены судьей на соревнование "Чемпионат России по киберспорту 2025" с 15.03.2025 по 20.03.2025.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
      isRead: false,
      actionPage: 'competitions',
      actionLabel: 'Посмотреть детали',
      modalType: 'competition',
      modalData: {
        competitionId: 'competition-championship-2025',
      },
    },
    {
      id: 'notif-j-2',
      type: 'warning',
      title: 'Профиль требует заполнения',
      message: 'Для назначения на соревнования необходимо заполнить профиль.',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 дня назад
      isRead: true,
      actionPage: 'profile',
      actionLabel: 'Заполнить профиль',
    },
  ],
};

export function NotificationsPopover({ role, onNavigate, onOpenUserModal, onOpenApplicationModal, onOpenCompetitionModal }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications[role] || []);
  const [open, setOpen] = useState(false);

  // Обновляем уведомления при смене роли
  useEffect(() => {
    setNotifications(mockNotifications[role] || []);
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Отметить как прочитанное
    setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
    
    // Сначала открыть модальное окно (установить state)
    if (notification.modalType && notification.modalData) {
      switch (notification.modalType) {
        case 'user':
          if (notification.modalData.userId && onOpenUserModal) {
            onOpenUserModal(notification.modalData.userId);
          }
          break;
        case 'application':
          if (notification.modalData.applicationId && onOpenApplicationModal) {
            onOpenApplicationModal(notification.modalData.applicationId);
          }
          break;
        case 'competition':
          if (notification.modalData.competitionId && onOpenCompetitionModal) {
            onOpenCompetitionModal(notification.modalData.competitionId);
          }
          break;
      }
    }

    // Затем перейти на нужную страницу
    if (notification.actionPage && onNavigate) {
      onNavigate(notification.actionPage);
    }
    
    // Закрыть popover
    setOpen(false);
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCheck className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-amber-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative h-10 w-10 rounded-full inline-flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="end">
        <div className="flex flex-col max-h-[600px]">
          {/* Заголовок */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm">Уведомления</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount} непрочитанных
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-7 px-2"
                >
                  Прочитать все
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Очистить
                </Button>
              )}
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 text-center">
                  Уведомлений нет
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative',
                      !notification.isRead && 'bg-blue-50/30'
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Иконка */}
                      <div className={cn('shrink-0 w-8 h-8 rounded-full flex items-center justify-center', getNotificationBgColor(notification.type))}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Контент */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="shrink-0 text-blue-600 hover:text-blue-700"
                              title="Отметить как прочитанное"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {notification.actionLabel && (
                            <p className="text-xs text-blue-600">
                              {notification.actionLabel} →
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Индикатор непрочитанного */}
                    {!notification.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}