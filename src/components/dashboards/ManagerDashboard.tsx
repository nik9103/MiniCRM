import { FileText, Trophy, Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MetricCard } from '../dashboard/MetricCard';
import { ActivityItem, ActivityType } from '../dashboard/ActivityItem';

// Моковые данные
const managerData = {
  metrics: {
    newApplications: 12,
    activeCompetitions: 5,
    registeredJudges: 28,
    activeAthletes: 145,
  },
  recentActivities: [
    {
      type: 'success' as ActivityType,
      title: 'Заявка одобрена',
      description: 'Спортсмен Иванов И.И. одобрен для участия в "Чемпионат России"',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
    },
    {
      type: 'info' as ActivityType,
      title: 'Новое соревнование создано',
      description: 'Создано соревнование "Кубок Москвы по плаванию 2025"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
    },
    {
      type: 'warning' as ActivityType,
      title: 'Заявка отклонена',
      description: 'Заявка спортсмена Петрова П.П. отклонена: неполный пакет документов',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
    },
    {
      type: 'success' as ActivityType,
      title: 'Судья назначен',
      description: 'Судья Сидоров С.С. назначен на соревнование "Первенство города"',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
    },
    {
      type: 'info' as ActivityType,
      title: 'Новая регистрация',
      description: 'Зарегистрирован новый спортсмен: Козлов К.К.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
    },
  ],
};

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1>Панель управления</h1>
        <p className="text-gray-600 mt-1">
          Обзор системы и ключевые метрики
        </p>
      </div>

      {/* Метрики */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Новые заявки"
          value={managerData.metrics.newApplications}
          icon={FileText}
          variant={managerData.metrics.newApplications === 0 ? 'muted' : 'default'}
        />
        <MetricCard
          title="Активные соревнования"
          value={managerData.metrics.activeCompetitions}
          icon={Trophy}
        />
        <MetricCard
          title="Зарегистрированные судьи"
          value={managerData.metrics.registeredJudges}
          icon={Users}
        />
        <MetricCard
          title="Активные спортсмены"
          value={managerData.metrics.activeAthletes}
          icon={UserCheck}
        />
      </div>

      {/* Последние действия */}
      <Card>
        <CardHeader>
          <CardTitle>Последние действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {managerData.recentActivities.map((activity, index) => (
              <ActivityItem
                key={index}
                type={activity.type}
                title={activity.title}
                description={activity.description}
                timestamp={activity.timestamp}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}