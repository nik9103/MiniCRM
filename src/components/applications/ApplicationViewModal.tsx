import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  FileText,
  Calendar,
  User,
  Trophy,
  Clock,
  Download,
  Check,
  XIcon,
  AlertCircle,
  Upload,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Application, ApplicationStatus, DocumentStatus, Document } from '../../types/application';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
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
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Role } from '../../App';
import { toast } from 'sonner';

interface ApplicationViewModalProps {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  userRole: Role;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDownloadDocuments?: (id: string) => void;
  onUploadScan?: (applicationId: string, documentId: string, file: File) => void;
  onDeleteScan?: (applicationId: string, documentId: string) => void;
  onDownloadDocument?: (applicationId: string, documentId: string) => void;
  onViewAthleteProfile?: (athleteId: string) => void;
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'На рассмотрении',
  approved: 'Принята',
  rejected: 'Отклонена',
};

const documentTypeLabels: Record<string, string> = {
  participation_agreement: 'Соглашение об участии в соревновании',
  antidoping_declaration: 'Антидопинговая декларация',
  ethical_declaration: 'Этическая декларация',
  personal_data_consent: 'Согласие на обработку персональных данных',
  nda: 'Соглашение о неразглашении (NDA)',
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

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
};

export function ApplicationViewModal({
  application,
  open,
  onClose,
  userRole,
  onApprove,
  onReject,
  onCancel,
  onDownloadDocuments,
  onUploadScan,
  onDeleteScan,
  onDownloadDocument,
  onViewAthleteProfile,
}: ApplicationViewModalProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  if (!application) return null;

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';
  const isAthlete = userRole === 'athlete';
  const canApproveOrReject = isManagerOrAdmin && application.status === 'pending';
  const canCancel = isAthlete && application.status === 'pending';

  const handleFileUpload = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Валидация размера
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10 МБ');
      return;
    }

    // Валидация формата
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Допустимые форматы: PDF, JPG, PNG');
      return;
    }

    if (onUploadScan) {
      onUploadScan(application.id, documentId, file);
      toast.success('Скан документа успешно загружен');
    }
  };

  const handleDeleteScan = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteScan = () => {
    if (documentToDelete && onDeleteScan) {
      onDeleteScan(application.id, documentToDelete);
      toast.success('Скан документа удален');
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[1000px] max-h-[95vh] flex flex-col p-0">
          {/* Хэдер */}
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl mb-2">Заявка {application.id}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(application.competitionDates.start, 'd MMMM', { locale: ru })} -{' '}
                      {format(application.competitionDates.end, 'd MMMM yyyy', { locale: ru })}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className={`${getStatusColor(application.status)} shrink-0`}>
                {statusLabels[application.status]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8 max-w-[850px] mx-auto">
              {/* Основная информация */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Основная информация</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">ID заявки</p>
                      <p className="mt-1.5">{application.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Дата подачи</p>
                      <p className="mt-1.5">
                        {format(application.submittedAt, 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Последнее изменение</p>
                      <p className="mt-1.5">
                        {application.statusChangedAt
                          ? format(application.statusChangedAt, 'd MMMM yyyy, HH:mm', { locale: ru })
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Статус</p>
                      <div className="mt-1.5">
                        <Badge className={getStatusColor(application.status)}>
                          {statusLabels[application.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о спортсмене */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Информация о спортсмене</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">ФИО</p>
                      <p className="mt-1.5">{application.athleteName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="mt-1.5">{application.athleteEmail || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Телефон</p>
                      <p className="mt-1.5">{application.athletePhone || '—'}</p>
                    </div>
                  </div>
                  {isManagerOrAdmin && onViewAthleteProfile && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAthleteProfile(application.athleteId)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Открыть профиль
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о соревновании */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Информация о соревновании</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Название соревнования</p>
                      <p className="mt-1.5">{application.competitionName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Вид спорта и дисциплина</p>
                      <p className="mt-1.5">
                        {application.competitionSport && application.competitionDiscipline
                          ? `${application.competitionSport} / ${application.competitionDiscipline}`
                          : application.competitionDiscipline || '—'}
                      </p>
                    </div>
                    {application.competitionParticipants && (
                      <div>
                        <p className="text-sm text-gray-600">Участников</p>
                        <p className="mt-1.5">
                          {application.competitionParticipants.current}/{application.competitionParticipants.total}
                        </p>
                      </div>
                    )}
                    <div></div>
                    <div>
                      <p className="text-sm text-gray-600">Даты проведения</p>
                      <p className="mt-1.5">
                        {format(application.competitionDates.start, 'd MMMM', { locale: ru })} -{' '}
                        {format(application.competitionDates.end, 'd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Причина отклонения */}
              {application.status === 'rejected' && application.rejectionReason && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-base">Причина отклонения</h3>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900">{application.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Документы */}
              {(application.status === 'approved' || application.status === 'pending') && application.documents && application.documents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="text-base">Документы</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{documentTypeLabels[doc.type] || doc.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.uploadedAt 
                                ? `Подписан ${format(doc.uploadedAt, 'd.MM.yyyy', { locale: ru })} • PDF • ${formatFileSize(doc.fileSize)}`
                                : `Требуется загрузка подписанного скана`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            className={
                              doc.status === 'signed'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            }
                          >
                            {doc.status === 'signed' ? 'Подписан' : 'Ожидает подписания'}
                          </Badge>
                          
                          {/* Кнопка "Скачать" - всегда доступна */}
                          {onDownloadDocument && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              onClick={() => onDownloadDocument(application.id, doc.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Если подписан - показываем кнопку удаления для менеджера/админа */}
                          {doc.status === 'signed' && isManagerOrAdmin && onDeleteScan && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteScan(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Если не подписан - показываем кнопку загрузки для менеджера/админа */}
                          {doc.status === 'generated' && isManagerOrAdmin && onUploadScan && (
                            <label htmlFor={`upload-${doc.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`upload-${doc.id}`)?.click()}
                              >
                                Загрузить скан
                              </Button>
                              <input
                                id={`upload-${doc.id}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleFileUpload(doc.id, e)}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Информация о процессе для принятых заявок */}
              {application.status === 'approved' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Следующие шаги:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Скачайте пакет документов</li>
                        <li>Распечатайте и подпишите документы</li>
                        <li>Отсканируйте подписанные документы</li>
                        <li>Загрузите сканы в систему через менеджера</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
            <div className="flex items-center justify-between w-full gap-4">
              <div>
                {/* Скачать пакет документов - доступно всем ролям для pending и approved заявок с документами */}
                {(application.status === 'approved' || application.status === 'pending') && application.documents && application.documents.length > 0 && onDownloadDocuments && (
                  <Button variant="outline" onClick={() => onDownloadDocuments(application.id)}>
                    <Download className="w-4 h-4 mr-2" />
                    Скачать пакет документов
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {canApproveOrReject && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onReject && onReject(application.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Отклонить
                    </Button>
                    <Button onClick={() => onApprove && onApprove(application.id)}>
                      <Check className="w-4 h-4 mr-2" />
                      Принять
                    </Button>
                  </>
                )}

                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={() => onCancel && onCancel(application.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Отменить заявку
                  </Button>
                )}

                {!canApproveOrReject && !canCancel && (
                  <Button variant="outline" onClick={onClose}>
                    Закрыть
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления скана */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить скан документа?</AlertDialogTitle>
            <AlertDialogDescription>
              Документ вернется в статус "Ожидает подписания". Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отменить</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteScan} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}