import { useRef, useState, useEffect, SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '@/context/AdminContext';
import {
  type Category,
  type Product,
  type Variant,
  type CustomCakeRequest,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  listCustomCakeRequests,
  updateCustomCakeRequest,
  deleteCustomCakeRequest,
} from '@/services/admin';
import {
  type OrderPublic,
  type OrderStatus,
  type PaymentStatus,
  fetchAllOrders,
  updateOrder,
  deleteOrder as deleteOrderApi,
} from '@/services/orders';
import {
  startOfWeek,
  startOfMonth,
  today,
  filterOrdersByDate,
  computeSummary,
  generateReportPDF,
  type ReportSummary,
  type CustomCakeSaleRow,
} from '@/services/reports';
import { uploadImageToCodeberg } from '@/services/codeberg';

// ============================================================
// Shared styles
// ============================================================

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,
  header: {
    background: '#3E2412',
    color: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.5rem',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: '0',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  tab: (active: boolean) => ({
    padding: '0.625rem 1.25rem',
    background: active ? '#3E2412' : '#e5e7eb',
    color: active ? '#fff' : '#374151',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
  }) as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.5rem 0.75rem',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
    color: '#374151',
  },
  td: {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid #f3f4f6',
  },
  input: {
    padding: '0.375rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.875rem',
    boxSizing: 'border-box' as const,
  },
  btnPrimary: {
    padding: '0.375rem 0.75rem',
    background: '#3E2412',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
  },
  btnSecondary: {
    padding: '0.375rem 0.75rem',
    background: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
  },
  btnDanger: {
    padding: '0.375rem 0.75rem',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
  },
  btnSmall: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  success: {
    background: '#f0fdf4',
    color: '#16a34a',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
};

// ============================================================
// Categories Tab
// ============================================================

function CategoriesTab({ isAdmin }: { isAdmin: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSection, setNewSection] = useState<string>('');

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSection, setEditSection] = useState<string>('');

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await listCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err?.detail || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function clearMessages() { setError(''); setSuccess(''); }

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();
    clearMessages();
    try {
      await createCategory({
        name: newName,
        description: newDesc || undefined,
        section: newSection || undefined,
      });
      setNewName('');
      setNewDesc('');
      setNewSection('');
      setSuccess('Categoría creada');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al crear categoría');
    }
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditSection(cat.section || '');
    clearMessages();
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();
    if (editId === null) return;
    clearMessages();
    try {
      await updateCategory(editId, {
        name: editName,
        description: editDesc || undefined,
        section: editSection || null,
      });
      setEditId(null);
      setSuccess('Categoría actualizada');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al actualizar categoría');
    }
  }

  async function handleDelete(id: number) {
    clearMessages();
    try {
      await deleteCategory(id);
      setDeleteConfirm(null);
      setSuccess('Categoría eliminada');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al eliminar categoría');
      setDeleteConfirm(null);
    }
  }

  return (
    <div>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Create form */}
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Nueva categoría</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Nombre *</label>
            <input style={styles.input} value={newName} onChange={e => setNewName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Descripción</label>
            <input style={{ ...styles.input, width: '250px' }} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Sección</label>
            <select style={{ ...styles.input, minWidth: '160px' }} value={newSection} onChange={e => setNewSection(e.target.value)}>
              <option value="">(Sin sección)</option>
              <option value="pasteles">Pasteles</option>
              <option value="postres">Postres</option>
            </select>
          </div>
          <button type="submit" style={styles.btnPrimary}>Crear</button>
        </form>
      </div>

      {/* Table */}
      <div style={styles.card}>
        {loading ? (
          <p>Cargando...</p>
        ) : categories.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No hay categorías</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
            {/* <th style={styles.th}>ID</th> */}
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Sección</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  {editId === cat.id ? (
                    <>
                      <td style={styles.td}>{cat.id}</td>
                      <td style={styles.td}>
                        <input style={styles.input} value={editName} onChange={e => setEditName(e.target.value)} />
                      </td>
                      <td style={styles.td}>
                        <input style={{ ...styles.input, width: '200px' }} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                      </td>
                      <td style={styles.td}>
                        <select style={{ ...styles.input, minWidth: '140px' }} value={editSection} onChange={e => setEditSection(e.target.value)}>
                          <option value="">(Sin sección)</option>
                          <option value="pasteles">Pasteles</option>
                          <option value="postres">Postres</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <span style={{ display: 'flex', gap: '0.25rem' }}>
                          <button style={styles.btnPrimary} onClick={handleUpdate as any}>Guardar</button>
                          <button style={styles.btnSecondary} onClick={() => setEditId(null)}>Cancelar</button>
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>{cat.id}</td>
                      <td style={styles.td}>{cat.name}</td>
                      <td style={styles.td}>{cat.description || '—'}</td>
                      <td style={styles.td}>
                        {cat.section === 'pasteles' ? 'Pasteles' : cat.section === 'postres' ? 'Postres' : '—'}
                      </td>
                      <td style={styles.td}>
                        <span style={{ display: 'flex', gap: '0.25rem' }}>
                          <button style={{ ...styles.btnSmall, background: '#3E2412', color: '#fff' }} onClick={() => startEdit(cat)}>Editar</button>
                          {isAdmin && (
                            deleteConfirm === cat.id ? (
                              <>
                                <button style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }} onClick={() => handleDelete(cat.id)}>Confirmar</button>
                                <button style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }} onClick={() => setDeleteConfirm(null)}>No</button>
                              </>
                            ) : (
                              <button style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }} onClick={() => setDeleteConfirm(cat.id)}>Eliminar</button>
                            )
                          )}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Variant inline management
// ============================================================

function VariantSection({ product, isAdmin, onRefresh }: { product: Product; isAdmin: boolean; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [vName, setVName] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vSize, setVSize] = useState('');
  const [vFlavor, setVFlavor] = useState('');
  const [vImagePath, setVImagePath] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [editVId, setEditVId] = useState<number | null>(null);
  const [editVName, setEditVName] = useState('');
  const [editVPrice, setEditVPrice] = useState('');
  const [editVSize, setEditVSize] = useState('');
  const [editVFlavor, setEditVFlavor] = useState('');
  const [editVImagePath, setEditVImagePath] = useState('');
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState('');

  function VariantImageUpload({
    disabled,
    uploading,
    imageUrl,
    onFile,
    onClear,
    compact,
  }: {
    disabled: boolean;
    uploading: boolean;
    imageUrl: string;
    onFile: (file: File) => void;
    onClear: () => void;
    compact?: boolean;
  }) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const btnText = imageUrl ? 'Cambiar imagen' : 'Subir imagen';

    return (
      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            // Allow picking the same file again.
            e.currentTarget.value = '';
          }}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        <button
          type="button"
          style={{
            ...(compact ? styles.btnSmall : styles.btnPrimary),
            background: '#3E2412',
            color: '#fff',
          }}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {uploading ? 'Subiendo...' : btnText}
        </button>

        {imageUrl ? (
          <>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3E2412',
                textDecoration: 'underline',
                fontSize: compact ? '0.65rem' : '0.75rem',
              }}
            >
              Ver
            </a>
            <button
              type="button"
              style={{
                ...styles.btnSmall,
                background: '#6b7280',
                color: '#fff',
              }}
              onClick={onClear}
              disabled={disabled}
            >
              Quitar
            </button>
            <span style={{ fontSize: compact ? '0.65rem' : '0.75rem', color: '#16a34a' }}>✓ OK</span>
          </>
        ) : (
          <span style={{ fontSize: compact ? '0.65rem' : '0.75rem', color: '#6b7280' }}>Sin imagen</span>
        )}
      </div>
    );
  }

  async function handleImageUpload(file: File, isEdit: boolean = false) {
    const setUploading = isEdit ? setEditUploadingImage : setUploadingImage;
    const setImagePath = isEdit ? setEditVImagePath : setVImagePath;
    
    setUploading(true);
    setError('');
    try {
      const url = await uploadImageToCodeberg(file, 'images');
      setImagePath(url);
    } catch (err: any) {
      setError(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateVariant(e: SubmitEvent) {
    e.preventDefault();
    setError('');
    try {
      await createVariant(product.id, { 
        name: vName, 
        price: parseFloat(vPrice), 
        size: vSize || undefined,
        flavor: vFlavor || undefined,
        image_path: vImagePath || undefined
      });
      setVName('');
      setVPrice('');
      setVSize('');
      setVFlavor('');
      setVImagePath('');
      setShowForm(false);
      onRefresh();
    } catch (err: any) {
      setError(err?.detail || 'Error');
    }
  }

  async function handleUpdateVariant(e: SubmitEvent) {
    e.preventDefault();
    if (editVId === null) return;
    setError('');
    try {
      await updateVariant(product.id, editVId, { 
        name: editVName, 
        price: parseFloat(editVPrice),
        size: editVSize || undefined,
        flavor: editVFlavor || undefined,
        image_path: editVImagePath || undefined
      });
      setEditVId(null);
      onRefresh();
    } catch (err: any) {
      setError(err?.detail || 'Error');
    }
  }

  async function handleDeleteVariant(variantId: number) {
    setError('');
    try {
      await deleteVariant(product.id, variantId);
      setDeleteConfirm(null);
      onRefresh();
    } catch (err: any) {
      setError(err?.detail || 'Error');
      setDeleteConfirm(null);
    }
  }

  return (
    <div style={{ marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <strong style={{ fontSize: '0.8125rem' }}>Variantes ({product.variants.length})</strong>
        <button
          style={{ ...styles.btnSmall, background: '#3E2412', color: '#fff' }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Variante'}
        </button>
      </div>

      {error && <div style={{ ...styles.error, padding: '0.375rem', fontSize: '0.75rem' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreateVariant} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#fafafa', borderRadius: '4px' }}>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            <input style={{ ...styles.input, width: '120px' }} placeholder="Nombre" value={vName} onChange={e => setVName(e.target.value)} required />
            <input style={{ ...styles.input, width: '80px' }} placeholder="Precio" type="number" step="0.01" min="0.01" value={vPrice} onChange={e => setVPrice(e.target.value)} required />
            <input style={{ ...styles.input, width: '90px' }} placeholder="Tamaño" value={vSize} onChange={e => setVSize(e.target.value)} />
            <input style={{ ...styles.input, width: '90px' }} placeholder="Sabor" value={vFlavor} onChange={e => setVFlavor(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <VariantImageUpload
              disabled={uploadingImage}
              uploading={uploadingImage}
              imageUrl={vImagePath}
              onFile={(file) => handleImageUpload(file)}
              onClear={() => setVImagePath('')}
            />
          </div>
          <button type="submit" style={{ ...styles.btnSmall, background: '#16a34a', color: '#fff', alignSelf: 'flex-start' }} disabled={uploadingImage}>Crear</button>
        </form>
      )}

      {product.variants.length > 0 && (
        <table style={{ ...styles.table, fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Nombre</th>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Precio</th>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Tamaño</th>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Sabor</th>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Imagen</th>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map(v => (
              <tr key={v.id}>
                {editVId === v.id ? (
                  <>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <input style={{ ...styles.input, width: '100px' }} value={editVName} onChange={e => setEditVName(e.target.value)} />
                    </td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <input style={{ ...styles.input, width: '70px' }} type="number" step="0.01" value={editVPrice} onChange={e => setEditVPrice(e.target.value)} />
                    </td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <input style={{ ...styles.input, width: '70px' }} value={editVSize} onChange={e => setEditVSize(e.target.value)} placeholder="Tamaño" />
                    </td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <input style={{ ...styles.input, width: '70px' }} value={editVFlavor} onChange={e => setEditVFlavor(e.target.value)} placeholder="Sabor" />
                    </td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <VariantImageUpload
                        disabled={editUploadingImage}
                        uploading={editUploadingImage}
                        imageUrl={editVImagePath}
                        onFile={(file) => handleImageUpload(file, true)}
                        onClear={() => setEditVImagePath('')}
                        compact
                      />
                    </td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <span style={{ display: 'flex', gap: '0.25rem' }}>
                        <button style={{ ...styles.btnSmall, background: '#16a34a', color: '#fff' }} onClick={handleUpdateVariant as any} disabled={editUploadingImage}>Ok</button>
                        <button style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }} onClick={() => setEditVId(null)}>X</button>
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>{v.name}</td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>${v.price}</td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>{v.size || '—'}</td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>{v.flavor || '—'}</td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      {v.image_path ? (
                        <a href={v.image_path} target="_blank" rel="noopener noreferrer" style={{ color: '#3E2412', textDecoration: 'underline', fontSize: '0.75rem' }}>Ver</a>
                      ) : '—'}
                    </td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <span style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          style={{ ...styles.btnSmall, background: '#3E2412', color: '#fff' }}
                          onClick={() => { 
                            setEditVId(v.id); 
                            setEditVName(v.name); 
                            setEditVPrice(String(v.price)); 
                            setEditVSize(v.size || '');
                            setEditVFlavor(v.flavor || '');
                            setEditVImagePath(v.image_path || ''); 
                          }}
                        >Ed</button>
                        {isAdmin && (
                          deleteConfirm === v.id ? (
                            <>
                              <button style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }} onClick={() => handleDeleteVariant(v.id)}>Sí</button>
                              <button style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }} onClick={() => setDeleteConfirm(null)}>No</button>
                            </>
                          ) : (
                            <button style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }} onClick={() => setDeleteConfirm(v.id)}>Del</button>
                          )
                        )}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============================================================
// Products Tab
// ============================================================

function ProductsTab({ isAdmin }: { isAdmin: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [newCatId, setNewCatId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newActive, setNewActive] = useState(true);

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editCatId, setEditCatId] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Expanded product (to show variants)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([listProducts(false), listCategories()]);
      setProducts(prods);
      setCategories(cats);
      if (!newCatId && cats.length > 0) setNewCatId(String(cats[0].id));
    } catch (err: any) {
      setError(err?.detail || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function clearMessages() { setError(''); setSuccess(''); }

  function getCategoryName(catId: number) {
    return categories.find(c => c.id === catId)?.name || `ID ${catId}`;
  }

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();
    clearMessages();
    try {
      await createProduct({
        category_id: parseInt(newCatId),
        name: newName,
        description: newDesc || undefined,
        is_active: newActive,
      });
      setNewName('');
      setNewDesc('');
      setNewActive(true);
      setSuccess('Producto creado');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al crear producto');
    }
  }

  function startEdit(prod: Product) {
    setEditId(prod.id);
    setEditCatId(String(prod.category_id));
    setEditName(prod.name);
    setEditDesc(prod.description || '');
    setEditActive(prod.is_active);
    clearMessages();
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();
    if (editId === null) return;
    clearMessages();
    try {
      await updateProduct(editId, {
        category_id: parseInt(editCatId),
        name: editName,
        description: editDesc || undefined,
        is_active: editActive,
      });
      setEditId(null);
      setSuccess('Producto actualizado');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al actualizar producto');
    }
  }

  async function handleDelete(id: number) {
    clearMessages();
    try {
      await deleteProduct(id);
      setDeleteConfirm(null);
      setSuccess('Producto eliminado');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al eliminar producto');
      setDeleteConfirm(null);
    }
  }

  return (
    <div>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Create form */}
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Nuevo producto</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Categoría *</label>
            <select style={{ ...styles.input, minWidth: '120px' }} value={newCatId} onChange={e => setNewCatId(e.target.value)} required>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Nombre *</label>
            <input style={styles.input} value={newName} onChange={e => setNewName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Descripción</label>
            <input style={{ ...styles.input, width: '200px' }} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={newActive} onChange={e => setNewActive(e.target.checked)} />
              Activo
            </label>
          </div>
          <button type="submit" style={styles.btnPrimary}>Crear</button>
        </form>
      </div>

      {/* Table */}
      <div style={styles.card}>
        {loading ? (
          <p>Cargando...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No hay productos</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
            {/* <th style={styles.th}>ID</th> */}
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Activo</th>
                <th style={styles.th}>Var.</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <>
                  <tr key={prod.id}>
                    {editId === prod.id ? (
                      <>
                        <td style={styles.td}>{prod.id}</td>
                        <td style={styles.td}>
                          <input style={styles.input} value={editName} onChange={e => setEditName(e.target.value)} />
                        </td>
                        <td style={styles.td}>
                          <select style={styles.input} value={editCatId} onChange={e => setEditCatId(e.target.value)}>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.td}>
                          <input style={{ ...styles.input, width: '150px' }} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                        </td>
                        <td style={styles.td}>
                          <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)} />
                        </td>
                        <td style={styles.td}>{prod.variants.length}</td>
                        <td style={styles.td}>
                          <span style={{ display: 'flex', gap: '0.25rem' }}>
                            <button style={styles.btnPrimary} onClick={handleUpdate as any}>Guardar</button>
                            <button style={styles.btnSecondary} onClick={() => setEditId(null)}>Cancelar</button>
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={styles.td}>{prod.id}</td>
                        <td style={styles.td}>{prod.name}</td>
                        <td style={styles.td}>{getCategoryName(prod.category_id)}</td>
                        <td style={styles.td}>{prod.description || '—'}</td>
                        <td style={styles.td}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: prod.is_active ? '#16a34a' : '#dc2626',
                          }} />
                        </td>
                        <td style={styles.td}>
                          <button
                            style={{ ...styles.btnSmall, background: 'transparent', color: '#3E2412', textDecoration: 'underline', padding: 0 }}
                            onClick={() => setExpandedId(expandedId === prod.id ? null : prod.id)}
                          >
                            {prod.variants.length} var.
                          </button>
                        </td>
                        <td style={styles.td}>
                          <span style={{ display: 'flex', gap: '0.25rem' }}>
                            <button style={{ ...styles.btnSmall, background: '#3E2412', color: '#fff' }} onClick={() => startEdit(prod)}>Editar</button>
                            {isAdmin && (
                              deleteConfirm === prod.id ? (
                                <>
                                  <button style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }} onClick={() => handleDelete(prod.id)}>Confirmar</button>
                                  <button style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }} onClick={() => setDeleteConfirm(null)}>No</button>
                                </>
                              ) : (
                                <button style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }} onClick={() => setDeleteConfirm(prod.id)}>Eliminar</button>
                              )
                            )}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                  {expandedId === prod.id && (
                    <tr key={`${prod.id}-variants`}>
                      <td colSpan={8} style={{ padding: '0.5rem 0.75rem', background: '#fafafa' }}>
                        <VariantSection product={prod} isAdmin={isAdmin} onRefresh={load} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Orders Tab
// ============================================================

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: '#eab308',
  confirmado: '#3b82f6',
  preparando: '#a855f7',
  en_camino: '#6366f1',
  entregado: '#16a34a',
  cancelado: '#dc2626',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
};

// Valid next statuses for each status
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['preparando', 'cancelado'],
  preparando: ['en_camino', 'cancelado'],
  en_camino: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
};

function OrdersTab({ isAdmin }: { isAdmin: boolean }) {
  const [orders, setOrders] = useState<OrderPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | ''>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchAllOrders(
        filterStatus || undefined,
        filterPaymentStatus || undefined,
      );
      setOrders(data);
    } catch (err: any) {
      setError(err?.detail || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterStatus, filterPaymentStatus]);

  function clearMessages() { setError(''); setSuccess(''); }

  async function handleStatusChange(orderId: number, newStatus: OrderStatus) {
    clearMessages();
    try {
      await updateOrder(orderId, { status: newStatus });
      setSuccess(`Estado actualizado a "${ORDER_STATUS_LABELS[newStatus]}"`);
      // Optimistic update for faster UI feedback
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      // Keep the list consistent with server-side computations
      void load();
    } catch (err: any) {
      setError(err?.detail || 'Error al actualizar estado');
    }
  }

  async function handlePaymentStatusChange(orderId: number, newPaymentStatus: PaymentStatus) {
    clearMessages();
    try {
      await updateOrder(orderId, { payment_status: newPaymentStatus });
      setSuccess(`Estado de pago actualizado a "${PAYMENT_STATUS_LABELS[newPaymentStatus]}"`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o)));
      void load();
    } catch (err: any) {
      setError(err?.detail || 'Error al actualizar estado de pago');
    }
  }

  async function handleDelete(orderId: number) {
    clearMessages();
    try {
      await deleteOrderApi(orderId);
      setSuccess('Pedido eliminado');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al eliminar pedido');
    }
  }

  return (
    <div>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Filters */}
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrar por estado:</label>
          <select
            style={{ ...styles.input, minWidth: '150px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
          >
            <option value="">Todos</option>
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>

          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Pago:</label>
          <select
            style={{ ...styles.input, minWidth: '150px' }}
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value as PaymentStatus | '')}
          >
            <option value="">Todos</option>
            {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => (
              <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
            ))}
          </select>

          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </span>
          <button style={styles.btnSecondary} onClick={() => { clearMessages(); load(); }}>
            Recargar
          </button>
        </div>
      </div>

      {/* Orders list */}
      <div style={styles.card}>
        {loading ? (
          <p>Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No hay pedidos</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ticket</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Pago</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr key={order.id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          style={{
                            ...styles.btnSmall,
                            background: 'transparent',
                            color: '#3E2412',
                            textDecoration: 'underline',
                            padding: 0,
                            fontSize: '0.875rem',
                          }}
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        >
                          {order.ticket_number}
                        </button>
                        <button
                          type="button"
                          style={{ ...styles.btnSmall, background: '#e5e7eb', color: '#374151' }}
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        >
                          {expandedId === order.id ? 'Ocultar' : 'Detalles'}
                        </button>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.client_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.phone}</div>
                      </div>
                    </td>
                    <td style={styles.td}>${Number(order.total).toLocaleString('es-MX')}</td>
                    <td style={styles.td}>
                      <select
                        style={{ ...styles.input, fontSize: '0.8125rem', minWidth: '160px' }}
                        value={order.status}
                        onChange={(e) => {
                          const next = e.target.value as OrderStatus;
                          if (next === order.status) return;

                          if (next === 'cancelado') {
                            const msg = order.payment_status === 'pagado'
                              ? `Este pedido está marcado como PAGADO. ¿Seguro que quieres CANCELARLO?\n\nTicket: ${order.ticket_number}`
                              : `¿Seguro que quieres cancelar este pedido?\n\nTicket: ${order.ticket_number}`;
                            if (!window.confirm(msg)) return;
                          }

                          handleStatusChange(order.id, next);
                        }}
                      >
                        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <select
                        style={{ ...styles.input, fontSize: '0.8125rem', minWidth: '140px' }}
                        value={order.payment_status}
                        onChange={(e) => {
                          const next = e.target.value as PaymentStatus;
                          if (next === order.payment_status) return;
                          if (next === 'pendiente') {
                            if (!window.confirm(`¿Seguro que quieres marcar como PENDIENTE este pago?\n\nTicket: ${order.ticket_number}`)) return;
                          }
                          handlePaymentStatusChange(order.id, next);
                        }}
                      >
                        {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => (
                          <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {isAdmin && (
                          <button
                            type="button"
                            style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }}
                            onClick={() => {
                              if (!window.confirm(`Eliminar este pedido NO se puede deshacer.\n\nTicket: ${order.ticket_number}\nCliente: ${order.client_name}`)) return;
                              handleDelete(order.id);
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-details`}>
                      <td colSpan={6} style={{ padding: '0.75rem', background: '#fafafa' }}>
                        <div style={{ paddingLeft: '1rem', borderLeft: '2px solid #e5e7eb' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                            <div>
                              <strong>Entrega:</strong>{' '}
                              {order.delivery_address && order.delivery_address !== 'Recoger en tienda'
                                ? order.delivery_address
                                : 'Recoger en tienda'}
                            </div>
                            <div>
                              <strong>Metodo de pago:</strong> {PAYMENT_METHOD_LABELS[order.payment_method]}
                            </div>
                            {order.notes && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <strong>Notas:</strong> {order.notes}
                              </div>
                            )}
                          </div>
                          <table style={{ ...styles.table, fontSize: '0.8125rem' }}>
                            <thead>
                              <tr>
                                <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Producto</th>
                                <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Cantidad</th>
                                <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Precio unit.</th>
                                <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.details.map((d) => (
                                <tr key={d.id}>
                                  <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>{d.variant_name}</td>
                                  <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>{d.quantity}</td>
                                  <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>${Number(d.unit_price).toLocaleString('es-MX')}</td>
                                  <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>${Number(d.subtotal).toLocaleString('es-MX')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Solicitudes Tab (Custom Cake Requests)
// ============================================================

const REQUEST_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: '#eab308' },
  cotizado: { label: 'Cotizado', color: '#3b82f6' },
  aceptado: { label: 'Aceptado', color: '#22c55e' },
  en_proceso: { label: 'En Proceso', color: '#a855f7' },
  completado: { label: 'Completado', color: '#16a34a' },
  cancelado: { label: 'Cancelado', color: '#dc2626' },
};

function SolicitudesTab({ isAdmin }: { isAdmin: boolean }) {
  const [requests, setRequests] = useState<CustomCakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await listCustomCakeRequests(filterStatus || undefined);
      setRequests(data);
    } catch (err: any) {
      setError(err?.detail || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterStatus]);

  function clearMessages() { setError(''); setSuccess(''); }

  function startEdit(req: CustomCakeRequest) {
    setEditingId(req.id);
    setEditStatus(req.status);
    setEditPrice(req.quoted_price?.toString() || '');
    setEditNotes(req.admin_notes || '');
    clearMessages();
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();
    if (editingId === null) return;
    clearMessages();
    try {
      await updateCustomCakeRequest(editingId, {
        status: editStatus,
        quoted_price: editPrice ? parseFloat(editPrice) : undefined,
        admin_notes: editNotes || undefined,
      });
      setEditingId(null);
      setSuccess('Solicitud actualizada');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al actualizar');
    }
  }

  async function handleDelete(requestId: number) {
    clearMessages();
    try {
      await deleteCustomCakeRequest(requestId);
      setDeleteConfirm(null);
      setSuccess('Solicitud eliminada');
      await load();
    } catch (err: any) {
      setError(err?.detail || 'Error al eliminar solicitud');
      setDeleteConfirm(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Filter */}
      <div style={{ ...styles.card, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrar por estado:</label>
          <select
            style={{ ...styles.input, minWidth: '150px' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="cotizado">Cotizado</option>
            <option value="aceptado">Aceptado</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p>Cargando...</p>
      ) : requests.length === 0 ? (
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No hay solicitudes</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => {
            const statusInfo = REQUEST_STATUS_LABELS[req.status] || { label: req.status, color: '#6b7280' };
            const isExpanded = expandedId === req.id;
            const isEditing = editingId === req.id;

            return (
              <div key={req.id} style={styles.card}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{req.client_name}</span>
                    <span
                      style={{
                        marginLeft: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#fff',
                        background: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>
                    <div>Solicitud #{req.id}</div>
                    <div>{formatDateTime(req.created_at)}</div>
                  </div>
                </div>

                {/* Summary row */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#374151' }}>
                  <div><strong>Tamaño:</strong> {req.cake_size}</div>
                  <div><strong>Pisos:</strong> {req.cake_layers}</div>
                  <div><strong>Sabor:</strong> {req.cake_flavor}</div>
                  <div><strong>Entrega:</strong> {formatDate(req.delivery_date)}{req.delivery_time ? ` a las ${req.delivery_time}` : ''}</div>
                  {req.quoted_price && (
                    <div><strong>Cotización:</strong> ${Number(req.quoted_price).toLocaleString('es-MX')}</div>
                  )}
                </div>

                {/* Toggle expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  style={{ ...styles.btnSmall, marginTop: '0.5rem', background: '#e5e7eb', color: '#374151' }}
                >
                  {isExpanded ? '▲ Menos detalles' : '▼ Más detalles'}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <strong>Contacto:</strong><br />
                        {req.client_email}<br />
                        {req.client_phone}
                      </div>
                      {req.filling && (
                        <div><strong>Relleno:</strong> {req.filling}</div>
                      )}
                      {req.topping && (
                        <div><strong>Cobertura:</strong> {req.topping}</div>
                      )}
                      {req.custom_text && (
                        <div><strong>Texto:</strong> {req.custom_text}</div>
                      )}
                      {req.additional_notes && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <strong>Notas del cliente:</strong><br />
                          {req.additional_notes}
                        </div>
                      )}
                      {req.admin_notes && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <strong>Notas internas:</strong><br />
                          {req.admin_notes}
                        </div>
                      )}
                    </div>

                    {/* Reference images */}
                    {req.reference_images && req.reference_images.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong style={{ fontSize: '0.875rem' }}>Imágenes de referencia:</strong>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {req.reference_images.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt={`Referencia ${idx + 1}`}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Edit form */}
                    {isEditing ? (
                      <form onSubmit={handleUpdate} style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Estado</label>
                            <select style={styles.input} value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                              <option value="pendiente">Pendiente</option>
                              <option value="cotizado">Cotizado</option>
                              <option value="aceptado">Aceptado</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="completado">Completado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Cotización ($)</label>
                            <input
                              style={{ ...styles.input, width: '120px' }}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.125rem' }}>Notas internas</label>
                            <input
                              style={{ ...styles.input, width: '100%' }}
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              placeholder="Notas para el equipo..."
                            />
                          </div>
                          <button type="submit" style={{ ...styles.btnSmall, background: '#16a34a', color: '#fff' }}>Guardar</button>
                          <button type="button" onClick={() => setEditingId(null)} style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }}>Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => startEdit(req)}
                          style={{ ...styles.btnSmall, background: '#3b82f6', color: '#fff' }}
                        >
                          Editar
                        </button>
                        <a
                          href={`https://wa.me/${req.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${req.client_name}, gracias por tu solicitud de pastel personalizado. `)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...styles.btnSmall, background: '#25d366', color: '#fff', textDecoration: 'none' }}
                        >
                          WhatsApp
                        </a>

                        {/* Delete (admin only) */}
                        {isAdmin && (
                          deleteConfirm === req.id ? (
                            <>
                              <button
                                style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }}
                                onClick={() => handleDelete(req.id)}
                              >
                                Confirmar
                              </button>
                              <button
                                style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }}
                                onClick={() => setDeleteConfirm(null)}
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <button
                              style={{ ...styles.btnSmall, background: '#dc2626', color: '#fff' }}
                              onClick={() => setDeleteConfirm(req.id)}
                            >
                              Eliminar
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Reportes Tab
// ============================================================

const SUMMARY_CARDS: { key: keyof ReportSummary; label: string; color: string; isMoney: boolean }[] = [
  { key: 'totalRevenue', label: 'Ingresos Totales', color: '#16a34a', isMoney: true },
  { key: 'totalOrders', label: 'Total Pedidos', color: '#3b82f6', isMoney: false },
  { key: 'averageTicket', label: 'Ticket Promedio', color: '#a855f7', isMoney: true },
  { key: 'deliveredOrders', label: 'Entregados', color: '#16a34a', isMoney: false },
  { key: 'cancelledOrders', label: 'Cancelados', color: '#dc2626', isMoney: false },
  { key: 'pendingOrders', label: 'En Proceso', color: '#eab308', isMoney: false },
];

function ReportesTab() {
  const [allOrders, setAllOrders] = useState<OrderPublic[]>([]);
  const [allCustomCompleted, setAllCustomCompleted] = useState<CustomCakeRequest[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderPublic[]>([]);
  const [filteredCustomCompleted, setFilteredCustomCompleted] = useState<CustomCakeSaleRow[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dateFrom, setDateFrom] = useState(startOfWeek());
  const [dateTo, setDateTo] = useState(today());
  const [quickFilter, setQuickFilter] = useState<'week' | 'month' | 'custom'>('week');

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');
      const [ordersRes, customRes] = await Promise.allSettled([
        fetchAllOrders(),
        listCustomCakeRequests('completado'),
      ]);

      if (ordersRes.status === 'fulfilled') {
        setAllOrders(ordersRes.value);
      } else {
        throw ordersRes.reason;
      }

      if (customRes.status === 'fulfilled') {
        setAllCustomCompleted(customRes.value);
      } else {
        // Keep reports usable even if custom cakes fail.
        setAllCustomCompleted([]);
      }
    } catch (err: any) {
      setError(err?.detail || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  // Re-filter whenever allOrders or date range changes
  useEffect(() => {
    const filtered = filterOrdersByDate(allOrders, dateFrom, dateTo);
    setFilteredOrders(filtered);

    // Custom cakes: count as revenue/orders only when completed AND has quoted_price.
    const fromTs = new Date(dateFrom + 'T00:00:00').getTime();
    const toTs = new Date(dateTo + 'T23:59:59').getTime();
    const customRows: CustomCakeSaleRow[] = allCustomCompleted
      .filter((r) => r.quoted_price != null)
      .filter((r) => {
        const ts = new Date(r.updated_at).getTime();
        return ts >= fromTs && ts <= toTs;
      })
      .map((r) => ({
        id: r.id,
        client_name: r.client_name,
        client_phone: r.client_phone,
        updated_at: r.updated_at,
        quoted_price: Number(r.quoted_price),
      }));
    setFilteredCustomCompleted(customRows);

    const base = computeSummary(filtered);

    const customRevenue = customRows.reduce((sum, r) => sum + Number(r.quoted_price), 0);
    const customCount = customRows.length;
    const nonCancelledOrders = filtered.filter((o) => o.status !== 'cancelado');
    const nonCancelledRevenue = nonCancelledOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const nonCancelledCount = nonCancelledOrders.length + customCount;

    const merged: ReportSummary = {
      ...base,
      totalRevenue: base.totalRevenue + customRevenue,
      totalOrders: base.totalOrders + customCount,
      deliveredOrders: base.deliveredOrders + customCount,
      averageTicket: nonCancelledCount > 0 ? (nonCancelledRevenue + customRevenue) / nonCancelledCount : 0,
    };

    setSummary(merged);
  }, [allOrders, allCustomCompleted, dateFrom, dateTo]);

  function handleQuickFilter(type: 'week' | 'month' | 'custom') {
    setQuickFilter(type);
    if (type === 'week') {
      setDateFrom(startOfWeek());
      setDateTo(today());
    } else if (type === 'month') {
      setDateFrom(startOfMonth());
      setDateTo(today());
    }
    // 'custom' leaves the inputs for the user to set
  }

  function handleDownloadPDF() {
    if (!summary) return;
    generateReportPDF(filteredOrders, summary, dateFrom, dateTo, filteredCustomCompleted);
  }

  function fmtMoney(n: number): string {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div>
      {error && <div style={styles.error}>{error}</div>}

      {/* Date filters */}
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Periodo:</label>
          <button
            style={quickFilter === 'week'
              ? styles.btnPrimary
              : styles.btnSecondary}
            onClick={() => handleQuickFilter('week')}
          >
            Esta semana
          </button>
          <button
            style={quickFilter === 'month'
              ? styles.btnPrimary
              : styles.btnSecondary}
            onClick={() => handleQuickFilter('month')}
          >
            Este mes
          </button>
          <button
            style={quickFilter === 'custom'
              ? styles.btnPrimary
              : styles.btnSecondary}
            onClick={() => handleQuickFilter('custom')}
          >
            Personalizado
          </button>

          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem' }}>Desde:</label>
            <input
              type="date"
              style={styles.input}
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setQuickFilter('custom'); }}
            />
            <label style={{ fontSize: '0.75rem' }}>Hasta:</label>
            <input
              type="date"
              style={styles.input}
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setQuickFilter('custom'); }}
            />
          </div>

          <button
            style={{ ...styles.btnPrimary, marginLeft: 'auto' }}
            onClick={handleDownloadPDF}
            disabled={!summary || (filteredOrders.length === 0 && filteredCustomCompleted.length === 0)}
          >
            Descargar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: '1rem' }}>Cargando...</p>
      ) : (
        <>
          {/* Summary cards */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              {SUMMARY_CARDS.map((card) => (
                <div
                  key={card.key}
                  style={{
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '1rem',
                    borderLeft: `4px solid ${card.color}`,
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{card.label}</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#374151' }}>
                    {card.isMoney ? fmtMoney(summary[card.key] as number) : String(summary[card.key])}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders table */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>
              Detalle de pedidos ({filteredOrders.length})
            </h3>
            {filteredOrders.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No hay pedidos en este periodo</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Ticket</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Telefono</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Metodo Pago</th>
                    <th style={styles.th}>Pago</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={styles.td}>{order.ticket_number}</td>
                      <td style={styles.td}>{order.client_name}</td>
                      <td style={styles.td}>{order.phone}</td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#fff',
                          background: ORDER_STATUS_COLORS[order.status],
                        }}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td style={styles.td}>{PAYMENT_METHOD_LABELS[order.payment_method]}</td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#fff',
                          background: order.payment_status === 'pagado' ? '#16a34a' : '#eab308',
                        }}>
                          {PAYMENT_STATUS_LABELS[order.payment_status]}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{fmtMoney(Number(order.total))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                      Total del periodo:
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                      {fmtMoney(filteredOrders.reduce((sum, o) => sum + Number(o.total), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Custom cakes table */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>
              Solicitudes personalizadas completadas ({filteredCustomCompleted.length})
            </h3>
            {filteredCustomCompleted.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No hay solicitudes completadas en este periodo</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Solicitud</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Telefono</th>
                    <th style={styles.th}>Completado</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomCompleted.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>#{r.id}</td>
                      <td style={styles.td}>{r.client_name}</td>
                      <td style={styles.td}>{r.client_phone}</td>
                      <td style={styles.td}>{r.updated_at.slice(0, 10)}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{fmtMoney(Number(r.quoted_price))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ ...styles.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                      Total del periodo:
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                      {fmtMoney(filteredCustomCompleted.reduce((sum, r) => sum + Number(r.quoted_price), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// Main Admin Page
// ============================================================

export function AdminPage() {
  const { user, isAuthenticated, loading, logout, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'orders' | 'solicitudes' | 'reportes'>('categories');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Admin — Pastelería Rouse</span>
          <span style={{ marginLeft: '1rem', fontSize: '0.8125rem', opacity: 0.8 }}>
            {user?.username} ({user?.role})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ ...styles.btnSecondary, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Ir al sitio
          </button>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            style={{ ...styles.btnSecondary, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={styles.tab(activeTab === 'categories')} onClick={() => setActiveTab('categories')}>
            Categorías
          </button>
          <button style={styles.tab(activeTab === 'products')} onClick={() => setActiveTab('products')}>
            Productos
          </button>
          <button style={styles.tab(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>
            Pedidos
          </button>
          <button style={styles.tab(activeTab === 'solicitudes')} onClick={() => setActiveTab('solicitudes')}>
            Solicitudes
          </button>
          <button style={styles.tab(activeTab === 'reportes')} onClick={() => setActiveTab('reportes')}>
            Reportes
          </button>
        </div>

        {activeTab === 'categories' && <CategoriesTab isAdmin={isAdmin} />}
        {activeTab === 'products' && <ProductsTab isAdmin={isAdmin} />}
        {activeTab === 'orders' && <OrdersTab isAdmin={isAdmin} />}
        {activeTab === 'solicitudes' && <SolicitudesTab isAdmin={isAdmin} />}
        {activeTab === 'reportes' && <ReportesTab />}
      </div>
    </div>
  );
}
