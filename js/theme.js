// DeliGo — light/dark theme toggle with i18n labels.
// Persists across language switches via localStorage (siteLang-independent).
// Reads <html lang="..."> to pick localized "Light"/"Dark" button labels.

(function () {
  'use strict';

  var html = document.documentElement;
  var STORAGE_KEY = 'deligo-theme';

  // Localized labels. The label shown is the *target* of the next toggle:
  // in light mode the button reads "Dark" (clicking goes dark), and vice versa.
  var LABELS = {
    en: { light: 'Light', dark: 'Dark'   },
    pt: { light: 'Claro', dark: 'Escuro' },
    da: { light: 'Lys',   dark: 'Mørk'   },
    de: { light: 'Hell',  dark: 'Dunkel' },
    es: { light: 'Claro', dark: 'Oscuro' },
    fi: { light: 'Vaalea',dark: 'Tumma'  },
    fr: { light: 'Clair', dark: 'Sombre' },
    it: { light: 'Chiaro',dark: 'Scuro'  },
    nl: { light: 'Licht', dark: 'Donker' },
    no: { light: 'Lys',   dark: 'Mørk'   },
    sv: { light: 'Ljus',  dark: 'Mörk'   }
  };

  var langCode = (html.getAttribute('lang') || 'en').split('-')[0].toLowerCase();
  var L = LABELS[langCode] || LABELS.en;

  function isDark() {
    return html.getAttribute('data-theme') === 'dark';
  }

  function setTheme(next) {
    if (next === 'dark') { html.setAttribute('data-theme', 'dark'); }
    else { html.removeAttribute('data-theme'); }
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}

    var desktop = document.getElementById('themeToggleDesktop');
    var mobile  = document.getElementById('themeToggleMobile');

    // Button shows the target state — i.e. clicking it switches to the *other* mode.
    var nextLabel = (next === 'dark') ? L.light : L.dark;
    var nextIcon  = (next === 'dark') ? 'sun'   : 'moon';

    var desktopHtml = '<i class="fa-regular fa-' + nextIcon + '"></i>'
                    + '<span class="ms-1 d-none d-md-inline">' + nextLabel + '</span>';
    var mobileHtml  = '<i class="fa-regular fa-' + nextIcon + '"></i>';

    if (desktop) desktop.innerHTML = desktopHtml;
    if (mobile)  mobile.innerHTML  = mobileHtml;
  }

  function toggle() {
    setTheme(isDark() ? 'light' : 'dark');
  }

  // Apply saved theme on load (persists across language navigations on same origin).
  var saved = 'light';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'light'; } catch (e) {}
  setTheme(saved);

  function bind() {
    ['themeToggleDesktop', 'themeToggleMobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', toggle);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
