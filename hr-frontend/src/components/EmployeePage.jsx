// src/components/EmployeePage.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/client";
import { getErrorMessage } from "../utils/getErrorMessage";

const emptyEmployee = {
  employee_id: "",
  employee_name: "",
  email_id: "",
  password: "",
  date_of_birth: "",
  date_of_join: "",
  designation: "",
  supervisor_id: "",
  company_id: "",
  department_id: "",
  work_location: "",
  mobile_no: "",
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

export default function EmployeePage({ userName }) {
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({ ...emptyEmployee });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const initialFormRef = useRef(JSON.stringify(emptyEmployee));
  const [globalFilter, setGlobalFilter] = useDebouncedState("", 200);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [eRes, cRes, dRes] = await Promise.all([
        api.get("/employee"),
        api.get("/company_details"),
        api.get("/departments"),
      ]);
      setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
      setCompanies(Array.isArray(cRes.data) ? cRes.data : []);
      setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
    } catch (err) {
      console.error(err);
      setEmployees([]);
      setCompanies([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const q = globalFilter.toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.employee_id, e.employee_name, e.email_id, e.designation]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [employees, globalFilter]);

  const filteredDepartments = useMemo(() => {
    if (!form.company_id) return [];
    return departments.filter((d) => d.company_id === form.company_id);
  }, [departments, form.company_id]);

  /* ---------------- HANDLERS ---------------- */

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyEmployee });
    initialFormRef.current = JSON.stringify(emptyEmployee);
    setView("form");
    setError("");
  };

  const handleEdit = (e) => {
    const f = {
      employee_id: e.employee_id || "",
      employee_name: e.employee_name || "",
      email_id: e.email_id || "",
      password: "", // never preload
      date_of_birth: e.date_of_birth || "",
      date_of_join: e.date_of_join || "",
      designation: e.designation || "",
      supervisor_id: e.supervisor_id || "",
      company_id: e.company_id || "",
      department_id: e.department_id || "",
      work_location: e.work_location || "",
      mobile_no: e.mobile_no || "",
      isactive: e.isactive || "Y",
    };
    setEditingId(e.id);
    setForm(f);
    initialFormRef.current = JSON.stringify(f);
    setView("form");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this employee?")) return;
    await api.delete(`/employee/${id}`);
    setEmployees((p) => p.filter((x) => x.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.employee_id || !form.employee_name || !form.email_id) {
      setError("Employee ID, Name and Email are required.");
      return false;
    }
    if (!form.date_of_join) {
      setError("Date of Join is required.");
      return false;
    }
    if (!form.company_id || !form.department_id) {
      setError("Company and Department are required.");
      return false;
    }
    if (!editingId && !form.password) {
      setError("Password is required for new employee.");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    const payload = {
      employee_id: form.employee_id,
      employee_name: form.employee_name,
      email_id: form.email_id,
      ...(form.password ? { password: form.password } : {}),
      date_of_birth: form.date_of_birth || null,
      date_of_join: form.date_of_join,
      designation: form.designation || null,
      supervisor_id: form.supervisor_id || null,
      company_id: form.company_id,
      department_id: form.department_id,
      work_location: form.work_location || null,
      mobile_no: form.mobile_no || null,
      isactive: form.isactive,
      ...(editingId ? { update_by: userName } : { created_by: userName }),
    };

    try {
      if (editingId) {
        await api.put(`/employee/${editingId}`, payload);
      } else {
        await api.post("/employee", payload);
      }
      await loadAll();
      setView("list");
      setForm({ ...emptyEmployee });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err.response?.data?.detail, "Failed to save employee."));
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid">
      {view === "list" && (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h5>Employees</h5>
            <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm"
                placeholder="Search..."
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Employee
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
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td>{e.employee_id}</td>
                        <td>{e.employee_name}</td>
                        <td>{e.email_id}</td>
                        <td>{e.designation}</td>
                        <td>{e.isactive === "Y" ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleEdit(e)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(e.id)}
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
            {editingId ? "Edit Employee" : "Add Employee"}
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSave}>
              <input
                className="form-control mb-2"
                name="employee_id"
                placeholder="Employee ID"
                value={form.employee_id}
                onChange={handleChange}
              />
              <input
                className="form-control mb-2"
                name="employee_name"
                placeholder="Employee Name"
                value={form.employee_name}
                onChange={handleChange}
              />
              <input
                className="form-control mb-2"
                name="email_id"
                placeholder="Email"
                value={form.email_id}
                onChange={handleChange}
              />
              {!editingId && (
                <input
                  className="form-control mb-2"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
              )}
              <input
                className="form-control mb-2"
                type="date"
                name="date_of_join"
                value={form.date_of_join}
                onChange={handleChange}
              />

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

              <select
                className="form-select mb-2"
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
              >
                <option value="">-- Select Department --</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>

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
