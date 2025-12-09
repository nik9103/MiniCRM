import { ApplicationStatus } from '../../types/application';
import { Role } from '../../App';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ApplicationsFiltersProps {
  statusFilter: string;
  competitionFilter: string;
  competitions: Array<{ id: string; name: string }>;
  onStatusChange: (status: string) => void;
  onCompetitionChange: (competitionId: string) => void;
  role: Role;
}

export function ApplicationsFilters({
  statusFilter,
  competitionFilter,
  competitions,
  onStatusChange,
  onCompetitionChange,
  role,
}: ApplicationsFiltersProps) {
  const isManagerOrAdmin = role === 'manager' || role === 'admin';

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        {/* Фильтр по соревнованию (только для менеджера/админа) */}
        {isManagerOrAdmin && (
          <div className="md:col-span-2">
            <Select value={competitionFilter} onValueChange={onCompetitionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Все соревнования" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все соревнования</SelectItem>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Статус */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">На рассмотрении</SelectItem>
            <SelectItem value="approved">Принята</SelectItem>
            <SelectItem value="rejected">Отклонена</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
