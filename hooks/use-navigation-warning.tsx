import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UseNavigationWarningProps {
  isTestActive: boolean;
  warningMessage?: string;
}

export const useNavigationWarning = ({ 
  isTestActive, 
  warningMessage = 'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.' 
}: UseNavigationWarningProps) => {
  const router = useRouter();
  const isTestActiveRef = useRef(isTestActive);

  // Update ref when prop changes
  useEffect(() => {
    isTestActiveRef.current = isTestActive;
  }, [isTestActive]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isTestActiveRef.current) {
      e.preventDefault();
      const message = 'Bạn có chắc muốn rời khỏi trang? Tiến trình làm bài sẽ bị mất.';
      e.returnValue = message;
      return message;
    }
  }, []);

  const safeNavigate = useCallback((url: string) => {
    if (isTestActiveRef.current) {
      const confirmLeave = window.confirm(warningMessage);
      if (confirmLeave) {
        isTestActiveRef.current = false;
        router.push(url);
      }
    } else {
      router.push(url);
    }
  }, [router, warningMessage]);

  const disableTestWarning = useCallback(() => {
    isTestActiveRef.current = false;
  }, []);

  useEffect(() => {
    // Override router methods
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;

    router.push = (...args: Parameters<typeof router.push>) => {
      if (isTestActiveRef.current) {
        const confirmLeave = window.confirm(warningMessage);
        if (!confirmLeave) {
          return Promise.resolve(false);
        }
        isTestActiveRef.current = false;
      }
      return originalPush.apply(router, args);
    };

    router.replace = (...args: Parameters<typeof router.replace>) => {
      if (isTestActiveRef.current) {
        const confirmLeave = window.confirm(warningMessage);
        if (!confirmLeave) {
          return Promise.resolve(false);
        }
        isTestActiveRef.current = false;
      }
      return originalReplace.apply(router, args);
    };

    router.back = () => {
      if (isTestActiveRef.current) {
        const confirmLeave = window.confirm(warningMessage);
        if (!confirmLeave) {
          return;
        }
        isTestActiveRef.current = false;
      }
      return originalBack.call(router);
    };

    // Handle beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle link clicks
    const handleLinkClick = (e: MouseEvent) => {
      if (!isTestActiveRef.current) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') || target.closest('[data-href]');

      if (link) {
        const href = (link as HTMLAnchorElement).href || link.getAttribute('data-href');

        if (href && (
          href.startsWith('/') ||
          href.startsWith('#') ||
          href.startsWith('?') ||
          href.startsWith(window.location.origin)
        )) {
          e.preventDefault();
          e.stopPropagation();

          const confirmLeave = window.confirm(warningMessage);

          if (confirmLeave) {
            isTestActiveRef.current = false;
            setTimeout(() => {
              if (href.startsWith(window.location.origin)) {
                window.location.href = href;
              } else {
                router.push(href);
              }
            }, 0);
          }
        }
      }
    };

    // Handle button clicks
    const handleButtonClick = (e: MouseEvent) => {
      if (!isTestActiveRef.current) return;

      const target = e.target as HTMLElement;
      const button = target.closest('button[onclick], button[data-navigate], [role="button"][onclick]');

      if (button && button !== e.currentTarget) {
        const onClick = button.getAttribute('onclick');
        const navigate = button.getAttribute('data-navigate');

        if (onClick?.includes('router.') || onClick?.includes('navigate') || navigate) {
          e.preventDefault();
          e.stopPropagation();

          const confirmLeave = window.confirm(warningMessage);

          if (confirmLeave) {
            isTestActiveRef.current = false;
            setTimeout(() => {
              (button as HTMLElement).click();
            }, 0);
          }
        }
      }
    };

    // Handle popstate (back/forward buttons)
    const handlePopState = (e: PopStateEvent) => {
      if (isTestActiveRef.current) {
        e.preventDefault();
        const confirmLeave = window.confirm(warningMessage);
        if (confirmLeave) {
          isTestActiveRef.current = false;
          window.history.go(-1);
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('click', handleButtonClick, true);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('click', handleButtonClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBeforeUnload, router, warningMessage]);

  return {
    safeNavigate,
    disableTestWarning
  };
};