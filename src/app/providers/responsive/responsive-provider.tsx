import { useEffect, useState, type PropsWithChildren } from 'react';
import { ResponsiveContext, type ResponsiveContextValue } from './responsive-context';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';
const TABLET_MEDIA_QUERY = '(min-width: 769px) and (max-width: 1024px)';

const getResponsiveState = (): ResponsiveContextValue => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }

  const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  const isTablet = window.matchMedia(TABLET_MEDIA_QUERY).matches;

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
};

export const ResponsiveProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [responsiveState, setResponsiveState] = useState(getResponsiveState);

  useEffect(() => {
    const mobileMediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
    const tabletMediaQueryList = window.matchMedia(TABLET_MEDIA_QUERY);

    const handleChange = () => {
      setResponsiveState(getResponsiveState());
    };

    mobileMediaQueryList.addEventListener('change', handleChange);
    tabletMediaQueryList.addEventListener('change', handleChange);

    return () => {
      mobileMediaQueryList.removeEventListener('change', handleChange);
      tabletMediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  return <ResponsiveContext.Provider value={responsiveState}>{children}</ResponsiveContext.Provider>;
};
