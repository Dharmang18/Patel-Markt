import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface CheckoutItem {
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items, locale } = (await req.json()) as {
      items: CheckoutItem[];
      locale: string;
    };

    const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      mode: 'payment',
      locale: locale === 'de' ? 'de' : locale === 'hi' ? 'en' : 'en',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: { allowed_countries: ['DE', 'AT', 'CH'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Kostenloser Versand (ab €50)',
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 499, currency: 'eur' },
            display_name: 'Standardversand (2–4 Werktage)',
          },
        },
      ],
      success_url: `${baseUrl}/${locale}?order=success`,
      cancel_url: `${baseUrl}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
