// src/components/HolidayPage.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/client";

/* ---------------- DEFAULT FORM ---------------- */

const emptyHoliday = {
  company_id: "",
  holiday_date: "",
  holiday_name: "",
  isactive: "Y",
};

/* ---------------- DEBOUNCE ---------------- */

function useDebouncedState(initial = "", wait = 200) {
  const [val, setVal] = useState(initial);
  const timer = useRef(null);

  const setDebounced = (v) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVal(v), wait);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  return [val, setDebounced];
}

/* ================= COMPONENT ================= */

export default function HolidayPage({ userName }) {
  const [holidays, setHolidays] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({ ...emptyHoliday });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const initialFormRef = useRef(JSON.stringify(emptyHoliday));
  const [globalFilter, setGlobalFilter] = useDebouncedState("", 200);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [hRes, cRes] = await Promise.all([
        api.get("/holidays"),
        api.get("/company_details"),
      ]);

      setHolidays(Array.isArray(hRes.data) ? hRes.data : []);
      setCompanies(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      console.error(err);
      setHolidays([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const q = globalFilter.toLowerCase();
    if (!q) return holidays;
    return holidays.filter((h) =>
      [h.holiday_name, h.holiday_date]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [holidays, globalFilter]);

  /* ---------------- HANDLERS ---------------- */

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyHoliday });
    initialFormRef.current = JSON.stringify(emptyHoliday);
    setView("form");
    setError("");
  };

  const handleEdit = (h) => {
    const f = {
      company_id: h.company_id || "",
      holiday_date: h.holiday_date || "",
      holiday_name: h.holiday_name || "",
      isactive: h.isactive || "Y",
    };
    setEditingId(h.id);
    setForm(f);
    initialFormRef.current = JSON.stringify(f);
    setView("form");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this holiday?")) return;
    await api.delete(`/holidays/${id}`);
    setHolidays((p) => p.filter((h) => h.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.company_id || !form.holiday_date || !form.holiday_name.trim()) {
      setError("Company, Date and Holiday Name are required.");
      return;
    }

    const payload = {
      company_id: form.company_id,
      holiday_date: form.holiday_date, // YYYY-MM-DD
      holiday_name: form.holiday_name,
      isactive: form.isactive,
      ...(editingId ? { update_by: userName } : { created_by: userName }),
    };

    try {
      if (editingId) {
        await api.put(`/holidays/${editingId}`, payload);
      } else {
        await api.post("/holidays", payload);
      }
      await loadAll();
      setView("list");
      setForm({ ...emptyHoliday });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save holiday.");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid">
      {view === "list" && (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h5>Holidays</h5>
            <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm"
                placeholder="Search..."
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Holiday
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-2">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h) => (
                      <tr key={h.id}>
                        <td>{h.holiday_date}</td>
                        <td>{h.holiday_name}</td>
                        <td>{h.isactive === "Y" ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleEdit(h)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(h.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {view === "form" && (
        <div className="card">
          <div className="card-header">
            {editingId ? "Edit Holiday" : "Add Holiday"}
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSave}>
              <select
                className="form-select mb-2"
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="form-control mb-2"
                name="holiday_date"
                value={form.holiday_date}
                onChange={handleChange}
              />

              <input
                className="form-control mb-2"
                name="holiday_name"
                placeholder="Holiday Name"
                value={form.holiday_name}
                onChange={handleChange}
              />

              <select
                className="form-select mb-3"
                name="isactive"
                value={form.isactive}
                onChange={handleChange}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>

              <button type="submit" className="btn btn-primary me-2">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setView("list")}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
