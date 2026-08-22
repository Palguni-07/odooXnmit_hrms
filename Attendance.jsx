import { useEffect, useState } from "react";
import { api } from "./api";

export default function Attendance() {
  const [profileOpen, setProfileOpen] = useState(false);

  const [attendance, setAttendance] = useState(null);
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role =
    localStorage.getItem("dayflow_role") || "employee";

  const name =
    localStorage.getItem("dayflow_name") || "Employee";

  const token =
    localStorage.getItem("dayflow_token");

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  useEffect(() => {
    async function loadAttendance() {
      try {
        if (!token) {
          throw new Error("You are not logged in.");
        }

        // =====================================================
        // EMPLOYEE
        // =====================================================

        if (role === "employee") {
          const [
            attendanceData,
            dailyData,
            weeklyData,
          ] = await Promise.all([
            api("/attendance/me", {
              token,
            }),

            api("/attendance/me/daily", {
              token,
            }),

            api("/attendance/me/weekly", {
              token,
            }),
          ]);

          setAttendance(attendanceData);
          setDaily(dailyData);
          setWeekly(weeklyData);
        }

        // =====================================================
        // ADMIN
        // =====================================================

        else {
          const data = await api(
            "/attendance",
            {
              token,
            }
          );

          setAttendance(data);
        }
      } catch (error) {
        console.error(
          "Attendance error:",
          error
        );

        setError(
          error.message ||
            "Unable to load attendance"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, [role, token]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatTime(value) {
    if (!value) {
      return "—";
    }

    try {
      return new Date(value).toLocaleTimeString(
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
  // LOGOUT
  // =========================================================

  function logout() {
    localStorage.clear();

    sessionStorage.removeItem(
      "selectedEmployee"
    );

    window.location.href = "/";
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />

          <p className="text-sm text-neutral-400">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-6 py-5 text-red-400">
          {error}
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

          {/* =================================================
              LOGO
          ================================================= */}

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


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="hidden items-center gap-2 md:flex">

            {/* DASHBOARD */}

            <a
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Dashboard
            </a>


            {/* ATTENDANCE */}

            <a
              href="/attendance"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white"
            >
              Attendance
            </a>


            {/* TIME OFF */}

            <a
              href="/time-off"
              className="relative z-50 cursor-pointer rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Time Off
            </a>

          </nav>


          {/* =================================================
              PROFILE
          ================================================= */}

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
              {name
                .charAt(0)
                .toUpperCase()}
            </button>


            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

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


                {/* DASHBOARD */}

                <a
                  href="/dashboard"
                  className="mt-2 block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-neutral-800"
                >
                  Dashboard
                </a>


                {/* MY PROFILE */}

                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-neutral-800"
                  onClick={() => {
                    sessionStorage.removeItem(
                      "selectedEmployee"
                    );

                    window.location.href =
                      "/employee-profile";
                  }}
                >
                  My Profile
                </button>


                {/* ATTENDANCE */}

                <a
                  href="/attendance"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-neutral-800"
                >
                  Attendance
                </a>


                {/* TIME OFF */}

                <a
                  href="/time-off"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-neutral-800"
                >
                  Time Off
                </a>


                {/* LOGOUT */}

                <button
                  type="button"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-neutral-800"
                  onClick={logout}
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

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-2xl font-semibold">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-neutral-400">
            {role === "admin"
              ? "View employee attendance records."
              : "View your daily and weekly attendance."}
          </p>

        </div>


        {/* =====================================================
            EMPLOYEE ATTENDANCE
        ===================================================== */}

        {role === "employee" && (

          <>

            {/* =================================================
                TODAY STATUS
            ================================================= */}

            <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

              <h2 className="text-lg font-semibold">
                Today's Attendance
              </h2>


              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* STATUS */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                  <p className="text-xs text-neutral-500">
                    Status
                  </p>

                  <div className="mt-3 flex items-center gap-2">

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        attendance?.checked_in
                          ? "bg-green-500"
                          : "bg-neutral-600"
                      }`}
                    />

                    <span className="text-sm">
                      {attendance?.checked_in
                        ? "Currently Working"
                        : attendance?.check_out
                        ? "Completed"
                        : "Not Checked In"}
                    </span>

                  </div>

                </div>


                {/* CHECK IN */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                  <p className="text-xs text-neutral-500">
                    Check In
                  </p>

                  <p className="mt-3 text-lg font-medium">
                    {formatTime(
                      attendance?.check_in
                    )}
                  </p>

                </div>


                {/* CHECK OUT */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                  <p className="text-xs text-neutral-500">
                    Check Out
                  </p>

                  <p className="mt-3 text-lg font-medium">
                    {formatTime(
                      attendance?.check_out
                    )}
                  </p>

                </div>

              </div>


              {/* TOTAL HOURS */}

              <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                <p className="text-xs text-neutral-500">
                  Total Hours Today
                </p>

                <p className="mt-2 text-2xl font-semibold">

                  {attendance?.total_hours ?? 0}

                  <span className="text-sm font-normal text-neutral-500">
                    {" "}hours
                  </span>

                </p>

              </div>

            </div>


            {/* =================================================
                DAILY SUMMARY
            ================================================= */}

            <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>

                  <h2 className="text-lg font-semibold">
                    Daily Summary
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    {daily?.date}
                  </p>

                </div>


                <div className="text-left sm:text-right">

                  <p className="text-xs text-neutral-500">
                    Total Hours
                  </p>

                  <p className="text-xl font-semibold">
                    {daily?.total_hours ?? 0} hrs
                  </p>

                </div>

              </div>


              <div className="mt-5 overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead>

                    <tr className="border-b border-neutral-800 text-neutral-500">

                      <th className="px-4 py-3 font-medium">
                        Check In
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Check Out
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Hours
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {daily?.records?.length > 0 ? (

                      daily.records.map(
                        (record) => (

                          <tr
                            key={record.id}
                            className="border-b border-neutral-800/70"
                          >

                            <td className="px-4 py-4">
                              {formatTime(
                                record.check_in
                              )}
                            </td>

                            <td className="px-4 py-4">
                              {formatTime(
                                record.check_out
                              )}
                            </td>

                            <td className="px-4 py-4">
                              {record.total_hours} hrs
                            </td>

                            <td className="px-4 py-4">

                              <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs">
                                {record.status}
                              </span>

                            </td>

                          </tr>

                        )

                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="4"
                          className="px-4 py-8 text-center text-neutral-500"
                        >
                          No attendance records for today.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* =================================================
                WEEKLY SUMMARY
            ================================================= */}

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>

                  <h2 className="text-lg font-semibold">
                    Weekly Summary
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">

                    {weekly?.week_start}
                    {" → "}
                    {weekly?.week_end}

                  </p>

                </div>


                <div className="flex gap-6">

                  <div>

                    <p className="text-xs text-neutral-500">
                      Present Days
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {weekly?.present_days ?? 0}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-neutral-500">
                      Total Hours
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {weekly?.total_hours ?? 0}
                    </p>

                  </div>

                </div>

              </div>


              <div className="mt-5 overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead>

                    <tr className="border-b border-neutral-800 text-neutral-500">

                      <th className="px-4 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Check In
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Check Out
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Hours
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {weekly?.records?.length > 0 ? (

                      weekly.records.map(
                        (record, index) => (

                          <tr
                            key={`${record.date}-${index}`}
                            className="border-b border-neutral-800/70"
                          >

                            <td className="px-4 py-4">
                              {record.date}
                            </td>

                            <td className="px-4 py-4">
                              {formatTime(
                                record.check_in
                              )}
                            </td>

                            <td className="px-4 py-4">
                              {formatTime(
                                record.check_out
                              )}
                            </td>

                            <td className="px-4 py-4">
                              {record.total_hours} hrs
                            </td>

                            <td className="px-4 py-4">

                              <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs">
                                {record.status}
                              </span>

                            </td>

                          </tr>

                        )

                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-neutral-500"
                        >
                          No attendance records this week.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}


        {/* =====================================================
            ADMIN ATTENDANCE
        ===================================================== */}

        {role === "admin" && (

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                Employee Attendance
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Attendance records for all employees.
              </p>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead>

                  <tr className="border-b border-neutral-800 text-neutral-500">

                    <th className="px-4 py-3 font-medium">
                      Employee
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Login ID
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Check In
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Check Out
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Hours
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {Array.isArray(attendance) &&
                  attendance.length > 0 ? (

                    attendance.map(
                      (record) => (

                        <tr
                          key={record.id}
                          className="border-b border-neutral-800/70"
                        >

                          <td className="px-4 py-4 font-medium">
                            {record.employee_name ||
                              "Employee"}
                          </td>

                          <td className="px-4 py-4 text-neutral-400">
                            {record.login_id || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {formatTime(
                              record.check_in
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {formatTime(
                              record.check_out
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {record.total_hours ?? 0} hrs
                          </td>

                          <td className="px-4 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                record.status ===
                                "Present"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {record.status}
                            </span>

                          </td>

                        </tr>

                      )

                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-neutral-500"
                      >
                        No attendance records found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}