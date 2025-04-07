import { useEffect } from "react"

export const NotificationManager = () => {
  // Service Worker Registration for Notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered", reg))
        .catch((err) => console.log("Service Worker registration failed", err))
    }
  }, [])

  // Notification Permission Check
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
    } else {
      console.log("Notification permission is:", Notification.permission)
    }
  }, [])

  const showNotification = (title, body) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification")
      return
    }

    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "./assets/react.svg" })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "./assets/react.svg" })
        }
      })
    }
  }

  return { showNotification }
}

export default NotificationManager

