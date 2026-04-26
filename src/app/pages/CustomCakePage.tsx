import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  listCakeFlavors,
  listCakeFillings,
  listCakeToppings,
  listCakeSizes,
  type CakeOption,
  type CakeSize,
} from '@/services/admin';
import { createCustomCakeRequest, type CustomCakeRequestCreate } from '@/services/customCakes';
import { uploadImageToCodeberg } from '@/services/codeberg';

interface FormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  cake_size: string;
  cake_layers: number;
  cake_flavor: string;
  filling: string;
  topping: string;
  custom_text: string;
  delivery_date: string;
  delivery_time: string;
  additional_notes: string;
}

const initialFormData: FormData = {
  client_name: '',
  client_email: '',
  client_phone: '',
  cake_size: '',
  cake_layers: 1,
  cake_flavor: '',
  filling: '',
  topping: '',
  custom_text: '',
  delivery_date: '',
  delivery_time: '',
  additional_notes: '',
};

export function CustomCakePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [sizes, setSizes] = useState<CakeSize[]>([]);
  const [flavors, setFlavors] = useState<CakeOption[]>([]);
  const [fillings, setFillings] = useState<CakeOption[]>([]);
  const [toppings, setToppings] = useState<CakeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cleanPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    // Strip Mexico country code (52) if present
    if (digits.startsWith('52') && digits.length === 12) {
      return digits.slice(2);
    }
    return digits;
  }

  const accountPhone = isAuthenticated && user?.phone ? cleanPhone(user.phone) : '';
  const usingAccountContact = !authLoading && isAuthenticated && !!user;
  const needsPhoneFromUser = usingAccountContact && !accountPhone;

  // If user is logged in, prefill contact info from account.
  useEffect(() => {
    if (!usingAccountContact || !user) return;
    setFormData((prev) => ({
      ...prev,
      client_name: user.name || prev.client_name,
      client_email: user.email || prev.client_email,
      client_phone: accountPhone || prev.client_phone,
    }));
  }, [usingAccountContact, user, accountPhone]);

  // Fetch cake options on mount
  useEffect(() => {
    Promise.all([
      listCakeSizes(),
      listCakeFlavors(),
      listCakeFillings(),
      listCakeToppings(),
    ])
      .then(([sizesData, flavorsData, fillingsData, toppingsData]) => {
        setSizes(sizesData);
        setFlavors(flavorsData.filter(f => f.is_active));
        setFillings(fillingsData.filter(f => f.is_active));
        setToppings(toppingsData.filter(t => t.is_active));
      })
      .catch(() => {
        setError('Error al cargar opciones. Por favor recarga la página.');
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cake_layers' ? parseInt(value) || 1 : value,
    }));
  };

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (referenceImages.length + files.length > 5) {
      setError('Máximo 5 imágenes de referencia permitidas.');
      return;
    }

    setUploadingImages(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(file =>
        uploadImageToCodeberg(file, 'references')
      );
      const urls = await Promise.all(uploadPromises);
      setReferenceImages(prev => [...prev, ...urls]);
    } catch (err) {
      setError('Error al subir imágenes. Intenta de nuevo.');
      console.error('Image upload error:', err);
    } finally {
      setUploadingImages(false);
    }
  }, [referenceImages.length]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const resolvedClientName = usingAccountContact && user ? user.name : formData.client_name;
    const resolvedClientEmail = usingAccountContact && user ? user.email : formData.client_email;
    const resolvedClientPhone = usingAccountContact
      ? (accountPhone || formData.client_phone)
      : formData.client_phone;

    // Validation
    if (!resolvedClientName || !resolvedClientEmail || !resolvedClientPhone) {
      setError('Por favor completa tus datos de contacto.');
      return;
    }
    if (!formData.cake_size || !formData.cake_flavor) {
      setError('Por favor selecciona tamaño y sabor del pastel.');
      return;
    }
    if (!formData.delivery_date) {
      setError('Por favor selecciona una fecha de entrega.');
      return;
    }

    setSubmitting(true);

    try {
      const requestData: CustomCakeRequestCreate = {
        client_name: resolvedClientName,
        client_email: resolvedClientEmail,
        client_phone: resolvedClientPhone,
        cake_size: formData.cake_size,
        cake_layers: formData.cake_layers,
        cake_flavor: formData.cake_flavor,
        filling: formData.filling || undefined,
        topping: formData.topping || undefined,
        custom_text: formData.custom_text || undefined,
        reference_images: referenceImages.length > 0 ? referenceImages : undefined,
        delivery_date: formData.delivery_date,
        delivery_time: formData.delivery_time || undefined,
        additional_notes: formData.additional_notes || undefined,
      };

      const result = await createCustomCakeRequest(requestData);
      setSubmitted(true);

      // Send WhatsApp notification to admin
      const adminPhone = import.meta.env.VITE_ADMIN_WHATSAPP;
      if (adminPhone) {
        const referenceImagesText =
          referenceImages.length > 0
            ? `\n\n*Imágenes de referencia:*\n${referenceImages.join('\n')}`
            : '';

        const message = `*Nueva Solicitud de Pastel Personalizado*

*Solicitud #${result.id}*
*Cliente:* ${resolvedClientName}
*Teléfono:* ${resolvedClientPhone}
*Email:* ${resolvedClientEmail}

*Detalles del pastel:*
Tamaño: ${formData.cake_size}
Pisos: ${formData.cake_layers}
Sabor: ${formData.cake_flavor}
${formData.filling ? `Relleno: ${formData.filling}` : ''}
${formData.topping ? `Cobertura: ${formData.topping}` : ''}
${formData.custom_text ? `Texto: "${formData.custom_text}"` : ''}

*Entrega:* ${formData.delivery_date}${formData.delivery_time ? ` a las ${formData.delivery_time}` : ''}
${formData.additional_notes ? `\n\n*Notas:* ${formData.additional_notes}` : ''}${referenceImagesText}

Revisa el panel de admin para más detalles.`;

        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (err: any) {
      setError(err.detail || 'Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />

        <main className="flex-1 bg-[#F5EDE0] flex items-center justify-center py-16 px-4">
          <div className="bg-white p-10 max-w-md w-full text-center shadow-lg">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1
              className="text-3xl text-[#3E2412] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              ¡Solicitud Enviada!
            </h1>
              <p
                className="text-[#6B4422] mb-6"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Hemos recibido tu solicitud de pastel personalizado. Te contactaremos
                pronto con una cotización al correo{' '}
                <strong>{usingAccountContact && user ? user.email : formData.client_email}</strong>.
              </p>
            <a
              href="/"
              className="inline-block bg-[#C8923A] text-white px-8 py-3 font-bold uppercase tracking-wide hover:bg-[#A67A28] transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Volver al inicio
            </a>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero */}
      <section className="relative h-[340px] sm:h-[400px] lg:h-[450px] overflow-hidden">
        <img
          src="https://codeberg.org/m4jbz/rouse-images/raw/branch/main/bg_main.jpg"
          alt="Pastel personalizado"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/75 px-10 py-6 flex flex-col items-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-[#3E2412] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Pastel Personalizado
            </h1>
            <p
              className="text-lg sm:text-xl text-[#6B4422] max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Crea el pastel de tus sueños. Completa el formulario y te enviaremos una cotización.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <main className="flex-1 bg-[#F5EDE0] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingOptions ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C8923A]" />
              <p className="mt-4 text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                Cargando opciones...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

              {/* Contact Info */}
              <fieldset className="mb-8">
                <legend
                  className="text-xl text-[#3E2412] mb-4 pb-2 border-b-2 border-[#EAD5B8] w-full"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Datos de Contacto
                </legend>
                {usingAccountContact && user && !needsPhoneFromUser ? (
                  <div className="bg-[#FAF4EB] border border-[#D4B888] p-4">
                    <p className="text-sm text-[#6B4422] mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
                      Sesión iniciada. Usaremos los datos de tu cuenta.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ fontFamily: 'var(--font-sans)' }}>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-[#3E2412]">Nombre</div>
                        <div className="text-[#3E2412]">{user.name}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-[#3E2412]">Teléfono</div>
                        <div className="text-[#3E2412]">{accountPhone}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs font-bold uppercase tracking-wide text-[#3E2412]">Correo</div>
                        <div className="text-[#3E2412]">{user.email}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                      <label
                        htmlFor="client_name"
                        className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="client_name"
                        name="client_name"
                        value={usingAccountContact && user ? user.name : formData.client_name}
                        onChange={handleInputChange}
                        required={!usingAccountContact}
                        disabled={usingAccountContact}
                        className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] disabled:opacity-60"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label
                        htmlFor="client_phone"
                        className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="client_phone"
                        name="client_phone"
                        value={usingAccountContact ? (accountPhone || formData.client_phone) : formData.client_phone}
                        onChange={handleInputChange}
                        required={!usingAccountContact || needsPhoneFromUser}
                        disabled={usingAccountContact && !!accountPhone}
                        className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] disabled:opacity-60"
                      />
                      {needsPhoneFromUser && (
                        <p className="mt-1 text-xs text-[#6B4422]" style={{ fontFamily: 'var(--font-sans)' }}>
                          Tu cuenta no tiene teléfono registrado. Agrega uno para poder contactarte.
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="client_email"
                        className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        id="client_email"
                        name="client_email"
                        value={usingAccountContact && user ? user.email : formData.client_email}
                        onChange={handleInputChange}
                        required={!usingAccountContact}
                        disabled={usingAccountContact}
                        className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Cake Details */}
              <fieldset className="mb-8">
                <legend
                  className="text-xl text-[#3E2412] mb-4 pb-2 border-b-2 border-[#EAD5B8] w-full"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Detalles del Pastel
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cake_size"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Tamaño *
                    </label>
                    <select
                      id="cake_size"
                      name="cake_size"
                      value={formData.cake_size}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] bg-white"
                    >
                      <option value="">Selecciona un tamaño</option>
                      {sizes.map(size => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="cake_layers"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Número de pisos
                    </label>
                    <select
                      id="cake_layers"
                      name="cake_layers"
                      value={formData.cake_layers}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] bg-white"
                    >
                      <option value={1}>1 piso</option>
                      <option value={2}>2 pisos</option>
                      <option value={3}>3 pisos</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="cake_flavor"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Sabor del bizcocho *
                    </label>
                    <select
                      id="cake_flavor"
                      name="cake_flavor"
                      value={formData.cake_flavor}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] bg-white"
                    >
                      <option value="">Selecciona un sabor</option>
                      {flavors.map(flavor => (
                        <option key={flavor.id} value={flavor.name}>
                          {flavor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="filling"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Relleno
                    </label>
                    <select
                      id="filling"
                      name="filling"
                      value={formData.filling}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] bg-white"
                    >
                      <option value="">Sin relleno adicional</option>
                      {fillings.map(filling => (
                        <option key={filling.id} value={filling.name}>
                          {filling.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="topping"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Cobertura
                    </label>
                    <select
                      id="topping"
                      name="topping"
                      value={formData.topping}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] bg-white"
                    >
                      <option value="">Sin cobertura adicional</option>
                      {toppings.map(topping => (
                        <option key={topping.id} value={topping.name}>
                          {topping.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="custom_text"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Texto personalizado
                    </label>
                    <input
                      type="text"
                      id="custom_text"
                      name="custom_text"
                      value={formData.custom_text}
                      onChange={handleInputChange}
                      placeholder="Ej: Feliz cumpleaños María"
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A]"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Reference Images */}
              <fieldset className="mb-8">
                <legend
                  className="text-xl text-[#3E2412] mb-4 pb-2 border-b-2 border-[#EAD5B8] w-full"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Imágenes de Referencia
                </legend>
                <p
                  className="text-[#6B4422] mb-4"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Sube hasta 5 imágenes de referencia para mostrarnos el estilo que deseas.
                </p>

                {/* Image previews */}
                {referenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {referenceImages.map((url, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={url}
                          alt={`Referencia ${index + 1}`}
                          className="w-full h-full object-cover border-2 border-[#3E2412]"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                {referenceImages.length < 5 && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-[#3E2412] p-8 text-center cursor-pointer hover:border-[#C8923A] transition-colors"
                  >
                    <input
                      type="file"
                      id="reference_images"
                      accept="image/*"
                      multiple
                      onChange={e => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    <label htmlFor="reference_images" className="cursor-pointer">
                      {uploadingImages ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C8923A]" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-[#6B4422]" />
                      )}
                      <p
                        className="mt-2 text-[#6B4422]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {uploadingImages
                          ? 'Subiendo imágenes...'
                          : 'Arrastra imágenes aquí o haz clic para seleccionar'}
                      </p>
                    </label>
                  </div>
                )}
              </fieldset>

              {/* Delivery */}
              <fieldset className="mb-8">
                <legend
                  className="text-xl text-[#3E2412] mb-4 pb-2 border-b-2 border-[#EAD5B8] w-full"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Entrega
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="delivery_date"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Fecha de entrega *
                    </label>
                    <input
                      type="date"
                      id="delivery_date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      required
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="delivery_time"
                      className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Hora preferida
                    </label>
                    <input
                      type="time"
                      id="delivery_time"
                      name="delivery_time"
                      value={formData.delivery_time}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A]"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Additional notes */}
              <fieldset className="mb-8">
                <label
                  htmlFor="additional_notes"
                  className="block text-sm font-bold text-[#3E2412] mb-1 uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Notas adicionales
                </label>
                <textarea
                  id="additional_notes"
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Cualquier detalle adicional que quieras compartir..."
                  className="w-full border-2 border-[#3E2412] px-4 py-2 focus:outline-none focus:border-[#C8923A] resize-none"
                />
              </fieldset>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C8923A] text-white py-4 px-8 font-bold uppercase tracking-wide hover:bg-[#A67A28] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Solicitar Cotización'
                )}
              </button>

              <p
                className="mt-4 text-center text-sm text-[#6B4422]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Te contactaremos en 24-48 horas con una cotización personalizada.
              </p>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
