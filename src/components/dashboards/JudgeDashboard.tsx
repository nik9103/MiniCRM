import { User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChecklistItem } from '../dashboard/ChecklistItem';

// Моковые данные
const judgeData = {
  name: 'Алексей Смирнов',
  profileComplete: true,
  hasActivity: false,
};

export function JudgeDashboard() {
  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div>
        <h1>Добро пожаловать, {judgeData.name}!</h1>
        <p className="text-gray-600 mt-1">
          Личный кабинет судьи
        </p>
      </div>

      {/* Статус и навигация */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Статус */}
        <Card>
          <CardHeader>
            <CardTitle>Статус профиля</CardTitle>
          </CardHeader>
          <CardContent>
            <ChecklistItem
              label="Профиль успешно создан"
              checked={judgeData.profileComplete}
            />
            {judgeData.profileComplete && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  Ваш профиль успешно создан. Ожидайте назначения на соревнования.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Активность */}
        <Card>
          <CardHeader>
            <CardTitle>Лента активностей</CardTitle>
          </CardHeader>
          <CardContent>
            {judgeData.hasActivity ? (
              <div className="space-y-3">
                {/* Здесь будут отображаться активности когда они появятся */}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Пока нет активности</p>
                <p className="text-sm text-gray-400 mt-1">
                  Информация о назначениях появится здесь
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}