// DeliGo — pre-render boot script.
// Loaded synchronously in <head> before any rendering.
// Must stay tiny and side-effect-free except for setting <html> attributes.
//
// Currently:
//   - Applies saved dark theme to prevent FOUC (flash of unstyled content).
//
// Phase 3 will extend this to apply the saved language hint early.

(function () {
  try {
    var savedTheme = localStorage.getItem('deligo-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) { /* private mode / no storage — fall through */ }
})();
