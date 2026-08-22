import { useState } from "react";
import { api } from "./api";

import Dashboard from "./Dashboard";
import EmployeeProfile from "./EmployeeProfile";
import AdminProfile from "./AdminProfile";
import AdminEmployeeProfile from "./AdminEmployeeProfile";
import Attendance from "./Attendance";
import TimeOff from "./TimeOff";

export default function App() {
  // =========================================================
  // LOGIN STATE
  // =========================================================

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // SIGNUP STATE
  // =========================================================

  const [showSignup, setShowSignup] = useState(false);

  const [signupCompany, setSignupCompany] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const [signupSuccess, setSignupSuccess] = useState(null);

  // =========================================================
  // CURRENT PATH
  // =========================================================

  const path =
    window.location.pathname.replace(/\/+$/, "") || "/";

  // =========================================================
  // ROUTES
  // =========================================================

  // ---------------------------------------------------------
  // MAIN DASHBOARD
  // ---------------------------------------------------------

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  // ---------------------------------------------------------
  // ADMIN'S OWN PROFILE
  // ---------------------------------------------------------

  if (path === "/admin-profile") {
    return <AdminProfile />;
  }

  // ---------------------------------------------------------
  // ADMIN VIEW OF A SELECTED EMPLOYEE
  //
  // Admin Dashboard
  //     ↓
  // Employee Directory
  //     ↓
  // Select Employee
  //     ↓
  // AdminEmployeeProfile
  // ---------------------------------------------------------

  if (path === "/admin-employee-profile") {
    return <AdminEmployeeProfile />;
  }

  // ---------------------------------------------------------
  // EMPLOYEE'S OWN PROFILE
  // ---------------------------------------------------------

  if (path === "/employee-profile") {
    return <EmployeeProfile />;
  }

  // ---------------------------------------------------------
  // ATTENDANCE
  // ---------------------------------------------------------

  if (path === "/attendance") {
    return <Attendance />;
  }

  // ---------------------------------------------------------
  // TIME OFF
  // ---------------------------------------------------------

  if (path === "/time-off") {
    return <TimeOff />;
  }

  // =========================================================
  // LOGIN
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api("/login", {
        method: "POST",

        body: {
          login: login.trim(),
          password,
        },
      });

      // =====================================================
      // CLEAR OLD SESSION
      // =====================================================

      localStorage.removeItem("dayflow_token");
      localStorage.removeItem("dayflow_role");
      localStorage.removeItem("dayflow_name");
      localStorage.removeItem("dayflow_login_id");

      localStorage.removeItem(
        "dayflow_must_change_password"
      );

      sessionStorage.removeItem(
        "selectedEmployee"
      );

      // =====================================================
      // NORMALIZE ROLE
      // =====================================================

      const normalizedRole = String(
        data.role || ""
      )
        .trim()
        .toLowerCase();

      // =====================================================
      // VALIDATE ROLE
      // =====================================================

      if (
        normalizedRole !== "admin" &&
        normalizedRole !== "employee"
      ) {
        throw new Error(
          `Invalid user role returned by server: ${
            data.role || "unknown"
          }`
        );
      }

      // =====================================================
      // SAVE LOGIN INFORMATION
      // =====================================================

      localStorage.setItem(
        "dayflow_token",
        data.access_token || ""
      );

      localStorage.setItem(
        "dayflow_role",
        normalizedRole
      );

      localStorage.setItem(
        "dayflow_name",
        data.name || ""
      );

      localStorage.setItem(
        "dayflow_login_id",
        data.login_id || ""
      );

      localStorage.setItem(
        "dayflow_must_change_password",
        String(
          data.must_change_password || false
        )
      );

      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "Dayflow login successful:",
        {
          name: data.name,
          role: normalizedRole,
          login_id: data.login_id,
        }
      );

      // =====================================================
      // GO TO DASHBOARD
      // =====================================================

      window.location.href = "/dashboard";

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Unable to sign in"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SIGNUP
  // =========================================================

  async function handleSignup(event) {
    event.preventDefault();

    setSignupError("");
    setSignupSuccess(null);
    setSignupLoading(true);

    try {
      const data = await api("/signup", {
        method: "POST",

        body: {
          company:
            signupCompany.trim(),

          name:
            signupName.trim(),

          email:
            signupEmail
              .trim()
              .toLowerCase(),

          phone:
            signupPhone.trim(),
        },
      });

      // =====================================================
      // SAVE SUCCESS INFORMATION
      // =====================================================

      setSignupSuccess({
        message:
          data.message ||
          "Account created successfully.",

        employee_id:
          data.employee_id || "",

        login_id:
          data.login_id || "",

        email:
          data.email ||
          signupEmail
            .trim()
            .toLowerCase(),

        temporary_password:
          data.temporary_password ||
          data.temp_password ||
          "",

        company:
          signupCompany.trim(),
      });

      // =====================================================
      // CLEAR FORM
      // =====================================================

      setSignupCompany("");
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");

    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      setSignupError(
        error.message ||
          "Unable to create account"
      );

    } finally {
      setSignupLoading(false);
    }
  }

  // =========================================================
  // CLOSE SIGNUP
  // =========================================================

  function closeSignup() {
    setShowSignup(false);

    setSignupError("");
    setSignupSuccess(null);

    setSignupCompany("");
    setSignupName("");
    setSignupEmail("");
    setSignupPhone("");
  }

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">

      <div className="w-full max-w-md">

        {/* =================================================
            LOGO / BRAND
        ================================================= */}

        <div className="mb-10 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-2xl font-bold text-white">
            D
          </div>

          <h1 className="text-3xl font-semibold text-white">
            Dayflow
          </h1>

          <p className="mt-2 text-neutral-400">
            Human Resource Management System
          </p>

        </div>

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">

          <h2 className="text-xl font-semibold text-white">
            Sign In
          </h2>

          <p className="mt-2 text-sm text-neutral-400">
            Enter your Login ID or Email to continue.
          </p>

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >

            {/* LOGIN ID / EMAIL */}

            <div>

              <label
                htmlFor="login"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Login ID / Email
              </label>

              <input
                id="login"
                type="text"
                value={login}
                onChange={(event) =>
                  setLogin(
                    event.target.value
                  )
                }
                placeholder="Enter Login ID or Email"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />

            </div>

            {/* LOGIN ERROR */}

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SIGN IN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 py-3 font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

          </form>

          {/* =================================================
              SIGN UP
          ================================================= */}

          <div className="mt-7 text-center text-sm text-neutral-400">

            Don't have an account?

            <button
              type="button"
              className="ml-1 font-medium text-purple-400 hover:text-purple-300"
              onClick={() => {
                setShowSignup(true);
                setSignupError("");
                setSignupSuccess(null);
              }}
            >
              Sign Up
            </button>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="mt-6 text-center text-xs text-neutral-600">
          Dayflow HRMS
        </p>

      </div>

      {/* =====================================================
          SIGNUP MODAL
      ===================================================== */}

      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">

          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">

            {/* =================================================
                SUCCESS
            ================================================= */}

            {signupSuccess ? (

              <div>

                <div className="mb-6 text-center">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600/20 text-2xl text-green-400">
                    ✓
                  </div>

                  <h2 className="text-xl font-semibold text-white">
                    Account Created
                  </h2>

                  <p className="mt-2 text-sm text-neutral-400">
                    Your Dayflow employee account has been created successfully.
                  </p>

                </div>

                {/* CREDENTIALS */}

                <div className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-800 p-5">

                  <div>

                    <p className="text-xs text-neutral-500">
                      Company
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {signupSuccess.company ||
                        "Your Company"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-neutral-500">
                      Email
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {signupSuccess.email}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-neutral-500">
                      Login ID
                    </p>

                    <p className="mt-1 font-mono font-semibold text-purple-400">
                      {signupSuccess.login_id}
                    </p>

                  </div>

                  {signupSuccess.temporary_password && (
                    <div>

                      <p className="text-xs text-neutral-500">
                        Temporary Password
                      </p>

                      <p className="mt-1 font-mono font-semibold text-green-400">
                        {signupSuccess.temporary_password}
                      </p>

                    </div>
                  )}

                </div>

                {/* PASSWORD MESSAGE */}

                {signupSuccess.temporary_password ? (

                  <div className="mt-5 rounded-xl border border-yellow-900 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-400">

                    <strong>
                      Important:
                    </strong>{" "}
                    Save your Login ID and temporary password.
                    You will be required to change the temporary password after your first login.

                  </div>

                ) : (

                  <div className="mt-5 rounded-xl border border-yellow-900 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-400">

                    Your account was created, but the backend did not return the temporary password.
                    Update the backend as shown below.

                  </div>

                )}

                {/* GO TO LOGIN */}

                <button
                  type="button"
                  onClick={() => {

                    setLogin(
                      signupSuccess.login_id
                    );

                    closeSignup();

                  }}
                  className="mt-6 w-full rounded-xl bg-purple-600 py-3 font-medium text-white transition hover:bg-purple-500"
                >
                  Continue to Sign In
                </button>

              </div>

            ) : (

              /* =================================================
                 SIGNUP FORM
              ================================================= */

              <div>

                <div className="mb-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-xl font-semibold text-white">
                        Create Account
                      </h2>

                      <p className="mt-2 text-sm text-neutral-400">
                        Create your employee account.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={closeSignup}
                      className="text-2xl text-neutral-500 hover:text-white"
                    >
                      ×
                    </button>

                  </div>

                </div>

                <form
                  onSubmit={handleSignup}
                  className="space-y-4"
                >

                  {/* COMPANY */}

                  <div>

                    <label
                      htmlFor="signupCompany"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Company
                    </label>

                    <input
                      id="signupCompany"
                      type="text"
                      value={signupCompany}
                      onChange={(event) =>
                        setSignupCompany(
                          event.target.value
                        )
                      }
                      placeholder="Enter company name"
                      required
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />

                  </div>

                  {/* FULL NAME */}

                  <div>

                    <label
                      htmlFor="signupName"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Full Name
                    </label>

                    <input
                      id="signupName"
                      type="text"
                      value={signupName}
                      onChange={(event) =>
                        setSignupName(
                          event.target.value
                        )
                      }
                      placeholder="Enter first and last name"
                      required
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="signupEmail"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Email
                    </label>

                    <input
                      id="signupEmail"
                      type="email"
                      value={signupEmail}
                      onChange={(event) =>
                        setSignupEmail(
                          event.target.value
                        )
                      }
                      placeholder="Enter email address"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label
                      htmlFor="signupPhone"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Phone
                    </label>

                    <input
                      id="signupPhone"
                      type="tel"
                      value={signupPhone}
                      onChange={(event) =>
                        setSignupPhone(
                          event.target.value
                        )
                      }
                      placeholder="Enter phone number"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />

                  </div>

                  {/* ERROR */}

                  {signupError && (
                    <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                      {signupError}
                    </div>
                  )}

                  {/* CREATE ACCOUNT */}

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full rounded-xl bg-purple-600 py-3 font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {signupLoading
                      ? "Creating Account..."
                      : "Create Account"}
                  </button>

                </form>

                {/* BACK TO LOGIN */}

                <button
                  type="button"
                  onClick={closeSignup}
                  className="mt-4 w-full rounded-xl border border-neutral-700 py-3 font-medium text-neutral-300 transition hover:bg-neutral-800"
                >
                  Back to Sign In
                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}