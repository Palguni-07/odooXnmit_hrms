import { useEffect, useState } from "react";
import { api } from "./api";

export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState("resume");

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isMyProfile, setIsMyProfile] = useState(false);

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    // ---------------------------------------------------
    // PERSONAL / PROFILE
    // ---------------------------------------------------

    mobile: "",
    date_of_birth: "",
    residential_address: "",
    nationality: "",

    // ---------------------------------------------------
    // RESUME
    // ---------------------------------------------------

    about: "",
    skills: "",
    certifications: "",
    experience: "",

    // ---------------------------------------------------
    // WORK INFORMATION
    // Displayed but Admin-controlled
    // ---------------------------------------------------

    company: "",
    department: "",
    manager: "",
    location: "",

    // ---------------------------------------------------
    // BANK INFORMATION
    // Employee can edit these
    // ---------------------------------------------------

    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  // =====================================================
  // CREATE FORM DATA FROM EMPLOYEE
  // =====================================================

  function createFormData(data) {
    return {
      // -------------------------------------------------
      // PERSONAL
      // -------------------------------------------------

      mobile: data.mobile || "",

      date_of_birth:
        data.date_of_birth || "",

      residential_address:
        data.residential_address ||
        data.address ||
        "",

      nationality:
        data.nationality || "",

      // -------------------------------------------------
      // RESUME
      // -------------------------------------------------

      about: data.about || "",

      skills: data.skills || "",

      certifications:
        data.certifications || "",

      experience:
        data.experience || "",

      // -------------------------------------------------
      // WORK INFORMATION
      // -------------------------------------------------

      company:
        data.company || "",

      department:
        data.department || "",

      manager:
        data.manager || "",

      location:
        data.location || "",

      // -------------------------------------------------
      // BANK INFORMATION
      // -------------------------------------------------

      bank_name:
        data.bank_name || "",

      account_number:
        data.account_number || "",

      ifsc_code:
        data.ifsc_code || "",
    };
  }

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    async function loadProfile() {
      try {
        const token =
          localStorage.getItem(
            "dayflow_token"
          );

        const role =
          localStorage.getItem(
            "dayflow_role"
          ) || "employee";

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        // =================================================
        // ADMIN VIEWING SELECTED EMPLOYEE
        // =================================================

        if (role === "admin") {
          const selectedEmployee =
            sessionStorage.getItem(
              "selectedEmployee"
            );

          if (selectedEmployee) {
            try {
              const parsedEmployee =
                JSON.parse(
                  selectedEmployee
                );

              setEmployee(
                parsedEmployee
              );

              setIsMyProfile(false);

              setFormData(
                createFormData(
                  parsedEmployee
                )
              );

              return;
            } catch (parseError) {
              console.error(
                "Selected employee parse error:",
                parseError
              );

              sessionStorage.removeItem(
                "selectedEmployee"
              );
            }
          }
        }

        // =================================================
        // EMPLOYEE / ADMIN OWN PROFILE
        // =================================================

        const data = await api(
          "/me",
          {
            token,
          }
        );

        setEmployee(data);

        setIsMyProfile(true);

        setFormData(
          createFormData(data)
        );
      } catch (error) {
        console.error(
          "Profile error:",
          error
        );

        setError(
          error.message ||
            "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  function formatCurrency(value) {
    const amount = Number(
      value || 0
    );

    return `₹${amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  // =====================================================
  // MASK ACCOUNT NUMBER
  // =====================================================

  function maskAccountNumber(
    accountNumber
  ) {
    if (!accountNumber) {
      return "Not provided";
    }

    const value =
      String(accountNumber);

    if (value.length <= 4) {
      return value;
    }

    return `•••• ${value.slice(-4)}`;
  }

  // =====================================================
  // UPDATE FORM FIELD
  // =====================================================

  function updateFormField(
    field,
    value
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // =====================================================
  // START EDITING
  // =====================================================

  function handleStartEditing() {
    setSaveMessage("");
    setError("");

    setFormData(
      createFormData(employee)
    );

    setEditing(true);
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setSaveMessage("");
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

      // =================================================
      // ONLY SEND EMPLOYEE-EDITABLE FIELDS
      //
      // This prevents accidental attempts to modify
      // company / department / manager / location.
      // =================================================

      const employeeUpdates = {
        mobile:
          formData.mobile,

        date_of_birth:
          formData.date_of_birth,

        address:
          formData.residential_address,

        about:
          formData.about,

        skills:
          formData.skills,

        certifications:
          formData.certifications,

        experience:
          formData.experience,

        nationality:
          formData.nationality,

        // BANK INFORMATION
        bank_name:
          formData.bank_name,

        account_number:
          formData.account_number,

        ifsc_code:
          formData.ifsc_code,
      };

      const updatedEmployee =
        await api(
          "/me/profile",
          {
            method: "PUT",
            token,
            body: employeeUpdates,
          }
        );

      // =================================================
      // API RETURNS employee_response()
      // =================================================

      setEmployee(
        updatedEmployee
      );

      setFormData(
        createFormData(
          updatedEmployee
        )
      );

      setEditing(false);

      setSaveMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  function handleCancelEdit() {
    setEditing(false);

    setSaveMessage("");

    setError("");

    setFormData(
      createFormData(employee)
    );
  }

  // =====================================================
  // GO BACK TO DASHBOARD
  // =====================================================

  function goBackToDashboard() {
    sessionStorage.removeItem(
      "selectedEmployee"
    );

    window.location.href =
      "/dashboard";
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-6 py-5 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="border-b border-neutral-800 bg-neutral-900">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 font-bold">
              D
            </div>

            <span className="font-semibold">
              Dayflow
            </span>

          </div>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-2 md:flex">

            <button
              onClick={
                goBackToDashboard
              }
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Employees
            </button>

            <button
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Attendance
            </button>

            <button
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Time Off
            </button>

          </nav>

          {/* PROFILE AVATAR */}

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-semibold">

            {(employee.name || "E")
              .charAt(0)
              .toUpperCase()}

          </div>

        </div>

      </header>


      {/* ================================================= */}
      {/* MAIN PROFILE */}
      {/* ================================================= */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* ================================================= */}
        {/* PAGE TITLE */}
        {/* ================================================= */}

        <div className="mb-6">

          <button
            onClick={
              goBackToDashboard
            }
            className="mb-5 text-sm text-neutral-400 hover:text-white"
          >
            ← Back to Employees
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <h1 className="text-2xl font-semibold">
              {isMyProfile
                ? "My Profile"
                : "Employee Profile"}
            </h1>

            {/* ================================================= */}
            {/* EDIT PROFILE BUTTON */}
            {/* ================================================= */}

            {isMyProfile &&
              !editing && (

                <button
                  onClick={
                    handleStartEditing
                  }
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium hover:bg-purple-500"
                >
                  Edit Profile
                </button>

              )}

          </div>


          {/* ================================================= */}
          {/* SAVE / CANCEL */}
          {/* ================================================= */}

          {isMyProfile &&
            editing && (

              <div className="mt-4 flex flex-wrap gap-3">

                <button
                  onClick={
                    handleSaveProfile
                  }
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                  className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            )}


          {/* ================================================= */}
          {/* SUCCESS MESSAGE */}
          {/* ================================================= */}

          {saveMessage && (

            <div className="mt-4 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              {saveMessage}
            </div>

          )}


          {/* ================================================= */}
          {/* ERROR MESSAGE */}
          {/* ================================================= */}

          {error && employee && (

            <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>

          )}

        </div>


        {/* ================================================= */}
        {/* PROFILE HEADER */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {/* AVATAR */}

            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-4xl font-semibold">

              {(employee.name || "E")
                .charAt(0)
                .toUpperCase()}

            </div>


            {/* BASIC INFORMATION */}

            <div className="flex-1">

              <h2 className="text-2xl font-semibold">
                {employee.name ||
                  "Employee"}
              </h2>

              <p className="mt-1 text-neutral-400">
                {employee.jobPosition ||
                  employee.job_position ||
                  "Employee"}
              </p>


              {/* EMAIL + MOBILE */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* EMAIL */}

                <div>

                  <p className="text-xs text-neutral-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm">
                    {employee.email ||
                      "Not provided"}
                  </p>

                </div>


                {/* MOBILE */}

                <div>

                  <p className="text-xs text-neutral-500">
                    Mobile
                  </p>

                  {editing &&
                  isMyProfile ? (

                    <input
                      type="text"
                      value={
                        formData.mobile
                      }
                      onChange={(e) =>
                        updateFormField(
                          "mobile",
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="Mobile number"
                    />

                  ) : (

                    <p className="mt-1 text-sm">
                      {employee.mobile ||
                        "Not provided"}
                    </p>

                  )}

                </div>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* WORK INFORMATION */}
          {/* ================================================= */}

          <div className="mt-8 grid grid-cols-1 gap-5 border-t border-neutral-800 pt-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* COMPANY */}

            <div>

              <p className="text-xs text-neutral-500">
                Company
              </p>

              <p className="mt-1 text-sm">
                {employee.company ||
                  "Not provided"}
              </p>

            </div>


            {/* DEPARTMENT */}

            <div>

              <p className="text-xs text-neutral-500">
                Department
              </p>

              <p className="mt-1 text-sm">
                {employee.department ||
                  "Not provided"}
              </p>

            </div>


            {/* MANAGER */}

            <div>

              <p className="text-xs text-neutral-500">
                Manager
              </p>

              <p className="mt-1 text-sm">
                {employee.manager ||
                  "Not provided"}
              </p>

            </div>


            {/* LOCATION */}

            <div>

              <p className="text-xs text-neutral-500">
                Location
              </p>

              <p className="mt-1 text-sm">
                {employee.location ||
                  "Not provided"}
              </p>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900">

          {/* ================================================= */}
          {/* TAB BUTTONS */}
          {/* ================================================= */}

          <div className="flex overflow-x-auto border-b border-neutral-800">

            {/* RESUME */}

            <button
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


            {/* PRIVATE INFO */}

            <button
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


            {/* SALARY INFO */}

            <button
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


          {/* ================================================= */}
          {/* TAB CONTENT */}
          {/* ================================================= */}

          <div className="p-6">


            {/* ================================================= */}
            {/* RESUME */}
            {/* ================================================= */}

            {activeTab === "resume" && (

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* ABOUT */}

                <div className="rounded-xl border border-neutral-800 p-5 md:col-span-2">

                  <h3 className="font-medium">
                    About
                  </h3>

                  {editing &&
                  isMyProfile ? (

                    <textarea
                      value={
                        formData.about
                      }
                      onChange={(e) =>
                        updateFormField(
                          "about",
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder="Tell us about yourself, your professional background, experience, interests, etc."
                      className="mt-3 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />

                  ) : (

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-400">
                      {employee.about ||
                        "No information added yet."}
                    </p>

                  )}

                </div>


                {/* SKILLS */}

                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Skills
                  </h3>

                  {editing &&
                  isMyProfile ? (

                    <textarea
                      value={
                        formData.skills
                      }
                      onChange={(e) =>
                        updateFormField(
                          "skills",
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder="Example: React, Python, MongoDB, Communication"
                      className="mt-3 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />

                  ) : (

                    <div className="mt-3">

                      {employee.skills ? (

                        <div className="flex flex-wrap gap-2">

                          {String(
                            employee.skills
                          )
                            .split(",")
                            .map(
                              (
                                skill,
                                index
                              ) => {

                                const cleanSkill =
                                  skill.trim();

                                if (
                                  !cleanSkill
                                ) {
                                  return null;
                                }

                                return (
                                  <span
                                    key={
                                      index
                                    }
                                    className="rounded-full border border-purple-800 bg-purple-950/30 px-3 py-1 text-xs text-purple-300"
                                  >
                                    {
                                      cleanSkill
                                    }
                                  </span>
                                );
                              }
                            )}

                        </div>

                      ) : (

                        <p className="text-sm text-neutral-500">
                          No skills added yet.
                        </p>

                      )}

                    </div>

                  )}

                </div>


                {/* CERTIFICATIONS */}

                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Certifications
                  </h3>

                  {editing &&
                  isMyProfile ? (

                    <textarea
                      value={
                        formData.certifications
                      }
                      onChange={(e) =>
                        updateFormField(
                          "certifications",
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder="Example: AWS Certified Developer, Google Data Analytics"
                      className="mt-3 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />

                  ) : (

                    <div className="mt-3">

                      {employee.certifications ? (

                        <div className="space-y-2">

                          {String(
                            employee.certifications
                          )
                            .split(",")
                            .map(
                              (
                                certification,
                                index
                              ) => {

                                const cleanCertification =
                                  certification.trim();

                                if (
                                  !cleanCertification
                                ) {
                                  return null;
                                }

                                return (
                                  <div
                                    key={
                                      index
                                    }
                                    className="rounded-lg bg-neutral-950 px-3 py-2 text-sm text-neutral-300"
                                  >
                                    {
                                      cleanCertification
                                    }
                                  </div>
                                );
                              }
                            )}

                        </div>

                      ) : (

                        <p className="text-sm text-neutral-500">
                          No certifications added yet.
                        </p>

                      )}

                    </div>

                  )}

                </div>


                {/* EXPERIENCE */}

                <div className="rounded-xl border border-neutral-800 p-5 md:col-span-2">

                  <h3 className="font-medium">
                    Experience
                  </h3>

                  {editing &&
                  isMyProfile ? (

                    <textarea
                      value={
                        formData.experience
                      }
                      onChange={(e) =>
                        updateFormField(
                          "experience",
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder="Describe your previous work experience."
                      className="mt-3 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />

                  ) : (

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-400">
                      {employee.experience ||
                        "No experience added yet."}
                    </p>

                  )}

                </div>

              </div>

            )}


            {/* ================================================= */}
            {/* PRIVATE INFO */}
            {/* ================================================= */}

            {activeTab === "private" && (

              <div className="space-y-6">

                <div>

                  <h3 className="text-lg font-semibold">
                    Private Information
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Personal and bank information
                    maintained by you.
                  </p>

                </div>


                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* DATE OF BIRTH */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Date of Birth
                    </p>

                    {editing &&
                    isMyProfile ? (

                      <input
                        type="date"
                        value={
                          formData.date_of_birth
                        }
                        onChange={(e) =>
                          updateFormField(
                            "date_of_birth",
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />

                    ) : (

                      <p className="mt-2 text-sm">
                        {employee.date_of_birth ||
                          "Not provided"}
                      </p>

                    )}

                  </div>


                  {/* RESIDENTIAL ADDRESS */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Residential Address
                    </p>

                    {editing &&
                    isMyProfile ? (

                      <textarea
                        value={
                          formData.residential_address
                        }
                        onChange={(e) =>
                          updateFormField(
                            "residential_address",
                            e.target.value
                          )
                        }
                        rows={3}
                        placeholder="Enter your residential address"
                        className="mt-2 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />

                    ) : (

                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {employee.residential_address ||
                          employee.address ||
                          "Not provided"}
                      </p>

                    )}

                  </div>


                  {/* NATIONALITY */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Nationality
                    </p>

                    {editing &&
                    isMyProfile ? (

                      <input
                        type="text"
                        value={
                          formData.nationality
                        }
                        onChange={(e) =>
                          updateFormField(
                            "nationality",
                            e.target.value
                          )
                        }
                        placeholder="Nationality"
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />

                    ) : (

                      <p className="mt-2 text-sm">
                        {employee.nationality ||
                          "Not provided"}
                      </p>

                    )}

                  </div>


                  {/* ================================================= */}
                  {/* BANK NAME */}
                  {/* ================================================= */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Bank Name
                    </p>

                    {editing &&
                    isMyProfile ? (

                      <input
                        type="text"
                        value={
                          formData.bank_name
                        }
                        onChange={(e) =>
                          updateFormField(
                            "bank_name",
                            e.target.value
                          )
                        }
                        placeholder="Enter bank name"
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />

                    ) : (

                      <p className="mt-2 text-sm">
                        {employee.bank_name ||
                          "Not provided"}
                      </p>

                    )}

                  </div>


                  {/* ================================================= */}
                  {/* ACCOUNT NUMBER */}
                  {/* ================================================= */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      Account Number
                    </p>

                    {editing &&
                    isMyProfile ? (

                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          formData.account_number
                        }
                        onChange={(e) =>
                          updateFormField(
                            "account_number",
                            e.target.value
                          )
                        }
                        placeholder="Enter account number"
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />

                    ) : (

                      <p className="mt-2 text-sm">
                        {maskAccountNumber(
                          employee.account_number
                        )}
                      </p>

                    )}

                  </div>


                  {/* ================================================= */}
                  {/* IFSC CODE */}
                  {/* ================================================= */}

                  <div className="rounded-xl border border-neutral-800 p-5">

                    <p className="text-xs text-neutral-500">
                      IFSC Code
                    </p>

                    {editing &&
                    isMyProfile ? (

                      <input
                        type="text"
                        value={
                          formData.ifsc_code
                        }
                        onChange={(e) =>
                          updateFormField(
                            "ifsc_code",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="Example: SBIN0001234"
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm uppercase text-white outline-none focus:border-purple-500"
                      />

                    ) : (

                      <p className="mt-2 text-sm">
                        {employee.ifsc_code ||
                          "Not provided"}
                      </p>

                    )}

                  </div>

                </div>


                {/* ================================================= */}
                {/* INFORMATION MESSAGE */}
                {/* ================================================= */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-4">

                  <p className="text-sm text-neutral-400">
                    You can edit your personal and
                    bank information from the
                    Edit Profile button.
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    Account numbers are partially
                    hidden when you are not editing
                    your profile.
                  </p>

                </div>

              </div>

            )}


            {/* ================================================= */}
            {/* SALARY INFO */}
            {/* ================================================= */}

            {activeTab === "salary" && (

              <div className="space-y-6">

                {/* SALARY HEADER */}

                <div>

                  <h3 className="text-lg font-semibold">
                    Salary Information
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Your current salary details.
                  </p>

                </div>


                {/* SALARY GRID */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* BASIC SALARY */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">

                    <p className="text-xs text-neutral-500">
                      Basic Salary
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(
                        employee.basic_salary
                      )}
                    </p>

                  </div>


                  {/* HRA */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">

                    <p className="text-xs text-neutral-500">
                      HRA
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(
                        employee.hra
                      )}
                    </p>

                  </div>


                  {/* ALLOWANCES */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">

                    <p className="text-xs text-neutral-500">
                      Allowances
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(
                        employee.allowances
                      )}
                    </p>

                  </div>


                  {/* GROSS SALARY */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">

                    <p className="text-xs text-neutral-500">
                      Gross Salary
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(
                        employee.gross_salary
                      )}
                    </p>

                  </div>


                  {/* DEDUCTIONS */}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">

                    <p className="text-xs text-neutral-500">
                      Deductions
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(
                        employee.deductions
                      )}
                    </p>

                  </div>


                  {/* NET SALARY */}

                  <div className="rounded-xl border border-purple-800 bg-purple-950/20 p-5">

                    <p className="text-xs text-purple-400">
                      Net Salary
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-purple-300">
                      {formatCurrency(
                        employee.net_salary
                      )}
                    </p>

                  </div>

                </div>


                {/* SALARY INFORMATION */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-4">

                  <p className="text-sm text-neutral-400">
                    Salary information is managed
                    by Admin.
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    You can view your salary details
                    here, but you cannot modify them.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}