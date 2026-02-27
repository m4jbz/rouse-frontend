import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { resendVerification, type LoginCredentials, type AuthError } from '@/services/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (showResendVerification) setShowResendVerification(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setShowResendVerification(false);
    setResendMessage('');

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err: unknown) {
      const apiError = err as AuthError;
      const detail = apiError?.detail || 'Credenciales incorrectas. Inténtalo de nuevo.';
      setError(detail);

      // If the error is about email verification, show resend option
      if (detail.toLowerCase().includes('verificar')) {
        setShowResendVerification(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    try {
      const response = await resendVerification(formData.email);
      setResendMessage(response.message);
      setShowResendVerification(false);
    } catch {
      setResendMessage('Error al reenviar el correo de verificación.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F0E0C8] flex flex-col">
      {/* Header mínimo */}
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

      {/* Card del formulario */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-[#FAF4EB] rounded-xl border border-[#D4B888] shadow-lg p-8">
            {/* Título */}
            <div className="text-center mb-8">
              <h2
                className="text-2xl sm:text-3xl text-[#3E2412] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Iniciar sesión
              </h2>
              <p
                className="text-[#6B4422]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Accede a tu cuenta para hacer pedidos
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 rounded-md bg-[#A63C2E]/10 border border-[#A63C2E]/30 text-[#A63C2E] text-sm text-center" style={{ fontFamily: 'var(--font-sans)' }}>
                {error}
                {showResendVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="block mx-auto mt-2 text-[#C8923A] hover:text-[#A67A28] underline font-medium"
                  >
                    Reenviar correo de verificación
                  </button>
                )}
              </div>
            )}

            {/* Resend success message */}
            {resendMessage && (
              <div className="mb-6 p-3 rounded-md bg-green-100 border border-green-300 text-green-800 text-sm text-center" style={{ fontFamily: 'var(--font-sans)' }}>
                {resendMessage}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#3E2412] mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B4422]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#3E2412] mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B4422]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tu contraseña"
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

              {/* Olvidé mi contraseña */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#C8923A] hover:text-[#A67A28] transition-colors"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed font-medium rounded-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#D4B888]"></div>
              <span className="text-sm text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                o
              </span>
              <div className="flex-1 h-px bg-[#D4B888]"></div>
            </div>

            {/* Link a registro */}
            <p
              className="text-center text-[#3E2412]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-[#C8923A] hover:text-[#A67A28] font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
