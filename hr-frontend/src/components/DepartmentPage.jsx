// src/components/DepartmentPage.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/client";
import { getErrorMessage } from "../utils/getErrorMessage";

const emptyDepartment = {
  company_id: "",
  department_name: "",
  department_code: "",
  isactive: "Y",
};

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

export default function DepartmentPage({ userName }) {
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({ ...emptyDepartment });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const initialFormRef = useRef(JSON.stringify(emptyDepartment));
  const [globalFilter, setGlobalFilter] = useDebouncedState("", 200);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        api.get("/departments"),
        api.get("/company_details"),
      ]);

      setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
      setCompanies(Array.isArray(cRes.data) ? cRes.data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setDepartments([]);
      setCompanies([]);
      setError("Failed to load departments or companies.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const q = globalFilter.toLowerCase();
    if (!q) return departments;

    return departments.filter((d) => {
      const comp = companies.find((c) => c.id === d.company_id);
      return [d.department_name, d.department_code, comp?.company_name]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [departments, companies, globalFilter]);

  /* ---------------- ACTIONS ---------------- */

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyDepartment });
    initialFormRef.current = JSON.stringify(emptyDepartment);
    setView("form");
    setError("");
  };

  const handleEdit = (d) => {
    const f = {
      company_id: d.company_id || "",
      department_name: d.department_name || "",
      department_code: d.department_code || "",
      isactive: d.isactive || "Y",
    };
    setEditingId(d.id);
    setForm(f);
    initialFormRef.current = JSON.stringify(f);
    setView("form");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this department?")) return;
    await api.delete(`/departments/${id}`);
    setDepartments((p) => p.filter((d) => d.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.department_name.trim()) {
      setError("Department name is required.");
      return false;
    }
    if (!form.company_id) {
      setError("Company is required.");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      company_id: form.company_id,
      department_name: form.department_name,
      department_code: form.department_code || null,
      isactive: form.isactive,
      ...(editingId ? { update_by: userName } : { created_by: userName }),
    };

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, payload);
      } else {
        await api.post("/departments", payload);
      }
      await loadAll();
      setView("list");
      setForm({ ...emptyDepartment });
      setEditingId(null);
      setNotice("Department saved successfully.");
      setTimeout(() => setNotice(""), 2500);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err.response?.data?.detail, "Failed to save department."));
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid">
      {view === "list" && (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h5>Departments</h5>
            <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm"
                placeholder="Search..."
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Department
              </button>
            </div>
          </div>

          {notice && <div className="alert alert-success">{notice}</div>}

          <div className="card">
            <div className="card-body p-2">
              {loading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((d) => {
                        const c = companies.find((x) => x.id === d.company_id);
                        return (
                          <tr key={d.id}>
                            <td>{d.department_code}</td>
                            <td>{d.department_name}</td>
                            <td>{c?.company_name || ""}</td>
                            <td>{d.isactive === "Y" ? "Yes" : "No"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-secondary me-2"
                                onClick={() => handleEdit(d)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(d.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {view === "form" && (
        <div className="card">
          <div className="card-header">
            {editingId ? "Edit Department" : "Add Department"}
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label">Company *</label>
                <select
                  name="company_id"
                  className="form-select"
                  value={form.company_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Department Name *</label>
                <input
                  className="form-control"
                  name="department_name"
                  value={form.department_name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Department Code</label>
                <input
                  className="form-control"
                  name="department_code"
                  value={form.department_code}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Active</label>
                <select
                  className="form-select"
                  name="isactive"
                  value={form.isactive}
                  onChange={handleChange}
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>

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
