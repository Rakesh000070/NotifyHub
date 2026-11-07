
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const API_URL = "http://localhost:5000";
const TOKEN_KEY = "notifyhub_token";

// Safely parse API responses.
async function readResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Invalid server response." };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

// Support the unread-count response formats used by the API.
function getUnreadCount(data) {
  return Number(
    data?.count ??
      data?.unreadCount ??
      data?.data?.count ??
      data?.data?.unreadCount ??
      0
  );
}

// Get a consistent notification ID.
function getNotificationId(notification) {
  return String(notification?._id ?? notification?.id ?? "");
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");

  const [actionInProgress, setActionInProgress] = useState("");

  // ====================================================
  // FETCH NOTIFICATIONS
  // ====================================================

  const loadNotifications = useCallback(async (authToken = token) => {
    if (!authToken) return;

    const response = await fetch(`${API_URL}/api/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await readResponse(response);

    const list = Array.isArray(data.notifications)
      ? data.notifications
      : Array.isArray(data.data?.notifications)
        ? data.data.notifications
        : [];

    setNotifications(list);
  }, [token]);

  // ====================================================
  // FETCH UNREAD COUNT
  // ====================================================

  const refreshUnreadCount = useCallback(
    async (authToken = token) => {
      if (!authToken) return;

      const response = await fetch(
        `${API_URL}/api/notifications/unread-count`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await readResponse(response);
      setUnreadCount(getUnreadCount(data));
    },
    [token]
  );

  // Refresh both pieces of notification data.
  const refreshNotificationData = useCallback(
    async (authToken = token) => {
      if (!authToken) return;

      const results = await Promise.allSettled([
        loadNotifications(authToken),
        refreshUnreadCount(authToken),
      ]);

      const failedRequest = results.find(
        (result) => result.status === "rejected"
      );

      if (failedRequest) {
        throw failedRequest.reason;
      }
    },
    [loadNotifications, refreshUnreadCount, token]
  );

  // ====================================================
  // LOGIN
  // ====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await readResponse(response);

      const receivedToken =
        data.token || data.accessToken || data.data?.token;

      if (!receivedToken) {
        throw new Error("Login succeeded, but the server returned no token.");
      }

      localStorage.setItem(TOKEN_KEY, receivedToken);
      setToken(receivedToken);
      setPassword("");
      setSuccess("Login successful.");
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);

    setToken("");
    setNotifications([]);
    setUnreadCount(0);

    setEmail("");
    setPassword("");
    setTitle("");
    setMessage("");
    setType("general");

    setError("");
    setSuccess("");
    setActionInProgress("");
  };

  // ====================================================
  // CREATE NOTIFICATION
  // ====================================================

  const handleCreateNotification = async (event) => {
    event.preventDefault();

    if (!title.trim() || !message.trim()) {
      setError("Please enter both a title and a message.");
      return;
    }

    setError("");
    setSuccess("");
    setActionInProgress("create");

    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
        }),
      });

      await readResponse(response);

      setTitle("");
      setMessage("");
      setType("general");

      // Refresh the current tab immediately.
      await refreshNotificationData(token);

      setSuccess("Notification created successfully.");
    } catch (err) {
      setError(err.message || "Unable to create notification.");
    } finally {
      setActionInProgress("");
    }
  };

  // ====================================================
  // MARK NOTIFICATION AS READ
  // ====================================================

  const handleMarkAsRead = async (id) => {
    if (!id) return;

    setError("");
    setSuccess("");
    setActionInProgress(`read-${id}`);

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

      await readResponse(response);

      // The server emits notificationUpdated to every tab.
      // Refresh this tab as well so it does not rely on the socket.
      await refreshNotificationData(token);

      setSuccess("Notification marked as read.");
    } catch (err) {
      setError(err.message || "Unable to mark notification as read.");
    } finally {
      setActionInProgress("");
    }
  };

  // ====================================================
  // DELETE NOTIFICATION
  // ====================================================

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setActionInProgress(`delete-${id}`);

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

      await readResponse(response);

      // The server emits notificationDeleted to every tab.
      await refreshNotificationData(token);

      setSuccess("Notification deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete notification.");
    } finally {
      setActionInProgress("");
    }
  };

  // ====================================================
  // INITIAL LOAD + SOCKET.IO
  // ====================================================

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    const refreshAfterSocketEvent = async () => {
      if (!active) return;

      try {
        await refreshNotificationData(token);
      } catch (err) {
        if (active) {
          console.error(
            "Unable to synchronize notifications:",
            err.message
          );
        }
      }
    };

    const handleNewNotification = (notification) => {
      if (!active || !notification) return;

      // Add the notification immediately, without duplicates.
      setNotifications((current) => {
        const incomingId = getNotificationId(notification);

        if (
          incomingId &&
          current.some(
            (item) => getNotificationId(item) === incomingId
          )
        ) {
          return current;
        }

        return [notification, ...current];
      });

      // Get the authoritative unread count from the backend.
      refreshUnreadCount(token).catch((err) => {
        if (active) {
          console.error("Unable to refresh unread count:", err.message);
        }
      });
    };

    const handleNotificationUpdated = (event) => {
      if (!active) return;

      // Apply the read state immediately, then reconcile with the API.
      if (event?.notificationId) {
        setNotifications((current) =>
          current.map((notification) =>
            getNotificationId(notification) ===
            String(event.notificationId)
              ? { ...notification, isRead: event.isRead ?? true }
              : notification
          )
        );
      }

      refreshAfterSocketEvent();
    };

    const handleNotificationDeleted = (event) => {
      if (!active) return;

      // Remove the notification immediately from this tab.
      if (event?.notificationId) {
        setNotifications((current) =>
          current.filter(
            (notification) =>
              getNotificationId(notification) !==
              String(event.notificationId)
          )
        );
      }

      refreshAfterSocketEvent();
    };

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      refreshAfterSocketEvent();
    };

    const handleConnectError = (err) => {
      console.error("❌ Socket connection failed:", err.message);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    socket.on("newNotification", handleNewNotification);
    socket.on("notificationUpdated", handleNotificationUpdated);
    socket.on("notificationDeleted", handleNotificationDeleted);

    // Load existing notifications after login.
    refreshAfterSocketEvent();

    return () => {
      active = false;

      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);

      socket.off("newNotification", handleNewNotification);
      socket.off("notificationUpdated", handleNotificationUpdated);
      socket.off("notificationDeleted", handleNotificationDeleted);

      socket.disconnect();
    };
  }, [token, refreshNotificationData, refreshUnreadCount]);

  // ====================================================
  // LOGIN SCREEN
  // ====================================================

  if (!token) {
    return (
      <main className="app-container">
        <section className="auth-card">
          <h1>NotifyHub</h1>
          <p>Sign in to manage your notifications.</p>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
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
            </div>

            <div className="form-group">
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
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  // ====================================================
  // NOTIFICATION DASHBOARD
  // ====================================================

  return (
    <main className="app-container">
      <header className="dashboard-header">
        <div>
          <h1>NotifyHub</h1>
          <p>Real-time notification dashboard</p>
        </div>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-summary">
        <h2>My Notifications</h2>

        <div className="notification-stats">
          <span>
            Total: {notifications.length}
          </span>

          <span className="unread-badge">
            {unreadCount} unread
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            refreshNotificationData(token).catch((err) =>
              setError(err.message || "Unable to refresh notifications.")
            )
          }
        >
          Refresh
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <section className="create-notification-section">
        <h2>Create Notification</h2>

        <form onSubmit={handleCreateNotification}>
          <div className="form-group">
            <label htmlFor="notification-title">Title</label>
            <input
              id="notification-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notification-message">Message</label>
            <textarea
              id="notification-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter notification message"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notification-type">Type</label>
            <select
              id="notification-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="general">General</option>
              <option value="system">System</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={actionInProgress === "create"}
          >
            {actionInProgress === "create"
              ? "Creating..."
              : "Create Notification"}
          </button>
        </form>
      </section>

      <section className="notifications-section">
        <h2>Notification List</h2>

        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => {
              const id = getNotificationId(notification);
              const isRead = Boolean(notification.isRead);

              return (
                <article
                  key={id || `${notification.title}-${notification.createdAt}`}
                  className={`notification-card ${isRead ? "read" : "unread"}`}
                >
                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>{notification.title}</h3>

                      <span className="notification-status">
                        {isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p>{notification.message}</p>

                    <p className="notification-meta">
                      Type: {notification.type || "general"}
                    </p>

                    {notification.createdAt && (
                      <p className="notification-meta">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="notification-actions">
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(id)}
                        disabled={
                          actionInProgress === `read-${id}` ||
                          !id
                        }
                      >
                        {actionInProgress === `read-${id}`
                          ? "Updating..."
                          : "Mark as Read"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(id)}
                      disabled={
                        actionInProgress === `delete-${id}` ||
                        !id
                      }
                    >
                      {actionInProgress === `delete-${id}`
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
