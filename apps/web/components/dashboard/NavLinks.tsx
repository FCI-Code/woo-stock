'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Visão Geral', href: '/dashboard' },
  { label: 'Pedidos', href: '/dashboard/orders' },
  { label: 'Envios', href: '/dashboard/shipments' },
  { label: 'Configurações', href: '/dashboard/settings' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive =
          href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`text-xs font-medium py-2 px-3 transition-colors ${
              isActive
                ? 'text-orange-600 border-l-2 border-orange-500 bg-orange-50/50'
                : 'text-slate-500 hover:text-slate-800 border-l-2 border-transparent'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
