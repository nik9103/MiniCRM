import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import * as DialogPrimitive from '@radix-ui/react-dialog@1.1.6';
import { XIcon } from 'lucide-react';

interface Referee {
  id: string;
  fullName: string;
}

interface RefereeSelectionDialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onAssignReferees: (refereeIds: string[]) => void;
  competitionId: string;
  assignedRefereeIds?: string[];
}

// Моковые данные судей
const mockReferees: Referee[] = [
  { id: 'ref-1', fullName: 'Петров Дмитрий Викторович' },
  { id: 'ref-2', fullName: 'Смирнова Елена Игоревна' },
  { id: 'ref-3', fullName: 'Козлов Сергей Александрович' },
  { id: 'ref-4', fullName: 'Морозова Анна Петровна' },
  { id: 'ref-5', fullName: 'Васильев Игорь Николаевич' },
  { id: 'ref-6', fullName: 'Кузнецова Ольга Дмитриевна' },
  { id: 'ref-7', fullName: 'Новиков Алексей Владимирович' },
  { id: 'ref-8', fullName: 'Федорова Мария Сергеевна' },
  { id: 'ref-9', fullName: 'Соколов Андрей Юрьевич' },
  { id: 'ref-10', fullName: 'Лебедева Татьяна Ивановна' },
  { id: 'ref-11', fullName: 'Орлов Максим Петрович' },
  { id: 'ref-12', fullName: 'Егорова Светлана Викторовна' },
  { id: 'ref-13', fullName: 'Николаев Владимир Александрович' },
  { id: 'ref-14', fullName: 'Павлова Наталья Сергеевна' },
  { id: 'ref-15', fullName: 'Григорьев Артём Игоревич' },
];

export function RefereeSelectionDialog({
  open,
  onClose,
  onOpenChange,
  onAssignReferees,
  competitionId,
  assignedRefereeIds = [],
}: RefereeSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefereeIds, setSelectedRefereeIds] = useState<string[]>([]);

  // Фильтрация судей по поиску
  const filteredReferees = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockReferees;
    }
    
    const query = searchQuery.toLowerCase();
    return mockReferees.filter((referee) =>
      referee.fullName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Обработчик изменения выбора судьи
  const handleToggleReferee = (refereeId: string) => {
    setSelectedRefereeIds((prev) => {
      if (prev.includes(refereeId)) {
        return prev.filter((id) => id !== refereeId);
      } else {
        return [...prev, refereeId];
      }
    });
  };

  // Обработчик назначения судей
  const handleAssign = () => {
    // Передаем только новых судей (тех, кого раньше не было)
    const newRefereeIds = selectedRefereeIds.filter(
      (id) => !assignedRefereeIds.includes(id)
    );
    
    onAssignReferees(newRefereeIds);
    handleClose();
  };

  // Обработчик закрытия диалога
  const handleClose = () => {
    setSearchQuery('');
    setSelectedRefereeIds([]);
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  // Количество новых выбранных судей
  const newSelectedCount = selectedRefereeIds.filter(
    (id) => !assignedRefereeIds.includes(id)
  ).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      if (onOpenChange) onOpenChange(isOpen);
    }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[60] w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col max-h-[85vh]">
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none z-10">
            <XIcon className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          
          {/* Хедер */}
          <div className="px-6 py-4 border-b shrink-0">
            <DialogPrimitive.Title className="text-lg leading-none font-semibold">
              Назначить судей
            </DialogPrimitive.Title>
          </div>

          {/* Поиск */}
          <div className="px-6 py-4 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Список судей с скроллом */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            {filteredReferees.length > 0 ? (
              <div className="space-y-2">
                {filteredReferees.map((referee) => {
                  const isSelected = selectedRefereeIds.includes(referee.id);
                  const isAlreadyAssigned = assignedRefereeIds.includes(referee.id);

                  return (
                    <div
                      key={referee.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      } ${isAlreadyAssigned ? 'opacity-60' : ''}`}
                      onClick={() => !isAlreadyAssigned && handleToggleReferee(referee.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => !isAlreadyAssigned && handleToggleReferee(referee.id)}
                        disabled={isAlreadyAssigned}
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <p className="font-medium">{referee.fullName}</p>
                        {isAlreadyAssigned && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Уже назначен
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Судьи не найдены</p>
                <p className="text-sm mt-1">Попробуйте изменить поисковый запрос</p>
              </div>
            )}
          </div>

          {/* Футер */}
          <div className="px-6 py-4 border-t bg-gray-50 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {newSelectedCount > 0 && (
                  <span>
                    Выбрано: <span className="font-medium">{newSelectedCount}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Отменить
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={newSelectedCount === 0}
                >
                  Добавить ({newSelectedCount})
                </Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
