import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const { data: banners } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  // Auto-rotate every 10 seconds
  useEffect(() => {
    if (!banners || banners.length === 0 || !autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [banners, autoPlay]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div
      className="relative w-full h-48 bg-muted overflow-hidden rounded-lg"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Image */}
      <img
        src={current.imageUrl}
        alt={current.title || 'Banner'}
        className="w-full h-full object-cover"
      />

      {/* Content overlay */}
      {(current.title || current.description) && (
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
          {current.title && (
            <h3 className="text-white font-bold text-lg">{current.title}</h3>
          )}
          {current.description && (
            <p className="text-white/90 text-sm">{current.description}</p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
