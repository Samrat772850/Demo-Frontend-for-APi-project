
import { Routes, Route, Navigate } from "react-router-dom";

import CoursePage from "./pages/CoursePage";
import UserPage from "./pages/UserPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/courses" replace />} />

      <Route path="/courses" element={<CoursePage />} />

      <Route path="/users" element={<UserPage />} />

      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}

export default App;
