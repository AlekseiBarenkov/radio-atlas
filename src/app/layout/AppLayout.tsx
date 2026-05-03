import { Outlet } from 'react-router-dom';
import { MiniPlayer } from '@widgets/mini-player/mini-player';
import { Sidebar } from '@widgets/sidebar/sidebar';
import S from './app-layout.module.css';
import { PlayerAudioBridge, usePlayerUiState } from '@/features/player';

export const AppLayout = () => {
  const { isIdle } = usePlayerUiState();

  return (
    <div className={S.layout}>
      <aside className={S.sidebar}>
        <Sidebar />
      </aside>

      <main className={S.main}>
        <Outlet />
      </main>

      {!isIdle && (
        <div className={S.player}>
          <MiniPlayer />
        </div>
      )}

      <PlayerAudioBridge />
    </div>
  );
};
