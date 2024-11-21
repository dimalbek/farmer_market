import Image from "next/image";
import { useRef, useState } from "react";

export const ImageCarousel = ({ images, width=126, height=126 }: { images: {
    image_url: string;
    id: number
}[]; width?: number; height?: number }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
  
    const handleScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, clientWidth } = carouselRef.current;
        const newIndex = Math.round(scrollLeft / clientWidth);
        setActiveIndex(newIndex);
      }
    };
  
    return (
      <div className={`relative w-[${width}px] h-[${height}px]  rounded-md overflow-hidden`} style={{
        width: `${width}px`,
        height: `${height}px`
      }}>
        {images.length > 0 && (
          <div
            ref={carouselRef}
            className="flex h-full overflow-x-scroll snap-x snap-mandatory hide-scrollbar"
            onScroll={handleScroll}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full h-full relative snap-start"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND}${image.image_url}` || "/images/farm.webp"}
                  alt={`Product Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeIndex ? "bg-[white]" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };
  