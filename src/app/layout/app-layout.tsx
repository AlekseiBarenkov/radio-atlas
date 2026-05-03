import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MiniPlayer } from '@widgets/mini-player/mini-player';
import { Sidebar } from '@widgets/sidebar/sidebar';
import { MobileSidebarDrawer } from './mobile-sidebar-drawer';
import S from './app-layout.module.css';
import { PlayerAudioBridge, PlayerToastBridge, usePlayerUiState } from '@/features/player';
import { ToastProvider } from '@/features/toast';
import { useTranslation } from '@/features/localization';
import { useResponsive } from '@/app/providers/responsive';

export const AppLayout = () => {
  const { isMobile } = useResponsive();
  const { isIdle } = usePlayerUiState();
  const t = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={S.layout}>
      {isMobile && (
        <header className={S.mobileHeader}>
          <button
            className={S.menuButton}
            type="button"
            aria-label={t.sidebar.openMenu}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            ☰
          </button>

          <span className={S.mobileTitle}>{t.sidebar.title}</span>
        </header>
      )}

      {!isMobile && (
        <aside className={S.sidebar}>
          <Sidebar />
        </aside>
      )}

      {isMobile && <MobileSidebarDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />}

      <main className={S.main}>
        <Outlet />
      </main>

      {!isIdle && (
        <div className={S.player}>
          <MiniPlayer />
        </div>
      )}

      <ToastProvider hasMiniPlayer={!isIdle} />

      <PlayerToastBridge />
      <PlayerAudioBridge />
    </div>
  );
};
