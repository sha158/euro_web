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
            className="splash-hero-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#050a14',
                overflow: 'hidden',
                opacity: opacity,
                transition: 'opacity 0.5s ease-out'
            }}
        >
            <div
                className="splash-grid-layer"
                style={{
                    position: 'absolute',
                    inset: '-16vmax',
                    pointerEvents: 'none',
                    zIndex: 1,
                    backgroundImage: `
                        repeating-linear-gradient(to right, rgba(56, 189, 248, 0.30) 0 1px, transparent 1px 48px),
                        repeating-linear-gradient(to bottom, rgba(56, 189, 248, 0.30) 0 1px, transparent 1px 48px),
                        radial-gradient(circle at center, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.08) 34%, rgba(56, 189, 248, 0.03) 56%, transparent 76%)
                    `,
                    backgroundPosition: 'center',
                    opacity: 1,
                    filter: 'blur(0.3px)',
                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.92) 26%, rgba(0, 0, 0, 0.62) 52%, rgba(0, 0, 0, 0.2) 68%, transparent 82%)',
                    maskImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.92) 26%, rgba(0, 0, 0, 0.62) 52%, rgba(0, 0, 0, 0.2) 68%, transparent 82%)'
                }}
            ></div>
            <div
                className="splash-radial-fade-layer"
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 2,
                    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.03) 45%, transparent 70%)',
                    mixBlendMode: 'screen',
                    opacity: 0.9
                }}
            ></div>
            <div
                className="splash-center-glow-layer"
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 3,
                    background: `
                        radial-gradient(circle at center, rgba(56, 189, 248, 0.30) 0%, rgba(56, 189, 248, 0.14) 18%, rgba(56, 189, 248, 0.05) 38%, transparent 64%),
                        radial-gradient(circle at center, rgba(255, 255, 255, 0.11) 0%, transparent 42%)
                    `,
                    mixBlendMode: 'screen',
                    opacity: 0.85,
                    filter: 'blur(12px)'
                }}
            ></div>

            {/* Content */}
            <div
                className="splash-content-layer"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: 'min(92vw, 980px)',
                    margin: 0
                }}
            >
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
