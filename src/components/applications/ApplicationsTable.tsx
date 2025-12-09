import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Eye, Check, X as XIcon, Download } from 'lucide-react';
import { Application, ApplicationStatus } from '../../types/application';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Role } from '../../App';

interface ApplicationsTableProps {
  applications: Application[];
  userRole: Role;
  onViewApplication: (application: Application) => void;
  onApproveApplication: (id: string) => void;
  onRejectApplication: (id: string) => void;
  onCancelApplication: (id: string) => void;
  onDownloadDocuments?: (id: string) => void;
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'На рассмотрении',
  approved: 'Принята',
  rejected: 'Отклонена',
};

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    case 'approved':
      return 'bg-green-100 text-green-700 hover:bg-green-100';
    case 'rejected':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
  }
};

export function ApplicationsTable({
  applications,
  userRole,
  onViewApplication,
  onApproveApplication,
  onRejectApplication,
  onCancelApplication,
  onDownloadDocuments,
}: ApplicationsTableProps) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'cancel'>('approve');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';
  const isAthlete = userRole === 'athlete';

  const handleAction = (type: 'approve' | 'reject' | 'cancel', id: string) => {
    setActionType(type);
    setSelectedApplicationId(id);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedApplicationId) return;

    switch (actionType) {
      case 'approve':
        onApproveApplication(selectedApplicationId);
        break;
      case 'reject':
        onRejectApplication(selectedApplicationId);
        break;
      case 'cancel':
        onCancelApplication(selectedApplicationId);
        break;
    }

    setActionDialogOpen(false);
    setSelectedApplicationId(null);
  };

  const getActionDialogContent = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Принять заявку?',
          description: 'Система автоматически сгенерирует пакет документов для подписания. Спортсмен будет включен в список участников соревнования.',
        };
      case 'reject':
        return {
          title: 'Отклонить заявку?',
          description: 'Спортсмен получит уведомление об отклонении заявки. Это действие можно будет отменить.',
        };
      case 'cancel':
        return {
          title: 'Отменить заявку?',
          description: 'Вы уверены, что хотите отменить эту заявку? Вы сможете подать новую заявку на это соревнование позже.',
        };
    }
  };

  const dialogContent = getActionDialogContent();

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[100px] text-gray-500 uppercase text-xs">ID Заявки</TableHead>
              {isManagerOrAdmin && (
                <TableHead className="text-gray-500 uppercase text-xs">ФИО Спортсмена</TableHead>
              )}
              <TableHead className="text-gray-500 uppercase text-xs">Соревнование</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Дата подачи</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Статус</TableHead>
              <TableHead className="w-[180px] text-gray-500 uppercase text-xs text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManagerOrAdmin ? 6 : 5} className="text-center py-8 text-gray-500">
                  Заявки не найдены
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow
                  key={application.id}
                  className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                  onClick={() => onViewApplication(application)}
                >
                  <TableCell className="text-blue-600">{application.id}</TableCell>
                  {isManagerOrAdmin && (
                    <TableCell>{application.athleteName}</TableCell>
                  )}
                  <TableCell>
                    <div>
                      <p>{application.competitionName}</p>
                      <p className="text-sm text-gray-500">
                        {format(application.competitionDates.start, 'd MMM', { locale: ru })} -{' '}
                        {format(application.competitionDates.end, 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {format(application.submittedAt, 'd MMMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      {statusLabels[application.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Действия для менеджера/админа */}
                      {isManagerOrAdmin && application.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction('approve', application.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction('reject', application.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {/* Кнопка скачивания документов для принятых заявок */}
                      {isManagerOrAdmin && application.status === 'approved' && onDownloadDocuments && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownloadDocuments(application.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Действия для спортсмена */}
                      {isAthlete && application.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction('cancel', application.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Прочерк для остальных статусов */}
                      {((isManagerOrAdmin && application.status !== 'pending' && application.status !== 'approved') ||
                        (isAthlete && application.status !== 'pending')) && (
                        <span className="text-gray-400 px-4">—</span>
                      )}

                      {/* Кнопка просмотра всегда доступна */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewApplication(application)}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Диалог подтверждения действия */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отменить</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionType === 'reject' || actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionType === 'approve' && 'Принять'}
              {actionType === 'reject' && 'Отклонить'}
              {actionType === 'cancel' && 'Отменить заявку'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
