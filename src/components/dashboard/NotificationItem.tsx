import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; bgColor: string; iconColor: string }> = {
  info: { icon: Info, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  success: { icon: CheckCircle, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
  warning: { icon: AlertCircle, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600' },
  error: { icon: AlertCircle, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
};

export function NotificationItem({ type, title, message, timestamp }: NotificationItemProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
      <div className={`p-2 rounded-lg ${config.bgColor} h-fit`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <p className="font-medium text-gray-900">{title}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDistanceToNow(timestamp, { addSuffix: true, locale: ru })}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
    </div>
  );
}
