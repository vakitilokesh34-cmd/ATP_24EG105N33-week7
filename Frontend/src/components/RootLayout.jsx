import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../store/authStore";

function RootLayout() {
  const checkAuth = useAuth((state) => state.checkAuth);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  // Home page is full-width — no horizontal padding
  const isHome = location.pathname === "/";

  return (
    <div>
      <Header />
      <div className={isHome ? "" : "min-h-screen"}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default RootLayout;
