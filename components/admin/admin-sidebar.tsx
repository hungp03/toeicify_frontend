'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminMenuItems } from '@/lib/constants';

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return false;
        if (path === '/admin') return pathname === '/admin';
        return pathname === path || pathname.startsWith(`${path}/`);
    };


    return (
        <div className="w-64 bg-white shadow-lg fixed h-full z-10">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            </div>
            <nav className="mt-4">
                {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                                }`}>
                            <Icon className="h-5 w-5" />
                            <span className="ml-3">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
