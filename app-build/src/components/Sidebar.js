'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import styles from './Sidebar.module.css';

const ICONS = {
    LayoutDashboard: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
    ),
    Map: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
    ),
    Bell: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    CloudRain: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" /><path d="M16 14v6" /><path d="M8 14v6" /><path d="M12 16v6" /></svg>
    ),
    Users: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Route: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg>
    ),
    BarChart3: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
    ),
};

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState(0);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        fetch('/api/alerts')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setActiveAlerts(data.active || 0); })
            .catch(() => { });
        const interval = setInterval(() => {
            fetch('/api/alerts')
                .then(r => r.ok ? r.json() : null)
                .then(data => { if (data) setActiveAlerts(data.active || 0); })
                .catch(() => { });
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Mobile Toggle */}
            <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {mobileOpen ? (
                        <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    ) : (
                        <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                    )}
                </svg>
            </button>

            {/* Overlay */}
            {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
                {/* Logo */}
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Image src="/logo.png" alt="FFEWS" width={32} height={32} style={{ objectFit: 'contain' }} />
                    </div>
                    {!collapsed && (
                        <div className={styles.logoText}>
                            <span className={styles.logoTitle}>FFEWS</span>
                            <span className={styles.logoSub}>Kenya Flood Alert</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = ICONS[item.icon];
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className={styles.navIcon}>
                                    {Icon && <Icon />}
                                    {item.icon === 'Bell' && activeAlerts > 0 && (
                                        <span className={styles.alertBadge}>{activeAlerts}</span>
                                    )}
                                </span>
                                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                                {isActive && <span className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Indicator */}
                {!collapsed && (
                    <div className={styles.statusCard}>
                        <div className={styles.statusDot} />
                        <div>
                            <div className={styles.statusTitle}>System Active</div>
                            <div className={styles.statusDesc}>Monitoring 8 zones</div>
                        </div>
                    </div>
                )}

                {/* Collapse Toggle */}
                <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {collapsed ? (
                            <polyline points="9 18 15 12 9 6" />
                        ) : (
                            <polyline points="15 18 9 12 15 6" />
                        )}
                    </svg>
                </button>
            </aside>
        </>
    );
}
