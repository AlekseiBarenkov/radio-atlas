import S from './discover-load-more-button.module.css';

type DiscoverLoadMoreButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const DiscoverLoadMoreButton = (props: DiscoverLoadMoreButtonProps) => {
  const { onClick, disabled = false } = props;

  return (
    <button className={S.button} type="button" onClick={onClick} disabled={disabled}>
      Load more
    </button>
  );
};
