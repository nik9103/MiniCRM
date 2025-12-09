import { useState, useMemo, useEffect } from 'react';
import { Search, UserPlus, Eye, User as UserIcon, Mail, Clock, IdCard, FileText, CreditCard, Edit2, Trash2, Ban, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { toast } from 'sonner@2.0.3';
import { EditUserModal } from '../EditUserModal';

type UserRole = 'admin' | 'manager' | 'judge' | 'athlete';
type UserStatus = 'active' | 'inactive';

// Базовый интерфейс пользователя
interface BaseUser {
  id: number;
  role: UserRole;
  email: string;
  status: UserStatus;
  lastLogin: string | null;
  registrationDate: string;
}

// Данные спортсмена (полный профиль)
interface AthleteUser extends BaseUser {
  role: 'athlete';
  // Персональные данные
  lastName: string;
  firstName: string;
  middleName: string;
  gender: 'male' | 'female';
  birthDate: string;
  profilePhoto: File | null;
  
  // Паспортные данные
  passportSeries: string;
  passportIssueDate: string;
  passportIssuedBy: string;
  registrationAddress: string;
  passportScans: string[]; // URL изображений
  
  // Прочие данные
  snils: string;
  snilsScan: string | null; // URL изображения
  inn: string;
  innScan: string | null; // URL изображения
  
  // Банковские реквизиты
  cardNumber: string;
  cardHolder: string;
  bik: string;
  corrAccount: string;
  account: string;
}

// Данные судьи
interface JudgeUser extends BaseUser {
  role: 'judge';
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
  passportScans: string[]; // URL изображений
}

// Данные менеджера
interface ManagerUser extends BaseUser {
  role: 'manager';
  // Контактные данные
  lastName: string;
  firstName: string;
  middleName: string;
  phoneNumber: string;
  profilePhoto: File | null;
}

// Данные администратора (минимальные данные)
interface AdminUser extends BaseUser {
  role: 'admin';
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
}

type User = AthleteUser | JudgeUser | ManagerUser | AdminUser;

interface UsersPageProps {
  role: 'admin' | 'manager';
  modalToOpen?: string;
  onModalOpened?: () => void;
}

// Моковые данные
const mockUsers: User[] = [
  {
    id: 1,
    lastName: 'Иванов',
    firstName: 'Иван',
    middleName: 'Иванович',
    role: 'athlete',
    email: 'ivanov@example.com',
    phone: '+7 (926) 123-45-67',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00',
    registrationDate: '2023-06-10',
    profilePhoto: null,
    gender: 'male',
    birthDate: '1990-01-01',
    passportSeries: '1234',
    passportIssueDate: '2015-05-15',
    passportIssuedBy: 'ОВД',
    registrationAddress: 'г. Москва, ул. Ленина, д. 1',
    passportScans: [
      'https://images.unsplash.com/photo-1613244470042-e69e8ccb303a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      'https://images.unsplash.com/photo-1763225271111-dd9363584249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    ],
    snils: '123-456-789 01',
    snilsScan: 'https://images.unsplash.com/photo-1617976166080-c8f997ccc237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    inn: '123456789012',
    innScan: 'https://images.unsplash.com/photo-1763225271111-dd9363584249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    cardNumber: '4111 1111 1111 1111',
    cardHolder: 'Иванов Иван Иванович',
    bik: '044525225',
    corrAccount: '30101810400000000225',
    account: '40702810800000000001',
  },
  {
    id: 2,
    lastName: 'Петрова',
    firstName: 'Мария',
    middleName: 'Сергеевна',
    role: 'judge',
    email: 'petrova@example.com',
    phone: '+7 (916) 234-56-78',
    status: 'active',
    lastLogin: '2024-01-14T14:20:00',
    registrationDate: '2023-07-22',
    profilePhoto: null,
    birthDate: '1985-06-15',
    passportSeries: '5678',
    passportIssueDate: '2016-06-16',
    passportIssuedBy: 'ОВД',
    registrationAddress: 'г. Москва, ул. Мира, д. 2',
    passportScans: [
      'https://images.unsplash.com/photo-1613244470042-e69e8ccb303a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    ],
  },
  {
    id: 3,
    lastName: 'Смирнов',
    firstName: 'Алексей',
    middleName: 'Владимирович',
    role: 'manager',
    email: 'smirnov@example.com',
    phone: '+7 (905) 345-67-89',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00',
    registrationDate: '2023-05-15',
    profilePhoto: null,
    phoneNumber: '+7 (905) 345-67-89',
  },
  {
    id: 4,
    lastName: 'Козлов',
    firstName: 'Дмитрий',
    middleName: 'Павлович',
    role: 'athlete',
    email: 'kozlov@example.com',
    phone: '+7 (903) 456-78-90',
    status: 'inactive',
    lastLogin: '2023-12-20T16:45:00',
    registrationDate: '2023-08-03',
    profilePhoto: null,
    gender: 'male',
    birthDate: '1995-07-20',
    passportSeries: '9012',
    passportIssueDate: '2017-07-17',
    passportIssuedBy: 'ОВД',
    registrationAddress: 'г. Москва, ул. Победы, д. 3',
    passportScans: [],
    snils: '901-234-567 02',
    snilsScan: null,
    inn: '901234567890',
    innScan: null,
    cardNumber: '5168 9900 4444 8888',
    cardHolder: 'Козлов Дмитрий Павлович',
    bik: '044525225',
    corrAccount: '30101810400000000225',
    account: '40702810800000000002',
  },
  {
    id: 5,
    lastName: 'Новикова',
    firstName: 'Елена',
    middleName: 'Андреевна',
    role: 'judge',
    email: 'novikova@example.com',
    phone: '+7 (917) 567-89-01',
    status: 'active',
    lastLogin: null,
    registrationDate: '2024-01-10',
    profilePhoto: null,
    birthDate: '1980-08-25',
    passportSeries: '3456',
    passportIssueDate: '2018-08-18',
    passportIssuedBy: 'ОВД',
    registrationAddress: 'г. Москва, ул. Садовая, д. 4',
    passportScans: [],
  },
  {
    id: 6,
    lastName: 'Федоров',
    firstName: 'Сергей',
    middleName: 'Николаевич',
    role: 'admin',
    email: 'fedorov@example.com',
    phone: '+7 (926) 678-90-12',
    status: 'active',
    lastLogin: '2024-01-15T11:00:00',
    registrationDate: '2023-04-01',
    profilePhoto: null,
    phone: '+7 (926) 678-90-12',
  },
  {
    id: 7,
    lastName: 'Козлов',
    firstName: 'Петр',
    middleName: 'Дмитриевич',
    role: 'athlete',
    email: 'kozlov.petr@example.com',
    phone: '+7 (903) 111-22-33',
    status: 'active',
    lastLogin: null,
    registrationDate: '2025-02-21',
    profilePhoto: null,
    gender: 'male',
    birthDate: '1998-03-12',
    passportSeries: '4567',
    passportIssueDate: '2018-03-15',
    passportIssuedBy: 'ОВД',
    registrationAddress: 'г. Москва, ул. Тверская, д. 10',
    passportScans: [],
    snils: '456-789-012 34',
    snilsScan: null,
    inn: '456789012345',
    innScan: null,
    cardNumber: '4111 2222 3333 4444',
    cardHolder: 'Козлов Петр Дмитриевич',
    bik: '044525225',
    corrAccount: '30101810400000000225',
    account: '40702810800000000003',
  },
  {
    id: 8,
    lastName: 'Васильев',
    firstName: 'Сергей',
    middleName: 'Петрович',
    role: 'athlete',
    email: 'vasiliev@example.com',
    phone: '+7 (916) 222-33-44',
    status: 'active',
    lastLogin: '2025-02-20T15:30:00',
    registrationDate: '2024-11-10',
    profilePhoto: null,
    gender: 'male',
    birthDate: '1992-08-20',
    passportSeries: '7890',
    passportIssueDate: '2012-08-25',
    passportIssuedBy: 'ОВД',
    registrationAddress: 'г. Москва, ул. Арбат, д. 5',
    passportScans: [],
    snils: '789-012-345 67',
    snilsScan: null,
    inn: '789012345678',
    innScan: null,
    cardNumber: '5555 6666 7777 8888',
    cardHolder: 'Васильев Сергей Петрович',
    bik: '044525225',
    corrAccount: '30101810400000000225',
    account: '40702810800000000004',
  },
];

export function UsersPage({ role, modalToOpen, onModalOpened }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Открытие модального окна из уведомлений
  useEffect(() => {
    if (modalToOpen) {
      // Найти пользователя по ID
      const user = users.find(u => u.id.toString() === modalToOpen);

      if (user) {
        setSelectedUser(user);
        setIsViewModalOpen(true);
        if (onModalOpened) {
          onModalOpened();
        }
      }
    }
  }, [modalToOpen, users]);

  // Получить доступные роли в зависимости от текущей роли пользователя
  const getAccessibleRoles = (): UserRole[] => {
    if (role === 'admin') {
      return ['athlete', 'judge', 'manager']; // Админ видит всех кроме других админов
    }
    return ['athlete', 'judge']; // Менеджер видит только спортсменов и судей
  };

  // Фильтрация пользоваелей
  const filteredUsers = useMemo(() => {
    const accessibleRoles = getAccessibleRoles();
    
    return users.filter(user => {
      // Проверка доступа по роли
      if (!accessibleRoles.includes(user.role)) {
        return false;
      }

      // Поиск по ФИО и email
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);

      // Фильтр по роли
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Фильтр по статусу
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      // Фильтр по дате регистрации
      const matchesDate = 
        (!dateFrom || user.registrationDate >= dateFrom) &&
        (!dateTo || user.registrationDate <= dateTo);

      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });
  }, [users, searchQuery, roleFilter, statusFilter, dateFrom, dateTo, role]);

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'Администратор',
      manager: 'Спортивный менеджер',
      judge: 'Судья',
      athlete: 'Спортсмен',
    };
    return labels[role];
  };

  const getStatusLabel = (status: UserStatus) => {
    return status === 'active' ? 'Активный' : 'Неактивный';
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleCreateUser = (newUser: Omit<User, 'id' | 'lastLogin' | 'registrationDate'>) => {
    const user: User = {
      ...newUser,
      id: users.length + 1,
      lastLogin: null,
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, user]);
    setIsCreateModalOpen(false);
    toast.success('Пользователь успешно создан');
  };

  const handleStatusChange = (userId: number, newStatus: UserStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`Статус пользователя изменен на "${getStatusLabel(newStatus)}"`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1>Пользователи</h1>
        <p className="text-gray-600 mt-1">
          Управление пользователями системы
        </p>
      </div>

      {/* Кнопка добавления */}
      {role === 'admin' && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>
      )}

      {/* Фильтры */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Первая строка фильтров */}
          <div className="grid md:grid-cols-4 gap-4">
            {/* Поиск */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по ФИО или email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Роль */}
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="athlete">Спортсмен</SelectItem>
                <SelectItem value="judge">Судья</SelectItem>
                <SelectItem value="manager">Спортивный менеджер</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>

            {/* Статус */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активный</SelectItem>
                <SelectItem value="inactive">Неактивный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Диапазон дат */}
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">Дата регистрации:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[180px]"
            />
            <span className="text-gray-400">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[180px]"
            />
            {(dateFrom || dateTo || roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Таблица */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-gray-500 uppercase text-xs">Пользователь</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Роль</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Email</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Телефон</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Статус</TableHead>
              <TableHead className="text-gray-500 uppercase text-xs">Последний вход</TableHead>
              <TableHead className="w-[120px] text-gray-500 uppercase text-xs">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setIsViewModalOpen(true);
                  }}
                  className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="text-sm text-gray-900">
                        {user.lastName} {user.firstName} {user.middleName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{getRoleLabel(user.role)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{user.phone}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }
                    >
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{formatDateTime(user.lastLogin)}</span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setIsViewModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-green-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно создания пользователя */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* Модальное окно просмотра пользователя */}
      <UserViewModal
        open={isViewModalOpen}
        user={selectedUser}
        userRole={role}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        onStatusChange={handleStatusChange}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsEditModalOpen(true);
        }}
        onDelete={(userId) => {
          setUsers(users.filter(u => u.id !== userId));
          toast.success('Пользователь успешно удален');
        }}
      />

      {/* Модальное окно редактирования пользователя */}
      <EditUserModal
        open={isEditModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={(updatedUser) => {
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          setIsEditModalOpen(false);
          setSelectedUser(null);
          toast.success('Профиль пользователя успешно обновлен');
        }}
      />
    </div>
  );
}

// Модальное окно создания пользователя
function CreateUserModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (user: Omit<User, 'id' | 'lastLogin' | 'registrationDate'>) => void;
}) {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    role: 'athlete' as UserRole,
    email: '',
    phone: '',
    password: '',
    status: 'active' as UserStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Обязательное поле';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Обязательное поле';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    onCreate({
      lastName: formData.lastName || 'Не указано',
      firstName: formData.firstName || 'Не указано',
      middleName: formData.middleName,
      role: formData.role,
      email: formData.email,
      phone: formData.phone || '—',
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создание пользователя</DialogTitle>
          <DialogDescription>
            Введите данные нового пользователя
          </DialogDescription>
        </DialogHeader>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="role" className="text-sm text-gray-700">
              Роль <span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="athlete">Спортсмен</option>
              <option value="judge">Судья</option>
              <option value="manager">Спортивный менеджер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm text-gray-700">
              Пароль <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`mt-2 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Минимум 6 символов"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Пользователь сможет изменить пароль после первого входа
            </p>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm text-gray-700">
              Статус <span className="text-red-500">*</span>
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="active">Активный</option>
              <option value="inactive">Неактивный</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Модальное окно просмотра пользователя
function UserViewModal({
  open,
  user,
  userRole,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  open: boolean;
  user: User | null;
  userRole: 'admin' | 'manager';
  onClose: () => void;
  onStatusChange: (userId: number, newStatus: UserStatus) => void;
  onEdit?: (user: User) => void;
  onDelete?: (userId: number) => void;
}) {
  if (!user) return null;

  const [currentStatus, setCurrentStatus] = useState(user.status);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'администратора',
      manager: 'спортивного менеджера',
      judge: 'судьи',
      athlete: 'спортсмена',
    };
    return labels[role];
  };

  const getRoleBadgeLabel = (role: UserRole) => {
    const labels = {
      admin: 'Администратор',
      manager: 'Спортивный менеджер',
      judge: 'Судья',
      athlete: 'Спортсмен',
    };
    return labels[role];
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      judge: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
      athlete: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      manager: 'bg-green-100 text-green-700 hover:bg-green-100',
      admin: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    };
    return colors[role];
  };

  const getStatusLabel = (status: UserStatus) => {
    return status === 'active' ? 'Активный' : 'Неактивный';
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleStatusChange = () => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setCurrentStatus(newStatus);
    onStatusChange(user.id, newStatus);
  };

  // Компонент для отображения поля
  const ViewField = ({ label, value }: { label: string; value: string | null }) => (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value || '—'}</div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[1000px] max-h-[95vh] flex flex-col p-0" aria-describedby={undefined}>
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="sr-only">
              Профиль {getRoleLabel(user.role)}
            </DialogTitle>
            {/* Заголовок в стиле профилей */}
            <div className="space-y-2">
              <h2 className="text-xl">
                Профиль {getRoleLabel(user.role)}: {user.lastName} {user.firstName} {user.middleName}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">ID: {user.id}</span>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleBadgeLabel(user.role)}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Содержимое с прокруткой */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Персональные данные */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">{user.role === 'manager' ? 'Контактные данные' : 'Персональные данные'}</h3>
                </div>
                <div className="flex gap-8">
                  {/* Фото профиля слева */}
                  <div className="shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <div className="text-4xl text-gray-400">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-center">Фото профиля</div>
                    </div>
                  </div>
                  {/* Остальные поля справа */}
                  <div className="flex-1 grid md:grid-cols-2 gap-6">
                    <ViewField label="Фамилия" value={user.lastName} />
                    <ViewField label="Имя" value={user.firstName} />
                    <ViewField label="Отчество" value={user.middleName} />
                    {(user.role === 'athlete' || user.role === 'judge') && (
                      <ViewField label="Дата рождения" value={formatDate(user.birthDate)} />
                    )}
                    {user.role === 'athlete' && (
                      <ViewField 
                        label="Пол" 
                        value={user.gender === 'male' ? 'Мужской' : 'Женский'} 
                      />
                    )}
                    {user.role === 'manager' && 'phoneNumber' in user && (
                      <ViewField label="Номер телефона" value={user.phoneNumber} />
                    )}
                  </div>
                </div>
              </div>

              {/* Паспортные данные (только для спортсмена и судьи) */}
              {(user.role === 'athlete' || user.role === 'judge') && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <IdCard className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base">Паспортные данные</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <ViewField label="Серия и номер" value={user.passportSeries} />
                      <ViewField label="Дата выдачи" value={formatDate(user.passportIssueDate)} />
                      <ViewField label="Кем выдан" value={user.passportIssuedBy} />
                      <div className="md:col-span-2">
                        <ViewField label="Место регистрации" value={user.registrationAddress} />
                      </div>
                    </div>
                    {user.passportScans.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-3">Скан паспорта ({user.passportScans.length} {user.passportScans.length === 1 ? 'файл' : 'файла'})</div>
                        <div className="grid grid-cols-2 gap-4">
                          {user.passportScans.map((url, index) => (
                            <a 
                              key={index} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group"
                            >
                              <img 
                                src={url} 
                                alt={`Паспорт страница ${index + 1}`}
                                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Прочие данные (только для спортсмена) */}
              {user.role === 'athlete' && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base">Прочие данные</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <ViewField label="СНИЛС" value={user.snils} />
                      <ViewField label="ИНН" value={user.inn} />
                    </div>
                    {(user.snilsScan || user.innScan) && (
                      <div className="grid md:grid-cols-2 gap-6">
                        {user.snilsScan && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Скан СНИЛС</div>
                            <a 
                              href={user.snilsScan} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group"
                            >
                              <img 
                                src={user.snilsScan} 
                                alt="Скан СНИЛС"
                                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                              />
                            </a>
                          </div>
                        )}
                        {user.innScan && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Скан ИНН</div>
                            <a 
                              href={user.innScan} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group"
                            >
                              <img 
                                src={user.innScan} 
                                alt="Скан ИНН"
                                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                              />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Банковские реквизиты (только для спортсмена) */}
              {user.role === 'athlete' && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base">Банковские реквизиты</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ViewField label="Номер карты" value={user.cardNumber} />
                    <ViewField label="Получатель" value={user.cardHolder} />
                    <ViewField label="БИК" value={user.bik} />
                    <ViewField label="Корр. счет" value={user.corrAccount} />
                    <ViewField label="Расчетный счет" value={user.account} />
                  </div>
                </div>
              )}

              {/* Контактная информация */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Контактная информация</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <ViewField label="Email" value={user.email} />
                  <ViewField label="Телефон" value={'phone' in user ? user.phone : '—'} />
                </div>
              </div>

              {/* Системная информация */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base">Системная информация</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <ViewField label="Дата регистрации" value={formatDate(user.registrationDate)} />
                  <ViewField label="Последний вход" value={formatDateTime(user.lastLogin)} />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky футер только для администратора */}
          {userRole === 'admin' ? (
            <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleStatusChange}
                    variant="outline"
                    className={currentStatus === 'active' ? 'text-red-600 border-red-600 hover:bg-red-50' : 'text-green-600 border-green-600 hover:bg-green-50'}
                  >
                    {currentStatus === 'active' ? (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Заблокировать
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Активировать
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      if (onEdit) onEdit(user);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button onClick={onClose}>
                    Закрыть
                  </Button>
                </div>
              </div>
            </DialogFooter>
          ) : (
            <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
              <Button onClick={onClose}>
                Закрыть
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя {user.lastName} {user.firstName}? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отменить</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onDelete) onDelete(user.id);
                setDeleteDialogOpen(false);
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}