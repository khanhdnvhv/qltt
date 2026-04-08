import { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTopButton } from "./ui/ScrollToTop";
import { LoadingScreen } from "./ui/LoadingScreen";
import { NetworkStatus } from "./ui/NetworkStatus";
import { OfflinePage } from "./ui/OfflinePage";

// Route name mapping for screen reader announcements
const routeNames: Record<string, string> = {
  "/": "Trang chủ",
  "/courses": "Khóa học",
  "/roadmap": "Lộ trình học",
  "/community": "Cộng đồng",
  "/blog": "Blog",
  "/about": "Giới thiệu",
  "/dashboard": "Dashboard",
  "/profile": "Hồ sơ",
  "/quiz": "Luyện tập",
  "/mock-test": "Thi thử",
  "/flashcards": "Flashcards",
  "/leaderboard": "Bảng xếp hạng",
  "/study-groups": "Nhóm học tập",
  "/notifications": "Thông báo",
};

export function Layout() {
  const location = useLocation();
  const [routeAnnouncement, setRouteAnnouncement] = useState("");
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const pageName = routeNames[location.pathname] || "Trang";
    setRouteAnnouncement(`Da chuyen den ${pageName}`);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] dark:bg-background">
      {/* Screen reader route announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {routeAnnouncement}
      </div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-[15px] focus:shadow-lg"
        style={{ fontWeight: 600 }}
      >
        Chuyen den noi dung chinh
      </a>
      <NetworkStatus />
      <Header />
      <main id="main-content" className="flex-1" role="main">
        {!isOnline ? (
          <OfflinePage />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        )}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
