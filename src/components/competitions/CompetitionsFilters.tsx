import { Search } from 'lucide-react';
import { CompetitionFilters, CompetitionStatus } from '../../types/competition';
import { Role } from '../../App';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';

interface CompetitionsFiltersProps {
  filters: CompetitionFilters;
  onFiltersChange: (filters: CompetitionFilters) => void;
  role: Role;
}

export function CompetitionsFilters({ filters, onFiltersChange, role }: CompetitionsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        {/* Поиск */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по названию..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Статус */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value as CompetitionStatus | 'all' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="planned">Запланировано</SelectItem>
            <SelectItem value="ongoing">Уже идет</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
          </SelectContent>
        </Select>

        {/* Фильтр для спортсмена */}
        {role === 'athlete' && (
          <Select
            value={filters.athleteFilter || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                athleteFilter: value as 'all' | 'applied' | 'available',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="applied">Подана заявка</SelectItem>
              <SelectItem value="available">Доступные для заявки</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Диапазон дат */}
      <div className="flex gap-4 items-center">
        <span className="text-sm text-gray-600">Период:</span>
        <Input
          type="date"
          value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateFrom: e.target.value ? new Date(e.target.value) : null,
            })
          }
          className="w-[180px]"
        />
        <span className="text-gray-400">—</span>
        <Input
          type="date"
          value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateTo: e.target.value ? new Date(e.target.value) : null,
            })
          }
          className="w-[180px]"
        />
        {(filters.dateFrom || filters.dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ ...filters, dateFrom: null, dateTo: null })}
          >
            Сбросить даты
          </Button>
        )}
      </div>
    </div>
  );
}

function format(date: Date, formatStr: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
