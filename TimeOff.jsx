import { useEffect, useState } from "react";
import { api } from "./api";

export default function TimeOff() {
  // =========================================================
  // STATE
  // =========================================================

  const [leaveType, setLeaveType] =
    useState("Casual Leave");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [requests, setRequests] =
    useState([]);

  // =========================================================
  // LEAVE BALANCE
  // =========================================================

  const [leaveBalance, setLeaveBalance] =
    useState(null);

  const [balanceLoading, setBalanceLoading] =
    useState(true);

  const [balanceError, setBalanceError] =
    useState("");

  // =========================================================
  // LOADING / MESSAGES
  // =========================================================

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================================================
  // USER INFO
  // =========================================================

  const role =
    localStorage.getItem("dayflow_role") ||
    "employee";

  const name =
    localStorage.getItem("dayflow_name") ||
    "Employee";

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadLeaveRequests();

    if (role === "employee") {
      loadLeaveBalance();
    } else {
      setBalanceLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD LEAVE REQUESTS
  // =========================================================

  async function loadLeaveRequests() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const endpoint =
        role === "admin"
          ? "/leave"
          : "/leave/me";

      const data = await api(
        endpoint,
        {
          token,
        }
      );

      setRequests(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load leave requests:",
        error
      );

      setError(
        error.message ||
          "Unable to load leave requests"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // LOAD LEAVE BALANCE
  // =========================================================

  async function loadLeaveBalance() {
    try {
      setBalanceLoading(true);
      setBalanceError("");

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data = await api(
        "/leave/balance",
        {
          token,
        }
      );

      setLeaveBalance(data);

    } catch (error) {
      console.error(
        "Failed to load leave balance:",
        error
      );

      setBalanceError(
        error.message ||
          "Unable to load leave balance"
      );

    } finally {
      setBalanceLoading(false);
    }
  }

  // =========================================================
  // SUBMIT LEAVE REQUEST
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!startDate || !endDate) {
      setError(
        "Please select both start and end dates."
      );
      return;
    }

    if (endDate < startDate) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      await api("/leave", {
        method: "POST",
        token,

        body: {
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim(),
        },
      });

      setSuccess(
        "Leave request submitted successfully."
      );

      // -------------------------------------------------------
      // RESET FORM
      // -------------------------------------------------------

      setLeaveType(
        "Casual Leave"
      );

      setStartDate("");
      setEndDate("");
      setReason("");

      // -------------------------------------------------------
      // RELOAD REQUESTS
      // -------------------------------------------------------

      await loadLeaveRequests();

      // -------------------------------------------------------
      // RELOAD BALANCE
      //
      // Pending requests don't reduce the balance,
      // but refreshing keeps the UI synchronized.
      // -------------------------------------------------------

      await loadLeaveBalance();

    } catch (error) {
      console.error(
        "Leave submission error:",
        error
      );

      setError(
        error.message ||
          "Unable to submit leave request"
      );

    } finally {
      setSubmitting(false);
    }
  }

  // =========================================================
  // ADMIN APPROVE
  // =========================================================

  async function handleApprove(id) {
    try {
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      await api(
        `/leave/${id}/approve`,
        {
          method: "PUT",
          token,
        }
      );

      setSuccess(
        "Leave request approved successfully."
      );

      await loadLeaveRequests();

    } catch (error) {
      console.error(
        "Approve leave error:",
        error
      );

      setError(
        error.message ||
          "Unable to approve leave request"
      );
    }
  }

  // =========================================================
  // ADMIN REJECT
  // =========================================================

  async function handleReject(id) {
    try {
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      await api(
        `/leave/${id}/reject`,
        {
          method: "PUT",
          token,
        }
      );

      setSuccess(
        "Leave request rejected."
      );

      await loadLeaveRequests();

    } catch (error) {
      console.error(
        "Reject leave error:",
        error
      );

      setError(
        error.message ||
          "Unable to reject leave request"
      );
    }
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  function goToDashboard() {
    window.location.href =
      "/dashboard";
  }

  function goToAttendance() {
    window.location.href =
      "/attendance";
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    localStorage.clear();

    sessionStorage.removeItem(
      "selectedEmployee"
    );

    window.location.href = "/";
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

  function getStatusClass(status) {
    if (status === "Approved") {
      return "border-green-900 bg-green-950/40 text-green-400";
    }

    if (status === "Rejected") {
      return "border-red-900 bg-red-950/40 text-red-400";
    }

    return "border-yellow-900 bg-yellow-950/40 text-yellow-400";
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString(
        [],
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return value;
    }
  }

  // =========================================================
  // LEAVE BALANCE HELPER
  // =========================================================

  function getBalance(leaveType) {
    if (!leaveBalance) {
      return null;
    }

    return (
      leaveBalance.balances?.find(
        (item) =>
          item.leave_type === leaveType
      ) || null
    );
  }

  const casualBalance =
    getBalance("Casual Leave");

  const sickBalance =
    getBalance("Sick Leave");

  const paidBalance =
    getBalance("Paid Leave");

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />

          <p className="text-sm text-neutral-400">
            Loading Time Off...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-neutral-800 bg-neutral-900">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}

          <button
            onClick={goToDashboard}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 font-bold">
              D
            </div>

            <span className="font-semibold">
              Dayflow
            </span>
          </button>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-2 md:flex">

            <button
              onClick={goToDashboard}
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Dashboard
            </button>

            <button
              onClick={goToAttendance}
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Attendance
            </button>

            <button
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium"
            >
              Time Off
            </button>

          </nav>

          {/* USER */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium">
                {name}
              </p>

              <p className="text-xs capitalize text-neutral-500">
                {role}
              </p>

            </div>

            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold transition hover:bg-purple-500"
            >
              {name
                .charAt(0)
                .toUpperCase()}
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* PAGE HEADER */}

        <div className="mb-8">

          <h1 className="text-2xl font-semibold">
            Time Off
          </h1>

          <p className="mt-1 text-sm text-neutral-400">
            {role === "admin"
              ? "Review and manage employee leave requests."
              : "Apply for leave and view your leave balance."}
          </p>

        </div>

        {/* =====================================================
            ERROR / SUCCESS
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* =====================================================
            EMPLOYEE LEAVE BALANCE
        ===================================================== */}

        {role === "employee" && (

          <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  Leave Balance
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Your available leave for{" "}
                  {leaveBalance?.year ||
                    new Date().getFullYear()}.
                </p>

              </div>

              {!balanceLoading &&
                leaveBalance && (
                  <div className="text-sm text-neutral-400">
                    Total remaining:{" "}
                    <span className="font-semibold text-white">
                      {leaveBalance.total_remaining}
                    </span>{" "}
                    days
                  </div>
                )}

            </div>

            {balanceError && (

              <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                {balanceError}
              </div>

            )}

            {balanceLoading && (

              <div className="mt-6 text-sm text-neutral-500">
                Loading leave balance...
              </div>

            )}

            {!balanceLoading &&
              !balanceError &&
              leaveBalance && (

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                  {/* CASUAL */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                    <p className="text-sm font-medium">
                      Casual Leave
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-purple-400">
                      {casualBalance?.remaining ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      of{" "}
                      {casualBalance?.allocated ?? 0}{" "}
                      days remaining
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">

                      <div
                        className="h-full rounded-full bg-purple-600"
                        style={{
                          width: `${
                            casualBalance
                              ? Math.min(
                                  (casualBalance.remaining /
                                    Math.max(
                                      casualBalance.allocated,
                                      1
                                    )) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                    <p className="mt-3 text-xs text-neutral-500">
                      Used:{" "}
                      {casualBalance?.used ?? 0}{" "}
                      days
                    </p>

                  </div>

                  {/* SICK */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                    <p className="text-sm font-medium">
                      Sick Leave
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-blue-400">
                      {sickBalance?.remaining ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      of{" "}
                      {sickBalance?.allocated ?? 0}{" "}
                      days remaining
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">

                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${
                            sickBalance
                              ? Math.min(
                                  (sickBalance.remaining /
                                    Math.max(
                                      sickBalance.allocated,
                                      1
                                    )) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                    <p className="mt-3 text-xs text-neutral-500">
                      Used:{" "}
                      {sickBalance?.used ?? 0}{" "}
                      days
                    </p>

                  </div>

                  {/* PAID */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                    <p className="text-sm font-medium">
                      Paid Leave
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-green-400">
                      {paidBalance?.remaining ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      of{" "}
                      {paidBalance?.allocated ?? 0}{" "}
                      days remaining
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">

                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${
                            paidBalance
                              ? Math.min(
                                  (paidBalance.remaining /
                                    Math.max(
                                      paidBalance.allocated,
                                      1
                                    )) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                    <p className="mt-3 text-xs text-neutral-500">
                      Used:{" "}
                      {paidBalance?.used ?? 0}{" "}
                      days
                    </p>

                  </div>

                </div>

              )}

          </div>

        )}

        {/* =====================================================
            EMPLOYEE: APPLY FOR LEAVE
        ===================================================== */}

        {role === "employee" && (

          <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

            <h2 className="text-lg font-semibold">
              Apply for Leave
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Submit a new time-off request.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* LEAVE TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Leave Type
                </label>

                <select
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >

                  <option>
                    Casual Leave
                  </option>

                  <option>
                    Sick Leave
                  </option>

                  <option>
                    Paid Leave
                  </option>

                  <option>
                    Unpaid Leave
                  </option>

                  <option>
                    Other
                  </option>

                </select>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-neutral-300">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-neutral-300">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    min={
                      startDate ||
                      undefined
                    }
                    onChange={(event) =>
                      setEndDate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />

                </div>

              </div>

              {/* REASON */}

              <div>

                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Reason
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="Enter the reason for your leave..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Leave Request →"}
              </button>

            </form>

          </div>

        )}

        {/* =====================================================
            LEAVE REQUESTS
        ===================================================== */}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div>

            <h2 className="text-lg font-semibold">
              {role === "admin"
                ? "Leave Requests"
                : "My Leave Requests"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {requests.length} request
              {requests.length === 1
                ? ""
                : "s"}
            </p>

          </div>

          {/* EMPTY */}

          {requests.length === 0 && (

            <div className="mt-6 rounded-xl border border-dashed border-neutral-700 px-6 py-10 text-center">

              <p className="text-sm text-neutral-400">
                No leave requests found.
              </p>

            </div>

          )}

          {/* REQUESTS */}

          {requests.length > 0 && (

            <div className="mt-6 space-y-4">

              {requests.map(
                (request) => (

                  <div
                    key={request.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5"
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div>

                        {role === "admin" && (

                          <h3 className="font-medium">
                            {request.employee_name ||
                              "Employee"}
                          </h3>

                        )}

                        <p className="mt-1 text-sm text-purple-400">
                          {request.leave_type}
                        </p>

                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      <div>

                        <p className="text-xs text-neutral-500">
                          Start Date
                        </p>

                        <p className="mt-1 text-sm text-neutral-300">
                          {formatDate(
                            request.start_date
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-neutral-500">
                          End Date
                        </p>

                        <p className="mt-1 text-sm text-neutral-300">
                          {formatDate(
                            request.end_date
                          )}
                        </p>

                      </div>

                      {role === "admin" && (

                        <div>

                          <p className="text-xs text-neutral-500">
                            Login ID
                          </p>

                          <p className="mt-1 text-sm text-neutral-300">
                            {request.login_id ||
                              "—"}
                          </p>

                        </div>

                      )}

                      <div>

                        <p className="text-xs text-neutral-500">
                          Requested
                        </p>

                        <p className="mt-1 text-sm text-neutral-300">
                          {request.created_at
                            ? new Date(
                                request.created_at
                              ).toLocaleDateString(
                                [],
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </p>

                      </div>

                    </div>

                    {/* REASON */}

                    {request.reason && (

                      <div className="mt-5 border-t border-neutral-800 pt-4">

                        <p className="text-xs text-neutral-500">
                          Reason
                        </p>

                        <p className="mt-1 text-sm text-neutral-300">
                          {request.reason}
                        </p>

                      </div>

                    )}

                    {/* ADMIN ACTIONS */}

                    {role === "admin" &&
                      request.status ===
                        "Pending" && (

                        <div className="mt-5 flex flex-wrap gap-3 border-t border-neutral-800 pt-4">

                          <button
                            onClick={() =>
                              handleApprove(
                                request.id
                              )
                            }
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium transition hover:bg-green-500"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleReject(
                                request.id
                              )
                            }
                            className="rounded-xl border border-red-800 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/40"
                          >
                            Reject
                          </button>

                        </div>

                      )}

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}