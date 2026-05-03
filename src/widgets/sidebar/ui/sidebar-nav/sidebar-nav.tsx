import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/features/localization';
import S from './sidebar-nav.module.css';

type SidebarNavProps = {
  onNavigate?: () => void;
};

export const SidebarNav = (props: SidebarNavProps) => {
  const { onNavigate } = props;

  const t = useTranslation();

  const navItems = [
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
        {navItems.map((item) => (
          <li key={item.to} className={S.item}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${S.link} ${isActive ? S.linkActive : ''}`}
              onClick={onNavigate}
            >
              <span className={S.label}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
