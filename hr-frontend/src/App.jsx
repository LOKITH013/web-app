import React, { useState, useEffect } from "react";
import CompanyPage from "./components/CompanyPage";
import DepartmentPage from "./components/DepartmentPage";
import HolidayPage from "./components/HolidayPage";
import EmployeePage from "./components/EmployeePage";
import DashboardPage from "./components/DashboardPage";
import LoginPage from "./components/LoginPage";

import {
  FaBuilding,
  FaUsers,
  FaCalendarDay,
  FaSitemap,
  FaHome,
  FaBars,
} from "react-icons/fa";

const CURRENT_USER_KEY = "hr_current_user";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // 🔑 prevents flicker

  const sidebarWidth = isCollapsed ? 110 : 240;

  /* ===================== AUTH BOOTSTRAP ===================== */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.employee_name) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setAuthLoading(false); // ✅ critical
    }
  }, []);

  /* ===================== LOGIN ===================== */
  const handleLogin = (userData) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  /* ===================== LOGOUT ===================== */
  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setShowProfileMenu(false);
  };

  /* ===================== BLOCK RENDER ===================== */
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  /* ===================== NOT LOGGED IN ===================== */
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const userName = user.employee_name || "Admin";

  /* ===================== UI ===================== */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f5f7" }}>
      {/* SIDEBAR */}
      <aside
        className="d-flex flex-column shadow-sm"
        style={{
          width: sidebarWidth,
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          transition: "width 0.25s ease-in-out",
          zIndex: 100,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #dee2e6",
        }}
      >
        {/* Collapse */}
        <div className="d-flex justify-content-end px-3 py-3 border-bottom">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setIsCollapsed((c) => !c);
              setShowProfileMenu(false);
            }}
          >
            <FaBars />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-grow-1 px-2 py-3">
          <ul className="nav flex-column gap-2">
            {[
              ["dashboard", "Dashboard", <FaHome />],
              ["company", "Company_Details", <FaBuilding />],
              ["department", "Departments", <FaSitemap />],
              ["holiday", "Holiday Calendar", <FaCalendarDay />],
              ["employee", "Employees", <FaUsers />],
            ].map(([key, label, icon]) => (
              <li key={key} className="nav-item">
                <button
                  className={
                    "btn w-100 text-start d-flex align-items-center gap-2 " +
                    (activePage === key ? "btn-dark text-white" : "btn-light")
                  }
                  onClick={() => setActivePage(key)}
                >
                  {icon}
                  {!isCollapsed && <span>{label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile */}
        <div className="px-3 py-3 border-top position-relative">
          <div
            className="d-flex align-items-center gap-2"
            style={{ cursor: "pointer" }}
            onClick={() => setShowProfileMenu((v) => !v)}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#16a34a",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div>
                <div className="fw-semibold">{userName}</div>
                <small className="text-muted">Administrator</small>
              </div>
            )}
          </div>

          {showProfileMenu && !isCollapsed && (
            <div className="mt-2 p-2 rounded border shadow-sm bg-light">
              <button
                className="btn btn-outline-secondary w-100 btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: sidebarWidth }}>
        <header className="border-bottom bg-white shadow-sm sticky-top">
          <div className="container-fluid py-2">
            <div className="fw-semibold">
              {activePage === "dashboard" && "Analytics Dashboard"}
              {activePage === "company" && "Company Management"}
              {activePage === "department" && "Department Management"}
              {activePage === "holiday" && "Holiday Calendar"}
              {activePage === "employee" && "Employee Management"}
            </div>
          </div>
        </header>

        <main className="container-fluid py-3">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "company" && <CompanyPage userName={userName} />}
          {activePage === "department" && (
            <DepartmentPage userName={userName} />
          )}
          {activePage === "holiday" && <HolidayPage userName={userName} />}
          {activePage === "employee" && <EmployeePage userName={userName} />}
        </main>
      </div>
    </div>
  );
}

export default App;
