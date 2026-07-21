import Image from 'next/image';

import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'full' | 'mark';
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function BrandLogo({
  variant = 'full',
  className,
  priority = false,
  alt = 'SignaCon CRM',
}: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <Image
        src="/brand/mark-signacon.svg"
        width={57}
        height={57}
        alt={alt}
        priority={priority}
        className={cn('shrink-0', className)}
      />
    );
  }

  return (
    <span
      className={cn('relative inline-flex aspect-[322.05/56.52]', className)}
    >
      <Image
        src="/brand/logo-signacon.svg"
        fill
        sizes="(max-width: 768px) 180px, 200px"
        alt={alt}
        priority={priority}
        className="brand-logo-light object-contain"
      />
      <Image
        src="/brand/logo-signacon-dark.svg"
        fill
        sizes="(max-width: 768px) 180px, 200px"
        alt=""
        aria-hidden="true"
        priority={priority}
        className="brand-logo-dark object-contain"
      />
    </span>
  );
}
