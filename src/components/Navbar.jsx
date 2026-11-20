
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-brand">
        <h2>CourseHub</h2>
      </div>

      <div className="navbar-links">

        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/courses">
          Courses
        </NavLink>

        <NavLink to="/users">
          Users
        </NavLink>

      </div>

    </nav>
  );
}

export default Navbar;
