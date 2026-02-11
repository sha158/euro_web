export default function EuroLogo({ className, ...props }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4b5563" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#4b5563" />
                    <animate
                        attributeName="x1"
                        from="-100%"
                        to="100%"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="x2"
                        from="0%"
                        to="200%"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </linearGradient>
            </defs>

            {/* Geometric 'E' constructed from window profile-like shapes */}
            {/* Vertical Spine */}
            <rect x="10" y="10" width="15" height="80" rx="2" fill="url(#shimmerGradient)" />

            {/* Top Bar */}
            <rect x="25" y="10" width="55" height="12" rx="2" fill="url(#shimmerGradient)" />

            {/* Middle Bar - shorter */}
            <rect x="25" y="44" width="45" height="12" rx="2" fill="url(#shimmerGradient)" />

            {/* Bottom Bar */}
            <rect x="25" y="78" width="55" height="12" rx="2" fill="url(#shimmerGradient)" />

            {/* Optional: Add some "joint" details or cuts */}
            <path d="M25 10 L25 22 L10 22 L10 10" fill="#050a14" opacity="0.2" />
            <path d="M25 78 L25 90 L10 90 L10 78" fill="#050a14" opacity="0.2" />
        </svg>
    );
}
