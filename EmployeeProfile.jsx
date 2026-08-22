import { useEffect, useState } from "react";
import { api } from "./api";

export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState("resume");

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isMyProfile, setIsMyProfile] = useState(false);

  // EDIT PROFILE
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    mobile: "",
    company: "",
    department: "",
    manager: "",
    location: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const token =
          localStorage.getItem("dayflow_token");

        const role =
          localStorage.getItem("dayflow_role") ||
          "employee";

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        /*
         * ADMIN
         *
         * If Admin clicked an employee card,
         * selectedEmployee contains that employee.
         *
         * Otherwise Admin views their own profile.
         */

        if (role === "admin") {
          const selectedEmployee =
            sessionStorage.getItem(
              "selectedEmployee"
            );

          if (selectedEmployee) {
            const parsedEmployee =
              JSON.parse(selectedEmployee);

            setEmployee(parsedEmployee);
            setIsMyProfile(false);

            return;
          }
        }

        /*
         * EMPLOYEE
         *
         * Employees ALWAYS get their own
         * profile from /me.
         *
         * We deliberately ignore selectedEmployee.
         */

        const data = await api("/me", {
          token,
        });

        setEmployee(data);
        setIsMyProfile(true);

        // Fill edit form with current data
        setFormData({
          mobile: data.mobile || "",
          company: data.company || "",
          department: data.department || "",
          manager: data.manager || "",
          location: data.location || "",
        });

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


  /* ================================================= */
  /* SAVE PROFILE */
  /* ================================================= */

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setSaveMessage("");
      setError("");

      const token =
        localStorage.getItem("dayflow_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const updatedEmployee = await api(
        "/me/profile",
        {
          method: "PUT",
          token,
          body: formData,
        }
      );

      // Update displayed profile
      setEmployee(updatedEmployee);

      // Update form with saved values
      setFormData({
        mobile:
          updatedEmployee.mobile || "",
        company:
          updatedEmployee.company || "",
        department:
          updatedEmployee.department || "",
        manager:
          updatedEmployee.manager || "",
        location:
          updatedEmployee.location || "",
      });

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


  /* ================================================= */
  /* CANCEL EDITING */
  /* ================================================= */

  function handleCancelEdit() {
    setEditing(false);
    setSaveMessage("");
    setError("");

    setFormData({
      mobile: employee.mobile || "",
      company: employee.company || "",
      department: employee.department || "",
      manager: employee.manager || "",
      location: employee.location || "",
    });
  }


  /* ================================================= */
  /* LOADING */
  /* ================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }


  /* ================================================= */
  /* ERROR */
  /* ================================================= */

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
              onClick={() => {
                sessionStorage.removeItem(
                  "selectedEmployee"
                );

                window.location.href =
                  "/dashboard";
              }}
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
            {employee.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

        </div>

      </header>


      {/* ================================================= */}
      {/* PROFILE */}
      {/* ================================================= */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* PAGE TITLE */}

        <div className="mb-6">

          <button
            onClick={() => {
              sessionStorage.removeItem(
                "selectedEmployee"
              );

              window.location.href =
                "/dashboard";
            }}
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


            {/* EDIT BUTTON ONLY FOR OWN PROFILE */}

            {isMyProfile && !editing && (
              <button
                onClick={() => {
                  setSaveMessage("");
                  setError("");
                  setEditing(true);
                }}
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium hover:bg-purple-500"
              >
                Edit Profile
              </button>
            )}

          </div>


          {/* SAVE / CANCEL BUTTONS */}

          {isMyProfile && editing && (
            <div className="mt-4 flex gap-3">

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>


              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl border border-neutral-700 px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
              >
                Cancel
              </button>

            </div>
          )}


          {/* SUCCESS MESSAGE */}

          {saveMessage && (
            <div className="mt-4 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              {saveMessage}
            </div>
          )}


          {/* ERROR MESSAGE */}

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
                  "Employee"}
              </p>


              {/* EMAIL + MOBILE */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* EMAIL */}

                <div>

                  <p className="text-xs text-neutral-500">
                    Email
                  </p>

                  <p className="mt-1 text-sm">
                    {employee.email ||
                      "Not provided"}
                  </p>

                </div>


                {/* MOBILE */}

                <div>

                  <p className="text-xs text-neutral-500">
                    Mobile
                  </p>

                  {editing && isMyProfile ? (

                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile:
                            e.target.value,
                        })
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
          {/* COMPANY INFORMATION */}
          {/* ================================================= */}

          <div className="mt-8 grid grid-cols-1 gap-5 border-t border-neutral-800 pt-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* COMPANY */}

            <div>

              <p className="text-xs text-neutral-500">
                Company
              </p>

              {editing && isMyProfile ? (

                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      company:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Company"
                />

              ) : (

                <p className="mt-1 text-sm">
                  {employee.company ||
                    "Not provided"}
                </p>

              )}

            </div>


            {/* DEPARTMENT */}

            <div>

              <p className="text-xs text-neutral-500">
                Department
              </p>

              {editing && isMyProfile ? (

                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Department"
                />

              ) : (

                <p className="mt-1 text-sm">
                  {employee.department ||
                    "Not provided"}
                </p>

              )}

            </div>


            {/* MANAGER */}

            <div>

              <p className="text-xs text-neutral-500">
                Manager
              </p>

              {editing && isMyProfile ? (

                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manager:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Manager"
                />

              ) : (

                <p className="mt-1 text-sm">
                  {employee.manager ||
                    "Not provided"}
                </p>

              )}

            </div>


            {/* LOCATION */}

            <div>

              <p className="text-xs text-neutral-500">
                Location
              </p>

              {editing && isMyProfile ? (

                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location:
                        e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Location"
                />

              ) : (

                <p className="mt-1 text-sm">
                  {employee.location ||
                    "Not provided"}
                </p>

              )}

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900">

          {/* TAB BUTTONS */}

          <div className="flex overflow-x-auto border-b border-neutral-800">

            {/* RESUME */}

            <button
              onClick={() =>
                setActiveTab("resume")
              }
              className={`px-6 py-4 text-sm font-medium ${
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
                setActiveTab("private")
              }
              className={`px-6 py-4 text-sm font-medium ${
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
                setActiveTab("salary")
              }
              className={`px-6 py-4 text-sm font-medium ${
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

                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    About
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Employee information and professional
                    background will appear here.
                  </p>

                </div>


                {/* SKILLS */}

                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Skills
                  </h3>

                  <p className="mt-3 text-sm text-neutral-500">
                    No skills added yet.
                  </p>

                </div>


                {/* CERTIFICATIONS */}

                <div className="rounded-xl border border-neutral-800 p-5">

                  <h3 className="font-medium">
                    Certifications
                  </h3>

                  <p className="mt-3 text-sm text-neutral-500">
                    No certifications added yet.
                  </p>

                </div>

              </div>

            )}


            {/* ================================================= */}
            {/* PRIVATE INFO */}
            {/* ================================================= */}

            {activeTab === "private" && (

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <p className="text-xs text-neutral-500">
                    Date of Birth
                  </p>

                  <p className="mt-1 text-sm">
                    Not provided
                  </p>

                </div>


                <div>

                  <p className="text-xs text-neutral-500">
                    Bank Details
                  </p>

                  <p className="mt-1 text-sm">
                    Not provided
                  </p>

                </div>


                <div>

                  <p className="text-xs text-neutral-500">
                    Residential Address
                  </p>

                  <p className="mt-1 text-sm">
                    Not provided
                  </p>

                </div>


                <div>

                  <p className="text-xs text-neutral-500">
                    Account Number
                  </p>

                  <p className="mt-1 text-sm">
                    Not provided
                  </p>

                </div>


                <div>

                  <p className="text-xs text-neutral-500">
                    Nationality
                  </p>

                  <p className="mt-1 text-sm">
                    Not provided
                  </p>

                </div>


                <div>

                  <p className="text-xs text-neutral-500">
                    Bank Name
                  </p>

                  <p className="mt-1 text-sm">
                    Not provided
                  </p>

                </div>

              </div>

            )}


            {/* ================================================= */}
            {/* SALARY */}
            {/* ================================================= */}

            {activeTab === "salary" && (

              <div className="rounded-xl border border-neutral-800 p-6">

                {employee.role === "admin" ? (

                  <>
                    <p className="text-sm text-neutral-400">
                      Salary information can be managed by authorized Admin/HR users.
                    </p>

                    <p className="mt-2 text-xs text-neutral-600">
                      Salary management functionality will be added next.
                    </p>
                  </>

                ) : (

                  <>
                    <p className="text-sm text-neutral-400">
                      Salary information is restricted.
                    </p>

                    <p className="mt-2 text-xs text-neutral-600">
                      Salary details will only be displayed
                      to authorized Admin/HR users.
                    </p>
                  </>

                )}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}