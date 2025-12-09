import { useState, useEffect } from 'react';
import { Plus, X, Building2, Users, Trophy, FileText, Calendar } from 'lucide-react';
import { Competition } from '../../types/competition';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';

interface CompetitionFormModalProps {
  competition: Competition | null;
  open: boolean;
  onClose: () => void;
  onSave: (competition: Partial<Competition>) => void;
}

// Моковые данные для реестра видов спорта
const sportsRegistry = [
  { id: '1', name: 'Легкая атлетика', disciplines: ['Бег на 100 метров', 'Бег на 200 метров', 'Прыжки в длину', 'Метание диска'] },
  { id: '2', name: 'Плавание', disciplines: ['Вольный стиль', 'Баттерфляй', 'Брасс', 'Комплексное плавание'] },
  { id: '3', name: 'Футбол', disciplines: ['Футбол'] },
  { id: '4', name: 'Баскетбол', disciplines: ['Баскетбол'] },
  { id: '5', name: 'Волейбол', disciplines: ['Волейбол'] },
  { id: '6', name: 'Дзюдо', disciplines: ['Дзюдо'] },
  { id: '7', name: 'Шахматы', disciplines: ['Шахматы'] },
  { id: '8', name: 'Киберспорт', disciplines: ['Многопользовательская онлайн-игра', 'Спортивные симуляторы'] },
];

export function CompetitionFormModal({
  competition,
  open,
  onClose,
  onSave,
}: CompetitionFormModalProps) {
  const isEdit = !!competition;

  // Состояние формы
  const [formData, setFormData] = useState<Partial<Competition>>({
    officialFullName: '',
    officialShortName: '',
    alternativeNames: [],
    organizer: { fullName: '', ogrn: '', inn: '' },
    coOrganizer: undefined,
    sportType: '',
    discipline: '',
    videoGame: '',
    startDate: new Date(),
    endDate: new Date(),
    participantsCount: 0,
    includedInMinistryList: false,
    gender: 'mixed',
  });

  const [alternativeName, setAlternativeName] = useState('');
  const [showCoOrganizer, setShowCoOrganizer] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [availableDisciplines, setAvailableDisciplines] = useState<string[]>([]);

  useEffect(() => {
    if (competition) {
      setFormData(competition);
      setShowCoOrganizer(!!competition.coOrganizer);
      
      const sport = sportsRegistry.find(s => s.name === competition.sportType);
      if (sport) {
        setSelectedSport(sport.id);
        setAvailableDisciplines(sport.disciplines);
      }
    } else {
      resetForm();
    }
  }, [competition, open]);

  const resetForm = () => {
    setFormData({
      officialFullName: '',
      officialShortName: '',
      alternativeNames: [],
      organizer: { fullName: '', ogrn: '', inn: '' },
      coOrganizer: undefined,
      sportType: '',
      discipline: '',
      videoGame: '',
      startDate: new Date(),
      endDate: new Date(),
      participantsCount: 0,
      includedInMinistryList: false,
      gender: 'mixed',
    });
    setAlternativeName('');
    setShowCoOrganizer(false);
    setSelectedSport('');
    setAvailableDisciplines([]);
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    const sport = sportsRegistry.find(s => s.id === sportId);
    if (sport) {
      setAvailableDisciplines(sport.disciplines);
      setFormData({ ...formData, sportType: sport.name, discipline: '' });
    }
  };

  const addAlternativeName = () => {
    if (alternativeName.trim()) {
      setFormData({
        ...formData,
        alternativeNames: [...(formData.alternativeNames || []), alternativeName.trim()],
      });
      setAlternativeName('');
    }
  };

  const removeAlternativeName = (index: number) => {
    setFormData({
      ...formData,
      alternativeNames: formData.alternativeNames?.filter((_, i) => i !== index),
    });
  };

  const validateOGRN = (ogrn: string): boolean => {
    return /^\d{13}$/.test(ogrn);
  };

  const validateINN = (inn: string): boolean => {
    return /^\d{10}$/.test(inn);
  };

  const handleSubmit = () => {
    // Валидация
    if (!formData.officialFullName || !formData.officialShortName) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (!formData.organizer?.fullName || !formData.organizer?.ogrn || !formData.organizer?.inn) {
      toast.error('Заполните данные организатора');
      return;
    }

    if (!validateOGRN(formData.organizer.ogrn)) {
      toast.error('ОГРН должен содержать 13 цифр');
      return;
    }

    if (!validateINN(formData.organizer.inn)) {
      toast.error('ИНН должен содержать 10 цифр');
      return;
    }

    if (showCoOrganizer && formData.coOrganizer) {
      if (!validateOGRN(formData.coOrganizer.ogrn)) {
        toast.error('ОГРН соорганизатора должен содержать 13 цифр');
        return;
      }
      if (!validateINN(formData.coOrganizer.inn)) {
        toast.error('ИНН соорганизатора должен содержать 10 цифр');
        return;
      }
    }

    if (!formData.sportType || !formData.discipline) {
      toast.error('Выберите вид спорта и дисциплину');
      return;
    }

    if (!formData.participantsCount || formData.participantsCount <= 0) {
      toast.error('Количество участников должно быть больше 0');
      return;
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      toast.error('Дата окончания не может быть раньше даты начала');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.startDate && formData.startDate < today) {
      toast.error('Дата начала не может быть в прошлом');
      return;
    }

    onSave(formData);
    toast.success(isEdit ? 'Соревнование обновлено' : 'Соревнование создано');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] w-full max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl">
            {isEdit ? 'Редактировать соревнование' : 'Создание соревнования'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8 max-w-[950px] mx-auto">
            {/* Основная информация */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-base">Основная информация</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="officialFullName" className="text-sm text-gray-700">Официальное полное наименование</Label>
                  <Input
                    id="officialFullName"
                    value={formData.officialFullName}
                    onChange={(e) =>
                      setFormData({ ...formData, officialFullName: e.target.value })
                    }
                    placeholder="Введите полное наименование"
                    className="mt-2"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="officialShortName" className="text-sm text-gray-700">Официальное краткое наименование</Label>
                  <Input
                    id="officialShortName"
                    value={formData.officialShortName}
                    onChange={(e) =>
                      setFormData({ ...formData, officialShortName: e.target.value })
                    }
                    placeholder="Краткое наименование"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Организатор */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="text-base">Организатор</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="orgName" className="text-sm text-gray-700">
                    Полное наименование <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="orgName"
                    value={formData.organizer?.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizer: { ...formData.organizer!, fullName: e.target.value },
                      })
                    }
                    maxLength={130}
                    className="mt-2"
                    placeholder="Введите наименование организации"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orgOgrn" className="text-sm text-gray-700">
                      ОГРН <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="orgOgrn"
                      value={formData.organizer?.ogrn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizer: { ...formData.organizer!, ogrn: e.target.value },
                        })
                      }
                      maxLength={13}
                      placeholder="1234567890123"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgInn" className="text-sm text-gray-700">
                      ИНН <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="orgInn"
                      value={formData.organizer?.inn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizer: { ...formData.organizer!, inn: e.target.value },
                        })
                      }
                      maxLength={10}
                      placeholder="1234567890"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Соорганизатор */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-base">Соорганизатор</h3>
              </div>

              {showCoOrganizer ? (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="coOrgName" className="text-sm text-gray-700">
                      Полное наименование
                    </Label>
                    <Input
                      id="coOrgName"
                      value={formData.coOrganizer?.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coOrganizer: { ...formData.coOrganizer!, fullName: e.target.value },
                        })
                      }
                      maxLength={130}
                      className="mt-2"
                      placeholder="Введите наименование соорганизатора"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coOrgOgrn" className="text-sm text-gray-700">ОГРН</Label>
                      <Input
                        id="coOrgOgrn"
                        value={formData.coOrganizer?.ogrn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coOrganizer: { ...formData.coOrganizer!, ogrn: e.target.value },
                          })
                        }
                        maxLength={13}
                        placeholder="1234567890123"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coOrgInn" className="text-sm text-gray-700">ИНН</Label>
                      <Input
                        id="coOrgInn"
                        value={formData.coOrganizer?.inn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coOrganizer: { ...formData.coOrganizer!, inn: e.target.value },
                          })
                        }
                        maxLength={10}
                        placeholder="1234567890"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCoOrganizer(false);
                      setFormData({ ...formData, coOrganizer: undefined });
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Удалить соорганизатора
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCoOrganizer(true);
                    setFormData({
                      ...formData,
                      coOrganizer: { fullName: '', ogrn: '', inn: '' },
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить соорганизатора
                </Button>
              )}
            </div>

            {/* Спортивная информация */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gray-600" />
                <h3 className="text-base">Спортивная информация</h3>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sport" className="text-sm text-gray-700">
                      Вид спорта <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedSport} onValueChange={handleSportChange}>
                      <SelectTrigger id="sport" className="mt-2">
                        <SelectValue placeholder="Выберите вид спорта" />
                      </SelectTrigger>
                      <SelectContent>
                        {sportsRegistry.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discipline" className="text-sm text-gray-700">
                      Спортивная дисциплина <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.discipline}
                      onValueChange={(value) => setFormData({ ...formData, discipline: value })}
                      disabled={!selectedSport}
                    >
                      <SelectTrigger id="discipline" className="mt-2">
                        <SelectValue placeholder="Выберите дисциплину" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDisciplines.map((discipline, index) => (
                          <SelectItem key={index} value={discipline}>
                            {discipline}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.sportType === 'Киберспорт' && (
                  <div>
                    <Label htmlFor="videoGame" className="text-sm text-gray-700">
                      Вид программы (видеоигра)
                    </Label>
                    <Input
                      id="videoGame"
                      value={formData.videoGame}
                      onChange={(e) => setFormData({ ...formData, videoGame: e.target.value })}
                      placeholder="Например: Dota 2, CS:GO"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Параметры проведения */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-base">Параметры проведения</h3>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm text-gray-700">
                      Дата начала <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={
                        formData.startDate
                          ? formData.startDate.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: new Date(e.target.value) })
                      }
                      className="mt-2"
                      placeholder="дд.мм.гггг"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm text-gray-700">
                      Дата окончания <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={
                        formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: new Date(e.target.value) })
                      }
                      className="mt-2"
                      placeholder="дд.мм.гггг"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="participants" className="text-sm text-gray-700">
                    Количество участников <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    value={formData.participantsCount}
                    onChange={(e) =>
                      setFormData({ ...formData, participantsCount: parseInt(e.target.value) })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-700">
                    Включено в Перечень Минспорта России <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.includedInMinistryList ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, includedInMinistryList: value === 'yes' })
                    }
                    className="flex gap-8 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="ministry-yes" />
                      <Label htmlFor="ministry-yes" className="cursor-pointer font-normal">Да</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="ministry-no" />
                      <Label htmlFor="ministry-no" className="cursor-pointer font-normal">Нет</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-sm text-gray-700">
                    Пол участников <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                    className="flex gap-8 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="gender-male" />
                      <Label htmlFor="gender-male" className="cursor-pointer font-normal">
                        Только мужчины
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="gender-female" />
                      <Label htmlFor="gender-female" className="cursor-pointer font-normal">
                        Только женщины
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="gender-mixed" />
                      <Label htmlFor="gender-mixed" className="cursor-pointer font-normal">
                        Мужчины и женщины
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0 flex-row justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Отменить
          </Button>
          <Button onClick={handleSubmit} className="bg-black text-white hover:bg-gray-800">
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}