import { Outlet } from 'react-router-dom';
import { MiniPlayer } from '@widgets/mini-player/mini-player';
import { Sidebar } from '@widgets/sidebar/sidebar';
import S from './app-layout.module.css';
import { PlayerAudioBridge } from '@/features/player';

export const AppLayout = () => {
  return (
    <div className={S.layout}>
      <aside className={S.sidebar}>
        <Sidebar />
      </aside>

      <main className={S.main}>
        <Outlet />
      </main>

      <div className={S.player}>
        <MiniPlayer />
      </div>

      <PlayerAudioBridge />
    </div>
  );
};
