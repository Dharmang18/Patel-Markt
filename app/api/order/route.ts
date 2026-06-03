import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface OrderItem {
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  locale?: string;
}

const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 4.99;
const GRAPH_API_VERSION = 'v21.0';

function formatPrice(amount: number) {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

function buildMessage(order: OrderPayload, subtotal: number, shipping: number, total: number) {
  const orderLines = order.items
    .map(
      (item) =>
        `  - ${item.name} (${item.unit}) x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n');

  const shippingLine = shipping === 0 ? 'Kostenlos' : formatPrice(shipping);

  return (
    `🛒 New Order from Patel Markt\n\n` +
    `👤 Name: ${order.name.trim()}\n` +
    `📞 Phone: ${order.phone.trim()}\n` +
    `📍 Address: ${order.address.trim()}\n\n` +
    `🛒 Order:\n${orderLines}\n\n` +
    `Subtotal: ${formatPrice(subtotal)}\n` +
    `Shipping: ${shippingLine}\n` +
    `💰 Total: ${formatPrice(total)}\n\n` +
    `✅ Bitte bestätigen / Please confirm. Danke!`
  );
}

async function sendWhatsApp(message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const merchantNumber = process.env.WHATSAPP_MERCHANT_NUMBER;
  if (!token || !phoneNumberId || !merchantNumber) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: merchantNumber,
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      }
    );
    if (!res.ok) {
      console.error('WhatsApp Cloud API error:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('WhatsApp delivery failed:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  let order: OrderPayload;
  try {
    order = (await req.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Server-side validation — never trust the client.
  if (
    !order?.name?.trim() ||
    !order?.phone?.trim() ||
    !order?.address?.trim() ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    return NextResponse.json({ error: 'Incomplete order' }, { status: 400 });
  }

  // Sanitise items and recompute totals on the server (authoritative).
  const items = order.items.map((i) => ({
    name: String(i.name),
    unit: String(i.unit),
    quantity: Math.max(1, Math.floor(Number(i.quantity) || 0)),
    price: Number(i.price) || 0,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;

  // 1) Persist to the database (best-effort), attaching the user if signed in.
  let persisted = false;
  if (isSupabaseConfigured()) {
    try {
      let userId: string | null = null;
      try {
        const ssr = createClient();
        const { data } = await ssr.auth.getUser();
        userId = data.user?.id ?? null;
      } catch {
        userId = null;
      }
      const admin = createAdminClient();
      const { error } = await admin.from('orders').insert({
        user_id: userId,
        customer_name: order.name.trim(),
        phone: order.phone.trim(),
        address: order.address.trim(),
        items,
        subtotal,
        shipping,
        total,
        status: 'new',
      });
      if (error) throw error;
      persisted = true;
    } catch (error) {
      console.error('Order persistence failed:', error);
    }
  }

  // 2) Notify the merchant via WhatsApp (best-effort).
  const notified = await sendWhatsApp(buildMessage(order, subtotal, shipping, total));

  // Succeed if the order was captured by at least one channel.
  if (!persisted && !notified) {
    return NextResponse.json(
      { error: 'Order channel not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, persisted, notified });
}
