import { useState } from 'react';
import { Upload, X, User as UserIcon, Eye, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';

interface ManagerProfileData {
  // Контактные данные
  lastName: string;
  firstName: string;
  middleName: string;
  phoneNumber: string;
  profilePhoto: File | null;
}

// Моковые данные для демонстрации режима просмотра
const createMockFile = (name: string, sizeInBytes: number = 500000): File => {
  // Создаем blob нужного размера
  const content = new Array(sizeInBytes).fill('x').join('');
  const blob = new Blob([content], { type: 'application/pdf' });
  return new File([blob], name, { type: 'application/pdf' });
};

const createMockImageFile = (name: string, sizeInBytes: number = 950000): File => {
  // Создаем blob изображения
  const content = new Array(sizeInBytes).fill('x').join('');
  const blob = new Blob([content], { type: 'image/jpeg' });
  return new File([blob], name, { type: 'image/jpeg' });
};

const mockSavedData: ManagerProfileData = {
  lastName: 'Смирнов',
  firstName: 'Алексей',
  middleName: 'Владимирович',
  phoneNumber: '+7 (926) 123-45-67',
  profilePhoto: createMockImageFile('manager_photo.jpg', 950000),
};

export function ManagerProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ManagerProfileData>(mockSavedData);
  const [savedData, setSavedData] = useState<ManagerProfileData>(mockSavedData);
  const [errors, setErrors] = useState<Partial<Record<keyof ManagerProfileData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (field: keyof ManagerProfileData, value: string) => {
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

  const handleFileUpload = (field: keyof ManagerProfileData, files: FileList | null) => {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ManagerProfileData, string>> = {};

    // Контактные данные
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

    // Валидация телефона (опционально, но если заполнено - должно быть 11 цифр)
    if (formData.phoneNumber) {
      const digits = formData.phoneNumber.replace(/\D/g, '');
      if (digits.length > 0 && digits.length !== 11) {
        newErrors.phoneNumber = 'Формат: +7 (XXX) XXX-XX-XX';
      }
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
      
      setSavedData(formData);
      setIsEditMode(false);
      toast.success('Данные успешно сохранены');
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
          Управление персональными данными
        </p>
      </div>

      {/* Скроллируемая область с полями */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-6 max-w-[1400px]">
          {isEditMode ? (
            /* РЕЖИМ РЕДАКТИРОВАНИЯ */
            <>
              {/* Контактные данные */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Контактные данные</h3>
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
                        placeholder="Смирнов"
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
                        placeholder="Алексей"
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
                        placeholder="Владимирович"
                      />
                      {errors.middleName && (
                        <p className="text-sm text-red-500 mt-1">{errors.middleName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm text-gray-700">Номер телефона</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        handleInputChange('phoneNumber', formatted);
                      }}
                      maxLength={18}
                      className={`mt-2 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                      placeholder="+7 (926) 123-45-67"
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="profilePhoto" className="text-sm text-gray-700">Фото профиля</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Форматы: PDF, JPG, PNG. Максимальный размер 10 МБ.
                    </p>
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
            </>
          ) : (
            /* РЕЖИМ ПРОСМОТРА */
            <>
              {/* Контактные данные */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Контактные данные</h3>
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
                    <ViewField label="Номер телефона" value={savedData.phoneNumber} />
                  </div>
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