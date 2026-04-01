export const auth = {
  isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
  login: () => localStorage.setItem('isLoggedIn', 'true'),
  logout: () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/screens/dang_nhap.html';
  },
  checkAccess: (protectedPaths = []) => {
    const path = window.location.pathname;
    const isProtected = protectedPaths.some(p => path.includes(p));

    if (isProtected && !auth.isLoggedIn()) {
      // Small toast simulation - will be handled in layout
      sessionStorage.setItem('showToast', 'Need to sign in to use this feature');
      window.location.href = '/screens/dang_nhap.html';
      return false;
    }
    return true;
  }
};
