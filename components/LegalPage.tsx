import { AlertTriangle, Info } from 'lucide-react';
import type { LegalDoc } from '@/lib/legal';

interface Props {
  doc: LegalDoc;
  /** Shown when the visitor's language has no translation of its own. */
  fallbackNotice?: string;
  updatedLabel: string;
}

export default function LegalPage({ doc, fallbackNotice, updatedLabel }: Props) {
  return (
    <div>
      {/* Page header band, matching the shop */}
      <div className="bg-surface-raised border-b border-surface-line">
        <div className="container-page py-6 sm:py-7">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {doc.title}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {updatedLabel}: {doc.updated}
          </p>
          <span className="rule !mt-3" aria-hidden="true" />
        </div>
      </div>

      <div className="container-page py-10">
        {/* Legal prose reads best in a narrow measure. */}
        <article className="max-w-3xl">
          {fallbackNotice && (
            <p className="flex items-start gap-2.5 mb-8 text-sm text-gray-700 bg-surface-raised
                          border border-surface-line rounded-xl px-4 py-3">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
              {fallbackNotice}
            </p>
          )}

          {doc.intro && (
            <p className="text-gray-600 leading-relaxed mb-10 text-[15px]">{doc.intro}</p>
          )}

          {doc.blocks.map((block, i) => {
            if (block.t === 'h') {
              return (
                <h2
                  key={i}
                  className="text-lg sm:text-xl font-bold text-gray-900 mt-10 mb-3 first:mt-0
                             scroll-mt-32"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.t === 'ul') {
              return (
                <ul key={i} className="list-disc pl-5 space-y-2 mb-4 text-gray-600 leading-relaxed text-[15px]">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            if (block.t === 'todo') {
              // Deliberately loud: these are details only the business owner
              // can supply, and shipping without them is a legal risk.
              return (
                <p
                  key={i}
                  className="flex items-start gap-2.5 my-4 text-sm text-amber-900 bg-amber-50
                             border border-amber-300 rounded-xl px-4 py-3"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>
                    <strong className="font-bold">To be completed:</strong> {block.label}
                  </span>
                </p>
              );
            }

            // Paragraph — newlines are meaningful in address blocks.
            return (
              <p key={i} className="text-gray-600 leading-relaxed mb-4 text-[15px] whitespace-pre-line">
                {block.text}
              </p>
            );
          })}
        </article>
      </div>
    </div>
  );
}
