import { useEffect } from "react";

export function useNotifications(currentUserId: string) {
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    Notification.requestPermission();

    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }, []);

  const sendNotification = (title: string, body: string, url: string) => {
    if (Notification.permission === "granted" && document.hidden) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "/icon.svg",
          data: { url },
        });
      });
    }
  };

  return { sendNotification };
}
