'use client';
import { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-100 last:border-0 group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-8 text-left transition-all"
      >
        <span className="text-xl lg:text-2xl font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
          {title}
        </span>
        <div className={cn(
          "w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b] transition-all duration-300",
          isOpen ? "rotate-180 bg-[#1d1d1f] text-white" : ""
        )}>
          <ChevronDown size={18} />
        </div>
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        isOpen ? "max-h-[1000px] pb-10 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="text-[17px] leading-relaxed text-[#1d1d1f] font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ProductSpecsAccordionProps {
  description: string;
  boxContent?: string;
  specs?: Record<string, string>;
}

export default function ProductSpecsAccordion({ description, boxContent, specs }: ProductSpecsAccordionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'overview': true });

  const toggle = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-white py-12 lg:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-12">
          Thông Tin Sản Phẩm
        </h2>

        <div className="flex flex-col">
          <AccordionItem
            title="Tổng Quan"
            isOpen={openItems['overview']}
            onToggle={() => toggle('overview')}
          >
            <div className="max-w-3xl space-y-6 text-[#86868b] font-normal">
              {description.split('. ').map((p, i) => (
                <p key={i}>{p}.</p>
              ))}
            </div>
          </AccordionItem>

          {boxContent && (
            <AccordionItem
              title="Trong hộp có gì"
              isOpen={openItems['box']}
              onToggle={() => toggle('box')}
            >
              <p className="text-[#86868b] font-normal">{boxContent}</p>
            </AccordionItem>
          )}

          {specs && Object.keys(specs).length > 0 && (
            <AccordionItem
              title="Thông số kỹ thuật"
              isOpen={openItems['specs']}
              onToggle={() => toggle('specs')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1 border-l-2 border-[#f5f5f7] pl-4">
                    <span className="text-xs font-bold text-[#86868b] uppercase tracking-wider">{key}</span>
                    <span className="text-base text-[#1d1d1f] font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}
        </div>
      </div>
    </section>
  );
}
