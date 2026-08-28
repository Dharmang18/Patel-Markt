import type { LegalDoc, LegalKey } from './types';

const UPDATED = '28 August 2026';

const imprint: LegalDoc = {
  title: 'Imprint',
  updated: UPDATED,
  intro: 'Legal website operator identification pursuant to § 5 DDG (German Digital Services Act).',
  blocks: [
    { t: 'h', text: 'Operator' },
    { t: 'todo', label: 'Full legal company name including legal form (e.g. “Patel Markt GmbH”, or the owner’s name for a sole proprietorship)' },
    { t: 'p', text: 'Große Ulrichstraße 36\n06108 Halle (Saale)\nGermany' },
    { t: 'todo', label: 'Represented by (managing director / owner)' },
    { t: 'h', text: 'Contact' },
    { t: 'p', text: 'Phone: 0174 2513750\nEmail: info@patel-markt.de' },
    { t: 'h', text: 'VAT' },
    { t: 'todo', label: 'VAT identification number pursuant to § 27a UStG (or a note on the small-business scheme under § 19 UStG)' },
    { t: 'h', text: 'Commercial register' },
    { t: 'todo', label: 'Registering court and commercial register number (not applicable to unregistered sole proprietorships)' },
    { t: 'h', text: 'Consumer dispute resolution' },
    { t: 'p', text: 'We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.' },
    { t: 'todo', label: 'If you do participate in an arbitration scheme, name the competent body here and replace the sentence above' },
    { t: 'h', text: 'Copyright' },
    {
      t: 'p',
      text: 'The content and works created by the site operator on these pages are subject to German copyright law. Any reproduction, editing, distribution or any form of use beyond the limits of copyright law requires the prior written consent of the respective author or creator. Downloads and copies of this site are permitted for private, non-commercial use only.',
    },
    {
      t: 'p',
      text: 'Where the content on this site was not created by the operator, the copyrights of third parties are respected and such content is identified accordingly. Should you nevertheless become aware of a copyright infringement, please notify us. Upon becoming aware of any violation, we will remove such content immediately.',
    },
    { t: 'h', text: 'Product and brand names' },
    {
      t: 'p',
      text: 'The brand and product names of the manufacturers we stock are the property of their respective rights holders. They are used solely to describe the goods we sell.',
    },
    { t: 'h', text: 'Liability for links' },
    {
      t: 'p',
      text: 'Our website contains links to external third-party websites over whose content we have no control. We therefore cannot accept any liability for such external content; the respective provider or operator of the linked pages is always responsible for their content. The linked pages were checked for possible legal violations at the time of linking, and no unlawful content was identifiable. Upon becoming aware of any violation, we will remove such links immediately.',
    },
  ],
};

const privacy: LegalDoc = {
  title: 'Privacy Policy',
  updated: UPDATED,
  intro:
    'Unless stated otherwise below, providing your personal data is neither legally nor contractually required, nor necessary for the conclusion of a contract. You are not obliged to provide the data, and not providing it will have no consequences. This applies only where the processing operations described below do not state otherwise. “Personal data” means any information relating to an identified or identifiable natural person.',
  blocks: [
    { t: 'h', text: 'Controller' },
    { t: 'p', text: 'The controller responsible for data processing is:' },
    { t: 'todo', label: 'Full legal company name including legal form (identical to the imprint)' },
    { t: 'p', text: 'Große Ulrichstraße 36, 06108 Halle (Saale), Germany\nPhone: 0174 2513750\nEmail: info@patel-markt.de' },

    { t: 'h', text: 'Hosting and server log files' },
    {
      t: 'p',
      text: 'You can visit our website without providing personal data. Each time the site is accessed, technical access data is transmitted by your browser to our hosting provider and stored in server log files. This includes, for example, the name of the page accessed, the date and time of the request, the IP address, the volume of data transferred and the requesting provider.',
    },
    {
      t: 'p',
      text: 'Processing is carried out on the basis of Art. 6(1)(f) GDPR due to our legitimate interest in the smooth operation and security of our website.',
    },
    {
      t: 'p',
      text: 'Our website is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Data may therefore be transferred to the USA. For the USA, an adequacy decision of the EU Commission exists in the form of the EU-US Data Privacy Framework.',
    },
    { t: 'todo', label: 'Verify and confirm the actual hosting provider and its certification; link the data processing agreement (DPA) if applicable' },

    { t: 'h', text: 'Contacting us by email, phone or WhatsApp' },
    {
      t: 'p',
      text: 'If you contact us proactively, we collect your personal data (name, contact details, content of your message) only to the extent you provide it. The purpose of processing is to handle and respond to your enquiry.',
    },
    {
      t: 'p',
      text: 'If the contact serves to implement pre-contractual measures or concerns a contract already concluded, processing is based on Art. 6(1)(b) GDPR. If contact occurs for other reasons, processing is based on Art. 6(1)(f) GDPR for our legitimate interest in handling your enquiry. In that case you have the right to object at any time on grounds relating to your particular situation.',
    },

    { t: 'h', text: 'Customer account' },
    {
      t: 'p',
      text: 'If you create a customer account, we collect the data you enter there (name, email address, phone number, address). Processing serves to simplify your orders and give you access to your order history, and is carried out on the basis of your consent pursuant to Art. 6(1)(a) GDPR. You may withdraw your consent at any time by contacting us, after which your account will be deleted. The lawfulness of processing carried out before withdrawal remains unaffected.',
    },
    {
      t: 'p',
      text: 'Account and order data is stored in our database with Supabase Inc., 970 Toa Payoh North, Singapore, which we use as a processor.',
    },
    { t: 'todo', label: 'State the region of the Supabase project (EU or third country) and adjust this paragraph accordingly; conclude a DPA with Supabase' },

    { t: 'h', text: 'Orders and contract processing' },
    {
      t: 'p',
      text: 'When you place an order, we collect and use your personal data only insofar as this is necessary to fulfil and process your order and to handle your enquiries. Providing the data is necessary for the conclusion of a contract; without it no contract can be concluded. Processing is based on Art. 6(1)(b) GDPR.',
    },
    {
      t: 'p',
      text: 'Your data is shared — restricted to the necessary minimum — with shipping companies, payment service providers and IT service providers.',
    },

    { t: 'h', text: 'Ordering via WhatsApp' },
    {
      t: 'p',
      text: 'We offer the option of submitting an order through a form on our website, which is then transmitted to us as a WhatsApp message. The data you provide (name, phone number, delivery address, order contents) is processed for this purpose.',
    },
    {
      t: 'p',
      text: 'To send this message we use the services of Twilio Ireland Limited, 3 Dublin Landings, North Wall Quay, Dublin 1, Ireland, and — inherent to the system — WhatsApp Ireland Limited, Merrion Road, Dublin 4, Ireland. Data may also be transferred to the USA.',
    },
    { t: 'p', text: 'Processing is carried out to implement pre-contractual measures or to perform the contract on the basis of Art. 6(1)(b) GDPR.' },
    { t: 'todo', label: 'Conclude a DPA with Twilio and check that WhatsApp ordering is reflected as a separate ordering route in the terms' },

    { t: 'h', text: 'Payment service providers' },
    {
      t: 'p',
      text: 'When paying by credit or debit card, the data required for payment processing is transmitted to Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland. Processing is based on Art. 6(1)(b) GDPR. Further information: https://stripe.com/privacy',
    },
    {
      t: 'p',
      text: 'When paying via PayPal, the data required for payment processing is transmitted to PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg. Processing is based on Art. 6(1)(b) GDPR. Further information: https://www.paypal.com/webapps/mpp/ua/privacy-full',
    },
    { t: 'p', text: 'When paying by bank transfer, your payment data is processed exclusively by the credit institution you instruct.' },

    { t: 'h', text: 'Sending emails for order processing' },
    {
      t: 'p',
      text: 'To send order confirmations and comparable transactional emails we use Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA, as a processor. Your email address and the content of the message are processed and transferred to the USA. Processing is based on Art. 6(1)(b) GDPR.',
    },

    { t: 'h', text: 'Delivery of product images' },
    {
      t: 'p',
      text: 'The product images in our shop are delivered via the storage and delivery services of Cloudflare Germany GmbH, Rosental 7, 80331 Munich (parent company: Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA). When an image is retrieved, technical access data including your IP address is processed. Processing is based on Art. 6(1)(f) GDPR due to our legitimate interest in the fast and reliable delivery of our website.',
    },

    { t: 'h', text: 'Cookies and local storage' },
    {
      t: 'p',
      text: 'We use only technically necessary cookies and comparable technologies. Your shopping cart is stored in your browser’s local storage so that selected items are retained as you move between pages. This data remains in your browser and is not transmitted to us. If you are signed in, a technically necessary session cookie is also set.',
    },
    {
      t: 'p',
      text: 'This is carried out on the basis of § 25(2) TDDDG and Art. 6(1)(f) GDPR due to our legitimate interest in a functioning website. You can delete stored data at any time via your browser settings.',
    },
    {
      t: 'p',
      text: 'We currently use no analytics, tracking or advertising services. No profiling and no automated decision-making takes place. Fonts are loaded exclusively from our own server or from the user’s own system; there is no connection to external font services.',
    },

    { t: 'h', text: 'Storage period' },
    {
      t: 'p',
      text: 'After the contract has been fully performed, data is initially stored for the duration of the warranty period, then in accordance with statutory retention periods — in particular under tax and commercial law — and is deleted thereafter, unless you have consented to further processing.',
    },

    { t: 'h', text: 'Rights of the data subject' },
    {
      t: 'p',
      text: 'Where the legal requirements are met, you have the following rights under Art. 15 to 20 GDPR: the right to information, rectification, erasure, restriction of processing and data portability. You also have a right to object to processing based on Art. 6(1)(f) GDPR and to processing for direct marketing purposes under Art. 21 GDPR.',
    },

    { t: 'h', text: 'Right to lodge a complaint' },
    {
      t: 'p',
      text: 'Under Art. 77 GDPR you have the right to lodge a complaint with a supervisory authority if you believe your data is not being processed lawfully. The authority responsible for us is:',
    },
    {
      t: 'p',
      text: 'Landesbeauftragter für den Datenschutz Sachsen-Anhalt\nLeiterstraße 9, 39104 Magdeburg, Germany\nPostfach 1947, 39009 Magdeburg\nPhone: +49 391 81803-0\nEmail: poststelle@lfd.sachsen-anhalt.de',
    },

    { t: 'h', text: 'Right to object' },
    {
      t: 'p',
      text: 'Where the processing described here is based on our legitimate interests pursuant to Art. 6(1)(f) GDPR, you have the right to object at any time with future effect on grounds relating to your particular situation. If the objection is successful, we will no longer process the personal data unless we can demonstrate compelling legitimate grounds that override your interests, rights and freedoms, or the processing serves to assert, exercise or defend legal claims.',
    },
  ],
};

const terms: LegalDoc = {
  title: 'Terms & Conditions',
  updated: UPDATED,
  blocks: [
    { t: 'h', text: '§ 1 Scope' },
    {
      t: 'p',
      text: '(1) The following terms apply to all contracts you conclude with us as supplier via the website patel-markt.de. Unless otherwise agreed, the inclusion of your own terms is excluded.',
    },
    {
      t: 'p',
      text: '(2) A “consumer” means any natural person who concludes a legal transaction for purposes that predominantly can be attributed neither to their commercial nor their independent professional activity. A “trader” means any natural or legal person or partnership with legal capacity acting in the exercise of their commercial or independent professional activity.',
    },

    { t: 'h', text: '§ 2 Conclusion of contract' },
    { t: 'p', text: '(1) The subject matter of the contract is the sale of food and everyday goods.' },
    { t: 'p', text: '(2) The presentation of products in the online shop does not constitute a legally binding offer, but an invitation to place an order.' },
    { t: 'p', text: '(3) A contract is concluded via one of the following two routes:' },
    {
      t: 'ul',
      items: [
        'Cart and checkout: you place the goods in the shopping cart. After entering your details and the payment and shipping conditions, all order data is shown in a summary. By submitting the order via the corresponding button you make a binding offer.',
        'Ordering via WhatsApp: alternatively, you can submit your cart to us as a WhatsApp message using the order form. This likewise constitutes a binding offer on your part.',
      ],
    },
    {
      t: 'p',
      text: '(4) We may accept your offer within five days by sending you an order confirmation in text form or by delivering the goods. Receipt of an automatically generated acknowledgement of receipt does not yet constitute acceptance.',
    },
    {
      t: 'p',
      text: '(5) Order processing and the transmission of all information required in connection with the conclusion of the contract take place by email, in part automatically. You must therefore ensure that the email address you provide is correct and that receipt of messages is not technically prevented, in particular by SPAM filters.',
    },

    { t: 'h', text: '§ 3 Prices, shipping costs and delivery area' },
    { t: 'p', text: '(1) All prices stated are total prices and include statutory VAT.' },
    { t: 'p', text: '(2) In addition to the value of the goods we charge shipping costs of €4.99. Orders of €50 or more are delivered free of shipping charges.' },
    { t: 'p', text: '(3) We deliver to Germany, Austria and Switzerland. Billing is exclusively in euros.' },
    {
      t: 'p',
      text: '(4) For deliveries to Switzerland, additional customs duties, taxes and fees may apply. These are levied not by us but by the competent customs or tax authorities and are to be borne by you.',
    },
    { t: 'todo', label: 'Confirm whether you actually ship to Switzerland, and check customs/import rules for foodstuffs' },

    { t: 'h', text: '§ 4 Payment terms' },
    { t: 'p', text: '(1) Unless otherwise agreed, payment claims arising from the concluded contract are due immediately.' },
    {
      t: 'p',
      text: '(2) The payment methods shown during the order process are available to you, in particular credit or debit card (via Stripe), PayPal and bank transfer.',
    },
    { t: 'p', text: '(3) When paying by bank transfer, the invoice amount is to be transferred to the account stated within seven days of conclusion of the contract.' },

    { t: 'h', text: '§ 5 Delivery' },
    {
      t: 'p',
      text: '(1) Unless otherwise agreed, delivery is made to the delivery address you provide. Delivery time within Germany is generally 2 to 4 business days.',
    },
    {
      t: 'p',
      text: '(2) If you are a consumer, the risk of accidental loss or deterioration of the sold goods passes to you only upon handover of the goods, irrespective of whether the shipment is insured.',
    },

    { t: 'h', text: '§ 6 Retention of title and right of retention' },
    { t: 'p', text: '(1) The goods remain our property until payment has been made in full.' },
    { t: 'p', text: '(2) You may exercise a right of retention only insofar as it concerns claims arising from the same contractual relationship.' },

    { t: 'h', text: '§ 7 Right of withdrawal' },
    { t: 'p', text: '(1) Consumers are generally entitled to a statutory right of withdrawal of 14 days. Details are set out in our withdrawal policy.' },
    {
      t: 'p',
      text: '(2) Pursuant to § 312g(2) no. 2 BGB, the right of withdrawal does not apply to contracts for the supply of goods that are liable to deteriorate rapidly or whose expiry date would quickly be exceeded. Pursuant to § 312g(2) no. 3 BGB, it also does not apply to sealed goods which are not suitable for return for reasons of health protection or hygiene, where their seal has been removed after delivery.',
    },
    { t: 'todo', label: 'Add a standalone withdrawal policy including the model withdrawal form (legally required) and link it here' },

    { t: 'h', text: '§ 8 Warranty' },
    { t: 'p', text: '(1) The statutory rights in respect of defects apply.' },
    {
      t: 'p',
      text: '(2) As a consumer you are asked to check the goods promptly on delivery for completeness, obvious defects and transport damage, and to notify us and the carrier of any complaints as soon as possible. Failure to do so has no effect on your statutory warranty claims.',
    },
    {
      t: 'p',
      text: '(3) In the case of food, please inspect the goods immediately upon receipt and store them appropriately. We cannot accept liability for spoilage caused by improper storage after handover.',
    },

    { t: 'h', text: '§ 9 Protection of minors' },
    {
      t: 'p',
      text: 'Insofar as we offer goods subject to the provisions of the German Protection of Young Persons Act, we enter into contractual relationships only with customers who have reached the legally prescribed minimum age. By submitting your order you confirm that you have reached the required minimum age.',
    },

    { t: 'h', text: '§ 10 Choice of law, place of performance, jurisdiction' },
    {
      t: 'p',
      text: '(1) German law applies. For consumers, this choice of law applies only insofar as it does not remove the protection granted by mandatory provisions of the law of the country of the consumer’s habitual residence.',
    },
    {
      t: 'p',
      text: '(2) If you are not a consumer but a trader, a legal entity under public law or a special fund under public law, our place of business is the place of jurisdiction and place of performance for all services arising from the existing business relationships.',
    },
    { t: 'p', text: '(3) The provisions of the UN Convention on Contracts for the International Sale of Goods expressly do not apply.' },

    { t: 'h', text: 'Customer information' },
    {
      t: 'p',
      text: 'The contract language is German. The text of the contract is not stored by us. Before submitting your order you can print the contract data using your browser’s print function or save it electronically.',
    },
    { t: 'p', text: 'The key features of the goods can be found in the respective product description.' },
  ],
};

export const en: Record<LegalKey, LegalDoc> = { privacy, imprint, terms };
