import React, { useState, useEffect, useRef } from 'react';

interface ZoomBoxProps {
    image: HTMLImageElement;
    zoomLevel?: number;
}

export function ZoomBox({ image, zoomLevel = 3 }: ZoomBoxProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);
    const zoomRef = useRef<HTMLDivElement>(null);
    const boxSize = 150;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const rect = image.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                setPosition({ x, y });
                setShowZoom(true);
            } else {
                setShowZoom(false);
            }
        };

        const handleMouseLeave = () => {
            setShowZoom(false);
        };

        image.addEventListener('mousemove', handleMouseMove);
        image.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            image.removeEventListener('mousemove', handleMouseMove);
            image.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [image]);

    if (!showZoom) return null;

    const zoomStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${boxSize}px`,
        height: `${boxSize}px`,
        border: '2px solid white',
        borderRadius: '8px',
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#1f2937',
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        backgroundImage: `url(${image.src})`,
        backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
        backgroundSize: `${image.width * zoomLevel}px ${image.height * zoomLevel}px`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    };

    return <div ref={zoomRef} style={zoomStyle} />;
}