import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  FileText,
  Building2,
  Users,
  Trophy,
  Calendar,
  Download,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  FileDown,
  AlertCircle,
} from 'lucide-react';
import { Competition, ParticipantStatus } from '../../types/competition';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
import { toast } from 'sonner';
import { RefereeSelectionDialog } from './RefereeSelectionDialog';

type UserRole = 'athlete' | 'manager' | 'referee' | 'admin';

interface CompetitionViewModalProps {
  competition: Competition | null;
  open: boolean;
  onClose: () => void;
  onEdit: (competition: Competition) => void;
  onDelete: (id: string) => void;
  userRole: UserRole;
}

const statusLabels: Record<string, string> = {
  planned: 'Запланировано',
  ongoing: 'В процессе',
  completed: 'Завершено',
};

const participantStatusLabels: Record<ParticipantStatus, string> = {
  pending: 'На рассмотрении',
  approved: 'Принята',
  rejected: 'Отклонена',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned':
      return 'bg-blue-100 text-blue-800';
    case 'ongoing':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getParticipantStatusColor = (status: ParticipantStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function CompetitionViewModal({
  competition,
  open,
  onClose,
  onEdit,
  onDelete,
  userRole,
}: CompetitionViewModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusChanged, setStatusChanged] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refereeToDelete, setRefereeToDelete] = useState<string | null>(null);
  const [refereeSelectionDialogOpen, setRefereeSelectionDialogOpen] = useState(false);

  if (!competition) return null;

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';
  const isAthlete = userRole === 'athlete';
  const canEdit = isManagerOrAdmin && competition.status === 'planned';

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setStatusChanged(value !== competition.status);
  };

  const handleApplyStatus = () => {
    // Здесь логика применения нового статуса
    toast.success('Статус соревнования обновлен');
    setStatusChanged(false);
  };

  const handleDeleteCompetition = () => {
    onDelete(competition.id);
    setDeleteDialogOpen(false);
    onClose();
    toast.success('Соревнование удалено');
  };

  const handleDownloadDocuments = () => {
    toast.success('Пакет документов скачан');
  };

  const handleGenerateParticipantsList = () => {
    toast.success('Документ о составе участников сформирован');
  };

  const handleAssignReferee = () => {
    setRefereeSelectionDialogOpen(true);
  };

  const handleAssignReferees = (refereeIds: string[]) => {
    // Здесь логика назначения судей
    if (refereeIds.length > 0) {
      toast.success(`Назначено судей: ${refereeIds.length}`);
    }
    setRefereeSelectionDialogOpen(false);
  };

  const handleRemoveReferee = (refereeId: string) => {
    // Логика удаления судьи
    toast.success('Судья удален');
    setRefereeToDelete(null);
  };

  const handleApplyToCompetition = () => {
    // Проверка заполнения профиля
    const isProfileComplete = true; // Моковая проверка
    
    if (!isProfileComplete) {
      toast.error('Необходимо заполнить профиль перед подачей заявки');
      return;
    }
    
    toast.success('Заявка подана');
    onClose();
  };

  const approvedParticipantsCount = competition.participants?.filter(p => p.status === 'approved').length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[1000px] max-h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl mb-2">{competition.officialFullName}</DialogTitle>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(competition.startDate, 'd MMMM yyyy', { locale: ru })} -{' '}
                      {format(competition.endDate, 'd MMMM yyyy', { locale: ru })}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className={`${getStatusColor(competition.status)} shrink-0`}>
                {statusLabels[competition.status]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8 max-w-[950px] mx-auto">
              {/* Основная информация */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Основная информация</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Дисциплина</p>
                    <p className="mt-1.5">{competition.discipline}</p>
                  </div>
                  {competition.videoGame && (
                    <div>
                      <p className="text-sm text-gray-600">Вид программы</p>
                      <p className="mt-1.5">{competition.videoGame}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Участников</p>
                    <p className="mt-1.5">{approvedParticipantsCount}/{competition.participantsCount}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Организатор</p>
                    <p className="mt-1.5">{competition.organizer.fullName}</p>
                  </div>
                  {competition.coOrganizer && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Соорганизатор</p>
                      <p className="mt-1.5">{competition.coOrganizer.fullName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Включено в Перечень Минспорта</p>
                    <p className="mt-1.5">{competition.includedInMinistryList ? 'Да' : 'Нет'}</p>
                  </div>
                </div>
              </div>

              {/* Участники */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base">Участники</h3>
                  </div>
                  {isManagerOrAdmin && competition.participants && competition.participants.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateParticipantsList}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Сформировать документ
                    </Button>
                  )}
                </div>
                {competition.participants && competition.participants.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm text-gray-600">ФИО</th>
                          {isManagerOrAdmin && (
                            <th className="px-4 py-3 text-left text-sm text-gray-600">Статус</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {competition.participants.map((participant) => (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{participant.fullName}</td>
                            {isManagerOrAdmin && (
                              <td className="px-4 py-3">
                                <Badge className={getParticipantStatusColor(participant.status)}>
                                  {participantStatusLabels[participant.status]}
                                </Badge>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center">Нет участников</p>
                )}
              </div>

              {/* Судейский состав */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base">Судейский состав</h3>
                  </div>
                  {isManagerOrAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAssignReferee}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Назначить судью
                    </Button>
                  )}
                </div>
                {competition.referees && competition.referees.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm text-gray-600">ФИО</th>
                          {isManagerOrAdmin && (
                            <th className="px-4 py-3 text-right text-sm text-gray-600">Действия</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {competition.referees.map((referee) => (
                          <tr key={referee.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{referee.fullName}</td>
                            {isManagerOrAdmin && (
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRefereeToDelete(referee.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserMinus className="w-4 h-4 mr-1" />
                                  Удалить
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center">Нет назначенных судей</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
            <div className="flex items-center justify-between w-full gap-4 flex-wrap">
              <Button variant="outline" onClick={handleDownloadDocuments}>
                <Download className="w-4 h-4 mr-2" />
                Скачать пакет документов
              </Button>

              <div className="flex items-center gap-3 flex-wrap">
                {isManagerOrAdmin && (
                  <>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedStatus || competition.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Запланировано</SelectItem>
                          <SelectItem value="ongoing">В процессе</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleApplyStatus}
                        disabled={!statusChanged}
                        size="sm"
                      >
                        Применить
                      </Button>
                    </div>

                    {canEdit && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => onEdit(competition)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить
                        </Button>
                      </>
                    )}
                  </>
                )}

                {isAthlete && canEdit && (
                  <Button onClick={handleApplyToCompetition}>
                    Подать заявку
                  </Button>
                )}

                {!isAthlete && !canEdit && (
                  <Button variant="outline" onClick={onClose}>
                    Закрыть
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления соревнования */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить соревнование?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Соревнование и все связанные с ним заявки будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отменить</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompetition}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения удаления судьи */}
      <AlertDialog open={!!refereeToDelete} onOpenChange={() => setRefereeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить судью?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этого судью из состава?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отменить</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => refereeToDelete && handleRemoveReferee(refereeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог выбора судей */}
      <RefereeSelectionDialog
        open={refereeSelectionDialogOpen}
        onOpenChange={setRefereeSelectionDialogOpen}
        competitionId={competition.id}
        onAssignReferees={handleAssignReferees}
        assignedRefereeIds={competition.referees?.map(r => r.id) || []}
      />
    </>
  );
}