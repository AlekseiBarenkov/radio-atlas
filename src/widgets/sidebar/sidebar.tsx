import { LanguageSwitcher, useTranslation } from '@/features/localization';
import S from './sidebar.module.css';
import { SidebarNav } from './ui/sidebar-nav/sidebar-nav';
import { ThemeSwitcher } from '@/features/theme';
import { SidebarControl } from './ui/sidebar-control';
import { useResponsive } from '@/app/providers/responsive';

type SidebarProps = {
  onNavigate?: () => void;
};

export const Sidebar = (props: SidebarProps) => {
  const { onNavigate } = props;

  const t = useTranslation();
  const { isMobile } = useResponsive();

  return (
    <section className={S.sidebar} aria-label={t.sidebar.ariaLabel}>
      {!isMobile && (
        <header className={S.header}>
          <h2 className={S.title}>{t.sidebar.title}</h2>
          <p className={S.subtitle}>{t.sidebar.subtitle}</p>
        </header>
      )}

      <div className={S.nav}>
        <SidebarNav onNavigate={onNavigate} />
      </div>

      <SidebarControl>
        <ThemeSwitcher />
      </SidebarControl>

      <SidebarControl height="player">
        <LanguageSwitcher />
      </SidebarControl>
    </section>
  );
};
