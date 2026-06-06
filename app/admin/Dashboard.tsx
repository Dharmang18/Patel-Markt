'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ClipboardList, LogOut, Plus, Save, Trash2, Loader2, RefreshCw, Database, Search, Upload, ImageIcon } from 'lucide-react';
import { categories as staticCategories } from '@/lib/products';
import type { ProductRow } from '@/lib/catalog';

interface OrderItem { name: string; unit: string; quantity: number; price: number; }
interface OrderRow {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  created_at: string;
}

const emptyProduct: ProductRow = {
  id: '', name: '', name_de: '', description: '', description_de: '',
  price: 0, unit: '', category: staticCategories[0], image: '',
  in_stock: true, stock_qty: 0, featured: false, brand: '',
};

function formatPrice(n: number) {
  return Number(n).toFixed(2).replace('.', ',') + ' €';
}

function Thumb({ src, size = 44 }: { src: string; size?: number }) {
  if (!src) {
    return (
      <div style={{ width: size, height: size }} className="rounded bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
        <ImageIcon className="w-5 h-5" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" style={{ width: size, height: size }} className="rounded object-contain bg-white border border-gray-100 flex-shrink-0" />;
}

export default function AdminDashboard({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState<ProductRow>(emptyProduct);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);

  // filters
  const [pSearch, setPSearch] = useState('');
  const [pCat, setPCat] = useState('');
  const [oName, setOName] = useState('');
  const [oCity, setOCity] = useState('');
  const [oDate, setODate] = useState('');

  const addFileRef = useRef<HTMLInputElement>(null);
  const rowFileRef = useRef<HTMLInputElement>(null);
  const rowUploadId = useRef<string>('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally { setLoading(false); }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    if (tab === 'products') loadProducts(); else loadOrders();
  }, [tab, supabaseConfigured, loadProducts, loadOrders]);

  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(''), 2500); };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (!res.ok) { flash('Image upload failed'); return null; }
    const d = await res.json(); return d.url as string;
  };

  const saveProduct = async (row: ProductRow) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row),
    });
    if (res.ok) { flash('Saved'); loadProducts(); } else flash('Save failed');
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(`Delete product ${id}?`)) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) { flash('Deleted'); loadProducts(); } else flash('Delete failed');
  };

  const addProduct = async () => {
    if (!draft.id || !draft.name) { flash('id and name are required'); return; }
    await saveProduct(draft);
    setDraft(emptyProduct); setShowAdd(false);
  };

  const seed = async () => {
    if (!confirm('Import the built-in catalogue into the database?')) return;
    setLoading(true);
    const res = await fetch('/api/admin/seed', { method: 'POST' });
    setLoading(false);
    if (res.ok) { const d = await res.json(); flash(`Imported ${d.count} products`); loadProducts(); }
    else flash('Import failed');
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login'); router.refresh();
  };

  const updateLocal = (id: string, patch: Partial<ProductRow>) =>
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // file handlers
  const onAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true); const url = await uploadImage(f); setUploading(false);
    if (url) setDraft((d) => ({ ...d, image: url }));
    e.target.value = '';
  };
  const onRowFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; const id = rowUploadId.current; if (!f || !id) return;
    setUploading(true); const url = await uploadImage(f); setUploading(false);
    if (url) {
      updateLocal(id, { image: url });
      const row = products.find((p) => p.id === id);
      if (row) await saveProduct({ ...row, image: url });
    }
    e.target.value = '';
  };
  const triggerRowUpload = (id: string) => { rowUploadId.current = id; rowFileRef.current?.click(); };

  const catList = useMemo(() => {
    const set = new Set<string>(staticCategories as unknown as string[]);
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = pSearch.trim().toLowerCase();
    return products.filter((p) =>
      (!pCat || p.category === pCat) &&
      (!q || p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    );
  }, [products, pSearch, pCat]);

  const filteredOrders = useMemo(() => {
    const n = oName.trim().toLowerCase(), c = oCity.trim().toLowerCase();
    return orders.filter((o) =>
      (!n || o.customer_name.toLowerCase().includes(n) || (o.phone || '').includes(n)) &&
      (!c || (o.address || '').toLowerCase().includes(c)) &&
      (!oDate || (o.created_at || '').slice(0, 10) === oDate)
    );
  }, [orders, oName, oCity, oDate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-900">Patel Markt — Admin</h1>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* hidden file inputs */}
      <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={onAddFile} />
      <input ref={rowFileRef} type="file" accept="image/*" className="hidden" onChange={onRowFile} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!supabaseConfigured && (
          <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
            Supabase is not configured. Add the env vars and run <code>supabase/schema.sql</code> to enable management.
          </div>
        )}

        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setTab('products')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'products' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <Package className="w-4 h-4" /> Products
          </button>
          <button onClick={() => setTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'orders' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <ClipboardList className="w-4 h-4" /> Orders
          </button>
          <div className="flex-1" />
          {uploading && <span className="text-sm text-gray-500 flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> uploading…</span>}
          {message && <span className="text-sm text-green-600 font-medium">{message}</span>}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        {tab === 'products' && supabaseConfigured && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Add product
              </button>
              <button onClick={loadProducts} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold px-3 py-2 rounded-lg">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={seed} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold px-3 py-2 rounded-lg">
                <Database className="w-4 h-4" /> Import catalogue
              </button>
            </div>

            {/* search + category filter */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={pSearch} onChange={(e) => setPSearch(e.target.value)} placeholder="Search by name, brand, id…"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm" />
              </div>
              <select value={pCat} onChange={(e) => setPCat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">All categories</option>
                {catList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-sm text-gray-400 self-center">{filteredProducts.length} shown</span>
            </div>

            {showAdd && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {([
                  ['id', 'ID (unique)'], ['name', 'Name (EN)'], ['name_de', 'Name (DE)'],
                  ['brand', 'Brand'], ['unit', 'Unit (e.g. 500g)'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="text-xs text-gray-500">{label}
                    <input value={(draft[key] as string) ?? ''} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" />
                  </label>
                ))}
                <label className="text-xs text-gray-500">Category
                  <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800">
                    {catList.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-500">Price (€)
                  <input type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" />
                </label>
                <label className="text-xs text-gray-500">Stock qty
                  <input type="number" value={draft.stock_qty} onChange={(e) => setDraft({ ...draft, stock_qty: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" />
                </label>
                {/* image upload */}
                <div className="text-xs text-gray-500 col-span-2 md:col-span-3">
                  Image
                  <div className="mt-1 flex items-center gap-3">
                    <Thumb src={draft.image} size={56} />
                    <button type="button" onClick={() => addFileRef.current?.click()}
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2 rounded-lg">
                      <Upload className="w-4 h-4" /> Upload image
                    </button>
                    <input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="…or paste image URL"
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={draft.in_stock} onChange={(e) => setDraft({ ...draft, in_stock: e.target.checked })} /> In stock
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} /> Featured
                  </label>
                  <button onClick={addProduct} className="ml-auto flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                    <Save className="w-4 h-4" /> Save product
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-3 py-2">Image</th>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-left px-3 py-2">Price (€)</th>
                    <th className="text-left px-3 py-2">Stock</th>
                    <th className="text-left px-3 py-2">In stock</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice(0, 400).map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 align-top">
                      <td className="px-3 py-2">
                        <button onClick={() => triggerRowUpload(p.id)} title="Replace image" className="block">
                          <Thumb src={p.image} />
                        </button>
                      </td>
                      <td className="px-3 py-2 min-w-[220px]">
                        <input value={p.name} onChange={(e) => updateLocal(p.id, { name: e.target.value })}
                          className="w-full font-medium text-gray-800 border border-transparent hover:border-gray-200 focus:border-gray-300 rounded px-1 py-0.5" />
                        <div className="text-xs text-gray-400 px-1">{p.id} · {p.brand}</div>
                      </td>
                      <td className="px-3 py-2">
                        <select value={p.category} onChange={(e) => updateLocal(p.id, { category: e.target.value })}
                          className="border border-gray-200 rounded px-1 py-1 text-xs bg-white max-w-[120px]">
                          {catList.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" value={p.price} onChange={(e) => updateLocal(p.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-20 border border-gray-200 rounded px-2 py-1" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={p.stock_qty} onChange={(e) => updateLocal(p.id, { stock_qty: parseInt(e.target.value) || 0 })}
                          className="w-16 border border-gray-200 rounded px-2 py-1" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={p.in_stock} onChange={(e) => updateLocal(p.id, { in_stock: e.target.checked })} />
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button onClick={() => saveProduct(p)} className="text-green-600 hover:text-green-700 p-1" title="Save"><Save className="w-4 h-4" /></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && !loading && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No matching products.</td></tr>
                  )}
                </tbody>
              </table>
              {filteredProducts.length > 400 && (
                <div className="px-4 py-2 text-xs text-gray-400 border-t">Showing first 400 of {filteredProducts.length}. Use search/filter to narrow down.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'orders' && supabaseConfigured && (
          <div className="space-y-4">
            {/* order filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={oName} onChange={(e) => setOName(e.target.value)} placeholder="Search name / phone…"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm" />
              </div>
              <input value={oCity} onChange={(e) => setOCity(e.target.value)} placeholder="City / address…"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[150px]" />
              <input type="date" value={oDate} onChange={(e) => setODate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
              {(oName || oCity || oDate) && (
                <button onClick={() => { setOName(''); setOCity(''); setODate(''); }} className="text-sm text-gray-500 underline self-center">clear</button>
              )}
              <span className="text-sm text-gray-400 self-center">{filteredOrders.length} shown</span>
            </div>

            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">{o.customer_name}</span>
                    <span className="text-gray-400 text-sm"> · {o.phone}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatPrice(o.total)}</div>
                    <div className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString('de-DE')}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{o.address}</p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  {o.items.map((it, i) => (
                    <li key={i}>{it.name} ({it.unit}) × {it.quantity} — {formatPrice(it.price * it.quantity)}</li>
                  ))}
                </ul>
              </div>
            ))}
            {filteredOrders.length === 0 && !loading && (
              <p className="text-center text-gray-400 py-8">No matching orders.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
