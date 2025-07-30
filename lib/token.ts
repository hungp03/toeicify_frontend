export const getAccessTokenFromStorage = () => {
    try {
      const raw = localStorage.getItem('toeic-auth-storage');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.state?.accessToken || null;
    } catch {
      return null;
    }
  };
  