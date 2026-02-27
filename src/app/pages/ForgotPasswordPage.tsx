import { useState } from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import { forgotPassword, type AuthError } from '@/services/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccess(true);
      setMessage(res.message);
    } catch (err: unknown) {
      const apiError = err as AuthError;
      setError(apiError?.detail || 'Error al enviar el correo. Inténtalo de nuevo.');
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
              <Mail className="w-16 h-16 mx-auto text-[#C8923A] mb-6" />
              <h2
                className="text-2xl text-[#3E2412] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Revisa tu correo
              </h2>
              <p className="text-[#6B4422] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                {message}
              </p>
              <Link
                to="/login"
                className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Volver a iniciar sesión
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
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
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
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="tu@correo.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed font-medium rounded-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-[#C8923A] hover:text-[#A67A28] transition-colors"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
