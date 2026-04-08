'use client';
import { ProductVariant } from '@/types';
import { cn } from '@/lib/utils';

interface ProductVariantPickerProps {
  variants: ProductVariant[];
  selectedVariants: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function ProductVariantPicker({ variants, selectedVariants, onChange }: ProductVariantPickerProps) {
  // Group variants by name (e.g., "Dòng máy", "Màu sắc")
  const groups = variants.reduce<Record<string, string[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    if (!acc[v.name].includes(v.value)) acc[v.name].push(v.value);
    return acc;
  }, {});

  // Helper to detect if a variant looks like a color
  const isColorVariant = (name: string) => name.toLowerCase().includes('màu');

  // Simple color mapping for bubbles
  const colorMap: Record<string, string> = {
    'Trắng': '#FFFFFF',
    'Đen': '#1d1d1f',
    'Xám': '#86868b',
    'Vàng': '#f5c518',
    'Hồng': '#fbc2c4',
    'Blue': '#96b8d6',
    'Purple': '#d1cfe2',
    'Ối Đào': '#ff7a5c',
    'Phấn Hồng': '#fbc2c4',
    'Xanh Băng': '#a7c7e7',
    'Xanh Mướp': '#a3c585',
    'Đen Midnight': '#1d1d1f',
    'Ánh Sao': '#faf9f6',
  };

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([name, values]) => {
        const isColor = isColorVariant(name);
        const selectedValue = selectedVariants[name];

        return (
          <div key={name} className="animate-fade-in">
            <h3 className="text-[13px] font-semibold text-[#86868b] mb-4 uppercase tracking-wider">
              {name}: <span className="text-[#1d1d1f] normal-case">{selectedValue}</span>
            </h3>
            
            {isColor ? (
              <div className="flex flex-wrap gap-4">
                {values.map((val) => (
                  <button
                    key={val}
                    onClick={() => onChange(name, val)}
                    title={val}
                    className={cn(
                      "w-9 h-9 rounded-full p-0.5 border-2 transition-all duration-300",
                      selectedValue === val ? "border-[#0071e3] scale-110 shadow-sm" : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <div 
                      className="w-full h-full rounded-full border border-black/5 shadow-inner"
                      style={{ backgroundColor: colorMap[val] || '#ccc' }}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {values.map((val) => (
                  <button
                    key={val}
                    onClick={() => onChange(name, val)}
                    className={cn(
                      "flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all duration-300 text-left group",
                      selectedValue === val 
                        ? "border-[#0071e3] bg-blue-50/10 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-[15px] font-semibold text-[#1d1d1f]">{val}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedValue === val ? "border-[#0071e3] bg-[#0071e3]" : "border-gray-300"
                    )}>
                      {selectedValue === val && <div className="w-2 h-2 rounded-full bg-white animate-scale-in" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
