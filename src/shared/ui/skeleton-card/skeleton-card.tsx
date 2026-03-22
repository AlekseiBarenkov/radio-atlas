import { Skeleton } from '@shared/ui';
import S from './skeleton-card.module.css';

export const SkeletonCard = () => {
  return (
    <div className={S.card}>
      <div className={S.logo}>
        <Skeleton width={56} height={56} borderRadius={12} />
      </div>

      <div className={S.content}>
        <Skeleton width="62%" height={24} borderRadius={10} />

        <div className={S.row}>
          <Skeleton width={96} height={16} borderRadius={8} />
          <Skeleton width={88} height={16} borderRadius={8} />
        </div>

        <div className={S.row}>
          <Skeleton width={84} height={16} borderRadius={8} />
          <Skeleton width={90} height={16} borderRadius={8} />
        </div>

        <div className={S.actions}>
          <Skeleton width={96} height={36} borderRadius={10} />
        </div>
      </div>
    </div>
  );
};
