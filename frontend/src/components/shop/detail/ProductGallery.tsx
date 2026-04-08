'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image */}
      <div className="relative aspect-square w-full max-w-[500px] mx-auto overflow-hidden bg-[#F5F4F7] rounded-[32px] transition-all duration-500">
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-contain p-8 animate-fade-in"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex justify-center gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-1 bg-[#F5F4F7]",
              selected === i ? "border-[#0071e3]" : "border-transparent hover:border-gray-200"
            )}
          >
            <Image
              src={img}
              alt={`${name} thumb ${i}`}
              fill
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
