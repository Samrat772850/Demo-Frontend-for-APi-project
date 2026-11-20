
import { useEffect, useMemo, useState } from "react";
import "./CoursePage.css";

const API_URL = "http://127.0.0.1:8000/alchemy/";

const initialForm = {
  name: "",
  instructor: "",
  address: "",
  website: "",
};

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // GET: Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to retrieve courses from the server.");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Search courses
  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase().trim();

    return courses.filter((course) =>
      [
        course.name,
        course.instructor,
        course.address,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [courses, search]);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // POST / PUT: Save course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail || "Request failed")
        );
      }

      setNotice(
        isEditing
          ? "Course updated successfully."
          : "New course created successfully."
      );

      resetForm();
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Load course into form for editing
  const handleEdit = (course) => {
    setEditingId(course.id);

    setFormData({
      name: course.name || "",
      instructor: course.instructor || "",
      address: course.address || "",
      website: course.website || "",
    });

    setNotice("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE: Remove course
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete course.");
      }

      setNotice("Course deleted successfully.");

      if (editingId === id) resetForm();

      await fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CourseHub</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          <a className="nav-item active" href="#overview">
            <span>▦</span> Overview
          </a>

          <a className="nav-item" href="#courses">
            <span>▤</span> All Courses
          </a>

          <a className="nav-item" href="#course-form">
            <span>＋</span> Add Course
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar">N</div>
          <div>
            <strong>Administrator</strong>
            <span>Course Manager</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Overview</span>
            <h1>Course Dashboard</h1>
          </div>

          <div className="topbar-right">
            <span className="system-status">
              <span className="status-dot"></span>
              Admin Panel
            </span>
            <div className="top-avatar">N</div>
          </div>
        </header>

        <section className="dashboard-content" id="overview">

          <div className="welcome-section">
            <div>
              <h2>Welcome back, Administrator 👋</h2>
              <p>Manage your courses and keep everything organized.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                resetForm();
                document.getElementById("course-form")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              + Add New Course
            </button>
          </div>

          {/* Statistics */}
          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon blue">▤</div>
              <div>
                <span>Total Courses</span>
                <h2>{courses.length}</h2>
                <small>Registered courses</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">♙</div>
              <div>
                <span>Instructors</span>
                <h2>
                  {new Set(
                    courses.map((c) => c.instructor).filter(Boolean)
                  ).size}
                </h2>
                <small>Unique instructors</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <div>
                <span>Database Status</span>
                <h2 className="connected-text">
                  {error ? "Check" : loading ? "..." : "Active"}
                </h2>
                <small>API connection status</small>
              </div>
            </div>

          </div>

          {/* Course Form */}
          <section className="panel form-panel" id="course-form">

            <div className="panel-heading">
              <div>
                <h2>{editingId ? "Edit Course" : "Create New Course"}</h2>
                <p>
                  {editingId
                    ? `Updating course ID: ${editingId}`
                    : "Enter the information to register a new course."}
                </p>
              </div>

              <span className="section-badge">
                {editingId ? "EDIT MODE" : "NEW ENTRY"}
              </span>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Course Name <span>*</span></label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Advanced Python Programming"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Instructor Name <span>*</span></label>
                  <input
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="Enter instructor name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Course Address <span>*</span></label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter course location"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Website URL <span>*</span></label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    required
                  />
                </div>

              </div>

              <div className="form-actions">
                {editingId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Course"}
                </button>
              </div>

            </form>
          </section>

          {/* Notifications */}
          {notice && (
            <div className="alert success-alert">
              ✓ {notice}
            </div>
          )}

          {error && (
            <div className="alert error-alert">
              ⚠ {error}
              <button onClick={fetchCourses}>Retry</button>
            </div>
          )}

          {/* Course Table */}
          <section className="panel table-panel" id="courses">

            <div className="panel-heading table-heading">
              <div>
                <h2>All Courses</h2>
                <p>View and manage your registered courses.</p>
              </div>

              <div className="table-tools">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <button
                  className="refresh-button"
                  onClick={fetchCourses}
                  disabled={loading}
                >
                  ↻ Refresh
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>COURSE NAME</th>
                    <th>INSTRUCTOR</th>
                    <th>ADDRESS</th>
                    <th>WEBSITE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        Loading courses...
                      </td>
                    </tr>
                  ) : filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No courses found.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <span className="id-badge">#{course.id}</span>
                        </td>

                        <td className="course-name">
                          {course.name}
                        </td>

                        <td>{course.instructor}</td>

                        <td>{course.address}</td>

                        <td>
                          <a
                            className="website-link"
                            href={course.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website ↗
                          </a>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(course)}
                              title="Edit course"
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => handleDelete(course.id)}
                              title="Delete course"
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

            <div className="table-footer">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>

          </section>

          <footer className="page-footer">
            CourseHub Management System · Powered by React & FastAPI
          </footer>

        </section>
      </main>
    </div>
  );
}

export default CoursePage;
