import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'muted';
}

export function MetricCard({ title, value, icon: Icon, variant = 'default' }: MetricCardProps) {
  return (
    <Card className={variant === 'muted' ? 'bg-gray-50' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${variant === 'muted' ? 'bg-gray-200' : 'bg-blue-50'}`}>
            <Icon className={`w-6 h-6 ${variant === 'muted' ? 'text-gray-500' : 'text-blue-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
