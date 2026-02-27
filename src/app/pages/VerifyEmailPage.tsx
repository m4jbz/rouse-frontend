import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '@/services/auth';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Enlace de verificación inválido.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.detail || 'Error al verificar el correo.');
      });
  }, [token]);

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
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-[#C8923A] animate-spin mb-6" />
                <h2
                  className="text-2xl text-[#3E2412] mb-2"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Verificando...
                </h2>
                <p className="text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                  Estamos verificando tu correo electrónico.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-6" />
                <h2
                  className="text-2xl text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Cuenta verificada
                </h2>
                <p className="text-[#6B4422] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                  {message}
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Iniciar sesión
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 mx-auto text-[#A63C2E] mb-6" />
                <h2
                  className="text-2xl text-[#3E2412] mb-4"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Error de verificación
                </h2>
                <p className="text-[#6B4422] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                  {message}
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-[#C8923A] text-white px-8 py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md font-medium rounded-md"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Ir a iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
