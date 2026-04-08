'use client';
import Image from 'next/image';

interface ProductLifestyleBannerProps {
  image?: string;
  tagline?: string;
  copy?: string;
}

export default function ProductLifestyleBanner({ image, tagline, copy }: ProductLifestyleBannerProps) {
  if (!image && !tagline) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#F5F4F7] py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Text content */}
        <div className="max-w-2xl mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-6xl font-semibold text-[#1d1d1f] tracking-tight mb-6 leading-tight">
            {tagline}
          </h2>
          <p className="text-lg lg:text-xl text-[#86868b] font-medium leading-relaxed">
            {copy}
          </p>
        </div>

        {/* Hero image with floating effect */}
        {image && (
          <div className="relative w-full max-w-4xl aspect-[16/9] lg:aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl animate-hero-float">
            <Image
              src={image}
              alt="Product Lifestyle"
              fill
              className="object-cover"
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
