import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, LayoutDashboard, FilePlus2, LogOut, User as UserIcon, LogIn } from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import Builder from "./pages/Builder.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

/**
 * Top navigation bar shown on authenticated pages.
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Hide Navbar on standalone auth pages
  if (["/login", "/register"].includes(location.pathname)) {
    return null;
  }

  const linkClasses = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            Smart<span className="text-indigo-600">Resume</span>AI
          </span>
        </Link>

        {/* Navigation & User Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/" className={linkClasses("/")}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/builder" className={linkClasses("/builder")}>
                <FilePlus2 className="w-4 h-4" />
                New Resume
              </Link>

              {/* User Avatar & Logout */}
              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:inline">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className={isAuthPage ? "" : "max-w-6xl mx-auto px-4 sm:px-6 py-8"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder"
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/:id"
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
