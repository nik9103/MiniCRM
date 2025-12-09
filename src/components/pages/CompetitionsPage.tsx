import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Role } from '../../App';
import { Competition, CompetitionFilters } from '../../types/competition';
import { mockCompetitions, judgeAssignments, athleteApplications } from '../../data/mockCompetitions';
import { CompetitionsFilters } from '../competitions/CompetitionsFilters';
import { CompetitionsTable } from '../competitions/CompetitionsTable';
import { CompetitionViewModal } from '../competitions/CompetitionViewModal';
import { CompetitionFormModal } from '../competitions/CompetitionFormModal';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
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

interface CompetitionsPageProps {
  role?: Role;
  modalToOpen?: string;
  onModalOpened?: () => void;
}

const ITEMS_PER_PAGE = 10;

export function CompetitionsPage({ role = 'athlete', modalToOpen, onModalOpened }: CompetitionsPageProps) {
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions);
  const [filters, setFilters] = useState<CompetitionFilters>({
    search: '',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    athleteFilter: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [athleteApps, setAthleteApps] = useState<string[]>(athleteApplications['athlete-1'] || []);

  // Фильтрация соревнований
  const filteredCompetitions = useMemo(() => {
    let result = [...competitions];

    // Фильтр по роли
    if (role === 'judge') {
      const assignedIds = judgeAssignments['judge-1'] || [];
      result = result.filter((c) => assignedIds.includes(c.id));
    } else if (role === 'athlete') {
      // Для спортсмена: только запланированные + те на которые подал заявку
      result = result.filter(
        (c) => c.status === 'planned' || athleteApps.includes(c.id)
      );

      // Дополнительный фильтр для спортсмена
      if (filters.athleteFilter === 'applied') {
        result = result.filter((c) => athleteApps.includes(c.id));
      } else if (filters.athleteFilter === 'available') {
        result = result.filter((c) => c.status === 'planned' && !athleteApps.includes(c.id));
      }
    }

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.officialFullName.toLowerCase().includes(searchLower) ||
          c.officialShortName.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по статусу
    if (filters.status !== 'all') {
      result = result.filter((c) => c.status === filters.status);
    }

    // Фильтр по дате
    if (filters.dateFrom) {
      result = result.filter((c) => c.startDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((c) => c.startDate <= filters.dateTo!);
    }

    return result;
  }, [competitions, filters, role, athleteApps]);

  // Пагинация
  const totalPages = Math.ceil(filteredCompetitions.length / ITEMS_PER_PAGE);
  const paginatedCompetitions = filteredCompetitions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (competition: Competition) => {
    setSelectedCompetition(competition);
    setViewModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCompetition(null);
    setFormModalOpen(true);
  };

  const handleEdit = (competition: Competition) => {
    setSelectedCompetition(competition);
    setFormModalOpen(true);
  };

  const handleDeleteRequest = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedCompetition) {
      setCompetitions(competitions.filter((c) => c.id !== selectedCompetition.id));
      toast.success('Соревнование удалено');
      setDeleteDialogOpen(false);
      setSelectedCompetition(null);
    }
  };

  const handleSave = (data: Partial<Competition>) => {
    if (selectedCompetition) {
      // Редактирование
      setCompetitions(
        competitions.map((c) =>
          c.id === selectedCompetition.id ? { ...c, ...data } : c
        )
      );
    } else {
      // Создание
      const newCompetition: Competition = {
        id: String(competitions.length + 1).padStart(3, '0'),
        status: 'planned',
        ...data,
      } as Competition;
      setCompetitions([...competitions, newCompetition]);
    }
  };

  const handleApply = (competition: Competition) => {
    setAthleteApps([...athleteApps, competition.id]);
    toast.success('Заявка подана успешно');
  };

  const canManage = role === 'manager' || role === 'admin';

  // Открытие модального окна из уведомлений
  useEffect(() => {
    if (modalToOpen) {
      // Найти соревнование по ID
      const competition = competitions.find(c => c.id === modalToOpen);

      if (competition) {
        setSelectedCompetition(competition);
        setViewModalOpen(true);
        if (onModalOpened) {
          onModalOpened();
        }
      }
    }
  }, [modalToOpen, competitions]);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1>Соревнования</h1>
        <p className="text-gray-600 mt-1">
          {role === 'judge' && 'Соревнования, на которые вы назначены'}
          {role === 'athlete' && 'Доступные соревнования и ваши заявки'}
          {canManage && 'Управление всеми соревнованиями в системе'}
        </p>
      </div>

      {/* Кнопка создания */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Создать соревнование
          </Button>
        </div>
      )}

      {/* Фильтры */}
      <Card className="p-6">
        <CompetitionsFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
          role={role}
        />
      </Card>

      {/* Таблица */}
      <CompetitionsTable
        competitions={paginatedCompetitions}
        role={role}
        onView={handleView}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDeleteRequest : undefined}
        onApply={role === 'athlete' ? handleApply : undefined}
        athleteApplications={athleteApps}
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

      {/* Модальные окна */}
      <CompetitionViewModal
        competition={selectedCompetition}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedCompetition(null);
        }}
        onEdit={handleEdit}
        onDelete={(id) => {
          setCompetitions(competitions.filter((c) => c.id !== id));
        }}
        userRole={role === 'manager' ? 'manager' : role === 'admin' ? 'admin' : role === 'judge' ? 'referee' : 'athlete'}
      />

      {canManage && (
        <CompetitionFormModal
          competition={selectedCompetition}
          open={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setSelectedCompetition(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить соревнование?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить соревнование "
              {selectedCompetition?.officialShortName}"? Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}