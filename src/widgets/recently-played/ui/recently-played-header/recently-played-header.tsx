import { useTranslation } from '@/features/localization';
import S from '../../recently-played.module.css';

type RecentlyPlayedHeaderProps = {
  isClearVisible: boolean;
  onClear: () => void;
};

export const RecentlyPlayedHeader = (props: RecentlyPlayedHeaderProps) => {
  const { isClearVisible, onClear } = props;

  const t = useTranslation();

  return (
    <header className={S.header}>
      <div className={S.titleBlock}>
        <h2 className={S.title}>{t.recentlyPlayed.title}</h2>
        <p className={S.description}>{t.recentlyPlayed.description}</p>
      </div>

      {isClearVisible && (
        <button className={S.clearButton} type="button" onClick={onClear}>
          {t.recentlyPlayed.clear}
        </button>
      )}
    </header>
  );
};
