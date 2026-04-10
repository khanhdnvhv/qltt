import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return (
    <div aria-live="assertive" aria-atomic="true" role="alert">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 px-4 text-center shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="text-[15px]" style={{ fontWeight: 600 }}>
                Mất kết nối mạng. Vui lòng kiểm tra lại kết nối internet.
              </span>
            </div>
          </motion.div>
        )}
        {showReconnected && isOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 px-4 text-center shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="text-[15px]" style={{ fontWeight: 600 }}>
                Đã kết nối lại thành công!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
