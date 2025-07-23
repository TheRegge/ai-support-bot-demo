interface StoreLogoProps {
  className?: string;
  /** 
   * Background the logo will appear on:
   * - 'light': Light background (white/gray) - uses dark text
   * - 'dark': Dark background - uses light text  
   */
  background?: 'light' | 'dark';
}

export function StoreLogo({ className = "h-10 sm:h-16 lg:h-20", background = 'light' }: StoreLogoProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
      {/* Logo Icon - Rounded square with infinity cable */}
      <div className="shrink-0">
        <svg 
          viewBox="0 0 100 100" 
          className={className}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="TechStore infinity cable logo"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EBF4FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#DBEAFE" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Rounded square background */}
          <rect x="5" y="5" width="90" height="90" rx="18" fill="url(#logoGradient)" stroke="#E0E7FF" strokeWidth="1" />
          
          {/* Simple, clean target icon with blue gradient */}
          <g transform="translate(50, 50)">
            {/* Outer circle - lightest blue */}
            <circle cx="0" cy="0" r="25" 
                    stroke="#93C5FD" 
                    strokeWidth="2.5" 
                    fill="none" />
            
            {/* Middle circle - medium blue */}
            <circle cx="0" cy="0" r="17" 
                    stroke="#3B82F6" 
                    strokeWidth="2.5" 
                    fill="none" />
            
            {/* Inner circle - darker blue */}
            <circle cx="0" cy="0" r="9" 
                    stroke="#1E40AF" 
                    strokeWidth="2.5" 
                    fill="none" />
            
            {/* Center dot - darkest blue */}
            <circle cx="0" cy="0" r="3" 
                    fill="#1E3A8A" />
          </g>
        </svg>
      </div>
      
      {/* Typography */}
      <div className="flex items-center min-w-0">
        <h1 className={`text-lg sm:text-2xl lg:text-4xl font-bold tracking-tight truncate ${
          background === 'dark' 
            ? 'text-white' 
            : 'text-gray-800'
        }`}>
          Tech<span className={`${
            background === 'dark' 
              ? 'text-blue-200' 
              : 'text-blue-600'
          }`}>Store</span>
        </h1>
      </div>
    </div>
  );
}