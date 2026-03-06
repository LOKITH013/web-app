import React, { useState, useEffect } from "react";
import { authApi } from "../api/client";
import { saveTokens, saveUser } from "../utils/authStorage";

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [loginForm, setLoginForm] = useState({
    loginId: "",
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

  /** Build login payload: send empId or email depending on input. */
  const getLoginPayload = () => {
    const trimmed = loginForm.loginId.trim();
    const password = loginForm.password;
    if (trimmed.includes("@")) {
      return { email: trimmed.toLowerCase(), password };
    }
    return { empId: trimmed, password };
  };

  /* ===================== LOGIN ===================== */

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginId = loginForm.loginId.trim();
    if (!loginId) {
      setError("Please enter Employee ID or Email.");
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.post("/auth/web/login", getLoginPayload());

      const data = res.data || {};
      const accessToken = data.access_token ?? data.accessToken;
      const refreshToken = data.refresh_token ?? data.refreshToken;
      const user = data.user ?? data.employee ?? data;

      if (!accessToken) {
        setError("Login succeeded but no access token received.");
        return;
      }

      saveTokens(accessToken, refreshToken);
      saveUser(user);
      onLogin(user);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Invalid Employee ID/email or password.");
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || "Invalid Employee ID/email or password.");
      }
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
      const res = await authApi.post("/auth/signup", {
        full_name,
        email,
        password,
      });

      const data = res.data || {};
      const accessToken = data.access_token ?? data.accessToken;
      const refreshToken = data.refresh_token ?? data.refreshToken;
      const user = data.user ?? data.employee ?? data;

      if (accessToken) {
        saveTokens(accessToken, refreshToken);
        saveUser(user);
        onLogin(user);
      } else {
        // signup may return only user (no tokens); backend might require separate login
        saveUser(user);
        onLogin(user);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.detail || "Invalid input. Please check your details.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Signup failed. Please contact administrator."
        );
      }
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
                <label className="form-label">Employee ID or Email</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter employee ID or email"
                  value={loginForm.loginId}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      loginId: e.target.value,
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
