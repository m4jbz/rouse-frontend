import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '@/context/AdminContext';
import {
  type Category,
  type Product,
  type Variant,
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
} from '@/services/admin';

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

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    try {
      await createCategory({ name: newName, description: newDesc || undefined });
      setNewName('');
      setNewDesc('');
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
    clearMessages();
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (editId === null) return;
    clearMessages();
    try {
      await updateCategory(editId, { name: editName, description: editDesc || undefined });
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
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Descripción</th>
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
  const [editVId, setEditVId] = useState<number | null>(null);
  const [editVName, setEditVName] = useState('');
  const [editVPrice, setEditVPrice] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function handleCreateVariant(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createVariant(product.id, { name: vName, price: parseFloat(vPrice) });
      setVName('');
      setVPrice('');
      setShowForm(false);
      onRefresh();
    } catch (err: any) {
      setError(err?.detail || 'Error');
    }
  }

  async function handleUpdateVariant(e: FormEvent) {
    e.preventDefault();
    if (editVId === null) return;
    setError('');
    try {
      await updateVariant(product.id, editVId, { name: editVName, price: parseFloat(editVPrice) });
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
        <form onSubmit={handleCreateVariant} style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem', alignItems: 'flex-end' }}>
          <input style={{ ...styles.input, width: '120px' }} placeholder="Nombre" value={vName} onChange={e => setVName(e.target.value)} required />
          <input style={{ ...styles.input, width: '80px' }} placeholder="Precio" type="number" step="0.01" min="0.01" value={vPrice} onChange={e => setVPrice(e.target.value)} required />
          <button type="submit" style={{ ...styles.btnSmall, background: '#16a34a', color: '#fff' }}>Crear</button>
        </form>
      )}

      {product.variants.length > 0 && (
        <table style={{ ...styles.table, fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Nombre</th>
              <th style={{ ...styles.th, padding: '0.25rem 0.5rem' }}>Precio</th>
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
                      <span style={{ display: 'flex', gap: '0.25rem' }}>
                        <button style={{ ...styles.btnSmall, background: '#16a34a', color: '#fff' }} onClick={handleUpdateVariant as any}>Ok</button>
                        <button style={{ ...styles.btnSmall, background: '#6b7280', color: '#fff' }} onClick={() => setEditVId(null)}>X</button>
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>{v.name}</td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>${v.price}</td>
                    <td style={{ ...styles.td, padding: '0.25rem 0.5rem' }}>
                      <span style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          style={{ ...styles.btnSmall, background: '#3E2412', color: '#fff' }}
                          onClick={() => { setEditVId(v.id); setEditVName(v.name); setEditVPrice(String(v.price)); }}
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

  async function handleCreate(e: FormEvent) {
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

  async function handleUpdate(e: FormEvent) {
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
                <th style={styles.th}>ID</th>
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
                      <td colSpan={7} style={{ padding: '0.5rem 0.75rem', background: '#fafafa' }}>
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
// Main Admin Page
// ============================================================

export function AdminPage() {
  const { user, isAuthenticated, loading, logout, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');

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
        </div>

        {activeTab === 'categories' && <CategoriesTab isAdmin={isAdmin} />}
        {activeTab === 'products' && <ProductsTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
