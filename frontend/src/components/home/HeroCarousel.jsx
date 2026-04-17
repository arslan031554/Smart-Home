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
        <div className="relative w-full overflow-hidden rounded-lg group bg-white h-[450px] sm:h-[550px] lg:h-[650px]">
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
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <button
                onClick={prevSlide}
                onMouseEnter={() => setIsAutoPlay(false)}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-300 hover:bg-white/40 hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={nextSlide}
                onMouseEnter={() => setIsAutoPlay(false)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-300 hover:bg-white/40 hover:scale-110 opacity-0 group-hover:opacity-100"
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
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/50 hover:bg-white/70'
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 z-30 px-2 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 animate-slide-in-down">
                <p className="text-xs font-semibold text-white">
                    {String(currentSlide + 1).padStart(2, '0')}/{String(images.length).padStart(2, '0')}
                </p>
            </div>
        </div>
    );
}
