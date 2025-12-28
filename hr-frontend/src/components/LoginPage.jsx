import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [mode]);

  const validateGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  /* ===================== LOGIN ===================== */

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = loginForm.email.toLowerCase().trim();

    if (!validateGmail(email)) {
      setError("Please enter a valid Gmail address.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password: loginForm.password,
      });

      // backend returns Employee object
      onLogin(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== SIGNUP ===================== */

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const full_name = signupForm.full_name.trim();
    const email = signupForm.email.toLowerCase().trim();
    const password = signupForm.password;

    if (!full_name) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }

    if (!validateGmail(email)) {
      setError("Please enter a valid Gmail address.");
      setLoading(false);
      return;
    }

    if (password.length > 10) {
      setError("Password must be at most 10 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/signup", {
        full_name,
        email,
        password,
      });

      // auto-login after signup
      onLogin(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Signup failed. Please contact administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f3f4f6" }}
    >
      <div className="card shadow-sm" style={{ width: 380 }}>
        <div className="card-body">
          <h4 className="mb-3 text-center">
            {mode === "login" ? "HR Web Login" : "Create HR Account"}
          </h4>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label">Gmail address</label>
                <input
                  type="email"
                  className="form-control"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              {error && <div className="text-danger small mb-2">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary w-100 mb-2"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-center small">
                No account?{" "}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit}>
              <div className="mb-3">
                <label className="form-label">Full name</label>
                <input
                  className="form-control"
                  value={signupForm.full_name}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      full_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Gmail address</label>
                <input
                  type="email"
                  className="form-control"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              {error && <div className="text-danger small mb-2">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary w-100 mb-2"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create account"}
              </button>

              <div className="text-center small">
                Already have an account?{" "}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
