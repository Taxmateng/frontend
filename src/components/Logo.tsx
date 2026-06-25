import Image from "next/image";

// Taxmate brand mark. The seal already has a transparent, circular background.
export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/taxmate-logo.png"
      alt="Taxmate"
      width={size}
      height={size}
      className={`rounded-full object-contain ${className}`}
      priority
    />
  );
}
