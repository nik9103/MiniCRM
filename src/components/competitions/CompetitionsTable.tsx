import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
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
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'planned':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'completed':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-[80px] text-gray-500 uppercase text-xs">ID</TableHead>
            <TableHead className="text-gray-500 uppercase text-xs">Название</TableHead>
            <TableHead className="text-gray-500 uppercase text-xs">Дисциплина</TableHead>
            <TableHead className="text-gray-500 uppercase text-xs">Дата начала</TableHead>
            <TableHead className="text-gray-500 uppercase text-xs">Дата окончания</TableHead>
            <TableHead className="text-gray-500 uppercase text-xs">Статус</TableHead>
            {showActions && <TableHead className="w-[120px] text-gray-500 uppercase text-xs">Действия</TableHead>}
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
                className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                onClick={() => onView(competition)}
              >
                <TableCell className="text-blue-600">{competition.id}</TableCell>
                <TableCell>{competition.officialShortName}</TableCell>
                <TableCell className="text-gray-600">{competition.discipline}</TableCell>
                <TableCell className="text-gray-600">
                  {format(competition.startDate, 'dd.MM.yyyy', { locale: ru })}
                </TableCell>
                <TableCell className="text-gray-600">
                  {format(competition.endDate, 'dd.MM.yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(competition.status)}>
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