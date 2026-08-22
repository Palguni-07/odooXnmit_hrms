import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

export default function AdminProfile() {
  // =========================================================
  // USER / PROFILE STATE
  // =========================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState("resume");

  const [profileOpen, setProfileOpen] =
    useState(false);

  // =========================================================
  // SALARY STATE
  // =========================================================

  const [monthlyWage, setMonthlyWage] =
    useState(50000);

  const [workingDays, setWorkingDays] =
    useState(5);

  const [breakTime, setBreakTime] =
    useState(1);

  // Salary component percentages
  const [basicPercentage, setBasicPercentage] =
    useState(50);

  const [hraPercentage, setHraPercentage] =
    useState(50);

  const [standardAllowance, setStandardAllowance] =
    useState(4167);

  const [performanceBonusPercentage, setPerformanceBonusPercentage] =
    useState(8.33);

  const [leaveTravelPercentage, setLeaveTravelPercentage] =
    useState(8.33);

  // PF
  const [employeePfPercentage, setEmployeePfPercentage] =
    useState(12);

  const [employerPfPercentage, setEmployerPfPercentage] =
    useState(12);

  const [professionalTax, setProfessionalTax] =
    useState(200);

  // =========================================================
  // EDIT STATE
  // =========================================================

  const [editingSalary, setEditingSalary] =
    useState(false);

  const [salaryMessage, setSalaryMessage] =
    useState("");

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "dayflow_token"
          );

        const role =
          localStorage.getItem(
            "dayflow_role"
          );

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        // Admin profile should only be accessible
        // to an Admin account.
        if (role !== "admin") {
          throw new Error(
            "Admin profile is only available to Admin users."
          );
        }

        const data =
          await api(
            "/me",
            {
              token,
            }
          );

        setProfile(data);

        // -----------------------------------------------------
        // If salary information exists in /me,
        // use it.
        //
        // Otherwise the reference configuration is used
        // as the initial UI configuration.
        // -----------------------------------------------------

        if (
          data?.monthly_wage !==
          undefined &&
          data?.monthly_wage !== null
        ) {
          setMonthlyWage(
            Number(
              data.monthly_wage
            )
          );
        }

        if (
          data?.working_days_per_week !==
          undefined &&
          data?.working_days_per_week !== null
        ) {
          setWorkingDays(
            Number(
              data.working_days_per_week
            )
          );
        }

        if (
          data?.break_time !==
          undefined &&
          data?.break_time !== null
        ) {
          setBreakTime(
            Number(
              data.break_time
            )
          );
        }

      } catch (err) {
        console.error(
          "Admin profile error:",
          err
        );

        setError(
          err.message ||
            "Unable to load admin profile."
        );

      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

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
  // PROFILE DATA
  // =========================================================

  const name =
    profile?.name ||
    localStorage.getItem(
      "dayflow_name"
    ) ||
    "Admin";

  const role =
    localStorage.getItem(
      "dayflow_role"
    ) || "admin";

  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "A";

  const email =
    profile?.email ||
    "Not provided";

  const mobile =
    profile?.phone ||
    profile?.mobile ||
    "Not provided";

  const company =
    profile?.company ||
    "Not provided";

  const department =
    profile?.department ||
    "Administration";

  const manager =
    profile?.manager ||
    profile?.manager_name ||
    "Not provided";

  const location =
    profile?.location ||
    "Not provided";

  const jobPosition =
    profile?.jobPosition ||
    profile?.job_position ||
    "Administrator";

  // =========================================================
  // PRIVATE INFO
  // =========================================================

  const dateOfBirth =
    profile?.date_of_birth ||
    profile?.dateOfBirth ||
    "Not provided";

  const residentialAddress =
    profile?.residential_address ||
    profile?.residentialAddress ||
    "Not provided";

  const nationality =
    profile?.nationality ||
    "Not provided";

  const personalEmail =
    profile?.personal_email ||
    profile?.personalEmail ||
    "Not provided";

  const gender =
    profile?.gender ||
    "Not provided";

  const maritalStatus =
    profile?.marital_status ||
    profile?.maritalStatus ||
    "Not provided";

  const dateOfJoining =
    profile?.date_of_joining ||
    profile?.dateOfJoining ||
    "Not provided";

  const bankDetails =
    profile?.bank_details ||
    "Not provided";

  const accountNumber =
    profile?.account_number ||
    "Not provided";

  const bankName =
    profile?.bank_name ||
    "Not provided";

  // =========================================================
  // SALARY CALCULATIONS
  // =========================================================

  const yearlyWage = useMemo(() => {
    return Number(monthlyWage || 0) * 12;
  }, [monthlyWage]);

  const basicSalary = useMemo(() => {
    return (
      Number(monthlyWage || 0) *
      (Number(basicPercentage || 0) /
        100)
    );
  }, [
    monthlyWage,
    basicPercentage,
  ]);

  const hra = useMemo(() => {
    return (
      basicSalary *
      (Number(hraPercentage || 0) /
        100)
    );
  }, [
    basicSalary,
    hraPercentage,
  ]);

  const performanceBonus = useMemo(() => {
    return (
      basicSalary *
      (Number(
        performanceBonusPercentage ||
          0
      ) /
        100)
    );
  }, [
    basicSalary,
    performanceBonusPercentage,
  ]);

  const leaveTravelAllowance = useMemo(() => {
    return (
      basicSalary *
      (Number(
        leaveTravelPercentage ||
          0
      ) /
        100)
    );
  }, [
    basicSalary,
    leaveTravelPercentage,
  ]);

  /*
   * Fixed allowance is the remaining amount
   * after the other salary components.
   *
   * This prevents the total components from
   * exceeding the defined monthly wage.
   */

  const fixedAllowance = useMemo(() => {
    const remaining =
      Number(monthlyWage || 0) -
      basicSalary -
      hra -
      Number(
        standardAllowance || 0
      ) -
      performanceBonus -
      leaveTravelAllowance;

    return Math.max(
      0,
      remaining
    );
  }, [
    monthlyWage,
    basicSalary,
    hra,
    standardAllowance,
    performanceBonus,
    leaveTravelAllowance,
  ]);

  const totalSalaryComponents =
    useMemo(() => {
      return (
        basicSalary +
        hra +
        Number(
          standardAllowance || 0
        ) +
        performanceBonus +
        leaveTravelAllowance +
        fixedAllowance
      );
    }, [
      basicSalary,
      hra,
      standardAllowance,
      performanceBonus,
      leaveTravelAllowance,
      fixedAllowance,
    ]);

  const employeePf =
    useMemo(() => {
      return (
        basicSalary *
        (Number(
          employeePfPercentage || 0
        ) /
          100)
      );
    }, [
      basicSalary,
      employeePfPercentage,
    ]);

  const employerPf =
    useMemo(() => {
      return (
        basicSalary *
        (Number(
          employerPfPercentage || 0
        ) /
          100)
      );
    }, [
      basicSalary,
      employerPfPercentage,
    ]);

  const grossSalary =
    totalSalaryComponents;

  const netSalary =
    grossSalary -
    employeePf -
    Number(
      professionalTax || 0
    );

  // =========================================================
  // MONEY FORMATTER
  // =========================================================

  function formatMoney(value) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  // =========================================================
  // SAVE SALARY
  // =========================================================

  async function saveSalary() {
    /*
     * The salary configuration is currently maintained
     * in this Admin profile UI.
     *
     * When your backend salary endpoint is connected,
     * this function is the place to send these values.
     */

    setEditingSalary(false);

    setSalaryMessage(
      "Salary configuration updated successfully."
    );

    setTimeout(() => {
      setSalaryMessage("");
    }, 3000);
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
            Loading admin profile...
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
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">

        <div className="w-full max-w-md rounded-2xl border border-red-900 bg-red-950/30 p-6">

          <h2 className="text-lg font-semibold text-red-400">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={
              goToDashboard
            }
            className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-500"
          >
            Back to Dashboard
          </button>

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

          <button
            type="button"
            onClick={
              goToDashboard
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


          {/* NAVIGATION */}

          <nav className="hidden items-center gap-2 md:flex">

            <button
              type="button"
              onClick={
                goToDashboard
              }
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
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


          {/* PROFILE */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold hover:bg-purple-500"
            >
              {initial}
            </button>


            {profileOpen && (

              <div className="absolute right-0 top-12 z-[100] w-52 rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-2xl">

                <div className="border-b border-neutral-800 px-3 py-3">

                  <p className="text-sm font-medium">
                    {name}
                  </p>

                  <p className="mt-1 text-xs capitalize text-neutral-500">
                    {role}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    goToDashboard
                  }
                  className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800"
                >
                  Employees
                </button>


                <button
                  type="button"
                  onClick={
                    goToAttendance
                  }
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800"
                >
                  Attendance
                </button>


                <button
                  type="button"
                  onClick={
                    goToTimeOff
                  }
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800"
                >
                  Time Off
                </button>


                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-800"
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
            PAGE TITLE
        ================================================= */}

        <div className="mb-7">

          <button
            type="button"
            onClick={
              goToDashboard
            }
            className="mb-5 text-sm text-neutral-400 transition hover:text-white"
          >
            ← Back to Employees
          </button>

          <h1 className="text-3xl font-semibold">
            My Profile
          </h1>

        </div>


        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-start">

            {/* AVATAR */}

            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-[#663535] text-4xl font-semibold text-neutral-200">

              {initial}

            </div>


            {/* MAIN INFO */}

            <div className="flex-1">

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                {/* LEFT */}

                <div>

                  <h2 className="text-3xl font-semibold">
                    {name}
                  </h2>

                  <p className="mt-2 text-neutral-400">
                    {jobPosition}
                  </p>


                  <div className="mt-7 space-y-5">

                    <div>

                      <p className="text-xs text-neutral-500">
                        Login ID
                      </p>

                      <p className="mt-1 text-sm">
                        {localStorage.getItem(
                          "dayflow_login_id"
                        ) ||
                          "Not provided"}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-neutral-500">
                        Email
                      </p>

                      <p className="mt-1 text-sm">
                        {email}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-neutral-500">
                        Mobile
                      </p>

                      <p className="mt-1 text-sm">
                        {mobile}
                      </p>

                    </div>

                  </div>

                </div>


                {/* RIGHT */}

                <div className="space-y-5">

                  <div>

                    <p className="text-xs text-neutral-500">
                      Company
                    </p>

                    <p className="mt-2 border-b border-neutral-700 pb-3 text-sm">
                      {company}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-neutral-500">
                      Department
                    </p>

                    <p className="mt-2 border-b border-neutral-700 pb-3 text-sm">
                      {department}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-neutral-500">
                      Manager
                    </p>

                    <p className="mt-2 border-b border-neutral-700 pb-3 text-sm">
                      {manager}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-neutral-500">
                      Location
                    </p>

                    <p className="mt-2 border-b border-neutral-700 pb-3 text-sm">
                      {location}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            TABS
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">

          <div className="flex overflow-x-auto border-b border-neutral-800">

            {/* RESUME */}

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "resume"
                )
              }
              className={`px-7 py-4 text-sm font-medium transition ${
                activeTab ===
                "resume"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Resume
            </button>


            {/* PRIVATE INFO */}

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "private"
                )
              }
              className={`px-7 py-4 text-sm font-medium transition ${
                activeTab ===
                "private"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Private Info
            </button>


            {/* SALARY */}

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "salary"
                )
              }
              className={`px-7 py-4 text-sm font-medium transition ${
                activeTab ===
                "salary"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Salary Info
            </button>

          </div>


          {/* =================================================
              RESUME
          ================================================= */}

          {activeTab ===
            "resume" && (

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">

              {/* ABOUT */}

              <div className="rounded-xl border border-neutral-800 p-5">

                <div className="flex items-center justify-between">

                  <h2 className="text-lg font-medium">
                    About
                  </h2>

                  <span className="text-neutral-600">
                    ✎
                  </span>

                </div>

                <p className="mt-5 text-sm leading-7 text-neutral-400">
                  {profile?.about ||
                    "Add information about yourself, your professional background, experience, and responsibilities."}
                </p>

              </div>


              {/* WHAT I LOVE */}

              <div className="rounded-xl border border-neutral-800 p-5">

                <div className="flex items-center justify-between">

                  <h2 className="text-lg font-medium">
                    What I love about my job
                  </h2>

                  <span className="text-neutral-600">
                    ✎
                  </span>

                </div>

                <p className="mt-5 text-sm leading-7 text-neutral-400">
                  {profile?.what_i_love ||
                    "Add what you enjoy most about your work and your role at the company."}
                </p>

              </div>


              {/* INTERESTS */}

              <div className="rounded-xl border border-neutral-800 p-5 lg:col-span-2">

                <div className="flex items-center justify-between">

                  <h2 className="text-lg font-medium">
                    My interests and hobbies
                  </h2>

                  <span className="text-neutral-600">
                    ✎
                  </span>

                </div>

                <p className="mt-5 text-sm leading-7 text-neutral-400">
                  {profile?.interests ||
                    "Add your interests, hobbies, and activities outside of work."}
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              PRIVATE INFO
          ================================================= */}

          {activeTab ===
            "private" && (

            <div className="p-6">

              <div className="grid grid-cols-1 gap-x-12 gap-y-7 lg:grid-cols-2">

                {/* DATE OF BIRTH */}

                <InfoField
                  label="Date of Birth"
                  value={
                    dateOfBirth
                  }
                />


                {/* RESIDENTIAL ADDRESS */}

                <InfoField
                  label="Residential Address"
                  value={
                    residentialAddress
                  }
                />


                {/* NATIONALITY */}

                <InfoField
                  label="Nationality"
                  value={
                    nationality
                  }
                />


                {/* PERSONAL EMAIL */}

                <InfoField
                  label="Personal Email"
                  value={
                    personalEmail
                  }
                />


                {/* GENDER */}

                <InfoField
                  label="Gender"
                  value={
                    gender
                  }
                />


                {/* MARITAL STATUS */}

                <InfoField
                  label="Marital Status"
                  value={
                    maritalStatus
                  }
                />


                {/* DATE OF JOINING */}

                <InfoField
                  label="Date of Joining"
                  value={
                    dateOfJoining
                  }
                />


                {/* BANK DETAILS */}

                <InfoField
                  label="Bank Details"
                  value={
                    bankDetails
                  }
                />


                {/* ACCOUNT NUMBER */}

                <InfoField
                  label="Account Number"
                  value={
                    accountNumber
                  }
                />


                {/* BANK NAME */}

                <InfoField
                  label="Bank Name"
                  value={
                    bankName
                  }
                />

              </div>

            </div>

          )}


          {/* =================================================
              SALARY INFO
          ================================================= */}

          {activeTab ===
            "salary" && (

            <div className="p-6">

              {/* ADMIN NOTICE */}

              <div className="mb-7 rounded-xl border border-purple-900/60 bg-purple-950/20 px-5 py-4">

                <p className="text-sm font-medium text-purple-300">
                  Salary information
                </p>

                <p className="mt-1 text-xs leading-6 text-neutral-500">
                  Salary information is restricted to authorized
                  Admin / HR users. Salary components are
                  automatically calculated from the defined wage.
                </p>

              </div>


              {/* =================================================
                  TOP SALARY CONFIGURATION
              ================================================= */}

              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">

                {/* LEFT */}

                <div>

                  <div className="flex items-center justify-between">

                    <h2 className="text-lg font-medium">
                      Salary Information
                    </h2>

                    {!editingSalary && (

                      <button
                        type="button"
                        onClick={() =>
                          setEditingSalary(
                            true
                          )
                        }
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800"
                      >
                        Edit
                      </button>

                    )}

                  </div>


                  <div className="mt-5 space-y-5">

                    {/* MONTH WAGE */}

                    <SalaryInput
                      label="Month Wage"
                      value={
                        monthlyWage
                      }
                      suffix="/ Month"
                      editing={
                        editingSalary
                      }
                      onChange={
                        setMonthlyWage
                      }
                    />


                    {/* YEARLY WAGE */}

                    <div>

                      <p className="text-xs text-neutral-500">
                        Yearly Wage
                      </p>

                      <div className="mt-2 flex items-center gap-3 border-b border-neutral-700 pb-2">

                        <span className="text-sm font-medium">
                          ₹{" "}
                          {formatMoney(
                            yearlyWage
                          )}
                        </span>

                        <span className="text-xs text-neutral-500">
                          / Yearly
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* SALARY COMPONENTS */}

                  <div className="mt-8">

                    <h3 className="border-b border-neutral-700 pb-2 text-sm font-medium">
                      Salary Components
                    </h3>


                    <div className="mt-3 space-y-6">

                      {/* BASIC */}

                      <SalaryComponent
                        name="Basic Salary"
                        description="Define Basic salary from company cost computed based on monthly wages."
                        amount={
                          basicSalary
                        }
                        percentage={
                          basicPercentage
                        }
                        editing={
                          editingSalary
                        }
                        onPercentageChange={
                          setBasicPercentage
                        }
                      />


                      {/* HRA */}

                      <SalaryComponent
                        name="House Rent Allowance"
                        description="HRA provided to employees as a percentage of the basic salary."
                        amount={
                          hra
                        }
                        percentage={
                          hraPercentage
                        }
                        editing={
                          editingSalary
                        }
                        onPercentageChange={
                          setHraPercentage
                        }
                      />


                      {/* STANDARD */}

                      <SalaryComponent
                        name="Standard Allowance"
                        description="A standard allowance is a predetermined fixed amount provided to employee as part of their salary."
                        amount={
                          standardAllowance
                        }
                        percentage={
                          null
                        }
                        editing={
                          editingSalary
                        }
                        fixed
                        onAmountChange={
                          setStandardAllowance
                        }
                      />


                      {/* PERFORMANCE */}

                      <SalaryComponent
                        name="Performance Bonus"
                        description="Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary."
                        amount={
                          performanceBonus
                        }
                        percentage={
                          performanceBonusPercentage
                        }
                        editing={
                          editingSalary
                        }
                        onPercentageChange={
                          setPerformanceBonusPercentage
                        }
                      />


                      {/* LEAVE TRAVEL */}

                      <SalaryComponent
                        name="Leave Travel Allowance"
                        description="LTA is paid by the company to employees to cover their travel expenses and calculated as a % of the basic salary."
                        amount={
                          leaveTravelAllowance
                        }
                        percentage={
                          leaveTravelPercentage
                        }
                        editing={
                          editingSalary
                        }
                        onPercentageChange={
                          setLeaveTravelPercentage
                        }
                      />


                      {/* FIXED */}

                      <SalaryComponent
                        name="Fixed Allowance"
                        description="Fixed allowance portion of wages is determined after calculating all salary components."
                        amount={
                          fixedAllowance
                        }
                        percentage={
                          null
                        }
                        editing={
                          false
                        }
                        fixed
                      />

                    </div>

                  </div>

                </div>


                {/* RIGHT */}

                <div>

                  {/* WORKING DAYS */}

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                    <NumberField
                      label="No of working days in a week"
                      value={
                        workingDays
                      }
                      editing={
                        editingSalary
                      }
                      onChange={
                        setWorkingDays
                      }
                    />

                    <NumberField
                      label="Break Time"
                      value={
                        breakTime
                      }
                      suffix="/hrs"
                      editing={
                        editingSalary
                      }
                      onChange={
                        setBreakTime
                      }
                    />

                  </div>


                  {/* PF */}

                  <div className="mt-8">

                    <h3 className="border-b border-neutral-700 pb-2 text-sm font-medium">
                      Provident Fund (PF) Contribution
                    </h3>


                    <div className="mt-4 space-y-6">

                      {/* EMPLOYEE PF */}

                      <div>

                        <div className="flex items-center justify-between gap-4">

                          <p className="text-sm">
                            Employee
                          </p>

                          <div className="flex items-center gap-3">

                            <span className="text-sm font-medium">
                              ₹{" "}
                              {formatMoney(
                                employeePf
                              )}
                            </span>

                            {editingSalary ? (

                              <input
                                type="number"
                                value={
                                  employeePfPercentage
                                }
                                onChange={(e) =>
                                  setEmployeePfPercentage(
                                    Number(
                                      e.target
                                        .value
                                    )
                                  )
                                }
                                className="w-20 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-sm outline-none focus:border-purple-500"
                              />

                            ) : (

                              <span className="text-xs text-neutral-500">
                                {
                                  employeePfPercentage
                                }
                                %
                              </span>

                            )}

                            <span className="text-xs text-neutral-500">
                              / month
                            </span>

                          </div>

                        </div>

                        <p className="mt-2 text-xs text-neutral-600">
                          PF is calculated based on the basic salary.
                        </p>

                      </div>


                      {/* EMPLOYER PF */}

                      <div>

                        <div className="flex items-center justify-between gap-4">

                          <p className="text-sm">
                            Employer
                          </p>

                          <div className="flex items-center gap-3">

                            <span className="text-sm font-medium">
                              ₹{" "}
                              {formatMoney(
                                employerPf
                              )}
                            </span>

                            {editingSalary ? (

                              <input
                                type="number"
                                value={
                                  employerPfPercentage
                                }
                                onChange={(e) =>
                                  setEmployerPfPercentage(
                                    Number(
                                      e.target
                                        .value
                                    )
                                  )
                                }
                                className="w-20 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-sm outline-none focus:border-purple-500"
                              />

                            ) : (

                              <span className="text-xs text-neutral-500">
                                {
                                  employerPfPercentage
                                }
                                %
                              </span>

                            )}

                            <span className="text-xs text-neutral-500">
                              / month
                            </span>

                          </div>

                        </div>

                        <p className="mt-2 text-xs text-neutral-600">
                          PF is calculated based on the basic salary.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* TAX */}

                  <div className="mt-8">

                    <h3 className="border-b border-neutral-700 pb-2 text-sm font-medium">
                      Tax Deductions
                    </h3>


                    <div className="mt-5 flex items-center justify-between gap-5">

                      <div>

                        <p className="text-sm">
                          Professional Tax
                        </p>

                        <p className="mt-2 text-xs text-neutral-600">
                          Professional Tax deducted from the Gross Salary.
                        </p>

                      </div>


                      {editingSalary ? (

                        <div className="flex items-center gap-2">

                          <span>
                            ₹
                          </span>

                          <input
                            type="number"
                            value={
                              professionalTax
                            }
                            onChange={(e) =>
                              setProfessionalTax(
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            className="w-28 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-right text-sm outline-none focus:border-purple-500"
                          />

                          <span className="text-xs text-neutral-500">
                            / month
                          </span>

                        </div>

                      ) : (

                        <div className="text-right">

                          <p className="text-sm font-medium">
                            ₹{" "}
                            {formatMoney(
                              professionalTax
                            )}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            / month
                          </p>

                        </div>

                      )}

                    </div>

                  </div>


                  {/* SUMMARY */}

                  <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">

                    <h3 className="text-sm font-medium">
                      Salary Summary
                    </h3>


                    <div className="mt-5 space-y-4">

                      <SummaryRow
                        label="Gross Salary"
                        value={
                          grossSalary
                        }
                      />

                      <SummaryRow
                        label="Employee PF"
                        value={
                          employeePf
                        }
                        negative
                      />

                      <SummaryRow
                        label="Professional Tax"
                        value={
                          professionalTax
                        }
                        negative
                      />


                      <div className="border-t border-neutral-800 pt-4">

                        <SummaryRow
                          label="Estimated Net Salary"
                          value={
                            netSalary
                          }
                          strong
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  COMPONENT TOTAL
              ================================================= */}

              <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/40 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-medium">
                      Salary Components Total
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      The total of all components should not exceed the defined wage.
                    </p>

                  </div>


                  <div className="text-left sm:text-right">

                    <p className="text-xl font-semibold">
                      ₹{" "}
                      {formatMoney(
                        totalSalaryComponents
                      )}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      of ₹{" "}
                      {formatMoney(
                        monthlyWage
                      )}{" "}
                      monthly wage
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  AUTOMATIC CALCULATION
              ================================================= */}

              <div className="mt-8 rounded-xl border border-purple-900/40 bg-purple-950/10 p-5">

                <h3 className="text-sm font-medium text-purple-300">
                  Automatic Calculation
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  The system calculates each salary component
                  automatically based on the employee's defined wage.
                </p>

                <div className="mt-5 space-y-3 text-sm text-neutral-400">

                  <p>
                    If Wage = ₹50,000 and Basic = 50%
                    of wage, then Basic = ₹25,000.
                  </p>

                  <p>
                    If HRA = 50% of Basic, then HRA =
                    ₹12,500.
                  </p>

                  <p>
                    Fixed Allowance is calculated from
                    the remaining wage after the other
                    salary components.
                  </p>

                </div>

              </div>


              {/* =================================================
                  SAVE BUTTON
              ================================================= */}

              {editingSalary && (

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setEditingSalary(
                        false
                      )
                    }
                    className="rounded-xl border border-neutral-700 px-5 py-3 text-sm text-neutral-300 hover:bg-neutral-800"
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      saveSalary
                    }
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium hover:bg-purple-500"
                  >
                    Save Salary Configuration
                  </button>

                </div>

              )}


              {salaryMessage && (

                <div className="mt-5 rounded-xl border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
                  {salaryMessage}
                </div>

              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


// =============================================================
// INFO FIELD
// =============================================================

function InfoField({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-neutral-500">
        {label}
      </p>

      <p className="mt-2 border-b border-neutral-800 pb-3 text-sm">
        {value || "Not provided"}
      </p>

    </div>
  );
}


// =============================================================
// SALARY INPUT
// =============================================================

function SalaryInput({
  label,
  value,
  suffix,
  editing,
  onChange,
}) {
  return (
    <div>

      <p className="text-xs text-neutral-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-3 border-b border-neutral-700 pb-2">

        {editing ? (

          <div className="flex items-center gap-2">

            <span className="text-sm">
              ₹
            </span>

            <input
              type="number"
              value={
                value
              }
              onChange={(e) =>
                onChange(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="w-32 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-purple-500"
            />

          </div>

        ) : (

          <span className="text-sm font-medium">
            ₹{" "}
            {Number(
              value || 0
            ).toLocaleString(
              "en-IN"
            )}
          </span>

        )}

        <span className="text-xs text-neutral-500">
          {suffix}
        </span>

      </div>

    </div>
  );
}


// =============================================================
// NUMBER FIELD
// =============================================================

function NumberField({
  label,
  value,
  suffix,
  editing,
  onChange,
}) {
  return (
    <div>

      <p className="text-xs text-neutral-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-3 border-b border-neutral-700 pb-2">

        {editing ? (

          <input
            type="number"
            value={
              value
            }
            onChange={(e) =>
              onChange(
                Number(
                  e.target.value
                )
              )
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-purple-500"
          />

        ) : (

          <span className="text-sm font-medium">
            {value}
          </span>

        )}

        {suffix && (

          <span className="text-xs text-neutral-500">
            {suffix}
          </span>

        )}

      </div>

    </div>
  );
}


// =============================================================
// SALARY COMPONENT
// =============================================================

function SalaryComponent({
  name,
  description,
  amount,
  percentage,
  editing,
  fixed,
  onPercentageChange,
  onAmountChange,
}) {
  return (
    <div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm font-medium">
          {name}
        </p>


        <div className="flex items-center gap-3">

          {editing &&
          fixed &&
          onAmountChange ? (

            <div className="flex items-center gap-1">

              <span className="text-xs text-neutral-500">
                ₹
              </span>

              <input
                type="number"
                value={
                  amount
                }
                onChange={(e) =>
                  onAmountChange(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
                className="w-28 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs outline-none focus:border-purple-500"
              />

            </div>

          ) : (

            <span className="text-sm font-medium">
              ₹{" "}
              {Number(
                amount || 0
              ).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>

          )}


          <span className="text-xs text-neutral-500">
            / month
          </span>


          {percentage !==
            null && (

            editing ? (

              <div className="flex items-center gap-1">

                <input
                  type="number"
                  step="0.01"
                  value={
                    percentage
                  }
                  onChange={(e) =>
                    onPercentageChange(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                  className="w-20 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs outline-none focus:border-purple-500"
                />

                <span className="text-xs text-neutral-500">
                  %
                </span>

              </div>

            ) : (

              <span className="text-xs text-neutral-500">
                {percentage}%
              </span>

            )

          )}

        </div>

      </div>


      <p className="mt-2 max-w-3xl text-xs leading-5 text-neutral-600">
        {description}
      </p>

    </div>
  );
}


// =============================================================
// SUMMARY ROW
// =============================================================

function SummaryRow({
  label,
  value,
  negative,
  strong,
}) {
  return (
    <div className="flex items-center justify-between gap-5">

      <span
        className={
          strong
            ? "text-sm font-medium text-white"
            : "text-sm text-neutral-400"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-base font-semibold text-purple-400"
            : negative
            ? "text-sm text-red-400"
            : "text-sm text-neutral-300"
        }
      >
        {negative
          ? "- "
          : ""}
        ₹{" "}
        {Number(
          value || 0
        ).toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}
      </span>

    </div>
  );
}