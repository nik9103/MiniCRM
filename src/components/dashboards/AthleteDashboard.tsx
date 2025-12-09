import { User, FileText, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChecklistItem } from '../dashboard/ChecklistItem';
import { NotificationItem, NotificationType } from '../dashboard/NotificationItem';

// Моковые данные
const athleteData = {
  name: 'Иван Петров',
  checklist: {
    profileComplete: true,
    hasActiveApplications: true,
    hasAvailableCompetitions: true,
  },
  notifications: [
    {
      type: 'success' as NotificationType,
      title: 'Заявка одобрена',
      message: 'Ваша заявка на участие в "Чемпионат России по легкой атлетике" одобрена',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
    },
    {
      type: 'info' as NotificationType,
      title: 'Новое соревнование',
      message: 'Открыта регистрация на "Кубок Москвы по плаванию 2025"',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 часов назад
    },
    {
      type: 'warning' as NotificationType,
      title: 'Требуется обновление документов',
      message: 'Срок действия медицинской справки истекает через 7 дней',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
    },
  ],
};

export function AthleteDashboard() {
  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div>
        <h1>Добро пожаловать, {athleteData.name}!</h1>
        <p className="text-gray-600 mt-1">
          Ваш центр управления для участия в соревнованиях
        </p>
      </div>

      {/* Чеклист */}
      <Card>
        <CardHeader>
          <CardTitle>Статус</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ChecklistItem
            label="Профиль заполнен"
            checked={athleteData.checklist.profileComplete}
          />
          <ChecklistItem
            label="Активные заявки"
            checked={athleteData.checklist.hasActiveApplications}
          />
          <ChecklistItem
            label="Доступные соревнования"
            checked={athleteData.checklist.hasAvailableCompetitions}
          />
        </CardContent>
      </Card>

      {/* Последние уведомления */}
      <Card>
        <CardHeader>
          <CardTitle>Последние уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          {athleteData.notifications.length > 0 ? (
            <div className="space-y-3">
              {athleteData.notifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  timestamp={notification.timestamp}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Уведомлений нет</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}