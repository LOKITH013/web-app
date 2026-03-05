import React, { useState, useEffect, useMemo } from "react";
import api from "../api/client";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

function DashboardPage() {
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);

  /* ---------------- LOAD DASHBOARD DATA ---------------- */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, dRes, eRes, hRes] = await Promise.all([
          api.get("/company_details"),
          api.get("/departments"),
          api.get("/employee"),
          api.get("/holidays"),
        ]);

        setCompanies(cRes.data?.data || cRes.data || []);
        setDepartments(dRes.data?.data || dRes.data || []);
        setEmployees(eRes.data?.data || eRes.data || []);
        setHolidays(hRes.data?.data || hRes.data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadData();
  }, []);

  /* ---------------- COUNTS ---------------- */

  const companyCount = companies.length;
  const departmentCount = departments.length;
  const employeeCount = employees.length;

  /* ---------------- EMPLOYEE JOIN DISTRIBUTION ---------------- */

  const barData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      months.push({
        key,
        month: d.toLocaleString("en", { month: "short" }),
        employees: 0,
      });
    }

    employees.forEach((emp) => {
      if (!emp?.date_of_join) return;

      const joinDate = new Date(emp.date_of_join);
      if (isNaN(joinDate.getTime())) return;

      const key = `${joinDate.getFullYear()}-${String(
        joinDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const found = months.find((m) => m.key === key);
      if (found) found.employees += 1;
    });

    return months;
  }, [employees]);

  /* ---------------- UPCOMING HOLIDAYS ---------------- */

  const today = new Date().toISOString().slice(0, 10);

  const upcomingHolidays = useMemo(() => {
    return holidays
      .filter((h) => h?.holiday_date && h.holiday_date >= today)
      .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
      .slice(0, 5);
  }, [holidays]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid">
      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-3">
        <SummaryCard title="COMPANIES" count={companyCount} />
        <SummaryCard title="DEPARTMENTS" count={departmentCount} />
        <SummaryCard title="EMPLOYEES" count={employeeCount} />
      </div>

      {/* EMPLOYEE JOIN GRAPH */}
      <div className="card mb-3 shadow-sm">
        <div className="card-header d-flex justify-content-between">
          <strong>Employee Joins (Last 8 Months)</strong>
          <small className="text-muted">Based on date_of_join</small>
        </div>
        <div className="card-body">
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <Tooltip />
                <Bar dataKey="employees" fill="#0d6efd" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* UPCOMING HOLIDAYS */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white fw-semibold">
          Upcoming Holidays
        </div>
        <div className="card-body">
          {upcomingHolidays.length === 0 ? (
            <div className="text-muted small">
              No upcoming holidays configured.
            </div>
          ) : (
            <ul className="list-unstyled mb-0">
              {upcomingHolidays.map((h) => (
                <li key={h.id} className="mb-2">
                  <div className="fw-semibold">
                    {formatDate(h.holiday_date)}
                  </div>
                  <div className="small text-muted">{h.holiday_name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUMMARY CARD ---------------- */

function SummaryCard({ title, count }) {
  return (
    <div className="col-md-4">
      <div className="card shadow-sm border-0 h-100">
        <div className="card-body">
          <div className="text-muted" style={{ fontSize: 12 }}>
            {title}
          </div>
          <div className="fs-3 fw-semibold">{count}</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
