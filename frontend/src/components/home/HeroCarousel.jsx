import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import img1 from '@/assets/12.JPG';
import img2 from '@/assets/13.jfif';
import img3 from '@/assets/14.jfif';

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    const images = [img1, img2, img3];

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlay) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [isAutoPlay, images.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
        setIsAutoPlay(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
        setIsAutoPlay(false);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlay(false);
    };

    return (
        <div className="group relative h-[450px] w-full overflow-hidden rounded-lg border border-white/12 bg-[#03120d] shadow-2xl shadow-black/35 sm:h-[550px] lg:h-[650px]">
            {/* Carousel Images */}
            <div className="relative w-full h-full">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={clsx(
                            'absolute inset-0 transition-all duration-1000 ease-in-out',
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        )}
                    >
                        <img
                            src={image}
                            alt={`Smart Home Image ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020a07]/72 via-transparent to-transparent" />
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <button
                onClick={prevSlide}
                onMouseEnter={() => setIsAutoPlay(false)}
                className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-emerald hover:text-ink group-hover:opacity-100 sm:left-4"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={nextSlide}
                onMouseEnter={() => setIsAutoPlay(false)}
                className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-emerald hover:text-ink group-hover:opacity-100 sm:right-4"
                aria-label="Next slide"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 animate-fade-in">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={clsx(
                            'h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125',
                            index === currentSlide
                                ? 'w-8 bg-emerald'
                                : 'w-2 bg-white/50 hover:bg-white/70'
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute right-4 top-4 z-30 rounded-full border border-white/15 bg-white/14 px-2 py-1 backdrop-blur-md transition-all duration-300 hover:bg-white/25 sm:px-3 animate-slide-in-down">
                <p className="text-xs font-semibold text-white">
                    {String(currentSlide + 1).padStart(2, '0')}/{String(images.length).padStart(2, '0')}
                </p>
            </div>
        </div>
    );
}
