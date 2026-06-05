import { products as staticProducts, Product, Category } from './products';
import { isSupabaseConfigured } from './supabase/config';
import { createClient } from './supabase/server';

// Shape of a row in the Supabase `products` table.
export interface ProductRow {
  id: string;
  name: string;
  name_de: string;
  description: string;
  description_de: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  brand: string;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    nameDE: row.name_de,
    description: row.description,
    descriptionDE: row.description_de,
    price: Number(row.price),
    unit: row.unit,
    category: row.category as Category,
    image: row.image,
    inStock: row.in_stock,
    featured: row.featured,
    brand: row.brand,
  };
}

export function productToRow(p: Product, stockQty = 0): ProductRow {
  return {
    id: p.id,
    name: p.name,
    name_de: p.nameDE,
    description: p.description,
    description_de: p.descriptionDE,
    price: p.price,
    unit: p.unit,
    category: p.category,
    image: p.image,
    in_stock: p.inStock,
    stock_qty: stockQty,
    featured: p.featured,
    brand: p.brand,
  };
}

// Returns the live catalogue from Supabase, falling back to the static list
// when Supabase isn't configured or a query fails. This keeps the storefront
// rendering no matter the deployment state.
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticProducts;
  try {
    const supabase = createClient();
    // Supabase caps a single query at 1000 rows, so page through all products.
    const PAGE = 1000;
    const all: ProductRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('name', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as ProductRow[]));
      if (data.length < PAGE) break;
    }
    if (all.length === 0) return staticProducts;
    return all.map(rowToProduct);
  } catch {
    return staticProducts;
  }
}
