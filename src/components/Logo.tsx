export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="100" cy="100" r="100" fill="#E5D3B3" />
      
      {/* Outer Oval Border */}
      <rect x="35" y="25" width="130" height="150" rx="55" ry="75" fill="none" stroke="#5D4037" strokeWidth="6" />
      
      {/* Monogram M/A */}
      <g fill="none" stroke="#5D4037" strokeWidth="14" strokeLinejoin="miter" strokeMiterlimit="4">
        {/* Left Arch */}
        <path d="M 100 55 C 75 45, 60 65, 60 90 L 60 125 C 60 135, 55 140, 45 140" />
        
        {/* Right Arch */}
        <path d="M 100 55 C 125 45, 140 65, 140 90 L 140 125 C 140 135, 145 140, 155 140" />
        
        {/* Center Pillar */}
        <path d="M 100 55 L 100 115" />
        
        {/* Crossbar */}
        <path d="M 60 115 L 140 115" />
        
        {/* Left Inner Leg */}
        <path d="M 100 115 C 95 130, 85 135, 70 140" />
        
        {/* Right Inner Leg */}
        <path d="M 100 115 C 105 130, 115 135, 130 140" />
      </g>
    </svg>
  );
}
