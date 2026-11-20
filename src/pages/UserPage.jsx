
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./UserPage.css";

const API_URL = "http://127.0.0.1:8000/user/";

const initialForm = {
  email: "",
  password: "",
};

// Safely read API responses
async function readResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function UserPage() {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [apiStatus, setApiStatus] = useState("connecting");

  // GET: Fetch all users
  const fetchUsers = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(API_URL);

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.detail
            ? typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail)
            : `Unable to retrieve users. Status: ${response.status}`
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid API response. Expected a user list.");
      }

      setUsers(data);
      setApiStatus("connected");

    } catch (err) {
      setError(err.message);
      setApiStatus("error");

    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Initial API request
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search users by email
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) =>
      user.email?.toLowerCase().includes(query)
    );
  }, [users, search]);

  // Unique email count
  const uniqueEmails = useMemo(() => {
    return new Set(
      users.map((user) => user.email?.toLowerCase())
        .filter(Boolean)
    ).size;
  }, [users]);

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  // POST: Create user
  // PUT: Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.detail
            ? typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail)
            : `Request failed. Status: ${response.status}`
        );
      }

      setNotice(
        isEditing
          ? "User updated successfully."
          : "New user registered successfully."
      );

      resetForm();

      await fetchUsers(false);

    } catch (err) {
      setError(err.message);

    } finally {
      setSaving(false);
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingId(user.id);

    setFormData({
      email: user.email || "",
      password: "",
    });

    setError("");
    setNotice("");

    document
      .getElementById("user-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  // DELETE: Remove user
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.detail
            ? typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail)
            : `Delete failed. Status: ${response.status}`
        );
      }

      setNotice("User deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchUsers(false);

    } catch (err) {
      setError(err.message);
    }
  };

  // Format registration date
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Scroll to registration form
  const openRegistrationForm = () => {
    resetForm();
    setError("");
    setNotice("");

    document
      .getElementById("user-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  return (
    <div className="user-page">

      {/* SIDEBAR */}
      <aside className="user-sidebar">

        <div className="user-brand">
          <div className="user-brand-icon">C</div>

          <div>
            <h2>Users Data</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="user-nav-label">
          WORKSPACE
        </div>

        <nav className="user-navigation">

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              `user-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span>▤</span>
            Course Management
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `user-nav-item ${isActive ? "active" : ""}`
            }
          >
            <span>♙</span>
            User Management
          </NavLink>

        </nav>

        <div className="user-sidebar-footer">

          <div className="user-profile-avatar">
            N
          </div>

          <div>
            <strong>Administrator</strong>
            <span>User Manager</span>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="user-main-content">

        {/* TOPBAR */}
        <header className="user-topbar">

          <div>
            <span className="user-breadcrumb">
              Workspace / Users
            </span>

            <h1>User Management</h1>
          </div>

          <div className="user-topbar-right">

            <span className="user-system-status">
              <span
                className={`user-status-dot ${
                  apiStatus === "error" ? "offline" : ""
                }`}
              />

              {apiStatus === "connected"
                ? "Admin Panel"
                : apiStatus === "error"
                  ? "API Disconnected"
                  : "Connecting..."}
            </span>

            <div className="user-top-avatar">
              N
            </div>

          </div>

        </header>

        <section className="user-dashboard-content">

          {/* WELCOME SECTION */}
          <div className="user-welcome-section">

            <div>
              <h2>
                Welcome to User Management 👋
              </h2>

              <p>
                Manage registered users and their account information.
              </p>
            </div>

            <button
              type="button"
              className="user-primary-button"
              onClick={openRegistrationForm}
            >
              + Register New User
            </button>

          </div>

          {/* STATISTICS */}
          <div className="user-stats-grid">

            <div className="user-stat-card">

              <div className="user-stat-icon blue">
                ♙
              </div>

              <div>
                <span>Total Users</span>

                <h2>{users.length}</h2>

                <small>Registered accounts</small>
              </div>

            </div>

            <div className="user-stat-card">

              <div className="user-stat-icon purple">
                ✉
              </div>

              <div>
                <span>Unique Emails</span>

                <h2>{uniqueEmails}</h2>

                <small>Unique user emails</small>
              </div>

            </div>

            <div className="user-stat-card">

              <div className="user-stat-icon green">
                ✓
              </div>

              <div>
                <span>API Status</span>

                <h2
                  className={
                    apiStatus === "connected"
                      ? "user-connected-text"
                      : apiStatus === "error"
                        ? "user-error-text"
                        : ""
                  }
                >
                  {apiStatus === "connected"
                    ? "Active"
                    : apiStatus === "error"
                      ? "Offline"
                      : "Loading"}
                </h2>

                <small>FastAPI connection</small>
              </div>

            </div>

          </div>

          {/* REGISTRATION FORM */}
          <section
            className="user-panel user-form-panel"
            id="user-form"
          >

            <div className="user-panel-heading">

              <div>
                <h2>
                  {editingId
                    ? "Update User"
                    : "Register New User"}
                </h2>

                <p>
                  {editingId
                    ? `Updating account ID: ${editingId}`
                    : "Enter user information to create a new account."}
                </p>
              </div>

              <span className="user-section-badge">
                {editingId ? "EDIT MODE" : "NEW USER"}
              </span>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="user-form-grid">

                {/* EMAIL */}
                <div className="user-form-group">

                  <label htmlFor="user-email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="user-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    autoComplete="email"
                    required
                  />

                </div>

                {/* PASSWORD */}
                <div className="user-form-group">

                  <label htmlFor="user-password">
                    {editingId ? "New Password" : "Password"}
                    <span>*</span>
                  </label>

                  <input
                    id="user-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      editingId
                        ? "Enter new password"
                        : "Create a password"
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />

                </div>

              </div>

              <div className="user-form-actions">

                {editingId !== null && (
                  <button
                    type="button"
                    className="user-secondary-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="user-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Processing..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Register User"}
                </button>

              </div>

            </form>

          </section>

          {/* NOTIFICATIONS */}
          {notice && (
            <div className="user-alert user-success-alert">
              <span>✓</span>
              {notice}
            </div>
          )}

          {error && (
            <div className="user-alert user-error-alert">
              <span>⚠ {error}</span>

              <button
                type="button"
                onClick={() => fetchUsers()}
              >
                Retry
              </button>
            </div>
          )}

          {/* USER TABLE */}
          <section className="user-panel user-table-panel">

            <div className="user-panel-heading user-table-heading">

              <div>
                <h2>Registered Users</h2>

                <p>
                  View and manage all registered accounts.
                </p>
              </div>

              <div className="user-table-tools">

                <input
                  className="user-search-input"
                  type="search"
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <button
                  type="button"
                  className="user-refresh-button"
                  onClick={() => fetchUsers()}
                  disabled={loading}
                >
                  ↻ Refresh
                </button>

              </div>

            </div>

            <div className="user-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>USER ID</th>
                    <th>EMAIL ADDRESS</th>
                    <th>REGISTRATION DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="user-empty-state"
                      >
                        Loading users...
                      </td>
                    </tr>

                  ) : filteredUsers.length === 0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="user-empty-state"
                      >
                        {search
                          ? "No matching users found."
                          : "No registered users found."}
                      </td>
                    </tr>

                  ) : (

                    filteredUsers.map((user) => (

                      <tr key={user.id}>

                        {/* ID */}
                        <td>
                          <span className="user-id-badge">
                            #{user.id}
                          </span>
                        </td>

                        {/* EMAIL */}
                        <td className="user-email">

                          <div className="user-email-cell">

                            <div className="user-table-avatar">
                              {user.email?.charAt(0).toUpperCase()}
                            </div>

                            {user.email}

                          </div>

                        </td>

                        {/* DATE */}
                        <td>
                          {formatDate(user.created_at)}
                        </td>

                        {/* ACTIONS */}
                        <td>

                          <div className="user-action-buttons">

                            <button
                              type="button"
                              className="user-edit-button"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="user-delete-button"
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            <div className="user-table-footer">

              Showing {filteredUsers.length} of {users.length} users

            </div>

          </section>

          {/* FOOTER */}
          <footer className="user-page-footer">
            User Management System · Powered by React & FastAPI
          </footer>

        </section>

      </main>

    </div>
  );
}

export default UserPage;
