"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, ArrowLeftRight, Box, Tag, Users, FileText, Settings } from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Sales', href: '/sales', icon: Tag },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Expenses', href: '/expenses', icon: ReceiptText },
  { name: 'Partners', href: '/partners', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-zinc-950 text-zinc-300 md:block md:w-64 md:shrink-0 md:flex-col min-h-screen">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold text-white tracking-widest uppercase">Unchaptrd</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center rounded-md px-3 py-2 text-sm font-medium
                  ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
                `}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
