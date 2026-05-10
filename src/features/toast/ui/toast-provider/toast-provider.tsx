import { createPortal } from 'react-dom';
import { IconButton } from '@/shared/ui';
import { useToastStore } from '../../model/toast-store';
import S from './toast-provider.module.css';
import { useTranslation } from '@/features/localization';
import { X } from 'lucide-react';

type ToastProviderProps = {
  hasMiniPlayer: boolean;
};

export const ToastProvider = (props: ToastProviderProps) => {
  const { hasMiniPlayer } = props;

  const t = useTranslation();

  const toasts = useToastStore((state) => state.toasts);
  const closeToast = useToastStore((state) => state.actions.closeToast);

  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className={S.viewport}
      data-has-mini-player={hasMiniPlayer || undefined}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className={S.toast} data-tone={toast.tone}>
          <div className={S.content}>
            <div className={S.title}>{toast.title}</div>

            {toast.description && <div className={S.description}>{toast.description}</div>}
          </div>

          <IconButton className={S.close} onClick={() => closeToast(toast.id)} aria-label={t.toast.close}>
            <X size={16} aria-hidden="true" />
          </IconButton>
        </div>
      ))}
    </div>,
    document.body,
  );
};
