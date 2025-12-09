import { useState } from 'react';
import { Mail, Phone, Lock, ArrowRight, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

type UserRole = 'athlete' | 'manager' | 'judge';

interface RegisterPageProps {
  onRegister: (data: {
    role: UserRole;
    email: string;
    phone: string;
    password: string;
  }) => void;
  onNavigateToLogin: () => void;
  onNavigateToRoleSwitch: () => void;
}

export function RegisterPage({ onRegister, onNavigateToLogin, onNavigateToRoleSwitch }: RegisterPageProps) {
  const [role, setRole] = useState<UserRole>('athlete');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\d\s\(\)\+\-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    if (!password.trim()) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Повторите пароль';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onRegister({ role, email, phone, password });
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      athlete: 'Спортсмен',
      manager: 'Спортивный менеджер',
      judge: 'Судья',
    };
    return labels[role];
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      athlete: 'Участвую в соревнованиях',
      manager: 'Управляю спортсменами и судьями',
      judge: 'Судья спортивных соревнований',
    };
    return descriptions[role];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl mb-2">Регистрация</h1>
          <p className="text-gray-600">
            Создайте аккаунт для доступа к системе
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Выбор роли */}
          <div>
            <Label className="text-sm text-gray-700 mb-3 block">
              Выберите роль
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {(['athlete', 'manager', 'judge'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    role === r
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                        role === r
                          ? 'border-black'
                          : 'border-gray-300'
                      }`}
                    >
                      {role === r && (
                        <div className="w-2.5 h-2.5 bg-black rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm">{getRoleLabel(r)}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {getRoleDescription(r)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <Label htmlFor="phone" className="text-sm text-gray-700">
              Номер телефона
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`pl-9 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Пароль */}
          <div>
            <Label htmlFor="password" className="text-sm text-gray-700">
              Пароль
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-9 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Минимум 6 символов</p>
          </div>

          {/* Повторите пароль */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Повторите пароль
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-9 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Кнопка регистрации */}
          <Button type="submit" className="w-full">
            Зарегистрироваться
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Вход */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Войти
              </button>
            </p>
          </div>

          {/* Переключение роли */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Тестовый режим:{' '}
              <button
                type="button"
                onClick={onNavigateToRoleSwitch}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Переключить роль
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}