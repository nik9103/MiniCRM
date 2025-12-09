import { useState, useMemo } from 'react';
import { Search, Download, FileText, ChevronDown, ChevronRight, Eye, X, Upload, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import { toast } from 'sonner@2.0.3';
import { DocumentViewModal } from './DocumentViewModal';
import { SearchableCombobox } from './SearchableCombobox';

type DocumentType = 'contract' | 'consent' | 'medical' | 'insurance' | 'application';
type DocumentStatus = 'signed' | 'unsigned';

export interface Document {
  id: number;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  date: string;
  size: number;
  athleteId: number;
  athleteName: string;
  competitionId: number;
  competitionName: string;
  fileUrl?: string;
  scanFile?: File | null;
}

// Моковые данные
const mockDocuments: Document[] = [
  {
    id: 1,
    name: 'Договор на участие',
    type: 'contract',
    status: 'signed',
    date: '2024-01-10',
    size: 1.2,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 2,
    name: 'Согласие на обработку персональных данных',
    type: 'consent',
    status: 'signed',
    date: '2024-01-10',
    size: 0.8,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 3,
    name: 'Медицинская справка',
    type: 'medical',
    status: 'unsigned',
    date: '2024-01-11',
    size: 0,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 4,
    name: 'Страховой полис',
    type: 'insurance',
    status: 'signed',
    date: '2024-01-12',
    size: 1.5,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 5,
    name: 'Заявление на участие',
    type: 'application',
    status: 'unsigned',
    date: '2024-01-13',
    size: 0,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 6,
    name: 'Договор на участие',
    type: 'contract',
    status: 'signed',
    date: '2024-01-08',
    size: 1.3,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 2,
    competitionName: 'Кубок Москвы 2024',
  },
  {
    id: 7,
    name: 'Согласие на обработку персональных данных',
    type: 'consent',
    status: 'signed',
    date: '2024-01-08',
    size: 0.9,
    athleteId: 1,
    athleteName: 'Иванов Иван Иванович',
    competitionId: 2,
    competitionName: 'Кубок Москвы 2024',
  },
  {
    id: 8,
    name: 'Договор на участие',
    type: 'contract',
    status: 'signed',
    date: '2024-01-15',
    size: 1.1,
    athleteId: 2,
    athleteName: 'Петрова Мария Сергеевна',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 9,
    name: 'Согласие на обработку персональных данных',
    type: 'consent',
    status: 'signed',
    date: '2024-01-15',
    size: 0.7,
    athleteId: 2,
    athleteName: 'Петрова Мария Сергеевна',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 10,
    name: 'Медицинская справка',
    type: 'medical',
    status: 'unsigned',
    date: '2024-01-16',
    size: 0,
    athleteId: 2,
    athleteName: 'Петрова Мария Сергеевна',
    competitionId: 1,
    competitionName: 'Чемпионат России 2024',
  },
  {
    id: 11,
    name: 'Договор на участие',
    type: 'contract',
    status: 'unsigned',
    date: '2024-01-14',
    size: 0,
    athleteId: 3,
    athleteName: 'Сидоров Алексей Петрович',
    competitionId: 3,
    competitionName: 'Первенство области 2024',
  },
  {
    id: 12,
    name: 'Согласие на обработку персональных данных',
    type: 'consent',
    status: 'unsigned',
    date: '2024-01-14',
    size: 0,
    athleteId: 3,
    athleteName: 'Сидоров Алексей Петрович',
    competitionId: 3,
    competitionName: 'Первенство области 2024',
  },
];

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [athleteFilter, setAthleteFilter] = useState<string>('all');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set());
  const [expandedAthletes, setExpandedAthletes] = useState<Set<number>>(new Set());
  const [expandedCompetitions, setExpandedCompetitions] = useState<Set<string>>(new Set());
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  
  const [athleteComboboxOpen, setAthleteComboboxOpen] = useState(false);
  const [competitionComboboxOpen, setCompetitionComboboxOpen] = useState(false);

  // Получить уникальных спортсменов
  const athletes = useMemo(() => {
    const uniqueAthletes = new Map<number, string>();
    documents.forEach(doc => {
      uniqueAthletes.set(doc.athleteId, doc.athleteName);
    });
    return Array.from(uniqueAthletes, ([id, name]) => ({ id, name }));
  }, [documents]);

  // Получить уникальные соревнования
  const competitions = useMemo(() => {
    const uniqueCompetitions = new Map<number, string>();
    documents.forEach(doc => {
      uniqueCompetitions.set(doc.competitionId, doc.competitionName);
    });
    return Array.from(uniqueCompetitions, ([id, name]) => ({ id, name }));
  }, [documents]);

  // Фильтрация документов
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.athleteName.toLowerCase().includes(searchLower) ||
        doc.competitionName.toLowerCase().includes(searchLower);

      const matchesAthlete = athleteFilter === 'all' || doc.athleteId === parseInt(athleteFilter);
      const matchesCompetition = competitionFilter === 'all' || doc.competitionId === parseInt(competitionFilter);
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;

      return matchesSearch && matchesAthlete && matchesCompetition && matchesStatus && matchesType;
    });
  }, [documents, searchQuery, athleteFilter, competitionFilter, statusFilter, typeFilter]);

  // Группировка документов
  const groupedDocuments = useMemo(() => {
    const groups = new Map<number, Map<number, Document[]>>();
    
    filteredDocuments.forEach(doc => {
      if (!groups.has(doc.athleteId)) {
        groups.set(doc.athleteId, new Map());
      }
      const athleteGroup = groups.get(doc.athleteId)!;
      
      if (!athleteGroup.has(doc.competitionId)) {
        athleteGroup.set(doc.competitionId, []);
      }
      athleteGroup.get(doc.competitionId)!.push(doc);
    });

    return groups;
  }, [filteredDocuments]);

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      contract: 'Договор',
      consent: 'Согласие',
      medical: 'Мед. справка',
      insurance: 'Страховка',
      application: 'Заявление',
    };
    return labels[type];
  };

  const getStatusLabel = (status: DocumentStatus) => {
    const labels = {
      signed: 'Подписан',
      unsigned: 'Не подписан',
    };
    return labels[status];
  };

  const getStatusColor = (status: DocumentStatus) => {
    const colors = {
      signed: 'bg-green-100 text-green-700 hover:bg-green-100',
      unsigned: 'bg-red-100 text-red-700 hover:bg-red-100',
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatSize = (size: number) => {
    if (size === 0) return '—';
    return `${size.toFixed(2)} МБ`;
  };

  const toggleAthleteExpand = (athleteId: number) => {
    const newExpanded = new Set(expandedAthletes);
    if (newExpanded.has(athleteId)) {
      newExpanded.delete(athleteId);
    } else {
      newExpanded.add(athleteId);
    }
    setExpandedAthletes(newExpanded);
  };

  const toggleCompetitionExpand = (athleteId: number, competitionId: number) => {
    const key = `${athleteId}-${competitionId}`;
    const newExpanded = new Set(expandedCompetitions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCompetitions(newExpanded);
  };

  const toggleDocumentSelection = (docId: number) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  const toggleSelectCompetition = (docs: Document[]) => {
    const competitionDocIds = docs.map(d => d.id);
    const allSelected = competitionDocIds.every(id => selectedDocuments.has(id));
    
    const newSelected = new Set(selectedDocuments);
    if (allSelected) {
      competitionDocIds.forEach(id => newSelected.delete(id));
    } else {
      competitionDocIds.forEach(id => newSelected.add(id));
    }
    setSelectedDocuments(newSelected);
  };

  const handleDownloadSelected = () => {
    if (selectedDocuments.size === 0) {
      return;
    }
    alert(`Скачивание ${selectedDocuments.size} документов...`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setAthleteFilter('all');
    setCompetitionFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const handleDeleteDocument = (docId: number) => {
    const newDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(newDocuments);
    toast.success('Документ удален');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Документы</h1>
        <p className="text-gray-600 mt-1">
          Централизованный архив всех документов системы
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск по документам, спортсменам, соревнованиям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <SearchableCombobox
              options={athletes}
              value={athleteFilter}
              onChange={setAthleteFilter}
              placeholder="Все спортсмены"
              searchPlaceholder="Поиск спортсмена..."
              emptyText="Спортсмен не найден"
              allLabel="Все спортсмены"
            />

            <SearchableCombobox
              options={competitions}
              value={competitionFilter}
              onChange={setCompetitionFilter}
              placeholder="Все соревнования"
              searchPlaceholder="Поиск соревнования..."
              emptyText="Соревнование не найдено"
              allLabel="Все соревнования"
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="signed">Подписан</SelectItem>
                <SelectItem value="unsigned">Не подписан</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as DocumentType | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Тип документа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="contract">Договор</SelectItem>
                <SelectItem value="consent">Согласие</SelectItem>
                <SelectItem value="medical">Мед. справка</SelectItem>
                <SelectItem value="insurance">Страховка</SelectItem>
                <SelectItem value="application">Заявление</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || athleteFilter !== 'all' || competitionFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Сбросить фильтры
            </Button>
          )}
        </div>
      </Card>

      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Выделить все ({filteredDocuments.length})
              </span>
            </label>
            {selectedDocuments.size > 0 && (
              <span className="text-sm text-gray-600">
                Выбрано: {selectedDocuments.size}
              </span>
            )}
          </div>
          {selectedDocuments.size > 0 && (
            <Button onClick={handleDownloadSelected}>
              <Download className="w-4 h-4 mr-2" />
              Скачать выделенные
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {groupedDocuments.size === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Документы не найдены</p>
          </Card>
        ) : (
          Array.from(groupedDocuments).map(([athleteId, competitionsMap]) => {
            const athleteName = documents.find(d => d.athleteId === athleteId)?.athleteName || '';
            const totalDocs = Array.from(competitionsMap.values()).reduce((sum, docs) => sum + docs.length, 0);
            const isAthleteExpanded = expandedAthletes.has(athleteId);

            return (
              <Card key={athleteId} className="overflow-hidden">
                <div
                  className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                  onClick={() => toggleAthleteExpand(athleteId)}
                >
                  <div className="flex items-center gap-3">
                    {isAthleteExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm">
                      {athleteName.split(' ')[0][0]}{athleteName.split(' ')[1]?.[0]}
                    </div>
                    <div>
                      <div className="text-sm">{athleteName}</div>
                      <div className="text-xs text-gray-500">
                        {totalDocs} {totalDocs === 1 ? 'документ' : totalDocs < 5 ? 'документа' : 'документов'}
                      </div>
                    </div>
                  </div>
                </div>

                {isAthleteExpanded && (
                  <div>
                    {Array.from(competitionsMap).map(([competitionId, docs]) => {
                      const competitionName = docs[0]?.competitionName || '';
                      const key = `${athleteId}-${competitionId}`;
                      const isCompetitionExpanded = expandedCompetitions.has(key);

                      return (
                        <div key={competitionId} className="border-b last:border-b-0">
                          <div className="p-4 pl-16 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={docs.every(doc => selectedDocuments.has(doc.id))}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelectCompetition(docs);
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <div
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleCompetitionExpand(athleteId, competitionId)}
                              >
                                {isCompetitionExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                                <div>
                                  <div className="text-sm text-gray-900">{competitionName}</div>
                                  <div className="text-xs text-gray-500">
                                    {docs.length} {docs.length === 1 ? 'документ' : docs.length < 5 ? 'документа' : 'документов'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {isCompetitionExpanded && (
                            <div className="bg-white">
                              {docs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-4 pl-24 border-t flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedDocuments.has(doc.id)}
                                      onChange={() => toggleDocumentSelection(doc.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <button
                                        onClick={() => {
                                          setSelectedDocument(doc);
                                          setIsViewModalOpen(true);
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left truncate block w-full"
                                      >
                                        {doc.name}
                                      </button>
                                      <div className="flex items-center gap-3 mt-1">
                                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs">
                                          {getDocumentTypeLabel(doc.type)}
                                        </Badge>
                                        <Badge className={`${getStatusColor(doc.status)} text-xs`}>
                                          {getStatusLabel(doc.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <div>{formatDate(doc.date)}</div>
                                    <div className="w-24 text-right">{formatSize(doc.size)}</div>
                                    <div className="flex items-center gap-1">
                                      {doc.status === 'unsigned' ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const updatedDocs = documents.map(d =>
                                              d.id === doc.id
                                                ? { ...d, status: 'signed' as DocumentStatus, size: 1.2 }
                                                : d
                                            );
                                            setDocuments(updatedDocs);
                                            toast.success('Скан документа загружен');
                                          }}
                                          className="h-8 w-8 p-0 text-gray-600 hover:text-green-600"
                                          title="Загрузить скан"
                                        >
                                          <Upload className="w-4 h-4" />
                                        </Button>
                                      ) : (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toast.success('Скачивание документа...')}
                                            className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                                            title="Скачать документ"
                                          >
                                            <Download className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const updatedDocs = documents.map(d =>
                                                d.id === doc.id
                                                  ? { ...d, status: 'unsigned' as DocumentStatus, size: 0 }
                                                  : d
                                              );
                                              setDocuments(updatedDocs);
                                              toast.success('Скан документа удален');
                                            }}
                                            className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                                            title="Удалить скан"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedDocument(doc);
                                          setIsViewModalOpen(true);
                                        }}
                                        className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                                        title="Просмотр"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <DocumentViewModal
        open={isViewModalOpen}
        document={selectedDocument}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDocument(null);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление документа</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот документ? Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete !== null) {
                  handleDeleteDocument(documentToDelete);
                }
                setDeleteDialogOpen(false);
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}