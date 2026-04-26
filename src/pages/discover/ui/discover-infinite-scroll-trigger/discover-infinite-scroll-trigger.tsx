import { useEffect, useRef } from 'react';
import S from './discover-infinite-scroll-trigger.module.css';

type DiscoverInfiniteScrollTriggerProps = {
  isEnabled: boolean;
  onLoadMore: () => void;
};

export const DiscoverInfiniteScrollTrigger = (props: DiscoverInfiniteScrollTriggerProps) => {
  const { isEnabled, onLoadMore } = props;

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const shouldSkipIntersectionRef = useRef(true);

  useEffect(() => {
    const triggerElement = triggerRef.current;

    if (!triggerElement || !isEnabled) {
      return;
    }

    hasTriggeredRef.current = false;
    shouldSkipIntersectionRef.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          shouldSkipIntersectionRef.current = false;
          return;
        }

        if (shouldSkipIntersectionRef.current) {
          shouldSkipIntersectionRef.current = false;
          return;
        }

        if (hasTriggeredRef.current) {
          return;
        }

        hasTriggeredRef.current = true;
        onLoadMore();
      },
      {
        root: null,
        rootMargin: '240px 0px',
        threshold: 0,
      },
    );

    observer.observe(triggerElement);

    return () => {
      observer.disconnect();
    };
  }, [isEnabled, onLoadMore]);

  return <div ref={triggerRef} className={S.trigger} aria-hidden="true" />;
};
