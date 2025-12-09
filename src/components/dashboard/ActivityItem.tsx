import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export type ActivityType = 'info' | 'success' | 'warning' | 'error';

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
}

const typeStyles: Record<ActivityType, { bgColor: string; dotColor: string }> = {
  info: { bgColor: 'bg-blue-50', dotColor: 'bg-blue-600' },
  success: { bgColor: 'bg-green-50', dotColor: 'bg-green-600' },
  warning: { bgColor: 'bg-yellow-50', dotColor: 'bg-yellow-600' },
  error: { bgColor: 'bg-red-50', dotColor: 'bg-red-600' },
};

export function ActivityItem({ type, title, description, timestamp }: ActivityItemProps) {
  const styles = typeStyles[type];
  
  return (
    <div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${styles.dotColor} mt-2`} />
        <div className="w-0.5 h-full bg-gray-200 mt-2" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDistanceToNow(timestamp, { addSuffix: true, locale: ru })}
          </span>
        </div>
      </div>
    </div>
  );
}
