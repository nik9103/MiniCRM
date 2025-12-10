import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Competition, CompetitionStatus } from '../../types/competition';
import { Role } from '../../App';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface CompetitionsTableProps {
  competitions: Competition[];
  role: Role;
  onView: (competition: Competition) => void;
  onEdit?: (competition: Competition) => void;
  onDelete?: (competition: Competition) => void;
  onApply?: (competition: Competition) => void;
  athleteApplications?: string[];
}

const statusLabels: Record<CompetitionStatus, string> = {
  planned: 'Запланировано',
  ongoing: 'Уже идет',
  completed: 'Завершено',
};

export function CompetitionsTable({
  competitions,
  role,
  onView,
  onEdit,
  onDelete,
  onApply,
  athleteApplications = [],
}: CompetitionsTableProps) {
  const showActions = role === 'manager' || role === 'admin' || role === 'athlete';

  const canApply = (competition: Competition) => {
    return competition.status === 'planned' && !athleteApplications.includes(competition.id);
  };

  const getStatusColor = (status: CompetitionStatus) => {
    switch (status) {
      case 'ongoing':
        return 'bg-[#DCFCE7] text-[#008236] hover:bg-[#DCFCE7]';
      case 'planned':
        return 'bg-[#DBEAFE] text-[#1447E6] hover:bg-[#DBEAFE]';
      case 'completed':
        return 'bg-[#E5E7EB] text-[#364153] hover:bg-[#E5E7EB]';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-[10px] border border-[#E5E7EB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB] h-10 border-b border-[rgba(0,0,0,0.1)]">
            <TableHead className="w-[80px] text-[#6A7282] uppercase text-[12px] font-medium">ID</TableHead>
            <TableHead className="text-[#6A7282] uppercase text-[12px] font-medium">Название</TableHead>
            <TableHead className="text-[#6A7282] uppercase text-[12px] font-medium">Дисциплина</TableHead>
            <TableHead className="text-[#6A7282] uppercase text-[12px] font-medium">Дата начала</TableHead>
            <TableHead className="text-[#6A7282] uppercase text-[12px] font-medium">Дата окончания</TableHead>
            <TableHead className="text-[#6A7282] uppercase text-[12px] font-medium">Статус</TableHead>
            {showActions && <TableHead className="w-[120px] text-[#6A7282] uppercase text-[12px] font-medium">Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-gray-500">
                Соревнования не найдены
              </TableCell>
            </TableRow>
          ) : (
            competitions.map((competition) => (
              <TableRow
                key={competition.id}
                className="cursor-pointer hover:bg-[#F9FAFB] border-b border-[#F3F4F6] h-[49px]"
                onClick={() => onView(competition)}
              >
                <TableCell className="text-[#155DFC] text-[14px] leading-[20px]">{competition.id}</TableCell>
                <TableCell className="text-[14px] leading-[20px] text-[#0A0A0A]">
                  {competition.officialShortName}
                </TableCell>
                <TableCell className="text-[14px] leading-[20px] text-[#4A5565]">
                  {competition.discipline}
                </TableCell>
                <TableCell className="text-[14px] leading-[20px] text-[#4A5565]">
                  {format(competition.startDate, 'dd.MM.yyyy', { locale: ru })}
                </TableCell>
                <TableCell className="text-[14px] leading-[20px] text-[#4A5565]">
                  {format(competition.endDate, 'dd.MM.yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  <Badge className={cn('rounded-lg px-3 py-1 text-[12px] font-medium', getStatusColor(competition.status))}>
                    {statusLabels[competition.status]}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {role === 'athlete' ? (
                      canApply(competition) ? (
                        <Button
                          size="sm"
                          onClick={() => onApply?.(competition)}
                        >
                          Подать заявку
                        </Button>
                      ) : athleteApplications.includes(competition.id) ? (
                        <Badge variant="secondary">Заявка подана</Badge>
                      ) : null
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(competition);
                          }}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                          disabled={competition.status !== 'planned'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(competition);
                          }}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                          disabled={competition.status !== 'planned'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}