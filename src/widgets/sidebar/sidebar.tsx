import { LanguageSwitcher, useTranslation } from '@/features/localization';
import S from './sidebar.module.css';
import { SidebarNav } from './ui/sidebar-nav/sidebar-nav';
import { ThemeSwitcher } from '@/features/theme';

export const Sidebar = () => {
  const t = useTranslation();

  return (
    <section className={S.sidebar} aria-label="Sidebar">
      <header className={S.header}>
        <h2 className={S.title}>{t.sidebar.title}</h2>
        <p className={S.subtitle}>{t.sidebar.subtitle}</p>
      </header>

      <div className={S.nav}>
        <SidebarNav />
      </div>

      <ThemeSwitcher />
      <LanguageSwitcher />
    </section>
  );
};
