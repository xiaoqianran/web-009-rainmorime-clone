import { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApp } from './AppContext';
import { scrollToSectionWithRetry } from '../lib/scrollToSection';

interface TransitionContextValue {
  navigateTo: (url: string, options?: { scroll?: boolean }) => void;
  setBackOverride: (handler: (() => void) | null) => void;
  handleBack: () => void;
  isDetailOpen: () => boolean;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigateTo: () => {},
  setBackOverride: () => {},
  handleBack: () => {},
  isDetailOpen: () => false,
});

export const useTransition = () => useContext(TransitionContext);

interface TransitionProviderProps {
  children: React.ReactNode;
  pageWrapperRef: React.RefObject<HTMLDivElement>;
}

const SLIDE_IN_KF: Keyframe[] = [
  { opacity: 0, transform: 'translateX(100%)' },
  { opacity: 1, transform: 'translateX(0)' },
];
const SLIDE_IN_OPTS: KeyframeAnimationOptions = {
  duration: 1800,
  easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  fill: 'both',
};

const SLIDE_OUT_KF: Keyframe[] = [
  { opacity: 1, transform: 'translateX(0)' },
  { opacity: 0, transform: 'translateX(100%)' },
];
const SLIDE_OUT_OPTS: KeyframeAnimationOptions = {
  duration: 500,
  easing: 'ease-in',
  fill: 'forwards',
};

const DIAG_EXPAND_KF: Keyframe[] = [
  { clipPath: 'inset(4% 100% 100% 4%)' },
  { clipPath: 'inset(0 0 0 0)' },
];
const DIAG_EXPAND_OPTS: KeyframeAnimationOptions = {
  duration: 900,
  easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  fill: 'both',
};

const DIAG_COLLAPSE_KF: Keyframe[] = [
  { clipPath: 'inset(0 0 0 0)' },
  { clipPath: 'inset(100% 0 0 100%)' },
];
const DIAG_COLLAPSE_OPTS: KeyframeAnimationOptions = {
  duration: 400,
  easing: 'ease-in',
  fill: 'forwards',
};

const checkMobile = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

const normalizePath = (path: string) => {
  if (!path) return '/';
  const trimmed = path.split('?')[0].replace(/\/$/, '');
  return trimmed === '' ? '/' : trimmed;
};

const splitNavUrl = (url: string): { pathname: string; hash: string } => {
  const [rawPath, rawHash = ''] = url.split('#');
  return {
    pathname: normalizePath(rawPath || '/'),
    hash: rawHash.replace(/^#/, ''),
  };
};

const toRouterDest = (pathname: string, hash?: string) => {
  if (hash) return { pathname, hash };
  return pathname;
};

export function TransitionProvider({ children, pageWrapperRef }: TransitionProviderProps) {
  const router = useRouter();
  const { retractColumns, expandColumns } = useApp();
  const isTransitioning = useRef(false);
  const queuedNav = useRef<{ url: string; options?: { scroll?: boolean } } | null>(null);
  const backOverrideRef = useRef<(() => void) | null>(null);
  const activeAnim = useRef<Animation | null>(null);
  const navigateToRef = useRef<((url: string, options?: { scroll?: boolean }) => void) | null>(null);
  const navGen = useRef(0);

  const cancelActiveAnim = () => {
    if (activeAnim.current) {
      activeAnim.current.cancel();
      activeAnim.current = null;
    }
  };

  const processQueue = () => {
    if (queuedNav.current && navigateToRef.current) {
      const nextNav = queuedNav.current;
      queuedNav.current = null;
      setTimeout(() => {
        navigateToRef.current?.(nextNav.url, nextNav.options);
      }, 0);
    }
  };

  const navigateTo = useCallback((url: string, options?: { scroll?: boolean }) => {
    const { pathname: destPath, hash: destHash } = splitNavUrl(url);
    const currentPath = normalizePath(router.pathname);

    // Already on /content (or any same path): hash-only — scroll, no slide, no lock.
    if (currentPath === destPath && destHash) {
      router.push(toRouterDest(destPath, destHash), undefined, { scroll: false, ...options });
      scrollToSectionWithRetry(destHash);
      return;
    }

    if (isTransitioning.current) {
      queuedNav.current = { url, options };
      return;
    }

    const wrapper = pageWrapperRef.current;
    if (!wrapper) {
      router.push(toRouterDest(destPath, destHash || undefined), undefined, { scroll: false, ...options });
      if (destHash) scrollToSectionWithRetry(destHash);
      return;
    }

    const myGen = ++navGen.current;
    const isStale = () => navGen.current !== myGen;

    const pathNow = () => {
      if (typeof window === 'undefined') return normalizePath(router.pathname);
      const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
      let path = window.location.pathname;
      if (base && path.startsWith(base)) path = path.slice(base.length) || '/';
      return normalizePath(path);
    };

    const finishLock = () => {
      if (isStale()) return;
      isTransitioning.current = false;
      if (pathNow() === '/') {
        expandColumns();
      }
      processQueue();
    };

    isTransitioning.current = true;
    queuedNav.current = null;
    cancelActiveAnim();
    const currentlyHome = currentPath === '/';
    const goingHome = destPath === '/';

    const pushThen = (target: string, cb: () => void) => {
      const { pathname, hash } = splitNavUrl(target);
      let settled = false;
      let tid = 0;
      const settle = () => {
        if (settled || isStale()) return;
        settled = true;
        router.events.off('routeChangeComplete', onComplete);
        router.events.off('routeChangeError', onError);
        window.clearTimeout(tid);
        if (hash) scrollToSectionWithRetry(hash);
        cb();
      };
      const onComplete = () => settle();
      const onError = () => settle();
      router.events.on('routeChangeComplete', onComplete);
      router.events.on('routeChangeError', onError);
      tid = window.setTimeout(settle, 2500);
      router
        .push(toRouterDest(pathname, hash || undefined), undefined, { scroll: false, ...options })
        .catch(() => settle());
    };

    const wapiSlideIn = () => {
      if (isStale() || !pageWrapperRef.current) {
        finishLock();
        return;
      }
      const el = pageWrapperRef.current;
      const anim = el.animate(SLIDE_IN_KF, SLIDE_IN_OPTS);
      activeAnim.current = anim;
      const done = () => {
        if (isStale()) return;
        el.style.opacity = '';
        el.style.transform = '';
        try { anim.cancel(); } catch {}
        activeAnim.current = null;
        finishLock();
      };
      anim.finished.then(done).catch(done);
    };

    const mobile = checkMobile();

    const wapiDiagExpand = () => {
      if (isStale() || !pageWrapperRef.current) {
        finishLock();
        return;
      }
      const el = pageWrapperRef.current;
      el.style.opacity = '';
      const anim = el.animate(DIAG_EXPAND_KF, DIAG_EXPAND_OPTS);
      activeAnim.current = anim;
      const done = () => {
        if (isStale()) return;
        el.style.clipPath = '';
        el.style.transform = '';
        try { anim.cancel(); } catch {}
        activeAnim.current = null;
        finishLock();
      };
      anim.finished.then(done).catch(done);
    };

    if (currentlyHome && !goingHome) {
      if (mobile) {
        retractColumns(() => {});
        const anim = wrapper.animate(DIAG_COLLAPSE_KF, DIAG_COLLAPSE_OPTS);
        activeAnim.current = anim;
        const afterCollapse = () => {
          if (isStale()) return;
          try { anim.cancel(); } catch {}
          activeAnim.current = null;
          wrapper.style.clipPath = 'inset(100%)';
          pushThen(url, wapiDiagExpand);
        };
        anim.finished.then(afterCollapse).catch(afterCollapse);
      } else {
        retractColumns(() => {
          if (isStale()) return;
          wrapper.style.opacity = '0';
          pushThen(url, wapiSlideIn);
        });
      }
    } else if (!currentlyHome && goingHome) {
      if (mobile) {
        const anim = wrapper.animate(DIAG_COLLAPSE_KF, DIAG_COLLAPSE_OPTS);
        activeAnim.current = anim;
        const afterCollapse = () => {
          if (isStale()) return;
          try { anim.cancel(); } catch {}
          activeAnim.current = null;
          wrapper.style.clipPath = 'inset(100%)';
          pushThen('/', () => {
            expandColumns();
            wapiDiagExpand();
          });
        };
        anim.finished.then(afterCollapse).catch(afterCollapse);
      } else {
        const anim = wrapper.animate(SLIDE_OUT_KF, SLIDE_OUT_OPTS);
        activeAnim.current = anim;
        const afterOut = () => {
          if (isStale()) return;
          try { anim.cancel(); } catch {}
          activeAnim.current = null;
          wrapper.style.opacity = '0';
          pushThen('/', () => {
            wrapper.style.opacity = '';
            expandColumns(() => {
              finishLock();
            });
          });
        };
        anim.finished.then(afterOut).catch(afterOut);
      }
    } else {
      const outAnim = wrapper.animate(SLIDE_OUT_KF, SLIDE_OUT_OPTS);
      activeAnim.current = outAnim;
      const afterOut = () => {
        if (isStale()) return;
        try { outAnim.cancel(); } catch {}
        activeAnim.current = null;
        wrapper.style.opacity = '0';
        pushThen(url, wapiSlideIn);
      };
      outAnim.finished.then(afterOut).catch(afterOut);
    }
  }, [router, pageWrapperRef, retractColumns, expandColumns]);

  useEffect(() => {
    navigateToRef.current = navigateTo;
  }, [navigateTo]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const pathPart = url.split('#')[0];
      const stripped = (base && pathPart.startsWith(base)) ? (pathPart.slice(base.length) || '/') : pathPart;
      if (normalizePath(stripped) === '/' && !isTransitioning.current) {
        expandColumns();
      }
      const hash = url.includes('#') ? url.split('#')[1] : '';
      if (hash) scrollToSectionWithRetry(hash);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, expandColumns]);

  const setBackOverride = useCallback((handler: (() => void) | null) => {
    backOverrideRef.current = handler;
  }, []);

  const handleBack = useCallback(() => {
    if (backOverrideRef.current) {
      backOverrideRef.current();
      return;
    }
    const isHome = router.pathname === '/';
    if (!isHome) {
      navigateTo('/');
    }
  }, [router.pathname, navigateTo]);

  const isDetailOpen = useCallback(() => {
    return backOverrideRef.current !== null;
  }, []);

  return (
    <TransitionContext.Provider value={{ navigateTo, setBackOverride, handleBack, isDetailOpen }}>
      {children}
    </TransitionContext.Provider>
  );
}
