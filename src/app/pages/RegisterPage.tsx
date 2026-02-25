import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { register, type RegisterData } from '@/services/auth';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo que se está editando
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio.';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Ingresa un número de teléfono válido.';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await register(formData);
      console.log('[RegisterPage] Registrado:', response.user.email);
      // TODO: Guardar token y redirigir
      navigate('/login');
    } catch (err) {
      setErrors({ general: 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.' });
      console.error('[RegisterPage] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function fieldError(field: keyof FormErrors) {
    if (!errors[field]) return null;
    return (
      <p className="mt-1 text-sm text-[#A63C2E]" style={{ fontFamily: 'var(--font-sans)' }}>
        {errors[field]}
      </p>
    );
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
                Crear cuenta
              </h2>
              <p
                className="text-[#6B4422]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Únete y disfruta de nuestros productos
              </p>
            </div>

            {/* Error general */}
            {errors.general && (
              <div className="mb-6 p-3 rounded-md bg-[#A63C2E]/10 border border-[#A63C2E]/30 text-[#A63C2E] text-sm text-center" style={{ fontFamily: 'var(--font-sans)' }}>
                {errors.general}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#3E2412] mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B4422]" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full pl-11 pr-4 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                </div>
                {fieldError('name')}
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                </div>
                {fieldError('email')}
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#3E2412] mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B4422]" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+52 733 123 4567"
                    className="w-full pl-11 pr-4 py-3 bg-[#EAD5B8] border border-[#D4B888] rounded-md text-[#3E2412] placeholder:text-[#6B4422]/60 focus:outline-none focus:ring-2 focus:ring-[#C8923A] focus:border-[#C8923A] transition-colors"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                </div>
                {fieldError('phone')}
              </div>

              {/* Contraseña */}
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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
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
                {fieldError('password')}
              </div>

              {/* Confirmar contraseña */}
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
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                {fieldError('confirmPassword')}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C8923A] text-white py-3 hover:bg-[#A67A28] transition-colors duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed font-medium rounded-md mt-2"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
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

            {/* Link a login */}
            <p
              className="text-center text-[#3E2412]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-[#C8923A] hover:text-[#A67A28] font-medium transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
