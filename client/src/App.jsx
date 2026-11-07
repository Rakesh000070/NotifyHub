
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const API_URL = "http://localhost:5000";

// Safely parse JSON responses, including empty responses.
async function readResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

// Read the unread count from common API response formats.
function getUnreadCount(data) {
  const count =
    data.unreadCount ??
    data.count ??
    data.data?.unreadCount ??
    data.data?.count;

  if (
    count === undefined ||
    count === null ||
    count === "" ||
    !Number.isFinite(Number(count)) ||
    Number(count) < 0
  ) {
    throw new Error(
      "The unread-count API returned an unexpected response."
    );
  }

  return Number(count);
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("notifyhub_token") || ""
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [actionInProgress, setActionInProgress] = useState({});

  // Fetch the unread count from the backend.
  const refreshUnreadCount = useCallback(
    async (currentToken = token) => {
      if (!currentToken) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          cache: "no-store",
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch unread count."
        );
      }

      const count = getUnreadCount(data);
      setUnreadCount(count);
    },
    [token]
  );

  // Load notifications and establish the Socket.IO connection.
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const socket = io(API_URL, {
      auth: { token },
    });

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await readResponse(response);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("notifyhub_token");

            if (active) {
              setToken("");
            }
          }

          throw new Error(
            data.message || "Failed to load notifications."
          );
        }

        if (!active) return;

        const list = Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data.data?.notifications)
            ? data.data.notifications
            : [];

        const uniqueNotifications = Array.from(
          new Map(
            list.map((notification) => [
              notification._id,
              notification,
            ])
          ).values()
        );

        uniqueNotifications.sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        setNotifications(uniqueNotifications);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Notification fetch error:", err);

        if (active) {
          setError(
            err.message || "Unable to load notifications."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    // Initial Socket.IO connection logs.
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error(
        "❌ Socket connection error:",
        err.message
      );
      console.error(
        "Details:",
        err.description || err.context || "No extra details"
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    // Receive new notifications without refreshing the page.
    socket.on("newNotification", (notification) => {
      if (!active || !notification?._id) return;

      setNotifications((current) => {
        const alreadyExists = current.some(
          (item) => item._id === notification._id
        );

        if (alreadyExists) return current;

        return [notification, ...current];
      });

      // Let the backend calculate the authoritative unread count.
      refreshUnreadCount(token).catch((err) => {
        console.error("Unread count refresh error:", err.message);
      });
    });

    loadNotifications();

    // Load the initial unread count.
    refreshUnreadCount(token).catch((err) => {
      console.error("Initial unread count error:", err.message);
    });

    return () => {
      active = false;
      controller.abort();

      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("newNotification");

      socket.disconnect();
    };
  }, [token, refreshUnreadCount]);

  // Login.
  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      const receivedToken =
        data.token ||
        data.accessToken ||
        data.data?.token;

      if (!receivedToken) {
        throw new Error(
          "No authentication token was returned."
        );
      }

      localStorage.setItem("notifyhub_token", receivedToken);
      setToken(receivedToken);
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to log in.");
    }
  }

  // Logout.
  function handleLogout() {
    localStorage.removeItem("notifyhub_token");

    setToken("");
    setNotifications([]);
    setUnreadCount(0);
    setError("");
    setActionInProgress({});
    setPassword("");
  }

  // Mark a notification as read.
  async function handleMarkAsRead(id) {
    if (actionInProgress[id]) return;

    setActionInProgress((current) => ({
      ...current,
      [id]: true,
    }));

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to mark as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                ...(data.notification || {}),
                isRead: true,
              }
            : notification
        )
      );

      // Recalculate using the backend after the successful update.
      await refreshUnreadCount(token);
    } catch (err) {
      console.error("Mark as read error:", err);
      setError(
        err.message || "Unable to mark notification as read."
      );
    } finally {
      setActionInProgress((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });
    }
  }

  // Delete a notification.
  async function handleDelete(id) {
    if (actionInProgress[id]) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    setActionInProgress((current) => ({
      ...current,
      [id]: true,
    }));

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete notification."
        );
      }

      setNotifications((current) =>
        current.filter(
          (notification) => notification._id !== id
        )
      );

      // Recalculate after deletion.
      await refreshUnreadCount(token);
    } catch (err) {
      console.error("Delete notification error:", err);
      setError(err.message || "Unable to delete notification.");
    } finally {
      setActionInProgress((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });
    }
  }

  // Login screen.
  if (!token) {
    return (
      <main className="app">
        <section className="login-container">
          <h1>NotifyHub</h1>
          <p>Log in to view your notifications.</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button type="submit">Login</button>
          </form>

          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  // Notification dashboard.
  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>NotifyHub</h1>
          <p>Your notification dashboard</p>
        </div>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="notifications-section">
        <h2>
          Notifications ({notifications.length})
          <span className="unread-badge">
            {unreadCount} unread
          </span>
        </h2>

        {loading && <p>Loading notifications...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && notifications.length === 0 && (
          <p>No notifications found.</p>
        )}

        <div className="notification-list">
          {notifications.map((notification) => {
            const busy = Boolean(
              actionInProgress[notification._id]
            );

            return (
              <article
                className="notification-card"
                key={notification._id}
              >
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>

                <div className="notification-meta">
                  <span>
                    Type: {notification.type || "general"}
                  </span>

                  <span>
                    Status: {notification.isRead ? "Read" : "Unread"}
                  </span>
                </div>

                {notification.createdAt && (
                  <small>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </small>
                )}

                <small className="notification-id">
                  ID: {notification._id}
                </small>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleMarkAsRead(notification._id)
                      }
                    >
                      {busy ? "Please wait..." : "Mark as Read"}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(notification._id)}
                  >
                    {busy ? "Please wait..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default App;
