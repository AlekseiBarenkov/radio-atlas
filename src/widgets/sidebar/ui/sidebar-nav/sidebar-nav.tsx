import { NavLink } from 'react-router-dom';
import S from './sidebar-nav.module.css';

type SidebarNavItem = {
  to: string;
  label: string;
  end?: boolean;
};

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    to: '/',
    label: 'Home',
    end: true,
  },
  {
    to: '/discover',
    label: 'Discover',
  },
  {
    to: '/favorites',
    label: 'Favorites',
  },
];

export const SidebarNav = () => {
  return (
    <nav className={S.nav} aria-label="Sidebar navigation">
      <ul className={S.list}>
        {SIDEBAR_NAV_ITEMS.map((item) => (
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
