export function fixMobileHeight() {
  const setHeight = () => {
    let height = window.innerHeight;

    // Nokia G-series / faulty WebView fix
    if (navigator.userAgent.toLowerCase().includes("nokia")) {
      height = screen.height; // screen.height is stable on Nokia
    }

    const vh = height * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  setHeight();
  window.addEventListener("resize", setHeight);
}
