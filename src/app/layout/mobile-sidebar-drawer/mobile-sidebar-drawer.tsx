import { useEffect, useState } from 'react';
import { Sidebar } from '@widgets/sidebar/sidebar';
import { useTranslation } from '@/features/localization';
import S from './mobile-sidebar-drawer.module.css';

type MobileSidebarDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileSidebarDrawer = (props: MobileSidebarDrawerProps) => {
  const { isOpen, onClose } = props;

  const t = useTranslation();

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const close = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (!isClosing) {
      return;
    }

    setIsClosing(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={S.drawer}
      data-closing={isClosing || undefined}
      role="presentation"
      onAnimationEnd={handleAnimationEnd}
    >
      <button className={S.overlay} type="button" aria-label={t.sidebar.closeMenu} onClick={close} />

      <aside className={S.panel} aria-label={t.sidebar.ariaLabel}>
        <div className={S.header}>
          <span>{t.sidebar.title}</span>

          <button className={S.close} type="button" aria-label={t.sidebar.closeMenu} onClick={close}>
            ×
          </button>
        </div>

        <div className={S.content}>
          <Sidebar onNavigate={close} />
        </div>
      </aside>
    </div>
  );
};
