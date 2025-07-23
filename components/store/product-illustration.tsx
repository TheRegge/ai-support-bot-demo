interface ProductIllustrationProps {
  productId: string;
  className?: string;
}

export function ProductIllustration({ productId, className = "" }: ProductIllustrationProps) {
  const defaultClasses = "w-full h-full";
  const combinedClasses = `${defaultClasses} ${className}`;

  switch (productId) {
    case "1": // Wireless Headphones
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="url(#gradient1)"/>
          <path d="M100 40C70 40 45 65 45 95V120C45 130 50 135 60 135H70V85C70 70 85 55 100 55C115 55 130 70 130 85V135H140C150 135 155 130 155 120V95C155 65 130 40 100 40Z" stroke="#4A5568" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="60" y="95" width="15" height="50" rx="7.5" fill="#4A5568" stroke="#4A5568" strokeWidth="2"/>
          <rect x="125" y="95" width="15" height="50" rx="7.5" fill="#4A5568" stroke="#4A5568" strokeWidth="2"/>
          <circle cx="100" cy="100" r="3" fill="#4A5568"/>
          <defs>
            <linearGradient id="gradient1" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#E0E7FF"/>
              <stop offset="1" stopColor="#C7D2FE"/>
            </linearGradient>
          </defs>
        </svg>
      );

    case "2": // Smart Watch
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="url(#gradient2)"/>
          <rect x="75" y="30" width="50" height="20" rx="10" fill="#4A5568"/>
          <rect x="75" y="150" width="50" height="20" rx="10" fill="#4A5568"/>
          <rect x="60" y="50" width="80" height="100" rx="20" stroke="#4A5568" strokeWidth="3" fill="white"/>
          <rect x="70" y="60" width="60" height="80" rx="15" fill="#1F2937"/>
          <circle cx="130" cy="100" r="4" fill="#4A5568"/>
          <text x="100" y="90" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">12:30</text>
          <text x="100" y="110" textAnchor="middle" fill="#9CA3AF" fontSize="12">Mon 15</text>
          <circle cx="85" cy="125" r="8" fill="none" stroke="#10B981" strokeWidth="2"/>
          <circle cx="100" cy="125" r="8" fill="none" stroke="#F59E0B" strokeWidth="2"/>
          <circle cx="115" cy="125" r="8" fill="none" stroke="#EF4444" strokeWidth="2"/>
          <defs>
            <linearGradient id="gradient2" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#FEE2E2"/>
              <stop offset="1" stopColor="#FECACA"/>
            </linearGradient>
          </defs>
        </svg>
      );

    case "3": // Bluetooth Speaker
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="url(#gradient3)"/>
          <rect x="50" y="70" width="100" height="60" rx="30" stroke="#4A5568" strokeWidth="3" fill="white"/>
          <circle cx="75" cy="100" r="15" fill="#4A5568"/>
          <circle cx="75" cy="100" r="10" fill="#6B7280"/>
          <circle cx="75" cy="100" r="5" fill="#4A5568"/>
          <circle cx="125" cy="100" r="15" fill="#4A5568"/>
          <circle cx="125" cy="100" r="10" fill="#6B7280"/>
          <circle cx="125" cy="100" r="5" fill="#4A5568"/>
          <rect x="95" y="85" width="10" height="30" rx="5" fill="#4A5568"/>
          <path d="M160 80C165 85 165 115 160 120" stroke="#4A5568" strokeWidth="2" strokeLinecap="round"/>
          <path d="M165 75C172 82 172 118 165 125" stroke="#4A5568" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="gradient3" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#D1FAE5"/>
              <stop offset="1" stopColor="#A7F3D0"/>
            </linearGradient>
          </defs>
        </svg>
      );

    case "4": // Laptop Stand
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="url(#gradient4)"/>
          <path d="M40 140L80 80H120L160 140" stroke="#4A5568" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="50" y="60" width="100" height="60" rx="10" stroke="#4A5568" strokeWidth="3" fill="white" transform="rotate(-15 100 90)"/>
          <rect x="55" y="65" width="90" height="50" rx="5" fill="#1F2937" transform="rotate(-15 100 90)"/>
          <rect x="30" y="140" width="140" height="10" rx="5" fill="#4A5568"/>
          <circle cx="60" cy="145" r="8" fill="#6B7280"/>
          <circle cx="140" cy="145" r="8" fill="#6B7280"/>
          <defs>
            <linearGradient id="gradient4" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#FEF3C7"/>
              <stop offset="1" stopColor="#FDE68A"/>
            </linearGradient>
          </defs>
        </svg>
      );

    case "5": // Wireless Charging Pad
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="url(#gradient5)"/>
          <ellipse cx="100" cy="120" rx="60" ry="15" fill="#E5E7EB"/>
          <circle cx="100" cy="110" r="60" stroke="#4A5568" strokeWidth="3" fill="white"/>
          <circle cx="100" cy="110" r="45" stroke="#6B7280" strokeWidth="2" strokeDasharray="5 5"/>
          <circle cx="100" cy="110" r="30" stroke="#6B7280" strokeWidth="2" strokeDasharray="5 5"/>
          <circle cx="100" cy="110" r="15" stroke="#6B7280" strokeWidth="2" strokeDasharray="5 5"/>
          <path d="M90 110L95 100L105 120L110 110" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="130" cy="110" r="4" fill="#10B981"/>
          <defs>
            <linearGradient id="gradient5" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#EDE9FE"/>
              <stop offset="1" stopColor="#DDD6FE"/>
            </linearGradient>
          </defs>
        </svg>
      );

    case "6": // USB-C Hub
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="url(#gradient6)"/>
          <rect x="60" y="80" width="80" height="40" rx="10" stroke="#4A5568" strokeWidth="3" fill="white"/>
          <rect x="20" y="90" width="40" height="20" rx="5" stroke="#4A5568" strokeWidth="2" fill="#E5E7EB"/>
          <rect x="140" y="85" width="25" height="10" rx="5" fill="#4A5568"/>
          <rect x="140" y="105" width="25" height="10" rx="5" fill="#4A5568"/>
          <rect x="170" y="85" width="20" height="30" rx="5" stroke="#4A5568" strokeWidth="2" fill="#E5E7EB"/>
          <rect x="70" y="90" width="15" height="8" rx="4" fill="#6B7280"/>
          <rect x="90" y="90" width="15" height="8" rx="4" fill="#6B7280"/>
          <rect x="110" y="90" width="15" height="8" rx="4" fill="#6B7280"/>
          <rect x="70" y="102" width="20" height="8" rx="4" fill="#4A5568"/>
          <rect x="95" y="102" width="30" height="8" rx="4" fill="#4A5568"/>
          <circle cx="130" cy="100" r="3" fill="#10B981"/>
          <defs>
            <linearGradient id="gradient6" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#FECDD3"/>
              <stop offset="1" stopColor="#FCA5A5"/>
            </linearGradient>
          </defs>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 200 200" className={combinedClasses} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="20" fill="#F3F4F6"/>
          <rect x="60" y="60" width="80" height="80" rx="10" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5"/>
          <text x="100" y="105" textAnchor="middle" fill="#9CA3AF" fontSize="14">No Image</text>
        </svg>
      );
  }
}