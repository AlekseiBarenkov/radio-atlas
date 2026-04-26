import { useTranslation } from '@features/localization';
import { NavLink } from 'react-router-dom';
import S from './sidebar-nav.module.css';

type SidebarNavItem = {
  to: string;
  label: string;
  end?: boolean;
};

export const SidebarNav = () => {
  const t = useTranslation();

  const sidebarNavItems: SidebarNavItem[] = [
    {
      to: '/',
      label: t.sidebar.home,
      end: true,
    },
    {
      to: '/discover',
      label: t.sidebar.discover,
    },
    {
      to: '/favorites',
      label: t.sidebar.favorites,
    },
  ];

  return (
    <nav className={S.nav} aria-label={t.sidebar.navAriaLabel}>
      <ul className={S.list}>
        {sidebarNavItems.map((item) => (
          <li key={item.to} className={S.item}>
            <NavLink to={item.to} end={item.end}>
              {({ isActive }) => (
                <span className={`${S.link} ${isActive ? S.linkActive : ''}`}>
                  <span className={`${S.marker} ${isActive ? S.markerActive : ''}`} aria-hidden="true">
                    •
                  </span>

                  <span className={S.label}>{item.label}</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
