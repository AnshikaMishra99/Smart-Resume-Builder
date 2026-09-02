import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Sparkles, LayoutDashboard, FilePlus2 } from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import Builder from "./pages/Builder.jsx";

/**
 * Top navigation bar shown on every page. Highlights the active
 * route and keeps branding consistent (Indigo + Cyan gradient logo).
 */
const Navbar = () => {
  const location = useLocation();

  const linkClasses = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-primary text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-textDark">
            Smart<span className="text-primary">Resume</span>AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className={linkClasses("/")}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/builder" className={linkClasses("/builder")}>
            <FilePlus2 className="w-4 h-4" />
            New Resume
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-bgLight">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/builder/:id" element={<Builder />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
