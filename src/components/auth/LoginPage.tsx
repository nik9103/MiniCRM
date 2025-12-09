import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToRoleSwitch: () => void;
}

type ForgotPasswordStep = 'email' | 'code' | 'password' | null;

export function LoginPage({ onLogin, onNavigateToRegister, onNavigateToRoleSwitch }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Восстановление пароля
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!password.trim()) {
      newErrors.password = 'Введите пароль';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onLogin(email, password);
  };

  const handleSendResetEmail = () => {
    const newErrors: Record<string, string> = {};

    if (!resetEmail.trim()) {
      newErrors.resetEmail = 'Введите email';
    } else if (!validateEmail(resetEmail)) {
      newErrors.resetEmail = 'Некорректный формат email';
    }

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      return;
    }

    setResetErrors({});
    // Имитация отправки кода
    setForgotPasswordStep('code');
  };

  const handleVerifyCode = () => {
    const newErrors: Record<string, string> = {};

    if (!resetCode.trim()) {
      newErrors.resetCode = 'Введите код';
    } else if (resetCode.length !== 6) {
      newErrors.resetCode = 'Код должен содержать 6 символов';
    }

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      return;
    }

    setResetErrors({});
    setForgotPasswordStep('password');
  };

  const handleResetPassword = () => {
    const newErrors: Record<string, string> = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Минимум 6 символов';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Повторите пароль';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      return;
    }

    setResetErrors({});
    // Имитация успешного сброса пароля
    alert('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
    setForgotPasswordStep(null);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelReset = () => {
    setForgotPasswordStep(null);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl mb-2">Вход в систему</h1>
          <p className="text-gray-600">
            Управление спортивными соревнованиями
          </p>
        </div>

        {/* Форма входа */}
        {forgotPasswordStep === null && (
          <form onSubmit={handleLogin} className="space-y-5">
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
            </div>

            {/* Забыли пароль */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setForgotPasswordStep('email')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Кнопка входа */}
            <Button type="submit" className="w-full">
              Войти
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Регистрация */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Зарегистрироваться
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
        )}

        {/* Восстановление пароля - Шаг 1: Email */}
        {forgotPasswordStep === 'email' && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Восстановление пароля</h2>
              <p className="text-sm text-gray-600">
                Введите email, указанный при регистрации
              </p>
            </div>

            <div>
              <Label htmlFor="resetEmail" className="text-sm text-gray-700">
                Email
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`pl-9 ${resetErrors.resetEmail ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              {resetErrors.resetEmail && (
                <p className="text-sm text-red-500 mt-1">{resetErrors.resetEmail}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelReset}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleSendResetEmail}
                className="flex-1"
              >
                Отправить код
              </Button>
            </div>
          </div>
        )}

        {/* Восстановление пароля - Шаг 2: Код */}
        {forgotPasswordStep === 'code' && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Введите код</h2>
              <p className="text-sm text-gray-600">
                Код отправлен на {resetEmail}
              </p>
            </div>

            <div>
              <Label htmlFor="resetCode" className="text-sm text-gray-700">
                Код подтверждения
              </Label>
              <Input
                id="resetCode"
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className={`mt-2 text-center text-lg tracking-widest ${resetErrors.resetCode ? 'border-red-500' : ''}`}
                placeholder="000000"
                maxLength={6}
              />
              {resetErrors.resetCode && (
                <p className="text-sm text-red-500 mt-1">{resetErrors.resetCode}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Не пришел код?{' '}
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="text-blue-600 hover:underline"
                >
                  Отправить повторно
                </button>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelReset}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleVerifyCode}
                className="flex-1"
              >
                Подтвердить
              </Button>
            </div>
          </div>
        )}

        {/* Восстановление пароля - Шаг 3: Новый пароль */}
        {forgotPasswordStep === 'password' && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl mb-2">Новый пароль</h2>
              <p className="text-sm text-gray-600">
                Придумайте новый пароль
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-sm text-gray-700">
                Новый пароль
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`pl-9 ${resetErrors.newPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {resetErrors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{resetErrors.newPassword}</p>
              )}
            </div>

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
                  className={`pl-9 ${resetErrors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {resetErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{resetErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelReset}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                className="flex-1"
              >
                Сохранить пароль
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}