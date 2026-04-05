import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolls to the top of the window on route change
    window.scrollTo(0, 0);
  }, [pathname]); // Reruns when the pathname changes

  return null; // This component doesn't render anything, it just handles the side effect
}

export default ScrollToTop;
