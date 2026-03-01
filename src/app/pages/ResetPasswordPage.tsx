import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { resetPassword, type AuthError } from '@/services/auth';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!token) {
      setError('Enlace inválido. Solicita uno nuevo.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as AuthError;
      setError(apiError?.detail || 'Error al restablecer la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F0E0C8] flex flex-col">
        <header className="py-6 text-center">
          <Link to="/">
            <h1
              className="text-3xl text-[#C8923A] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Pastelería Rouse
            </h1>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md">
            <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-6" />
              <h2
                className="text-2xl text-[#3E2412] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Contraseña restablecida
              </h2>
              <p className="text-[#6B4422] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link
                to="/login"
                className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F0E0C8] flex flex-col">
        <header className="py-6 text-center">
          <Link to="/">
            <h1
              className="text-3xl text-[#C8923A] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Pastelería Rouse
            </h1>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md">
            <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-lg p-8 text-center">
              <h2
                className="text-2xl text-[#3E2412] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Enlace inválido
              </h2>
              <p className="text-[#6B4422] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                Este enlace no es válido o ha expirado. Solicita uno nuevo.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0E0C8] flex flex-col">
      <header className="py-6 text-center">
        <Link to="/">
          <h1
            className="text-3xl text-[#C8923A] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Pastelería Rouse
          </h1>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-lg p-8">
            <div className="text-center mb-8">
              <h2
                className="text-2xl sm:text-3xl text-[#3E2412] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Nueva contraseña
              </h2>
              <p className="text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                Ingresa tu nueva contraseña.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-md bg-[#A63C2E]/10 border border-[#A63C2E]/30 text-[#A63C2E] text-sm text-center" style={{ fontFamily: 'var(--font-sans)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#3E2412] mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B4422]" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-11 pr-12 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4422] hover:text-[#C8923A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#3E2412] mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B4422]" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Repite tu contraseña"
                    className="w-full pl-11 pr-12 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4422] hover:text-[#C8923A] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed font-medium rounded-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
