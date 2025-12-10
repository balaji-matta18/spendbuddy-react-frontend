export function fixMobileHeight() {
  const set = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  set();
  window.addEventListener("resize", set);
}
