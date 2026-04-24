
  // --- Detect previously saved language ---
  const savedLang = localStorage.getItem("siteLang") || "en";

  function updateLanguageUI(lang) {
    const flag = document.getElementById("lang-flag");
    const text = document.getElementById("current-language");

    if (lang === "pt") {
      flag.src = "/images/pt.png";
      text.innerHTML = '<img id="lang-flag" src="/images/pt.png" width="24" height="16" style="margin-right:6px" />PT';
    } else {
      flag.src = "images/en.png";
      text.innerHTML = '<img id="lang-flag" src="images/en.png" width="24" height="16" style="margin-right:6px" />EN';
    }
  }

  // --- Apply saved language ---
  updateLanguageUI(savedLang);

  // --- Set click behavior for language options ---
  document.querySelectorAll(".lang-option").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedLang = e.currentTarget.getAttribute("data-lang");
      localStorage.setItem("siteLang", selectedLang);
      redirectToLanguage(selectedLang);
    });
  });

  // --- Handle redirection logic ---
  function redirectToLanguage(lang) {
    const currentPath = window.location.pathname;
    const isInPtFolder = currentPath.includes("/pt/");

    if (lang === "pt" && !isInPtFolder) {
      // Redirect to Portuguese version
      const newPath = "/pt" + currentPath;
      window.location.href = newPath;
    } else if (lang === "en" && isInPtFolder) {
      // Redirect back to English version
      const newPath = currentPath.replace("/pt/", "/");
      window.location.href = newPath;
    } else {
      window.location.reload();
    }
  }

  // --- Automatically redirect on page load based on saved language ---
  window.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    const isInPtFolder = currentPath.includes("/pt/");

    if (savedLang === "pt" && !isInPtFolder) {
      window.location.href = "/pt" + currentPath;
    } else if (savedLang === "en" && isInPtFolder) {
      window.location.href = currentPath.replace("/pt/", "/");
    }
  });
