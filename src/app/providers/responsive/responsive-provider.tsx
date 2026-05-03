import { useEffect, useState, type PropsWithChildren } from 'react';
import { ResponsiveContext } from './responsive-context';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

const getIsMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
};

export const ResponsiveProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  return <ResponsiveContext.Provider value={{ isMobile }}>{children}</ResponsiveContext.Provider>;
};
