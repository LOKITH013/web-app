import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/client";

/* ---------------- DEFAULT FORM ---------------- */

const emptyCompany = {
  company_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  country: "",
  post_code: "",
  contact_person: "",
  phone_number: "",
  website_link: "",
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

/* ===================== COMPONENT ===================== */

export default function CompanyPage({ userName }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({ ...emptyCompany });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const initialFormRef = useRef(JSON.stringify(emptyCompany));
  const [globalFilter, setGlobalFilter] = useDebouncedState("", 200);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/company_details");
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const q = globalFilter.toLowerCase();
    if (!q) return companies;

    return companies.filter((c) =>
      [
        c.company_name,
        c.city,
        c.state,
        c.country,
        c.contact_person,
        c.phone_number,
        c.website_link,
      ].some((f) => (f || "").toLowerCase().includes(q))
    );
  }, [companies, globalFilter]);

  /* ---------------- ACTIONS ---------------- */

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyCompany });
    initialFormRef.current = JSON.stringify(emptyCompany);
    setView("form");
  };

  const handleEdit = (c) => {
    const f = {
      company_name: c.company_name || "",
      address_1: c.address_1 || "",
      address_2: c.address_2 || "",
      city: c.city || "",
      state: c.state || "",
      country: c.country || "",
      post_code: c.post_code || "",
      contact_person: c.contact_person || "",
      phone_number: c.phone_number || "",
      website_link: c.website_link || "",
      isactive: c.isactive || "Y",
    };
    setEditingId(c.id);
    setForm(f);
    initialFormRef.current = JSON.stringify(f);
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this company?")) return;
    await api.delete(`/company_details/${id}`);
    setCompanies((p) => p.filter((c) => c.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.company_name.trim()) {
      setError("Company name is required");
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(
          `/company_details/${editingId}`,
          { ...form, update_by: userName }
        );
        setCompanies((p) => p.map((c) => (c.id === editingId ? res.data : c)));
      } else {
        const res = await api.post("/company_details", {
          ...form,
          created_by: userName,
        });
        setCompanies((p) => [res.data, ...p]);
      }

      setView("list");
      setForm({ ...emptyCompany });
      setEditingId(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save company");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid">
      {view === "list" && (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h5>Company List</h5>
            <div className="d-flex gap-2">
              <input
                className="form-control form-control-sm"
                placeholder="Search..."
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Company
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-2">
              {loading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>City</th>
                        <th>Phone</th>
                        <th>Website</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id}>
                          <td>{c.company_name}</td>
                          <td>{c.city}</td>
                          <td>{c.phone_number}</td>
                          <td>{c.website_link}</td>
                          <td>{c.isactive === "Y" ? "Yes" : "No"}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => handleEdit(c)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(c.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
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
            {editingId ? "Edit Company" : "Add Company"}
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              {Object.keys(emptyCompany).map(
                (key) =>
                  key !== "isactive" && (
                    <input
                      key={key}
                      className="form-control mb-2"
                      name={key}
                      placeholder={key.replaceAll("_", " ").toUpperCase()}
                      value={form[key]}
                      onChange={handleChange}
                    />
                  )
              )}

              <select
                name="isactive"
                className="form-select mb-3"
                value={form.isactive}
                onChange={handleChange}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>

              {error && <div className="text-danger mb-2">{error}</div>}

              <button className="btn btn-primary me-2" type="submit">
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
