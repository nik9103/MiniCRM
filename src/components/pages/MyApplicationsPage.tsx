import { useState, useMemo, useEffect } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
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
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Role, Page } from '../../App';

interface MyApplicationsPageProps {
  role: Role;
  onNavigate?: (page: Page) => void;
  modalToOpen?: string;
  onModalOpened?: () => void;
}

// Моковые данные заявок текущего спортсмена
const mockMyApplications: Application[] = [
  {
    id: 'application-chempionat-rf-2025',
    athleteId: 'current-athlete',
    athleteName: 'Текущий Спортсмен',
    athleteEmail: 'current@example.com',
    athletePhone: '+7 (999) 111-22-33',
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
    submittedAt: new Date('2025-02-12T10:30:00'),
    status: 'approved',
    statusChangedAt: new Date('2025-02-13T09:00:00'),
    documents: [
      {
        id: 'doc-my-pending-1',
        type: 'participation_agreement',
        name: 'Соглашение об участии',
        createdAt: new Date('2025-02-12T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 245000,
      },
      {
        id: 'doc-my-pending-2',
        type: 'antidoping_declaration',
        name: 'Антидопинговая декларация',
        createdAt: new Date('2025-02-12T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 180000,
      },
      {
        id: 'doc-my-pending-3',
        type: 'ethical_declaration',
        name: 'Этическая декларация',
        createdAt: new Date('2025-02-12T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 195000,
      },
      {
        id: 'doc-my-pending-4',
        type: 'personal_data_consent',
        name: 'Согласие на обработку персональных данных',
        createdAt: new Date('2025-02-12T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 320000,
      },
      {
        id: 'doc-my-pending-5',
        type: 'nda',
        name: 'Соглашение о неразглашении',
        createdAt: new Date('2025-02-12T10:30:00'),
        status: 'generated',
        version: 1,
        fileSize: 410000,
      },
    ],
  },
  {
    id: '#2025008',
    athleteId: 'current-athlete',
    athleteName: 'Текущий Спортсмен',
    athleteEmail: 'current@example.com',
    athletePhone: '+7 (999) 111-22-33',
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
    submittedAt: new Date('2025-02-05T14:20:00'),
    status: 'approved',
    statusChangedAt: new Date('2025-02-06T09:15:00'),
    documents: [
      {
        id: 'doc-1',
        type: 'participation_agreement',
        name: 'Соглашение об участии',
        createdAt: new Date('2025-02-06T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 245000,
      },
      {
        id: 'doc-2',
        type: 'antidoping_declaration',
        name: 'Антидопинговая декларация',
        createdAt: new Date('2025-02-06T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 180000,
      },
      {
        id: 'doc-3',
        type: 'ethical_declaration',
        name: 'Этическая декларация',
        createdAt: new Date('2025-02-06T09:15:00'),
        status: 'signed',
        uploadedAt: new Date('2025-02-07T16:30:00'),
        version: 1,
        fileSize: 2100000,
      },
      {
        id: 'doc-4',
        type: 'personal_data_consent',
        name: 'Согласие на обработку персональных данных',
        createdAt: new Date('2025-02-06T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 320000,
      },
      {
        id: 'doc-5',
        type: 'nda',
        name: 'Соглашение о неразглашении',
        createdAt: new Date('2025-02-06T09:15:00'),
        status: 'generated',
        version: 1,
        fileSize: 410000,
      },
    ],
  },
  {
    id: '#2025003',
    athleteId: 'current-athlete',
    athleteName: 'Текущий Спортсмен',
    athleteEmail: 'current@example.com',
    athletePhone: '+7 (999) 111-22-33',
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
    submittedAt: new Date('2025-01-28T16:45:00'),
    status: 'rejected',
    statusChangedAt: new Date('2025-01-30T11:20:00'),
    rejectionReason: 'К сожалению, достигнут лимит участников для данного соревнования.',
  },
];

export function MyApplicationsPage({ role, onNavigate, modalToOpen, onModalOpened }: MyApplicationsPageProps) {
  const [applications, setApplications] = useState<Application[]>(mockMyApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Фильтрация заявок
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesStatus;
    });
  }, [applications, statusFilter]);

  // Пагинация
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewModalOpen(true);
  };

  const handleCancelApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    toast.success('Заявка отменена');
    setViewModalOpen(false);
  };

  const handleDownloadDocuments = (id: string) => {
    toast.success('Пакет документов скачан');
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

  const handleGoToCompetitions = () => {
    if (onNavigate) {
      onNavigate('competitions');
    }
  };

  // Открытие модального окна из уведомлений
  useEffect(() => {
    if (modalToOpen) {
      const application = applications.find((app) => app.id === modalToOpen);
      if (application) {
        handleViewApplication(application);
        if (onModalOpened) {
          onModalOpened();
        }
      }
    }
  }, [modalToOpen, applications, onModalOpened]);

  // Пустое состояние
  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Мои заявки</h1>
          <p className="text-gray-600">
            История ваших заявок на участие в соревнованиях
          </p>
        </div>

        <div className="border rounded-lg p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl mb-2">У вас пока нет заявок</h2>
            <p className="text-gray-600 mb-6">
              Подайте заявку на участие в соревновании, чтобы начать свой путь к победе
            </p>
            <Button onClick={handleGoToCompetitions}>
              Перейти к соревнованиям
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Мои заявки</h1>
        <p className="text-gray-600">
          История ваших заявок на участие в соревнованиях
        </p>
      </div>

      {/* Фильтры */}
      <Card className="p-6">
        <ApplicationsFilters
          statusFilter={statusFilter}
          competitionFilter="all"
          competitions={[]}
          onStatusChange={setStatusFilter}
          onCompetitionChange={() => {}}
          role={role}
        />
      </Card>

      <ApplicationsTable
        applications={paginatedApplications}
        userRole={role}
        onViewApplication={handleViewApplication}
        onApproveApplication={() => {}}
        onRejectApplication={() => {}}
        onCancelApplication={handleCancelApplication}
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
        onCancel={handleCancelApplication}
        onDownloadDocuments={handleDownloadDocuments}
        onDownloadDocument={handleDownloadDocument}
      />
    </div>
  );
}