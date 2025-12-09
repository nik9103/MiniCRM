import { useState } from 'react';
import { Upload, X, User as UserIcon, IdCard, FileText, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { toast } from 'sonner@2.0.3';

type UserRole = 'athlete' | 'judge' | 'manager';

interface AthleteUser {
  id: number;
  role: 'athlete';
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string | null;
  registrationDate: string;
  gender: 'male' | 'female';
  birthDate: string;
  profilePhoto: File | null;
  passportSeries: string;
  passportIssueDate: string;
  passportIssuedBy: string;
  registrationAddress: string;
  passportScans: File[];
  snils: string;
  snilsScan: File | null;
  inn: string;
  innScan: File | null;
  cardNumber: string;
  cardHolder: string;
  bik: string;
  corrAccount: string;
  account: string;
}

interface JudgeUser {
  id: number;
  role: 'judge';
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string | null;
  registrationDate: string;
  birthDate: string;
  profilePhoto: File | null;
  passportSeries: string;
  passportIssueDate: string;
  passportIssuedBy: string;
  registrationAddress: string;
  passportScans: File[];
}

interface ManagerUser {
  id: number;
  role: 'manager';
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string | null;
  registrationDate: string;
  phoneNumber: string;
  profilePhoto: File | null;
}

type User = AthleteUser | JudgeUser | ManagerUser;

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export function EditUserModal({ open, user, onClose, onSave }: EditUserModalProps) {
  if (!user) return null;

  // Инициализация формы в зависимости от роли
  const [formData, setFormData] = useState(user);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Валидация только кириллицы
  const validateCyrillic = (value: string) => {
    return /^[А-Яа-яЁё\s-]*$/.test(value);
  };

  // Валидация email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Валидация файла
  const validateFile = (file: File, maxSize = 10 * 1024 * 1024) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Допустимы только файлы JPG, PNG, PDF';
    }
    
    if (file.size > maxSize) {
      return 'Максимальный размер файла 10 МБ';
    }
    
    return null;
  };

  // Форматирование номера телефона +7 (XXX) XXX-XX-XX
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    let formatted = '+7';
    
    if (digits.length > 1) {
      formatted += ` (${digits.slice(1, 4)}`;
    }
    
    if (digits.length >= 5) {
      formatted += `) ${digits.slice(4, 7)}`;
    }
    
    if (digits.length >= 8) {
      formatted += `-${digits.slice(7, 9)}`;
    }
    
    if (digits.length >= 10) {
      formatted += `-${digits.slice(9, 11)}`;
    }
    
    return formatted;
  };

  // Обработчик изменения текстовых полей
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }) as User);
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Обработчик загрузки файлов
  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const error = validateFile(file);

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      toast.error(error);
      return;
    }

    setFormData(prev => ({ ...prev, [field]: file }) as User);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Обработчик загрузки множественных файлов (паспортные сканы)
  const handlePassportScansUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (formData.role !== 'athlete' && formData.role !== 'judge') return;

    const currentScans = formData.passportScans || [];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (currentScans.length + newFiles.length >= 5) {
        toast.error('Максимум 5 файлов');
        break;
      }

      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        passportScans: [...currentScans, ...newFiles],
      }) as User);
    }
  };

  // Удаление скана паспорта
  const removePassportScan = (index: number) => {
    if (formData.role !== 'athlete' && formData.role !== 'judge') return;
    
    setFormData(prev => ({
      ...prev,
      passportScans: formData.passportScans.filter((_, i) => i !== index),
    }) as User);
  };

  // Удаление файла
  const removeFile = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: null }) as User);
  };

  // Валидация и отправка формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Общая валидация для всех ролей
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Обязательное поле';
    } else if (!validateCyrillic(formData.lastName)) {
      newErrors.lastName = 'Только кириллица';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Обязательное поле';
    } else if (!validateCyrillic(formData.firstName)) {
      newErrors.firstName = 'Только кириллица';
    }

    if (formData.middleName && !validateCyrillic(formData.middleName)) {
      newErrors.middleName = 'Только кириллица';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Обязательное поле';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Валидация для спортсмена и судьи
    if (formData.role === 'athlete' || formData.role === 'judge') {
      if (!formData.birthDate) {
        newErrors.birthDate = 'Обязательное поле';
      }

      if (!formData.passportSeries.trim()) {
        newErrors.passportSeries = 'Обязательное поле';
      }

      if (!formData.passportIssueDate) {
        newErrors.passportIssueDate = 'Обязательное поле';
      }

      if (!formData.passportIssuedBy.trim()) {
        newErrors.passportIssuedBy = 'Обязательное поле';
      } else if (!validateCyrillic(formData.passportIssuedBy)) {
        newErrors.passportIssuedBy = 'Только кириллица';
      }

      if (!formData.registrationAddress.trim()) {
        newErrors.registrationAddress = 'Обязательное поле';
      }
    }

    // Дополнительная валидация для спортсмена
    if (formData.role === 'athlete') {
      if (!formData.snils.trim()) {
        newErrors.snils = 'Обязательное поле';
      }

      if (!formData.inn.trim()) {
        newErrors.inn = 'Обязательное поле';
      }
    }

    // Валидация для менеджера
    if (formData.role === 'manager') {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Обязательное поле';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Редактирование профиля: {user.lastName} {user.firstName} {user.middleName}
          </DialogTitle>
          <DialogDescription>
            Измените данные пользователя
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Форма для Спортсмена */}
          {formData.role === 'athlete' && (
            <>
              {/* Персональные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Персональные данные</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lastName" className="text-sm text-gray-700">
                      Фамилия <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`mt-2 ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="firstName" className="text-sm text-gray-700">
                      Имя <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`mt-2 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="middleName" className="text-sm text-gray-700">Отчество</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      className={`mt-2 ${errors.middleName ? 'border-red-500' : ''}`}
                    />
                    {errors.middleName && <p className="text-sm text-red-500 mt-1">{errors.middleName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="birthDate" className="text-sm text-gray-700">
                      Дата рождения <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className={`mt-2 ${errors.birthDate ? 'border-red-500' : ''}`}
                    />
                    {errors.birthDate && <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="gender" className="text-sm text-gray-700">
                      Пол <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Паспортные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Паспортные данные</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="passportSeries" className="text-sm text-gray-700">
                      Серия и номер <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportSeries"
                      value={formData.passportSeries}
                      onChange={(e) => handleInputChange('passportSeries', e.target.value)}
                      className={`mt-2 ${errors.passportSeries ? 'border-red-500' : ''}`}
                      placeholder="1234 567890"
                    />
                    {errors.passportSeries && <p className="text-sm text-red-500 mt-1">{errors.passportSeries}</p>}
                  </div>

                  <div>
                    <Label htmlFor="passportIssueDate" className="text-sm text-gray-700">
                      Дата выдачи <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportIssueDate"
                      type="date"
                      value={formData.passportIssueDate}
                      onChange={(e) => handleInputChange('passportIssueDate', e.target.value)}
                      className={`mt-2 ${errors.passportIssueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.passportIssueDate && <p className="text-sm text-red-500 mt-1">{errors.passportIssueDate}</p>}
                  </div>

                  <div className="md:col-span-2 xl:col-span-1">
                    <Label htmlFor="passportIssuedBy" className="text-sm text-gray-700">
                      Кем выдан <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportIssuedBy"
                      value={formData.passportIssuedBy}
                      onChange={(e) => handleInputChange('passportIssuedBy', e.target.value)}
                      className={`mt-2 ${errors.passportIssuedBy ? 'border-red-500' : ''}`}
                    />
                    {errors.passportIssuedBy && <p className="text-sm text-red-500 mt-1">{errors.passportIssuedBy}</p>}
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <Label htmlFor="registrationAddress" className="text-sm text-gray-700">
                      Место регистрации <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registrationAddress"
                      value={formData.registrationAddress}
                      onChange={(e) => handleInputChange('registrationAddress', e.target.value)}
                      className={`mt-2 ${errors.registrationAddress ? 'border-red-500' : ''}`}
                    />
                    {errors.registrationAddress && <p className="text-sm text-red-500 mt-1">{errors.registrationAddress}</p>}
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <Label htmlFor="passportScans" className="text-sm text-gray-700">Скан паспорта</Label>
                    <div className="mt-2 space-y-3">
                      {formData.passportScans.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePassportScan(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {formData.passportScans.length < 5 && (
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Загрузить скан ({formData.passportScans.length}/5)
                          </span>
                          <input
                            id="passportScans"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            onChange={(e) => handlePassportScansUpload(e.target.files)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Прочие данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Прочие данные</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="snils" className="text-sm text-gray-700">
                      СНИЛС <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="snils"
                      value={formData.snils}
                      onChange={(e) => handleInputChange('snils', e.target.value)}
                      className={`mt-2 ${errors.snils ? 'border-red-500' : ''}`}
                      placeholder="123-456-789 01"
                    />
                    {errors.snils && <p className="text-sm text-red-500 mt-1">{errors.snils}</p>}
                  </div>

                  <div>
                    <Label htmlFor="snilsScan" className="text-sm text-gray-700">Скан СНИЛС</Label>
                    {formData.snilsScan ? (
                      <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{formData.snilsScan.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.snilsScan.size / 1024 / 1024).toFixed(2)} МБ
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('snilsScan')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="mt-2 flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Загрузить файл</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('snilsScan', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inn" className="text-sm text-gray-700">
                      ИНН <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="inn"
                      value={formData.inn}
                      onChange={(e) => handleInputChange('inn', e.target.value)}
                      className={`mt-2 ${errors.inn ? 'border-red-500' : ''}`}
                      placeholder="123456789012"
                    />
                    {errors.inn && <p className="text-sm text-red-500 mt-1">{errors.inn}</p>}
                  </div>

                  <div>
                    <Label htmlFor="innScan" className="text-sm text-gray-700">Скан ИНН</Label>
                    {formData.innScan ? (
                      <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{formData.innScan.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.innScan.size / 1024 / 1024).toFixed(2)} МБ
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('innScan')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="mt-2 flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Загрузить файл</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('innScan', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Банковские реквизиты */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Банковские реквизиты</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm text-gray-700">Номер карты</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="mt-2"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardHolder" className="text-sm text-gray-700">Получатель</Label>
                    <Input
                      id="cardHolder"
                      value={formData.cardHolder}
                      onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bik" className="text-sm text-gray-700">БИК</Label>
                    <Input
                      id="bik"
                      value={formData.bik}
                      onChange={(e) => handleInputChange('bik', e.target.value)}
                      className="mt-2"
                      placeholder="044525225"
                    />
                  </div>

                  <div>
                    <Label htmlFor="corrAccount" className="text-sm text-gray-700">Корр. счет</Label>
                    <Input
                      id="corrAccount"
                      value={formData.corrAccount}
                      onChange={(e) => handleInputChange('corrAccount', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="account" className="text-sm text-gray-700">Расчетный счет</Label>
                    <Input
                      id="account"
                      value={formData.account}
                      onChange={(e) => handleInputChange('account', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Форма для Судьи */}
          {formData.role === 'judge' && (
            <>
              {/* Персональные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Персональные данные</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lastName" className="text-sm text-gray-700">
                      Фамилия <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`mt-2 ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="firstName" className="text-sm text-gray-700">
                      Имя <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`mt-2 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="middleName" className="text-sm text-gray-700">Отчество</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      className={`mt-2 ${errors.middleName ? 'border-red-500' : ''}`}
                    />
                    {errors.middleName && <p className="text-sm text-red-500 mt-1">{errors.middleName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="birthDate" className="text-sm text-gray-700">
                      Дата рождения <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className={`mt-2 ${errors.birthDate ? 'border-red-500' : ''}`}
                    />
                    {errors.birthDate && <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>}
                  </div>
                </div>
              </div>

              {/* Паспортные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Паспортные данные</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="passportSeries" className="text-sm text-gray-700">
                      Серия и номер <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportSeries"
                      value={formData.passportSeries}
                      onChange={(e) => handleInputChange('passportSeries', e.target.value)}
                      className={`mt-2 ${errors.passportSeries ? 'border-red-500' : ''}`}
                      placeholder="1234 567890"
                    />
                    {errors.passportSeries && <p className="text-sm text-red-500 mt-1">{errors.passportSeries}</p>}
                  </div>

                  <div>
                    <Label htmlFor="passportIssueDate" className="text-sm text-gray-700">
                      Дата выдачи <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportIssueDate"
                      type="date"
                      value={formData.passportIssueDate}
                      onChange={(e) => handleInputChange('passportIssueDate', e.target.value)}
                      className={`mt-2 ${errors.passportIssueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.passportIssueDate && <p className="text-sm text-red-500 mt-1">{errors.passportIssueDate}</p>}
                  </div>

                  <div className="md:col-span-2 xl:col-span-1">
                    <Label htmlFor="passportIssuedBy" className="text-sm text-gray-700">
                      Кем выдан <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportIssuedBy"
                      value={formData.passportIssuedBy}
                      onChange={(e) => handleInputChange('passportIssuedBy', e.target.value)}
                      className={`mt-2 ${errors.passportIssuedBy ? 'border-red-500' : ''}`}
                    />
                    {errors.passportIssuedBy && <p className="text-sm text-red-500 mt-1">{errors.passportIssuedBy}</p>}
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <Label htmlFor="registrationAddress" className="text-sm text-gray-700">
                      Место регистрации <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registrationAddress"
                      value={formData.registrationAddress}
                      onChange={(e) => handleInputChange('registrationAddress', e.target.value)}
                      className={`mt-2 ${errors.registrationAddress ? 'border-red-500' : ''}`}
                    />
                    {errors.registrationAddress && <p className="text-sm text-red-500 mt-1">{errors.registrationAddress}</p>}
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <Label htmlFor="passportScans" className="text-sm text-gray-700">Скан паспорта</Label>
                    <div className="mt-2 space-y-3">
                      {formData.passportScans.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePassportScan(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {formData.passportScans.length < 5 && (
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Загрузить скан ({formData.passportScans.length}/5)
                          </span>
                          <input
                            id="passportScans"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            onChange={(e) => handlePassportScansUpload(e.target.files)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Форма для Менеджера */}
          {formData.role === 'manager' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-base">Контактные данные</h3>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lastName" className="text-sm text-gray-700">
                    Фамилия <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`mt-2 ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <Label htmlFor="firstName" className="text-sm text-gray-700">
                    Имя <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`mt-2 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="middleName" className="text-sm text-gray-700">Отчество</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    className={`mt-2 ${errors.middleName ? 'border-red-500' : ''}`}
                  />
                  {errors.middleName && <p className="text-sm text-red-500 mt-1">{errors.middleName}</p>}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm text-gray-700">
                    Номер телефона <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', formatPhoneNumber(e.target.value))}
                    className={`mt-2 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                  {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Общие поля для всех */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <h3 className="text-base">Системная информация</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="user@example.com"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="status" className="text-sm text-gray-700">
                  Статус <span className="text-red-500">*</span>
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="active">Активный</option>
                  <option value="inactive">Неактивный</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="bg-black text-white hover:bg-gray-800">
              Сохранить изменения
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}