import S from '../../recently-played.module.css';

type RecentlyPlayedHeaderProps = {
  isClearVisible: boolean;
  onClear: () => void;
};

export const RecentlyPlayedHeader = (props: RecentlyPlayedHeaderProps) => {
  const { isClearVisible, onClear } = props;

  return (
    <header className={S.header}>
      <div className={S.titleBlock}>
        <h2 className={S.title}>Recently played</h2>
        <p className={S.description}>Станции, которые вы недавно запускали</p>
      </div>

      {isClearVisible && (
        <button className={S.clearButton} type="button" onClick={onClear}>
          Clear
        </button>
      )}
    </header>
  );
};
