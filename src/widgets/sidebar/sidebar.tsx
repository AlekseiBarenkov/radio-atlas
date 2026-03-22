import S from './sidebar.module.css';
import { SidebarNav } from './ui/sidebar-nav/sidebar-nav';

export const Sidebar = () => {
  return (
    <section className={S.sidebar} aria-label="Sidebar">
      <header className={S.header}>
        <h2 className={S.title}>Radio Atlas</h2>
        <p className={S.subtitle}>Browse stations and manage favorites</p>
      </header>

      <div className={S.nav}>
        <SidebarNav />
      </div>
    </section>
  );
};
