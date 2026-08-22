import { useEffect, useState } from "react";
import { api } from "./api";

export default function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);

  // =========================================================
  // ATTENDANCE STATE
  // =========================================================

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [totalHours, setTotalHours] = useState(0);

  const [attendanceLoading, setAttendanceLoading] =
    useState(true);

  const [attendanceActionLoading, setAttendanceActionLoading] =
    useState(false);

  const [attendanceError, setAttendanceError] =
    useState("");

  // =========================================================
  // EMPLOYEE STATE
  // =========================================================

  const [employees, setEmployees] = useState([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [employeeError, setEmployeeError] =
    useState("");

  // =========================================================
  // LEAVE STATE
  // =========================================================

  const [leaveRequests, setLeaveRequests] =
    useState([]);

  const [leaveLoading, setLeaveLoading] =
    useState(true);

  const [leaveError, setLeaveError] =
    useState("");

  // =========================================================
  // LEAVE BALANCE STATE
  // =========================================================

  const [leaveBalance, setLeaveBalance] =
    useState(null);

  const [leaveBalanceLoading, setLeaveBalanceLoading] =
    useState(true);

  const [leaveBalanceError, setLeaveBalanceError] =
    useState("");

  // =========================================================
  // USER INFO
  // =========================================================

  const role =
    localStorage.getItem("dayflow_role") ||
    "employee";

  const name =
    localStorage.getItem("dayflow_name") ||
    (role === "admin" ? "Admin" : "Employee");

  const profileInitial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    (role === "admin" ? "A" : "E");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        setEmployeeError("");
        setAttendanceError("");
        setLeaveError("");
        setLeaveBalanceError("");

        const token =
          localStorage.getItem(
            "dayflow_token"
          );

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        // =====================================================
        // ADMIN
        // =====================================================

        if (role === "admin") {
          const employeeData =
            await api(
              "/employees",
              {
                token,
              }
            );

          setEmployees(
            Array.isArray(
              employeeData
            )
              ? employeeData.filter(
                  (employee) =>
                    employee.role ===
                    "employee"
                )
              : []
          );

          setAttendanceLoading(
            false
          );

          // ---------------------------------------------------
          // ADMIN LEAVE REQUESTS
          // ---------------------------------------------------

          try {
            const leaveData =
              await api(
                "/leave",
                {
                  token,
                }
              );

            setLeaveRequests(
              Array.isArray(
                leaveData
              )
                ? leaveData
                : []
            );

          } catch (error) {
            console.error(
              "Failed to load admin leave requests:",
              error
            );

            setLeaveError(
              error.message ||
                "Unable to load leave requests"
            );

          } finally {
            setLeaveLoading(
              false
            );
          }

          // Admin does not need employee leave balance.
          setLeaveBalance(null);

          setLeaveBalanceLoading(
            false
          );
        }

        // =====================================================
        // EMPLOYEE
        // =====================================================

        else {
          // ---------------------------------------------------
          // PROFILE
          // ---------------------------------------------------

          const profileData =
            await api(
              "/me",
              {
                token,
              }
            );

          setEmployees([
            profileData
          ]);

          // ---------------------------------------------------
          // ATTENDANCE
          // ---------------------------------------------------

          const attendanceData =
            await api(
              "/attendance/me",
              {
                token,
              }
            );

          setCheckedIn(
            attendanceData.checked_in ===
              true
          );

          setCheckInTime(
            attendanceData.check_in ||
              null
          );

          setCheckOutTime(
            attendanceData.check_out ||
              null
          );

          setTotalHours(
            attendanceData.total_hours ||
              0
          );

          setAttendanceLoading(
            false
          );

          // ---------------------------------------------------
          // LEAVE REQUESTS
          // ---------------------------------------------------

          try {
            const leaveData =
              await api(
                "/leave/me",
                {
                  token,
                }
              );

            setLeaveRequests(
              Array.isArray(
                leaveData
              )
                ? leaveData
                : []
            );

          } catch (error) {
            console.error(
              "Failed to load employee leave requests:",
              error
            );

            setLeaveError(
              error.message ||
                "Unable to load leave requests"
            );

          } finally {
            setLeaveLoading(
              false
            );
          }

          // ---------------------------------------------------
          // LEAVE BALANCE
          // ---------------------------------------------------

          try {
            const balanceData =
              await api(
                "/leave/balance",
                {
                  token,
                }
              );

            setLeaveBalance(
              balanceData
            );

          } catch (error) {
            console.error(
              "Failed to load employee leave balance:",
              error
            );

            setLeaveBalanceError(
              error.message ||
                "Unable to load leave balance"
            );

          } finally {
            setLeaveBalanceLoading(
              false
            );
          }
        }

      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );

        setEmployeeError(
          error.message ||
            "Unable to load dashboard"
        );

        setAttendanceLoading(
          false
        );

        setLeaveLoading(
          false
        );

        setLeaveBalanceLoading(
          false
        );

      } finally {
        setLoadingEmployees(
          false
        );
      }
    }

    loadDashboard();

  }, [role]);

  // =========================================================
  // CHECK IN
  // =========================================================

  async function handleCheckIn() {
    try {
      setAttendanceError("");
      setAttendanceActionLoading(
        true
      );

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data =
        await api(
          "/attendance/check-in",
          {
            method: "POST",
            token,
          }
        );

      setCheckedIn(true);

      setCheckInTime(
        data.check_in ||
          null
      );

      setCheckOutTime(null);

      setTotalHours(
        data.total_hours ||
          0
      );

    } catch (error) {
      console.error(
        "Check in error:",
        error
      );

      setAttendanceError(
        error.message ||
          "Unable to check in"
      );

    } finally {
      setAttendanceActionLoading(
        false
      );
    }
  }

  // =========================================================
  // CHECK OUT
  // =========================================================

  async function handleCheckOut() {
    try {
      setAttendanceError("");
      setAttendanceActionLoading(
        true
      );

      const token =
        localStorage.getItem(
          "dayflow_token"
        );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data =
        await api(
          "/attendance/check-out",
          {
            method: "POST",
            token,
          }
        );

      setCheckedIn(false);

      setCheckInTime(
        data.check_in ||
          checkInTime
      );

      setCheckOutTime(
        data.check_out ||
          null
      );

      setTotalHours(
        data.total_hours ||
          0
      );

    } catch (error) {
      console.error(
        "Check out error:",
        error
      );

      setAttendanceError(
        error.message ||
          "Unable to check out"
      );

    } finally {
      setAttendanceActionLoading(
        false
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

  function goToTimeOff() {
    window.location.href =
      "/time-off";
  }

  // =========================================================
  // MY PROFILE NAVIGATION
  //
  // ADMIN:
  // /admin-profile
  //
  // EMPLOYEE:
  // /employee-profile
  // =========================================================

  function goToMyProfile() {
    sessionStorage.removeItem(
      "selectedEmployee"
    );

    sessionStorage.removeItem(
      "adminSelectedEmployee"
    );

    if (role === "admin") {
      window.location.href =
        "/admin-profile";
      return;
    }

    window.location.href =
      "/employee-profile";
  }

  // =========================================================
  // ADMIN -> EMPLOYEE PROFILE
  //
  // IMPORTANT:
  // Admin clicking an employee must NEVER go to
  // /employee-profile.
  //
  // It goes to:
  //
  // /admin-employee-profile
  // =========================================================

  function openAdminEmployeeProfile(
    employee
  ) {
    // Remove the employee-side selection
    // so EmployeeProfile.jsx cannot accidentally
    // reuse an old employee selection.

    sessionStorage.removeItem(
      "selectedEmployee"
    );

    // Store the employee specifically
    // for the Admin employee profile.

    sessionStorage.setItem(
      "adminSelectedEmployee",
      JSON.stringify(
        employee
      )
    );

    // Open the separate Admin employee profile.

    window.location.href =
      "/admin-employee-profile";
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    localStorage.clear();

    sessionStorage.removeItem(
      "selectedEmployee"
    );

    sessionStorage.removeItem(
      "adminSelectedEmployee"
    );

    window.location.href =
      "/";
  }

  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatTime(value) {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        value
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    } catch {
      return "—";
    }
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
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

    } catch {
      return value;
    }
  }

  // =========================================================
  // STATUS COLOR
  // =========================================================

  function getStatusColor(status) {
    if (status === "office") {
      return "bg-green-500";
    }

    if (status === "leave") {
      return "bg-blue-500";
    }

    return "bg-yellow-400";
  }

  // =========================================================
  // LEAVE STATUS COLOR
  // =========================================================

  function getLeaveStatusClass(status) {
    if (status === "Approved") {
      return "border-green-900 bg-green-950/40 text-green-400";
    }

    if (status === "Rejected") {
      return "border-red-900 bg-red-950/40 text-red-400";
    }

    return "border-yellow-900 bg-yellow-950/40 text-yellow-400";
  }

  // =========================================================
  // LEAVE BALANCE HELPER
  // =========================================================

  function getLeaveBalance(
    leaveType
  ) {
    if (!leaveBalance) {
      return null;
    }

    if (
      !Array.isArray(
        leaveBalance.balances
      )
    ) {
      return null;
    }

    return (
      leaveBalance.balances.find(
        (item) =>
          item.leave_type ===
          leaveType
      ) || null
    );
  }

  const casualBalance =
    getLeaveBalance(
      "Casual Leave"
    );

  const sickBalance =
    getLeaveBalance(
      "Sick Leave"
    );

  const paidBalance =
    getLeaveBalance(
      "Paid Leave"
    );

  // =========================================================
  // LEAVE COUNTS
  // =========================================================

  const pendingLeaveCount =
    leaveRequests.filter(
      (request) =>
        request.status ===
        "Pending"
    ).length;

  const approvedLeaveCount =
    leaveRequests.filter(
      (request) =>
        request.status ===
        "Approved"
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingEmployees) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-purple-500 border-t-transparent" />

          <p className="text-sm text-neutral-400">
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (employeeError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">

        <div className="rounded-xl border border-red-900 bg-red-950/40 px-6 py-5 text-red-400">
          {employeeError}
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

      <header className="relative z-50 border-b border-neutral-800 bg-neutral-900">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}

          <a
            href="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 font-bold">
              D
            </div>

            <span className="font-semibold">
              Dayflow
            </span>

          </a>


          {/* NAVIGATION */}

          <nav className="hidden items-center gap-2 md:flex">

            <a
              href="/dashboard"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium"
            >
              Dashboard
            </a>

            <a
              href="/attendance"
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Attendance
            </a>

            <a
              href="/time-off"
              className="relative z-50 cursor-pointer rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Time Off
            </a>

          </nav>


          {/* PROFILE MENU */}

          <div className="relative z-50">

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold transition hover:bg-purple-500"
            >
              {profileInitial}
            </button>


            {profileOpen && (

              <div className="absolute right-0 top-12 z-[100] w-52 rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-xl">

                {/* USER INFO */}

                <div className="border-b border-neutral-800 px-3 py-3">

                  <p className="text-sm font-medium">
                    {name}
                  </p>

                  <p className="mt-1 text-xs capitalize text-neutral-500">
                    {role}
                  </p>

                </div>


                {/* PROFILE */}

                <button
                  type="button"
                  className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800"
                  onClick={
                    goToMyProfile
                  }
                >
                  My Profile
                </button>


                {/* ATTENDANCE */}

                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800"
                  onClick={
                    goToAttendance
                  }
                >
                  Attendance
                </button>


                {/* TIME OFF */}

                <a
                  href="/time-off"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800"
                >
                  Time Off
                </a>


                {/* LOGOUT */}

                <button
                  type="button"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-800"
                  onClick={
                    handleLogout
                  }
                >
                  Log Out
                </button>

              </div>

            )}

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

            {role === "admin"
              ? "Employees"
              : "My Dashboard"}

          </h1>

          <p className="mt-1 text-sm text-neutral-400">

            {role === "admin"
              ? "View employees, attendance, and leave status."
              : "View your work status, attendance, and time off."}

          </p>

        </div>


        {/* =====================================================
            EMPLOYEE DASHBOARD
        ===================================================== */}

        {role === "employee" && (

          <>

            {/* ATTENDANCE */}

            <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                <div>

                  <p className="text-sm text-neutral-400">
                    Welcome back
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {name}
                  </h2>

                  <p className="mt-1 text-xs capitalize text-neutral-500">
                    Role: {role}
                  </p>

                </div>


                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={
                      handleCheckIn
                    }
                    disabled={
                      checkedIn ||
                      attendanceLoading ||
                      attendanceActionLoading
                    }
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {attendanceActionLoading &&
                    !checkedIn
                      ? "Checking In..."
                      : "Check In →"}
                  </button>


                  <button
                    type="button"
                    onClick={
                      handleCheckOut
                    }
                    disabled={
                      !checkedIn ||
                      attendanceLoading ||
                      attendanceActionLoading
                    }
                    className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-medium transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {attendanceActionLoading &&
                    checkedIn
                      ? "Checking Out..."
                      : "Check Out →"}
                  </button>

                </div>

              </div>


              {attendanceError && (

                <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {attendanceError}
                </div>

              )}


              <div className="mt-6 border-t border-neutral-800 pt-5">

                <div className="flex items-center gap-2 text-sm">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      checkedIn
                        ? "bg-green-500"
                        : "bg-neutral-600"
                    }`}
                  />

                  <span className="text-neutral-400">

                    {attendanceLoading
                      ? "Loading attendance..."
                      : checkedIn
                      ? "Currently checked in"
                      : "Not checked in"}

                  </span>

                </div>


                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                    <p className="text-xs text-neutral-500">
                      Today
                    </p>

                    <p className="mt-2 text-sm font-medium">

                      {new Date().toLocaleDateString(
                        [],
                        {
                          weekday:
                            "short",
                          month:
                            "short",
                          day:
                            "numeric",
                        }
                      )}

                    </p>

                  </div>


                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                    <p className="text-xs text-neutral-500">
                      Check In
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {formatTime(
                        checkInTime
                      )}
                    </p>

                  </div>


                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                    <p className="text-xs text-neutral-500">
                      Check Out
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {formatTime(
                        checkOutTime
                      )}
                    </p>

                  </div>


                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                    <p className="text-xs text-neutral-500">
                      Total Hours
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {Number(
                        totalHours ||
                          0
                      ).toFixed(2)}{" "}
                      hrs
                    </p>

                  </div>

                </div>


                <a
                  href="/attendance"
                  className="mt-5 inline-block rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                >
                  View Full Attendance →
                </a>

              </div>

            </div>


            {/* TIME OFF SUMMARY */}

            <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-semibold">
                    Time Off
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Manage your leave requests and remaining balance.
                  </p>

                </div>


                <a
                  href="/time-off"
                  className="inline-block rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-500"
                >
                  Manage Time Off →
                </a>

              </div>


              {leaveBalanceError && (

                <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {leaveBalanceError}
                </div>

              )}


              {leaveBalanceLoading && (

                <div className="mt-6 text-sm text-neutral-500">
                  Loading leave balance...
                </div>

              )}


              {!leaveBalanceLoading &&
                !leaveBalanceError &&
                leaveBalance && (

                  <div className="mt-6">

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                      <div>

                        <p className="text-sm font-medium">
                          Leave Balance
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          Available leave for{" "}
                          {leaveBalance.year ||
                            new Date().getFullYear()}
                        </p>

                      </div>


                      <div className="sm:text-right">

                        <p className="text-xs text-neutral-500">
                          Total Remaining
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                          {leaveBalance.total_remaining ??
                            0}{" "}
                          days
                        </p>

                      </div>

                    </div>


                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                      {/* CASUAL */}

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                        <p className="text-xs text-neutral-500">
                          Casual Leave
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-purple-400">
                          {casualBalance?.remaining ??
                            0}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          of{" "}
                          {casualBalance?.allocated ??
                            0}{" "}
                          days remaining
                        </p>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-800">

                          <div
                            className="h-full rounded-full bg-purple-600"
                            style={{
                              width: `${
                                casualBalance
                                  ? Math.min(
                                      (Number(
                                        casualBalance.remaining ||
                                          0
                                      ) /
                                        Math.max(
                                          Number(
                                            casualBalance.allocated ||
                                              0
                                          ),
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
                          {casualBalance?.used ??
                            0}{" "}
                          days
                        </p>

                      </div>


                      {/* SICK */}

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                        <p className="text-xs text-neutral-500">
                          Sick Leave
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-blue-400">
                          {sickBalance?.remaining ??
                            0}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          of{" "}
                          {sickBalance?.allocated ??
                            0}{" "}
                          days remaining
                        </p>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-800">

                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${
                                sickBalance
                                  ? Math.min(
                                      (Number(
                                        sickBalance.remaining ||
                                          0
                                      ) /
                                        Math.max(
                                          Number(
                                            sickBalance.allocated ||
                                              0
                                          ),
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
                          {sickBalance?.used ??
                            0}{" "}
                          days
                        </p>

                      </div>


                      {/* PAID */}

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                        <p className="text-xs text-neutral-500">
                          Paid Leave
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-green-400">
                          {paidBalance?.remaining ??
                            0}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          of{" "}
                          {paidBalance?.allocated ??
                            0}{" "}
                          days remaining
                        </p>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-800">

                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${
                                paidBalance
                                  ? Math.min(
                                      (Number(
                                        paidBalance.remaining ||
                                          0
                                      ) /
                                        Math.max(
                                          Number(
                                            paidBalance.allocated ||
                                              0
                                          ),
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
                          {paidBalance?.used ??
                            0}{" "}
                          days
                        </p>

                      </div>

                    </div>

                  </div>

                )}


              {!leaveLoading &&
                !leaveError && (

                  <div className="mt-6 border-t border-neutral-800 pt-5">

                    <p className="mb-4 text-sm font-medium">
                      Request Summary
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                        <p className="text-xs text-neutral-500">
                          Total Requests
                        </p>

                        <p className="mt-2 text-xl font-semibold">
                          {leaveRequests.length}
                        </p>

                      </div>


                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                        <p className="text-xs text-neutral-500">
                          Pending
                        </p>

                        <p className="mt-2 text-xl font-semibold text-yellow-400">
                          {pendingLeaveCount}
                        </p>

                      </div>


                      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">

                        <p className="text-xs text-neutral-500">
                          Approved
                        </p>

                        <p className="mt-2 text-xl font-semibold text-green-400">
                          {approvedLeaveCount}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

            </div>


            {/* EMPLOYEE PROFILE */}

            {employees.length > 0 && (

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center gap-5">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-700 text-2xl font-semibold">

                      {employees[0].name
                        ?.charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <h2 className="text-xl font-semibold">
                        {employees[0].name}
                      </h2>

                      <p className="mt-1 text-sm text-neutral-400">
                        {employees[0].jobPosition ||
                          "Employee"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {employees[0].department ||
                          "No department"}
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={
                      goToMyProfile
                    }
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-500"
                  >
                    View My Profile →
                  </button>

                </div>

              </div>

            )}

          </>

        )}


        {/* =====================================================
            ADMIN DASHBOARD
        ===================================================== */}

        {role === "admin" && (

          <>

            {/* ADMIN SUMMARY */}

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

                <p className="text-xs text-neutral-500">
                  Employees
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {employees.length}
                </p>

              </div>


              <a
                href="/time-off"
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-left transition hover:border-purple-500"
              >

                <p className="text-xs text-neutral-500">
                  Pending Leave
                </p>

                <p className="mt-2 text-2xl font-semibold text-yellow-400">
                  {pendingLeaveCount}
                </p>

                <p className="mt-1 text-xs text-neutral-600">
                  Review requests →
                </p>

              </a>


              <a
                href="/attendance"
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-left transition hover:border-purple-500"
              >

                <p className="text-xs text-neutral-500">
                  Attendance
                </p>

                <p className="mt-2 text-sm font-medium text-purple-400">
                  View Attendance →
                </p>

              </a>

            </div>


            {/* EMPLOYEE DIRECTORY */}

            <div>

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-semibold">
                    Employee Directory
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    View employee profiles.
                  </p>

                </div>


                <div className="flex gap-3">

                  <a
                    href="/attendance"
                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                  >
                    Attendance →
                  </a>


                  <a
                    href="/time-off"
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500"
                  >
                    Manage Leave →
                  </a>

                </div>

              </div>


              {employees.length === 0 && (

                <div className="rounded-2xl border border-dashed border-neutral-700 px-6 py-10 text-center">

                  <p className="text-sm text-neutral-400">
                    No employees found.
                  </p>

                </div>

              )}


              {employees.length > 0 && (

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  {employees.map(
                    (employee) => (

                      <button
                        type="button"
                        key={
                          employee.id
                        }
                        onClick={() =>
                          openAdminEmployeeProfile(
                            employee
                          )
                        }
                        className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-left transition hover:border-purple-500 hover:bg-neutral-900/80"
                      >

                        <div className="flex items-start justify-between">

                          <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700 text-lg font-semibold">

                              {employee.name
                                ?.charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <h3 className="font-medium group-hover:text-purple-400">
                                {
                                  employee.name
                                }
                              </h3>

                              <p className="mt-1 text-xs text-neutral-500">
                                {
                                  employee.jobPosition ||
                                  "Employee"
                                }
                              </p>

                            </div>

                          </div>


                          <span
                            className={`mt-1 h-3 w-3 rounded-full ${getStatusColor(
                              "office"
                            )}`}
                          />

                        </div>


                        <div className="mt-5 border-t border-neutral-800 pt-4">

                          <p className="text-xs text-neutral-500">
                            Department
                          </p>

                          <p className="mt-1 text-sm text-neutral-300">
                            {
                              employee.department ||
                              "Not provided"
                            }
                          </p>

                        </div>


                        <div className="mt-4">

                          <p className="text-xs text-neutral-500">
                            Email
                          </p>

                          <p className="mt-1 truncate text-sm text-neutral-300">
                            {
                              employee.email ||
                              "Not provided"
                            }
                          </p>

                        </div>

                      </button>

                    )
                  )}

                </div>

              )}

            </div>


            {/* ADMIN LEAVE PREVIEW */}

            <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-semibold">
                    Leave Management
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Review employee leave requests and approve or reject them.
                  </p>

                </div>


                <a
                  href="/time-off"
                  className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium transition hover:bg-purple-500"
                >
                  Open Leave Management →
                </a>

              </div>


              {leaveRequests.length > 0 && (

                <div className="mt-5 space-y-3">

                  {leaveRequests
                    .filter(
                      (request) =>
                        request.status ===
                        "Pending"
                    )
                    .slice(0, 3)
                    .map(
                      (request) => (

                        <div
                          key={
                            request.id
                          }
                          className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div>

                            <p className="text-sm font-medium">
                              {
                                request.employee_name ||
                                "Employee"
                              }
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">

                              {
                                request.leave_type
                              }

                              {" • "}

                              {formatDate(
                                request.start_date
                              )}

                              {" - "}

                              {formatDate(
                                request.end_date
                              )}

                            </p>

                          </div>


                          <span
                            className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${getLeaveStatusClass(
                              request.status
                            )}`}
                          >
                            {
                              request.status
                            }
                          </span>

                        </div>

                      )
                    )}

                </div>

              )}

              {leaveRequests.filter(
                (request) =>
                  request.status ===
                  "Pending"
              ).length === 0 && (

                <div className="mt-5 rounded-xl border border-dashed border-neutral-700 px-5 py-6 text-center">

                  <p className="text-sm text-neutral-500">
                    No pending leave requests.
                  </p>

                </div>

              )}

            </div>

          </>

        )}


        {/* =====================================================
            STATUS LEGEND
        ===================================================== */}

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">

          <h3 className="text-sm font-medium">
            Attendance Status
          </h3>

          <div className="mt-4 flex flex-wrap gap-6 text-sm text-neutral-400">

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              Present in office

            </div>


            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

              Employee is on leave

            </div>


            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />

              Employee is absent

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}