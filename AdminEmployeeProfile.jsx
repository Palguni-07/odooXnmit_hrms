import { useEffect, useState } from "react";

export default function AdminEmployeeProfile() {
  const [activeTab, setActiveTab] = useState("resume");

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    department: "",
    job_position: "",
    manager: "",
    location: "",
    joining_date: "",

    basic_salary: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,

    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  // =========================================================
  // API BASE URL
  // =========================================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


  // =========================================================
  // LOAD SELECTED EMPLOYEE
  // =========================================================

  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("dayflow_token");

        const role =
          localStorage.getItem("dayflow_role");

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        if (role !== "admin") {
          throw new Error(
            "This page is only available to Admin users."
          );
        }

        const selectedEmployee =
          sessionStorage.getItem(
            "adminSelectedEmployee"
          );

        if (!selectedEmployee) {
          throw new Error(
            "No employee was selected."
          );
        }

        let parsedEmployee;

        try {
          parsedEmployee =
            JSON.parse(selectedEmployee);
        } catch {
          throw new Error(
            "The selected employee information is invalid."
          );
        }

        if (!parsedEmployee) {
          throw new Error(
            "Employee information could not be loaded."
          );
        }

        setEmployee(parsedEmployee);

        setForm({
          department:
            parsedEmployee.department || "",

          job_position:
            parsedEmployee.job_position ||
            parsedEmployee.jobPosition ||
            "",

          manager:
            parsedEmployee.manager || "",

          location:
            parsedEmployee.location || "",

          joining_date:
            parsedEmployee.joining_date ||
            "",

          basic_salary:
            parsedEmployee.basic_salary ?? 0,

          hra:
            parsedEmployee.hra ?? 0,

          allowances:
            parsedEmployee.allowances ?? 0,

          deductions:
            parsedEmployee.deductions ?? 0,

          bank_name:
            parsedEmployee.bank_name || "",

          account_number:
            parsedEmployee.account_number ||
            "",

          ifsc_code:
            parsedEmployee.ifsc_code ||
            "",
        });

      } catch (error) {
        console.error(
          "Admin employee profile error:",
          error
        );

        setError(
          error.message ||
            "Unable to load employee profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, []);


  // =========================================================
  // BACK TO EMPLOYEES
  // =========================================================

  function goBackToEmployees() {
    sessionStorage.removeItem(
      "adminSelectedEmployee"
    );

    sessionStorage.removeItem(
      "selectedEmployee"
    );

    window.location.href =
      "/dashboard";
  }


  // =========================================================
  // ATTENDANCE
  // =========================================================

  function goToAttendance() {
    window.location.href =
      "/attendance";
  }


  // =========================================================
  // TIME OFF
  // =========================================================

  function goToTimeOff() {
    window.location.href =
      "/time-off";
  }


  // =========================================================
  // ADMIN PROFILE
  // =========================================================

  function goToAdminProfile() {
    sessionStorage.removeItem(
      "adminSelectedEmployee"
    );

    sessionStorage.removeItem(
      "selectedEmployee"
    );

    window.location.href =
      "/admin-profile";
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
  // START EDITING
  // =========================================================

  function startEditing() {
    setSaveMessage("");
    setSaveError("");

    setForm({
      department:
        employee.department || "",

      job_position:
        employee.job_position ||
        employee.jobPosition ||
        "",

      manager:
        employee.manager || "",

      location:
        employee.location || "",

      joining_date:
        employee.joining_date || "",

      basic_salary:
        employee.basic_salary ?? 0,

      hra:
        employee.hra ?? 0,

      allowances:
        employee.allowances ?? 0,

      deductions:
        employee.deductions ?? 0,

      bank_name:
        employee.bank_name || "",

      account_number:
        employee.account_number || "",

      ifsc_code:
        employee.ifsc_code || "",
    });

    setEditing(true);
  }


  // =========================================================
  // CANCEL EDITING
  // =========================================================

  function cancelEditing() {
    setEditing(false);
    setSaveMessage("");
    setSaveError("");

    setForm({
      department:
        employee.department || "",

      job_position:
        employee.job_position ||
        employee.jobPosition ||
        "",

      manager:
        employee.manager || "",

      location:
        employee.location || "",

      joining_date:
        employee.joining_date || "",

      basic_salary:
        employee.basic_salary ?? 0,

      hra:
        employee.hra ?? 0,

      allowances:
        employee.allowances ?? 0,

      deductions:
        employee.deductions ?? 0,

      bank_name:
        employee.bank_name || "",

      account_number:
        employee.account_number ||
        "",

      ifsc_code:
        employee.ifsc_code ||
        "",
    });
  }


  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  // =========================================================
  // SAVE EMPLOYEE
  // =========================================================

  async function saveEmployee() {
    if (!employee) {
      return;
    }

    const token =
      localStorage.getItem(
        "dayflow_token"
      );

    if (!token) {
      setSaveError(
        "Your session has expired. Please log in again."
      );

      return;
    }

    const employeeId =
      employee.id ||
      employee._id ||
      employee.employee_id ||
      employee.employeeId;

    if (!employeeId) {
      setSaveError(
        "Employee ID is missing."
      );

      return;
    }

    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const payload = {
        department:
          form.department.trim(),

        job_position:
          form.job_position.trim(),

        manager:
          form.manager.trim(),

        location:
          form.location.trim(),

        joining_date:
          form.joining_date.trim(),

        basic_salary:
          Number(form.basic_salary) || 0,

        hra:
          Number(form.hra) || 0,

        allowances:
          Number(form.allowances) || 0,

        deductions:
          Number(form.deductions) || 0,

        bank_name:
          form.bank_name.trim(),

        account_number:
          form.account_number.trim(),

        ifsc_code:
          form.ifsc_code.trim(),
      };

      const response =
        await fetch(
          `${API_URL}/employees/${employeeId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(payload),
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to update employee."
        );
      }

      if (!data?.employee) {
        throw new Error(
          "Employee was updated, but the server did not return the updated employee."
        );
      }

      const updatedEmployee =
        data.employee;

      setEmployee(
        updatedEmployee
      );

      sessionStorage.setItem(
        "adminSelectedEmployee",
        JSON.stringify(
          updatedEmployee
        )
      );

      setEditing(false);

      setSaveMessage(
        "Employee profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Save employee error:",
        error
      );

      setSaveError(
        error.message ||
          "Unable to save employee."
      );
    } finally {
      setSaving(false);
    }
  }


  // =========================================================
  // FORMAT MONEY
  // =========================================================

  function formatMoney(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not provided";
    }

    const number =
      Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return `₹${number.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  }


  // =========================================================
  // FIELD HELPER
  // =========================================================

  function displayValue(
    value,
    fallback = "Not provided"
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    return value;
  }


  // =========================================================
  // INPUT CLASS
  // =========================================================

  const inputClass =
    "mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500";


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />

          <p className="text-sm text-neutral-400">
            Loading employee profile...
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">

        <div className="w-full max-w-md rounded-2xl border border-red-900 bg-red-950/40 p-6">

          <h2 className="text-lg font-semibold text-red-400">
            Unable to Load Employee
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error ||
              "Employee information could not be loaded."}
          </p>

          <button
            type="button"
            onClick={
              goBackToEmployees
            }
            className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-500"
          >
            ← Back to Employees
          </button>

        </div>

      </div>
    );
  }


  // =========================================================
  // SALARY VALUES
  // =========================================================

  const basicSalary =
    employee.basic_salary ??
    employee.basicSalary ??
    0;

  const hra =
    employee.hra ??
    employee.HRA ??
    0;

  const allowances =
    employee.allowances ??
    employee.other_allowances ??
    0;

  const deductions =
    employee.deductions ??
    employee.other_deductions ??
    0;

  const grossSalary =
    employee.gross_salary ??
    (
      Number(basicSalary) +
      Number(hra) +
      Number(allowances)
    );

  const netSalary =
    employee.net_salary ??
    (
      Number(grossSalary) -
      Number(deductions)
    );


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

          <button
            type="button"
            onClick={
              goBackToEmployees
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 font-bold">
              D
            </div>

            <span className="font-semibold">
              Dayflow
            </span>

          </button>


          {/* ADMIN NAVIGATION */}

          <nav className="hidden items-center gap-2 md:flex">

            <button
              type="button"
              onClick={
                goBackToEmployees
              }
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium"
            >
              Employees
            </button>

            <button
              type="button"
              onClick={
                goToAttendance
              }
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Attendance
            </button>

            <button
              type="button"
              onClick={
                goToTimeOff
              }
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              Time Off
            </button>

          </nav>


          {/* ADMIN PROFILE */}

          <button
            type="button"
            onClick={
              goToAdminProfile
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold transition hover:bg-purple-500"
          >
            A
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* BACK */}

        <button
          type="button"
          onClick={
            goBackToEmployees
          }
          className="mb-5 text-sm text-neutral-400 transition hover:text-white"
        >
          ← Back to Employees
        </button>


        {/* PAGE TITLE */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h1 className="text-2xl font-semibold">
              Employee Profile
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Admin view of employee information.
            </p>

          </div>


          {/* EDIT BUTTONS */}

          <div className="flex gap-2">

            {!editing && (
              <button
                type="button"
                onClick={
                  startEditing
                }
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500"
              >
                Edit Employee
              </button>
            )}

            {editing && (
              <>
                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  disabled={saving}
                  className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    saveEmployee
                  }
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </>
            )}

          </div>

        </div>


        {/* SAVE MESSAGE */}

        {saveMessage && (
          <div className="mb-5 rounded-xl border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
            {saveMessage}
          </div>
        )}


        {/* SAVE ERROR */}

        {saveError && (
          <div className="mb-5 rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {saveError}
          </div>
        )}


        {/* =====================================================
            PROFILE HEADER
        ===================================================== */}

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {/* AVATAR */}

            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-4xl font-semibold">

              {(employee.name ||
                "E")
                .charAt(0)
                .toUpperCase()}

            </div>


            {/* BASIC INFORMATION */}

            <div className="flex-1">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-2xl font-semibold">
                    {displayValue(
                      employee.name,
                      "Employee"
                    )}
                  </h2>

                  <p className="mt-1 text-neutral-400">
                    {displayValue(
                      employee.jobPosition ||
                        employee.job_position,
                      "Employee"
                    )}
                  </p>

                </div>

                <span className="w-fit rounded-full border border-purple-900 bg-purple-950/40 px-3 py-1 text-xs font-medium text-purple-400">
                  Admin View
                </span>

              </div>


              {/* EMAIL / MOBILE */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <p className="text-xs text-neutral-500">
                    Email
                  </p>

                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.email
                    )}
                  </p>

                </div>


                <div>

                  <p className="text-xs text-neutral-500">
                    Mobile
                  </p>

                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.mobile ||
                        employee.phone
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ===================================================
              WORK INFORMATION
          =================================================== */}

          <div className="mt-8 border-t border-neutral-800 pt-6">

            <div className="mb-5">

              <h3 className="text-lg font-semibold">
                Work Information
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Employment and organizational information.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div>

                <p className="text-xs text-neutral-500">
                  Company
                </p>

                <p className="mt-1 text-sm">
                  {displayValue(
                    employee.company
                  )}
                </p>

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Department
                </p>

                {editing ? (
                  <input
                    name="department"
                    value={
                      form.department
                    }
                    onChange={
                      handleChange
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.department
                    )}
                  </p>
                )}

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Manager
                </p>

                {editing ? (
                  <input
                    name="manager"
                    value={
                      form.manager
                    }
                    onChange={
                      handleChange
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.manager
                    )}
                  </p>
                )}

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Location
                </p>

                {editing ? (
                  <input
                    name="location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.location
                    )}
                  </p>
                )}

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Employee ID
                </p>

                <p className="mt-1 text-sm font-mono">
                  {displayValue(
                    employee.employee_id ||
                      employee.employeeId ||
                      employee.id
                  )}
                </p>

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Login ID
                </p>

                <p className="mt-1 text-sm font-mono">
                  {displayValue(
                    employee.login_id ||
                      employee.loginId
                  )}
                </p>

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Job Position
                </p>

                {editing ? (
                  <input
                    name="job_position"
                    value={
                      form.job_position
                    }
                    onChange={
                      handleChange
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.job_position ||
                        employee.jobPosition
                    )}
                  </p>
                )}

              </div>


              <div>

                <p className="text-xs text-neutral-500">
                  Joining Date
                </p>

                {editing ? (
                  <input
                    type="date"
                    name="joining_date"
                    value={
                      form.joining_date
                    }
                    onChange={
                      handleChange
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {displayValue(
                      employee.joining_date
                    )}
                  </p>
                )}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            TABS
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900">

          {/* TAB NAVIGATION */}

          <div className="flex overflow-x-auto border-b border-neutral-800">

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "resume"
                )
              }
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                activeTab === "resume"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Resume
            </button>


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "private"
                )
              }
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                activeTab === "private"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Private Info
            </button>


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "work"
                )
              }
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                activeTab === "work"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Work Information
            </button>


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "salary"
                )
              }
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                activeTab === "salary"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Salary Info
            </button>

          </div>


          {/* TAB CONTENT */}

          <div className="p-6">

            {/* =================================================
                RESUME
            ================================================= */}

            {activeTab === "resume" && (

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    About
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    {displayValue(
                      employee.about,
                      "No professional summary has been added."
                    )}
                  </p>

                </div>


                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Skills
                  </h3>

                  <p className="mt-3 text-sm text-neutral-400">
                    {displayValue(
                      employee.skills,
                      "No skills added yet."
                    )}
                  </p>

                </div>


                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Certifications
                  </h3>

                  <p className="mt-3 text-sm text-neutral-400">
                    {displayValue(
                      employee.certifications,
                      "No certifications added yet."
                    )}
                  </p>

                </div>


                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Experience
                  </h3>

                  <p className="mt-3 text-sm text-neutral-400">
                    {displayValue(
                      employee.experience,
                      "No experience information added yet."
                    )}
                  </p>

                </div>

              </div>

            )}


            {/* =================================================
                PRIVATE INFO
            ================================================= */}

            {activeTab === "private" && (

              <div>

                <div className="mb-5">

                  <h3 className="text-lg font-semibold">
                    Private Information
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Personal and banking information for authorized Admin/HR users.
                  </p>

                </div>


                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  <div>

                    <p className="text-xs text-neutral-500">
                      Date of Birth
                    </p>

                    <p className="mt-1 text-sm">
                      {displayValue(
                        employee.date_of_birth ||
                          employee.dateOfBirth
                      )}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-neutral-500">
                      Nationality
                    </p>

                    <p className="mt-1 text-sm">
                      {displayValue(
                        employee.nationality
                      )}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-neutral-500">
                      Residential Address
                    </p>

                    <p className="mt-1 text-sm">
                      {displayValue(
                        employee.address ||
                          employee.residential_address
                      )}
                    </p>

                  </div>


                  {/* BANK NAME */}

                  <div>

                    <p className="text-xs text-neutral-500">
                      Bank Name
                    </p>

                    {editing ? (
                      <input
                        name="bank_name"
                        value={
                          form.bank_name
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-1 text-sm">
                        {displayValue(
                          employee.bank_name ||
                            employee.bankName
                        )}
                      </p>
                    )}

                  </div>


                  {/* ACCOUNT NUMBER */}

                  <div>

                    <p className="text-xs text-neutral-500">
                      Account Number
                    </p>

                    {editing ? (
                      <input
                        name="account_number"
                        value={
                          form.account_number
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-1 text-sm">
                        {displayValue(
                          employee.account_number ||
                            employee.accountNumber
                        )}
                      </p>
                    )}

                  </div>


                  {/* IFSC */}

                  <div>

                    <p className="text-xs text-neutral-500">
                      IFSC Code
                    </p>

                    {editing ? (
                      <input
                        name="ifsc_code"
                        value={
                          form.ifsc_code
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-1 text-sm">
                        {displayValue(
                          employee.ifsc_code ||
                            employee.ifscCode
                        )}
                      </p>
                    )}

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                WORK INFORMATION
            ================================================= */}

            {activeTab === "work" && (

              <div>

                <div className="mb-6">

                  <h3 className="text-lg font-semibold">
                    Work Information
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Employee's organizational and employment details.
                  </p>

                </div>


                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                  {/* COMPANY */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Company
                    </p>

                    <p className="mt-2 text-sm">
                      {displayValue(
                        employee.company
                      )}
                    </p>

                  </div>


                  {/* DEPARTMENT */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Department
                    </p>

                    {editing ? (
                      <input
                        name="department"
                        value={
                          form.department
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-2 text-sm">
                        {displayValue(
                          employee.department
                        )}
                      </p>
                    )}

                  </div>


                  {/* MANAGER */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Manager
                    </p>

                    {editing ? (
                      <input
                        name="manager"
                        value={
                          form.manager
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-2 text-sm">
                        {displayValue(
                          employee.manager
                        )}
                      </p>
                    )}

                  </div>


                  {/* JOB POSITION */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Job Position
                    </p>

                    {editing ? (
                      <input
                        name="job_position"
                        value={
                          form.job_position
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-2 text-sm">
                        {displayValue(
                          employee.job_position ||
                            employee.jobPosition
                        )}
                      </p>
                    )}

                  </div>


                  {/* LOCATION */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Location
                    </p>

                    {editing ? (
                      <input
                        name="location"
                        value={
                          form.location
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-2 text-sm">
                        {displayValue(
                          employee.location
                        )}
                      </p>
                    )}

                  </div>


                  {/* JOINING DATE */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Joining Date
                    </p>

                    {editing ? (
                      <input
                        type="date"
                        name="joining_date"
                        value={
                          form.joining_date
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />
                    ) : (
                      <p className="mt-2 text-sm">
                        {displayValue(
                          employee.joining_date
                        )}
                      </p>
                    )}

                  </div>


                  {/* STATUS */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Employment Status
                    </p>

                    <p className="mt-2 text-sm">
                      {displayValue(
                        employee.status,
                        "Active"
                      )}
                    </p>

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                SALARY INFO
            ================================================= */}

            {activeTab === "salary" && (

              <div>

                <div className="mb-6">

                  <h3 className="text-lg font-semibold">
                    Salary Information
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Compensation details for this employee.
                  </p>

                </div>


                {editing ? (

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    {/* BASIC */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <label className="text-xs text-neutral-500">
                        Basic Salary
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="basic_salary"
                        value={
                          form.basic_salary
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />

                    </div>


                    {/* HRA */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <label className="text-xs text-neutral-500">
                        HRA
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="hra"
                        value={
                          form.hra
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />

                    </div>


                    {/* ALLOWANCES */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <label className="text-xs text-neutral-500">
                        Allowances
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="allowances"
                        value={
                          form.allowances
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />

                    </div>


                    {/* DEDUCTIONS */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <label className="text-xs text-neutral-500">
                        Deductions
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="deductions"
                        value={
                          form.deductions
                        }
                        onChange={
                          handleChange
                        }
                        className={inputClass}
                      />

                    </div>


                    {/* GROSS */}

                    <div className="rounded-xl border border-purple-900 bg-purple-950/20 p-5">

                      <p className="text-xs text-purple-400">
                        Gross Salary
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-purple-300">
                        Calculated on Save
                      </p>

                      <p className="mt-2 text-xs text-neutral-500">
                        Basic + HRA + Allowances
                      </p>

                    </div>


                    {/* NET */}

                    <div className="rounded-xl border border-green-900 bg-green-950/20 p-5">

                      <p className="text-xs text-green-400">
                        Net Salary
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-green-300">
                        Calculated on Save
                      </p>

                      <p className="mt-2 text-xs text-neutral-500">
                        Gross Salary - Deductions
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    {/* MONTHLY WAGE */}

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                      <p className="text-xs text-neutral-500">
                        Monthly Wage
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-purple-400">
                        {formatMoney(
                          grossSalary
                        )}
                      </p>

                    </div>


                    {/* YEARLY WAGE */}

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                      <p className="text-xs text-neutral-500">
                        Yearly Wage
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-green-400">
                        {formatMoney(
                          Number(grossSalary) *
                            12
                        )}
                      </p>

                    </div>


                    {/* BASIC */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <p className="text-xs text-neutral-500">
                        Basic Salary
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatMoney(
                          basicSalary
                        )}
                      </p>

                    </div>


                    {/* HRA */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <p className="text-xs text-neutral-500">
                        HRA
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatMoney(
                          hra
                        )}
                      </p>

                    </div>


                    {/* ALLOWANCES */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <p className="text-xs text-neutral-500">
                        Allowances
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatMoney(
                          allowances
                        )}
                      </p>

                    </div>


                    {/* DEDUCTIONS */}

                    <div className="rounded-xl border border-neutral-800 p-5">

                      <p className="text-xs text-neutral-500">
                        Deductions
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatMoney(
                          deductions
                        )}
                      </p>

                    </div>


                    {/* GROSS */}

                    <div className="rounded-xl border border-purple-900 bg-purple-950/20 p-5">

                      <p className="text-xs text-purple-400">
                        Gross Salary
                      </p>

                      <p className="mt-2 text-xl font-semibold text-purple-300">
                        {formatMoney(
                          grossSalary
                        )}
                      </p>

                    </div>


                    {/* NET */}

                    <div className="rounded-xl border border-green-900 bg-green-950/20 p-5">

                      <p className="text-xs text-green-400">
                        Net Salary
                      </p>

                      <p className="mt-2 text-xl font-semibold text-green-300">
                        {formatMoney(
                          netSalary
                        )}
                      </p>

                    </div>

                  </div>

                )}


                {/* SALARY NOTE */}

                <div className="mt-6 rounded-xl border border-purple-900 bg-purple-950/20 p-4">

                  <p className="text-sm text-purple-300">
                    Salary information is visible because this is the Admin employee profile view.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mx-auto max-w-5xl px-6 pb-8 pt-2">

        <p className="text-center text-xs text-neutral-600">
          Dayflow HRMS • Admin Employee Profile
        </p>

      </footer>

    </div>
  );
}
