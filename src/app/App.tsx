import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/auth/AuthContext";
import { AppDataProvider } from "./context/AppDataContext";
import { ThemeProvider } from "./components/ThemeContext";
import { ReducedMotionProvider } from "./components/ReducedMotionContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MotionConfig } from "motion/react";
import { PWAProvider } from "./components/PWAProvider";
import { PerformanceMonitor } from "./components/ui/PerformanceMonitor";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ReducedMotionProvider>
          <MotionConfig reducedMotion="user">
            <AuthProvider>
              <AppDataProvider>
              <RouterProvider router={router} />
              </AppDataProvider>
              <PWAProvider />
              <PerformanceMonitor />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                  },
                }}
              />
            </AuthProvider>
          </MotionConfig>
        </ReducedMotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
