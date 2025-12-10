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
      <div className="flex flex-wrap items-center gap-4">
        {/* Статус */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value as CompetitionStatus | 'all' })
          }
        >
          <SelectTrigger className="w-[180px] h-9 rounded-lg bg-[#F3F3F5] border border-transparent text-[14px] text-[#0A0A0A]">
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
            <SelectTrigger className="w-[180px] h-9 rounded-lg bg-[#F3F3F5] border border-transparent text-[14px] text-[#0A0A0A]">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="applied">Подана заявка</SelectItem>
              <SelectItem value="available">Доступные для заявки</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Поиск */}
        <div className="relative flex-1 min-w-[280px] max-w-[520px] ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99A1AF]" />
          <Input
            placeholder="Поиск по названию..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9 rounded-lg bg-[#F3F3F5] border border-transparent text-[16px] leading-[19px] text-[#717182] placeholder:text-[#717182] focus-visible:ring-1 focus-visible:ring-[#155DFC] focus-visible:border-transparent"
          />
        </div>
      </div>

      {/* Диапазон дат */}
      <div className="flex flex-wrap gap-4 items-center text-sm text-[#4A5565]">
        <span className="text-[14px] leading-[20px]">Период:</span>
        <Input
          type="date"
          value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateFrom: e.target.value ? new Date(e.target.value) : null,
            })
          }
          className="w-[180px] h-9 rounded-lg bg-[#F3F3F5] border border-transparent text-[14px] text-[#0A0A0A] focus-visible:ring-1 focus-visible:ring-[#155DFC] focus-visible:border-transparent"
        />
        <span className="text-[#99A1AF] text-base">—</span>
        <Input
          type="date"
          value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateTo: e.target.value ? new Date(e.target.value) : null,
            })
          }
          className="w-[180px] h-9 rounded-lg bg-[#F3F3F5] border border-transparent text-[14px] text-[#0A0A0A] focus-visible:ring-1 focus-visible:ring-[#155DFC] focus-visible:border-transparent"
        />
        {(filters.dateFrom || filters.dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#364153] hover:bg-[#F5F6F7]"
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
