'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ClipboardList, LogOut, Plus, Save, Trash2, Loader2, RefreshCw, Database } from 'lucide-react';
import { categories } from '@/lib/products';
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
  price: 0, unit: '', category: categories[0], image: '',
  in_stock: true, stock_qty: 0, featured: false, brand: '',
};

function formatPrice(n: number) {
  return Number(n).toFixed(2).replace('.', ',') + ' €';
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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    if (tab === 'products') loadProducts();
    else loadOrders();
  }, [tab, supabaseConfigured, loadProducts, loadOrders]);

  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(''), 2500); };

  const saveProduct = async (row: ProductRow) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    if (res.ok) { flash('Saved'); loadProducts(); }
    else flash('Save failed');
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(`Delete product ${id}?`)) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) { flash('Deleted'); loadProducts(); }
    else flash('Delete failed');
  };

  const addProduct = async () => {
    if (!draft.id || !draft.name) { flash('id and name are required'); return; }
    await saveProduct(draft);
    setDraft(emptyProduct);
    setShowAdd(false);
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
    router.push('/admin/login');
    router.refresh();
  };

  const updateLocal = (id: string, patch: Partial<ProductRow>) =>
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-900">Patel Markt — Admin</h1>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!supabaseConfigured && (
          <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
            Supabase is not configured. Add the <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> env vars and run <code>supabase/schema.sql</code> to enable product & order management.
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'products' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <Package className="w-4 h-4" /> Products
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'orders' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <ClipboardList className="w-4 h-4" /> Orders
          </button>
          <div className="flex-1" />
          {message && <span className="text-sm text-green-600 font-medium">{message}</span>}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        {tab === 'products' && supabaseConfigured && (
          <div className="space-y-4">
            <div className="flex gap-2">
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

            {showAdd && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {([
                  ['id', 'ID (unique)'], ['name', 'Name (EN)'], ['name_de', 'Name (DE)'],
                  ['brand', 'Brand'], ['unit', 'Unit (e.g. 500g)'], ['image', 'Image URL/path'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="text-xs text-gray-500">
                    {label}
                    <input
                      value={(draft[key] as string) ?? ''}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800"
                    />
                  </label>
                ))}
                <label className="text-xs text-gray-500">Category
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-500">Price (€)
                  <input type="number" step="0.01" value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" />
                </label>
                <label className="text-xs text-gray-500">Stock qty
                  <input type="number" value={draft.stock_qty}
                    onChange={(e) => setDraft({ ...draft, stock_qty: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" />
                </label>
                <label className="text-xs text-gray-500 col-span-2 md:col-span-3">Description (EN)
                  <textarea value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800" rows={2} />
                </label>
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
                    <th className="text-left px-4 py-2">Product</th>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-left px-4 py-2">Price (€)</th>
                    <th className="text-left px-4 py-2">Stock</th>
                    <th className="text-left px-4 py-2">In stock</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.id} · {p.brand}</div>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{p.category}</td>
                      <td className="px-4 py-2">
                        <input type="number" step="0.01" value={p.price}
                          onChange={(e) => updateLocal(p.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-20 border border-gray-200 rounded px-2 py-1" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={p.stock_qty}
                          onChange={(e) => updateLocal(p.id, { stock_qty: parseInt(e.target.value) || 0 })}
                          className="w-20 border border-gray-200 rounded px-2 py-1" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="checkbox" checked={p.in_stock}
                          onChange={(e) => updateLocal(p.id, { in_stock: e.target.checked })} />
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button onClick={() => saveProduct(p)} className="text-green-600 hover:text-green-700 p-1" title="Save">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && !loading && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet. Use “Import catalogue” to load the built-in list.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && supabaseConfigured && (
          <div className="space-y-3">
            {orders.map((o) => (
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
            {orders.length === 0 && !loading && (
              <p className="text-center text-gray-400 py-8">No orders yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
