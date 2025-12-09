import { useState, useMemo, useEffect } from 'react';
import { Application } from '../../types/application';
import { ApplicationsTable } from '../applications/ApplicationsTable';
import { ApplicationsFilters } from '../applications/ApplicationsFilters';
import { ApplicationViewModal } from '../applications/ApplicationViewModal';
import { Card } from '../ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { toast } from 'sonner';
import { Role } from '../../App';

interface ApplicationsPageProps {
  role: Role;
  modalToOpen?: string;
  onModalOpened?: () => void;
}

// Моковые данные заявок
const mockApplications: Application[] = [
  {
    id: '#2025001',
    athleteId: 'athlete-1',
    athleteName: 'Иванов Петр Сергеевич',
    athleteEmail: 'ivanov@example.com',
    athletePhone: '+7 (999) 123-45-67',
    competitionId: 'comp-1',
    competitionName: 'Чемпионат России по киберспорту 2025',
    competitionSport: 'Киберспорт',
    competitionDiscipline: 'Dota 2',
    competitionDates: {
      start: new Date('2025-03-15'),
      end: new Date('2025-03-20'),
    },
    competitionParticipants: {
      current: 15,
      total: 40,
    },
    submittedAt: new Date('2025-02-10T10:30:00'),
    status: 'pending',
    documents: [
      {
        id: 'doc-pending-1',
        type: 'participation_agreement',
        name: 'Соглашение об участии',
        createdAt: new Date('2025-02-10T10:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-15T14:20:00'),
        version: 1,
        fileSize: 1850000,
      },
      {
        id: 'doc-pending-2',
        type: 'antidoping_declaration',
        name: 'Антидопинговая декларация',
        createdAt: new Date('2025-02-10T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 180000,
      },
      {
        id: 'doc-pending-3',
        type: 'ethical_declaration',
        name: 'Этическая декларация',
        createdAt: new Date('2025-02-10T10:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-15T14:22:00'),
        version: 1,
        fileSize: 2050000,
      },
      {
        id: 'doc-pending-4',
        type: 'personal_data_consent',
        name: 'Согласие на обработку персональных данных',
        createdAt: new Date('2025-02-10T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 320000,
      },
      {
        id: 'doc-pending-5',
        type: 'nda',
        name: 'Соглашение о неразглашении',
        createdAt: new Date('2025-02-10T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 410000,
      },
    ],
  },
  {
    id: '#2025002',
    athleteId: 'athlete-2',
    athleteName: 'Смирнова Анна Викторовна',
    athleteEmail: 'smirnova@example.com',
    athletePhone: '+7 (999) 234-56-78',
    competitionId: 'comp-1',
    competitionName: 'Чемпионат России по киберспорту 2025',
    competitionSport: 'Киберспорт',
    competitionDiscipline: 'Dota 2',
    competitionDates: {
      start: new Date('2025-03-15'),
      end: new Date('2025-03-20'),
    },
    competitionParticipants: {
      current: 15,
      total: 40,
    },
    submittedAt: new Date('2025-02-09T14:20:00'),
    status: 'approved',
    statusChangedAt: new Date('2025-02-11T09:15:00'),
    documents: [
      {
        id: 'doc-1',
        type: 'participation_agreement',
        name: 'Соглашение об участии',
        createdAt: new Date('2025-02-11T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 245000,
      },
      {
        id: 'doc-2',
        type: 'antidoping_declaration',
        name: 'Антидопинговая декларация',
        createdAt: new Date('2025-02-11T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 180000,
      },
      {
        id: 'doc-3',
        type: 'ethical_declaration',
        name: 'Этическая декларация',
        createdAt: new Date('2025-02-11T09:15:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-12T16:30:00'),
        version: 1,
        fileSize: 2100000,
      },
      {
        id: 'doc-4',
        type: 'personal_data_consent',
        name: 'Согласие на обработку персональных данных',
        createdAt: new Date('2025-02-11T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 320000,
      },
      {
        id: 'doc-5',
        type: 'nda',
        name: 'Соглашение о неразглашении',
        createdAt: new Date('2025-02-11T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 410000,
      },
    ],
  },
  {
    id: '#2025003',
    athleteId: 'athlete-3',
    athleteName: 'Козлов Дмитрий Александрович',
    athleteEmail: 'kozlov@example.com',
    athletePhone: '+7 (999) 345-67-89',
    competitionId: 'comp-2',
    competitionName: 'Кубок Москвы по FIFA 2025',
    competitionSport: 'Киберспорт',
    competitionDiscipline: 'FIFA',
    competitionDates: {
      start: new Date('2025-04-10'),
      end: new Date('2025-04-12'),
    },
    competitionParticipants: {
      current: 8,
      total: 16,
    },
    submittedAt: new Date('2025-02-08T16:45:00'),
    status: 'rejected',
    statusChangedAt: new Date('2025-02-10T11:20:00'),
    rejectionReason: 'Не предоставлены все необходимые документы. Пожалуйста, загрузите скан паспорта и справку из спортивной организации.',
  },
  {
    id: '#2025004',
    athleteId: 'athlete-4',
    athleteName: 'Петрова Ольга Игоревна',
    athleteEmail: 'petrova@example.com',
    athletePhone: '+7 (999) 456-78-90',
    competitionId: 'comp-1',
    competitionName: 'Чемпионат России по киберспорту 2025',
    competitionSport: 'Киберспорт',
    competitionDiscipline: 'Dota 2',
    competitionDates: {
      start: new Date('2025-03-15'),
      end: new Date('2025-03-20'),
    },
    competitionParticipants: {
      current: 15,
      total: 40,
    },
    submittedAt: new Date('2025-02-07T09:10:00'),
    status: 'approved',
    statusChangedAt: new Date('2025-02-08T14:30:00'),
    documents: [
      {
        id: 'doc-6',
        type: 'participation_agreement',
        name: 'Соглашение об участии',
        createdAt: new Date('2025-02-08T14:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-09T10:00:00'),
        version: 1,
        fileSize: 1850000,
      },
      {
        id: 'doc-7',
        type: 'antidoping_declaration',
        name: 'Антидопинговая декларация',
        createdAt: new Date('2025-02-08T14:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-09T10:00:00'),
        version: 1,
        fileSize: 1620000,
      },
      {
        id: 'doc-8',
        type: 'ethical_declaration',
        name: 'Этическая декларация',
        createdAt: new Date('2025-02-08T14:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-09T10:00:00'),
        version: 1,
        fileSize: 1920000,
      },
      {
        id: 'doc-9',
        type: 'personal_data_consent',
        name: 'Согласие на обработку персональных данных',
        createdAt: new Date('2025-02-08T14:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-09T10:00:00'),
        version: 1,
        fileSize: 2240000,
      },
      {
        id: 'doc-10',
        type: 'nda',
        name: 'Соглашение о неразглашении',
        createdAt: new Date('2025-02-08T14:30:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-09T10:00:00'),
        version: 1,
        fileSize: 1980000,
      },
    ],
  },
  {
    id: '#2025005',
    athleteId: 'athlete-5',
    athleteName: 'Васильев Максим Николаевич',
    athleteEmail: 'vasiliev@example.com',
    athletePhone: '+7 (999) 567-89-01',
    competitionId: 'comp-3',
    competitionName: 'Турнир по Dota 2 "Весенний кубок"',
    competitionSport: 'Киберспорт',
    competitionDiscipline: 'Dota 2',
    competitionDates: {
      start: new Date('2025-05-01'),
      end: new Date('2025-05-05'),
    },
    competitionParticipants: {
      current: 22,
      total: 32,
    },
    submittedAt: new Date('2025-02-06T11:30:00'),
    status: 'pending',
  },
];

export function ApplicationsPage({ role, modalToOpen, onModalOpened }: ApplicationsPageProps) {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Открытие модального окна из уведомлений
  useEffect(() => {
    if (modalToOpen) {
      const application = applications.find((app) => app.id === modalToOpen);
      if (application) {
        setSelectedApplication(application);
        setViewModalOpen(true);
        if (onModalOpened) {
          onModalOpened();
        }
      }
    }
  }, [modalToOpen, applications]);

  // Получаем список уникальных соревнований для фильтра
  const competitions = useMemo(() => {
    const unique = new Map<string, string>();
    applications.forEach((app) => {
      if (!unique.has(app.competitionId)) {
        unique.set(app.competitionId, app.competitionName);
      }
    });
    return Array.from(unique, ([id, name]) => ({ id, name }));
  }, [applications]);

  // Фильтрация заявок
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesCompetition = competitionFilter === 'all' || app.competitionId === competitionFilter;
      return matchesStatus && matchesCompetition;
    });
  }, [applications, statusFilter, competitionFilter]);

  // Пагинация
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewModalOpen(true);
    if (onModalOpened) {
      onModalOpened();
    }
  };

  const handleApproveApplication = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          // Генерируем документы
          const documents = [
            {
              id: `doc-${Date.now()}-1`,
              type: 'participation_agreement' as const,
              name: 'Соглашение об участии',
              createdAt: new Date(),
              status: 'generated' as const,
              version: 1,
              fileSize: 245000,
            },
            {
              id: `doc-${Date.now()}-2`,
              type: 'antidoping_declaration' as const,
              name: 'Антидопинговая декларация',
              createdAt: new Date(),
              status: 'generated' as const,
              version: 1,
              fileSize: 180000,
            },
            {
              id: `doc-${Date.now()}-3`,
              type: 'ethical_declaration' as const,
              name: 'Этическая декларация',
              createdAt: new Date(),
              status: 'generated' as const,
              version: 1,
              fileSize: 2100000,
            },
            {
              id: `doc-${Date.now()}-4`,
              type: 'personal_data_consent' as const,
              name: 'Согласие на обработку персональных данных',
              createdAt: new Date(),
              status: 'generated' as const,
              version: 1,
              fileSize: 320000,
            },
            {
              id: `doc-${Date.now()}-5`,
              type: 'nda' as const,
              name: 'Соглашение о неразглашении',
              createdAt: new Date(),
              status: 'generated' as const,
              version: 1,
              fileSize: 410000,
            },
          ];

          return {
            ...app,
            status: 'approved' as const,
            statusChangedAt: new Date(),
            documents,
          };
        }
        return app;
      })
    );
    toast.success('Заявка принята. Документы сгенерированы и готовы к скачиванию.');
    setViewModalOpen(false);
  };

  const handleRejectApplication = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: 'rejected' as const,
              statusChangedAt: new Date(),
              rejectionReason: 'Заявка отклонена менеджером.',
            }
          : app
      )
    );
    toast.success('Заявка отклонена. Спортсмен получит уведомление.');
    setViewModalOpen(false);
  };

  const handleCancelApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    toast.success('Заявка отменена');
    setViewModalOpen(false);
  };

  const handleDownloadDocuments = (id: string) => {
    toast.success('Пакет документов скачан');
  };

  const handleUploadScan = (applicationId: string, documentId: string, file: File) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId && app.documents) {
          return {
            ...app,
            documents: app.documents.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    status: 'signed' as const,
                    uploadedAt: new Date(),
                    fileSize: file.size,
                    signedFileUrl: URL.createObjectURL(file),
                  }
                : doc
            ),
          };
        }
        return app;
      })
    );
    // Обновляем выбранную заявку для отображения в модалке
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication((prev) => {
        if (!prev || !prev.documents) return prev;
        return {
          ...prev,
          documents: prev.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: 'signed' as const,
                  uploadedAt: new Date(),
                  fileSize: file.size,
                  signedFileUrl: URL.createObjectURL(file),
                }
              : doc
          ),
        };
      });
    }
  };

  const handleDeleteScan = (applicationId: string, documentId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId && app.documents) {
          return {
            ...app,
            documents: app.documents.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    status: 'generated' as const,
                    uploadedAt: undefined,
                    signedFileUrl: undefined,
                  }
                : doc
            ),
          };
        }
        return app;
      })
    );
    // Обновляем выбранную заявку для отображения в модалке
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication((prev) => {
        if (!prev || !prev.documents) return prev;
        return {
          ...prev,
          documents: prev.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: 'generated' as const,
                  uploadedAt: undefined,
                  signedFileUrl: undefined,
                }
              : doc
          ),
        };
      });
    }
  };

  const handleDownloadDocument = (applicationId: string, documentId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    const doc = app?.documents?.find((d) => d.id === documentId);
    if (doc) {
      if (doc.status === 'signed') {
        toast.success('Скачан подписанный скан документа');
      } else {
        toast.success('Скачан шаблон документа с заполненными данными');
      }
    }
  };

  const handleViewAthleteProfile = (athleteId: string) => {
    toast.info(`Открытие профиля спортсмена ${athleteId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Заявки на участие</h1>
        <p className="text-gray-600">
          Управление заявками спортсменов на участие в соревнованиях
        </p>
      </div>

      {/* Фильтры */}
      <Card className="p-6">
        <ApplicationsFilters
          statusFilter={statusFilter}
          competitionFilter={competitionFilter}
          competitions={competitions}
          onStatusChange={setStatusFilter}
          onCompetitionChange={setCompetitionFilter}
          role={role}
        />
      </Card>

      <ApplicationsTable
        applications={paginatedApplications}
        userRole={role}
        onViewApplication={handleViewApplication}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
        onCancelApplication={handleCancelApplication}
        onDownloadDocuments={handleDownloadDocuments}
      />

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ApplicationViewModal
        application={selectedApplication}
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        userRole={role}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
        onDownloadDocuments={handleDownloadDocuments}
        onUploadScan={handleUploadScan}
        onDeleteScan={handleDeleteScan}
        onDownloadDocument={handleDownloadDocument}
        onViewAthleteProfile={handleViewAthleteProfile}
      />
    </div>
  );
}