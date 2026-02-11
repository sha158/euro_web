'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Show splash for 3 seconds to allow animation to play
        const timer = setTimeout(() => {
            setOpacity(0);
            setTimeout(() => {
                setIsVisible(false);
                if (onFinish) onFinish();
            }, 500); // Wait for fade out transition
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!isVisible) return null;


    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#050a14',
                overflow: 'hidden',
                opacity: opacity,
                transition: 'opacity 0.5s ease-out'
            }}
        >
            {/* Grid Background */}
            <div
                className="grid-background"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.4
                }}
            ></div>

            {/* Radial Gradient Overlay for depth */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, transparent 0%, #050a14 100%)'
                }}
            ></div>

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
                    {"EURO".split("").map((letter, index) => (
                        <span
                            key={index}
                            className="letter-shimmer"
                            style={{
                                fontSize: 'clamp(3rem, 10vw, 6rem)',
                                fontWeight: 900,
                                letterSpacing: '0.2em',
                                fontFamily: 'Inter, sans-serif',
                                animationDelay: `${index * 0.15}s`, // Slightly faster stagger
                                paddingRight: index === 3 ? 0 : '0.1em' // Fix spacing for last letter
                            }}
                        >
                            {letter}
                        </span>
                    ))}
                </div>

                <div
                    className="fade-in"
                    style={{
                        color: '#94a3b8', // Slate-400 for subtitle
                        fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        fontWeight: 300,
                        animationDelay: '1.2s', // Wait for Euro text
                        opacity: 0,
                        animationFillMode: 'forwards'
                    }}
                >
                    system aluminium windows & doors
                </div>

                <div
                    className="animate-width-grow"
                    style={{
                        marginTop: '1.5rem',
                        height: '1px',
                        width: 0,
                        background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                        animationDelay: '1.5s'
                    }}
                ></div>
            </div>
        </div>
    );
}
