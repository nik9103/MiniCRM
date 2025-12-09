import { useState } from 'react';
import { Upload, X, User as UserIcon, IdCard, Eye, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';

interface JudgeProfileData {
  // Персональные данные
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  profilePhoto: File | null;
  
  // Паспортные данные
  passportSeries: string;
  passportIssueDate: string;
  passportIssuedBy: string;
  registrationAddress: string;
  passportScans: File[];
}

// Моковые данные для демонстрации режима просмотра
const createMockFile = (name: string, sizeInBytes: number = 500000): File => {
  // Создаем blob нужного размера
  const content = new Array(sizeInBytes).fill('x').join('');
  const blob = new Blob([content], { type: 'application/pdf' });
  return new File([blob], name, { type: 'application/pdf' });
};

const createMockImageFile = (name: string, sizeInBytes: number = 1100000): File => {
  // Создаем blob изображения
  const content = new Array(sizeInBytes).fill('x').join('');
  const blob = new Blob([content], { type: 'image/jpeg' });
  return new File([blob], name, { type: 'image/jpeg' });
};

const mockSavedData: JudgeProfileData = {
  lastName: 'Петров',
  firstName: 'Петр',
  middleName: 'Петрович',
  birthDate: '1980-03-25',
  profilePhoto: createMockImageFile('judge_photo.jpg', 1100000),
  passportSeries: '6789 234567',
  passportIssueDate: '2010-08-15',
  passportIssuedBy: 'Отделением УФМС России по Санкт-Петербургу',
  registrationAddress: 'г. Санкт-Петербург, Невский пр-т, д. 50, кв. 100',
  passportScans: [
    createMockFile('judge_passport_1.pdf', 900000),
    createMockFile('judge_passport_2.pdf', 850000),
  ],
};

export function JudgeProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<JudgeProfileData>(mockSavedData);
  const [savedData, setSavedData] = useState<JudgeProfileData>(mockSavedData);
  const [errors, setErrors] = useState<Partial<Record<keyof JudgeProfileData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Форматирование серии и номера паспорта (XXXX XXXXXX)
  const formatPassportSeries = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    }
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)}`;
  };

  // Валидация только кириллицы
  const validateCyrillic = (value: string) => {
    return /^[А-Яа-яЁё\s-]*$/.test(value);
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

  const handleInputChange = (field: keyof JudgeProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (field: keyof JudgeProfileData, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const error = validateFile(file);

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      toast.error(error);
      return;
    }

    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handlePassportScansUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const currentScans = formData.passportScans;

    if (currentScans.length + newFiles.length > 5) {
      toast.error('Можно загрузить не более 5 файлов');
      return;
    }

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      passportScans: [...prev.passportScans, ...newFiles],
    }));
  };

  const removePassportScan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      passportScans: prev.passportScans.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JudgeProfileData, string>> = {};

    // Персональные данные
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

    if (!formData.birthDate) {
      newErrors.birthDate = 'Обязательное поле';
    }

    // Паспортные данные
    if (!formData.passportSeries.trim()) {
      newErrors.passportSeries = 'Обязательное поле';
    } else if (formData.passportSeries.replace(/\s/g, '').length !== 10) {
      newErrors.passportSeries = 'Формат: XXXX XXXXXX';
    }

    if (!formData.passportIssueDate) {
      newErrors.passportIssueDate = 'Обязательное поле';
    }

    if (!formData.passportIssuedBy.trim()) {
      newErrors.passportIssuedBy = 'Обязательное поле';
    }

    if (!formData.registrationAddress.trim()) {
      newErrors.registrationAddress = 'Обязательное поле';
    }

    if (formData.passportScans.length === 0) {
      newErrors.passportScans = 'Необходимо загрузить скан паспорта';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      // Здесь будет отправка данных на сервер
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверка изменения паспортных данных
      const passportDataChanged = 
        savedData.passportSeries !== formData.passportSeries ||
        savedData.passportIssueDate !== formData.passportIssueDate ||
        savedData.passportIssuedBy !== formData.passportIssuedBy ||
        savedData.registrationAddress !== formData.registrationAddress;

      setSavedData(formData);
      setIsEditMode(false);
      toast.success('Данные успешно сохранены');

      // Уведомление спортивных менеджеров при изменении паспортных данных
      if (passportDataChanged) {
        setTimeout(() => {
          toast.info('Спортивные менеджеры уведомлены об изменении паспортных данных');
        }, 500);
      }
    } catch (error) {
      toast.error('Произошла ошибка при сохранении данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setErrors({});
    setIsEditMode(false);
    toast.info('Изменения отменены');
  };

  const handleViewFile = (file: File) => {
    // Создаем временный URL для просмотра файла
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Компонент для отображения поля в режиме просмотра
  const ViewField = ({ label, value }: { label: string; value: string | null }) => (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value || '—'}</div>
    </div>
  );

  // Компонент для отображения файла в режиме просмотра
  const FileViewCard = ({ file, label }: { file: File | null; label: string }) => {
    if (!file) {
      return (
        <div>
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="text-sm text-gray-500">Не загружено</div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="flex items-center gap-2 mt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleViewFile(file)}
            className="h-8 px-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            {file.name}
          </Button>
          <span className="text-xs text-gray-500">
            ({(file.size / 1024 / 1024).toFixed(2)} МБ)
          </span>
        </div>
      </div>
    );
  };

  // Компонент для отображения фото профиля в режиме просмотра
  const ProfilePhotoView = ({ file }: { file: File | null }) => {
    const imageUrl = file ? URL.createObjectURL(file) : null;
    const isImage = file ? file.type.startsWith('image/') : false;

    return (
      <div className="flex flex-col items-center">
        {file && isImage ? (
          <img 
            src={imageUrl!} 
            alt="Фото профиля" 
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        ) : file && !isImage ? (
          <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <UserIcon className="w-16 h-16 text-gray-400" />
          </div>
        ) : (
          <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <UserIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 text-center">Фото профиля</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок - зафиксированный */}
      <div className="shrink-0 pb-6">
        <h1>Мой профиль</h1>
        <p className="text-gray-600 mt-1">
          Управление персональными данными и документами
        </p>
      </div>

      {/* Скроллируемая область с полями */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-6 max-w-[1400px]">
          {isEditMode ? (
            /* РЕЖИМ РЕДАКТИРОВАНИЯ */
            <>
              {/* Персональные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Персональные данные</h3>
                </div>
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lastName" className="text-sm text-gray-700">
                        Фамилия <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        maxLength={100}
                        className={`mt-2 ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Петров"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="firstName" className="text-sm text-gray-700">
                        Имя <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        maxLength={100}
                        className={`mt-2 ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder="Петр"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="middleName" className="text-sm text-gray-700">Отчество</Label>
                      <Input
                        id="middleName"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        maxLength={100}
                        className={`mt-2 ${errors.middleName ? 'border-red-500' : ''}`}
                        placeholder="Петрович"
                      />
                      {errors.middleName && (
                        <p className="text-sm text-red-500 mt-1">{errors.middleName}</p>
                      )}
                    </div>
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
                    {errors.birthDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="profilePhoto" className="text-sm text-gray-700">Фото профиля</Label>
                    <div className="mt-2">
                      {formData.profilePhoto ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm">{formData.profilePhoto.name}</p>
                            <p className="text-xs text-gray-500">
                              {(formData.profilePhoto.size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, profilePhoto: null }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Загрузить фото (PDF, JPG, PNG, до 10 МБ)
                          </span>
                          <input
                            id="profilePhoto"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('profilePhoto', e.target.files)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {errors.profilePhoto && (
                      <p className="text-sm text-red-500 mt-1">{errors.profilePhoto}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Паспортные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Паспортные данные</h3>
                </div>
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passportSeries" className="text-sm text-gray-700">
                        Серия и номер <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="passportSeries"
                        value={formData.passportSeries}
                        onChange={(e) => handleInputChange('passportSeries', formatPassportSeries(e.target.value))}
                        maxLength={11}
                        className={`mt-2 ${errors.passportSeries ? 'border-red-500' : ''}`}
                        placeholder="1234 567890"
                      />
                      {errors.passportSeries && (
                        <p className="text-sm text-red-500 mt-1">{errors.passportSeries}</p>
                      )}
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
                      {errors.passportIssueDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.passportIssueDate}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="passportIssuedBy" className="text-sm text-gray-700">
                      Кем выдан <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passportIssuedBy"
                      value={formData.passportIssuedBy}
                      onChange={(e) => handleInputChange('passportIssuedBy', e.target.value)}
                      maxLength={500}
                      className={`mt-2 ${errors.passportIssuedBy ? 'border-red-500' : ''}`}
                      placeholder="Отделением УФМС России"
                    />
                    {errors.passportIssuedBy && (
                      <p className="text-sm text-red-500 mt-1">{errors.passportIssuedBy}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="registrationAddress" className="text-sm text-gray-700">
                      Место регистрации <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registrationAddress"
                      value={formData.registrationAddress}
                      onChange={(e) => handleInputChange('registrationAddress', e.target.value)}
                      maxLength={500}
                      className={`mt-2 ${errors.registrationAddress ? 'border-red-500' : ''}`}
                      placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                    />
                    {errors.registrationAddress && (
                      <p className="text-sm text-red-500 mt-1">{errors.registrationAddress}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="passportScans" className="text-sm text-gray-700">
                      Скан паспорта <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Скан разворота паспорта с фото и данными. До 5 файлов.
                    </p>
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
                    {errors.passportScans && (
                      <p className="text-sm text-red-500 mt-1">{errors.passportScans}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* РЕЖИМ ПРОСМОТРА */
            <>
              {/* Персональные данные */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Персональные данные</h3>
                </div>
                <div className="flex gap-8">
                  {/* Фото профиля слева */}
                  <div className="shrink-0">
                    <ProfilePhotoView file={savedData.profilePhoto} />
                  </div>
                  {/* Остальные поля справа */}
                  <div className="flex-1 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ViewField label="Фамилия" value={savedData.lastName} />
                    <ViewField label="Имя" value={savedData.firstName} />
                    <ViewField label="Отчество" value={savedData.middleName} />
                    <ViewField label="Дата рождения" value={formatDate(savedData.birthDate)} />
                  </div>
                </div>
              </div>

              {/* Паспортные данные */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-5">
                  <IdCard className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Паспортные данные</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <ViewField label="Серия и номер" value={savedData.passportSeries} />
                  <ViewField label="Дата выдачи" value={formatDate(savedData.passportIssueDate)} />
                  <ViewField label="Кем выдан" value={savedData.passportIssuedBy} />
                  <div className="md:col-span-2 xl:col-span-3">
                    <ViewField label="Место регистрации" value={savedData.registrationAddress} />
                  </div>
                  {savedData.passportScans.length > 0 && (
                    <div className="md:col-span-2 xl:col-span-3">
                      <div className="text-xs text-gray-500 mb-2">Скан паспорта</div>
                      <div className="flex flex-wrap gap-2">
                        {savedData.passportScans.map((file, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFile(file)}
                            className="h-8 px-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {file.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky футер с кнопками */}
      <div className="shrink-0 border-t bg-gray-50 -mx-6 px-6 py-4 mt-6">
        <div className="max-w-[1400px] flex justify-end gap-3">
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleEdit}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}