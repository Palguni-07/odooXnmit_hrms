from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends

from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

from datetime import (
    datetime,
    timezone,
    timedelta
)

from database import (
    employees_col,
    attendance_col,
    leave_col
)

from auth import (
    verify_password,
    hash_password,
    create_token,
    get_current_user
)

import secrets
import string


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Dayflow HRMS API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# NOTIFICATIONS COLLECTION
# =========================================================

notifications_col = (
    employees_col.database["notifications"]
)


# =========================================================
# REQUEST MODELS
# =========================================================

class LoginRequest(BaseModel):

    login: str
    password: str


class SignupRequest(BaseModel):

    company: str
    name: str
    email: str
    phone: Optional[str] = ""


class ChangePasswordRequest(BaseModel):

    current_password: str
    new_password: str


class UpdateProfileRequest(BaseModel):

    # =====================================================
    # PERSONAL INFORMATION
    # Employee can update these
    # =====================================================

    mobile: Optional[str] = None
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[str] = None

    # =====================================================
    # RESUME INFORMATION
    # Employee can update these
    # =====================================================

    about: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    experience: Optional[str] = None

    # =====================================================
    # WORK INFORMATION
    # Admin can update these
    # =====================================================

    company: Optional[str] = None
    department: Optional[str] = None
    manager: Optional[str] = None
    location: Optional[str] = None

    job_position: Optional[str] = None
    joining_date: Optional[str] = None

    # =====================================================
    # SALARY INFORMATION
    # Admin only
    # =====================================================

    basic_salary: Optional[float] = None
    hra: Optional[float] = None
    allowances: Optional[float] = None
    deductions: Optional[float] = None
    gross_salary: Optional[float] = None
    net_salary: Optional[float] = None

    # =====================================================
    # BANK INFORMATION
    # Admin only
    # =====================================================

    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None


class LeaveRequest(BaseModel):

    leave_type: str
    start_date: str
    end_date: str
    reason: Optional[str] = ""


# =========================================================
# HELPER - EMPLOYEE RESPONSE
# =========================================================

def employee_response(employee):

    return {

        "id": str(
            employee["_id"]
        ),

        # -------------------------------------------------
        # BASIC INFORMATION
        # -------------------------------------------------

        "name": employee.get(
            "name",
            ""
        ),

        "login_id": employee.get(
            "login_id",
            ""
        ),

        "email": employee.get(
            "email",
            ""
        ),

        "mobile": employee.get(
            "mobile",
            ""
        ),

        "role": employee.get(
            "role",
            ""
        ),

        "status": employee.get(
            "status",
            "Active"
        ),

        # -------------------------------------------------
        # PRIVATE / PERSONAL INFORMATION
        # -------------------------------------------------

        "date_of_birth": employee.get(
            "date_of_birth",
            ""
        ),

        "nationality": employee.get(
            "nationality",
            ""
        ),

        "address": employee.get(
            "address",
            ""
        ),

        # -------------------------------------------------
        # RESUME INFORMATION
        # -------------------------------------------------

        "about": employee.get(
            "about",
            ""
        ),

        "skills": employee.get(
            "skills",
            ""
        ),

        "certifications": employee.get(
            "certifications",
            ""
        ),

        "experience": employee.get(
            "experience",
            ""
        ),

        # -------------------------------------------------
        # WORK INFORMATION
        # -------------------------------------------------

        "jobPosition": employee.get(
            "job_position",
            ""
        ),

        "job_position": employee.get(
            "job_position",
            ""
        ),

        "company": employee.get(
            "company",
            ""
        ),

        "department": employee.get(
            "department",
            ""
        ),

        "manager": employee.get(
            "manager",
            ""
        ),

        "location": employee.get(
            "location",
            ""
        ),

        "joining_date": employee.get(
            "joining_date",
            ""
        ),

        "joining_year": employee.get(
            "joining_year",
            ""
        ),

        # -------------------------------------------------
        # SALARY INFORMATION
        # -------------------------------------------------

        "basic_salary": employee.get(
            "basic_salary",
            0
        ),

        "hra": employee.get(
            "hra",
            0
        ),

        "allowances": employee.get(
            "allowances",
            0
        ),

        "deductions": employee.get(
            "deductions",
            0
        ),

        "gross_salary": employee.get(
            "gross_salary",
            0
        ),

        "net_salary": employee.get(
            "net_salary",
            0
        ),

        # -------------------------------------------------
        # BANK INFORMATION
        # -------------------------------------------------

        "bank_name": employee.get(
            "bank_name",
            ""
        ),

        "account_number": employee.get(
            "account_number",
            ""
        ),

        "ifsc_code": employee.get(
            "ifsc_code",
            ""
        )
    }


# =========================================================
# HELPER - NORMALIZE DATETIME
# =========================================================

def normalize_datetime(value):

    if value is None:
        return None

    if value.tzinfo is None:

        return value.replace(
            tzinfo=timezone.utc
        )

    return value.astimezone(
        timezone.utc
    )


# =========================================================
# HELPER - CALCULATE HOURS
# =========================================================

def calculate_hours(
    check_in,
    check_out=None
):

    if not check_in:
        return 0

    check_in = normalize_datetime(
        check_in
    )

    if check_out:

        end_time = normalize_datetime(
            check_out
        )

    else:

        end_time = datetime.now(
            timezone.utc
        )

    duration = (
        end_time -
        check_in
    )

    total_seconds = max(
        duration.total_seconds(),
        0
    )

    hours = (
        total_seconds /
        3600
    )

    return round(
        hours,
        2
    )


# =========================================================
# HELPER - DATETIME ISO
# =========================================================

def datetime_iso(value):

    value = normalize_datetime(
        value
    )

    if not value:
        return None

    return value.isoformat()


# =========================================================
# HELPER - PARSE LEAVE DATE
# =========================================================

def parse_leave_date(value):

    try:

        return datetime.strptime(
            value,
            "%Y-%m-%d"
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Dates must use "
                "YYYY-MM-DD format"
            )
        )


# =========================================================
# HELPER - COMPANY CODE
# =========================================================

def create_company_code(
    company_name: str
):

    words = [

        word.strip()

        for word in company_name.split()

        if word.strip()

    ]

    if len(words) >= 2:

        return (

            words[0][0] +

            words[1][0]

        ).upper()

    clean_name = "".join(

        character

        for character in company_name

        if character.isalnum()

    )

    if len(clean_name) < 2:

        raise HTTPException(
            status_code=400,
            detail=(
                "Company name must contain "
                "at least 2 letters"
            )
        )

    return clean_name[:2].upper()


# =========================================================
# HELPER - EMPLOYEE CODE
# =========================================================

def create_employee_code(
    name: str
):

    parts = [

        part.strip()

        for part in name.split()

        if part.strip()

    ]

    if len(parts) < 2:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter both first "
                "name and last name"
            )
        )

    first_name = parts[0]
    last_name = parts[-1]

    return (

        first_name[:2] +

        last_name[:2]

    ).upper()


# =========================================================
# HELPER - TEMPORARY PASSWORD
# =========================================================

def generate_initial_password(
    length=10
):

    characters = (

        string.ascii_letters +

        string.digits +

        "!@#$%"

    )

    return "".join(

        secrets.choice(
            characters
        )

        for _ in range(length)

    )


# =========================================================
# HELPER - GENERATE LOGIN ID
# =========================================================

def generate_login_id(
    company: str,
    name: str,
    joining_year: int
):

    company_code = (
        create_company_code(
            company
        )
    )

    employee_code = (
        create_employee_code(
            name
        )
    )

    prefix = (

        company_code +

        employee_code +

        str(joining_year)

    )

    count = (
        employees_col.count_documents({

            "company":
                company,

            "joining_year":
                joining_year

        })
    )

    serial = count + 1

    login_id = (

        prefix +

        str(serial).zfill(4)

    )

    while employees_col.find_one({

        "login_id":
            login_id

    }):

        serial += 1

        login_id = (

            prefix +

            str(serial).zfill(4)

        )

    return login_id


# =========================================================
# HELPER - CREATE NOTIFICATION
# =========================================================

def create_notification(
    employee_id,
    title,
    message,
    notification_type="general"
):

    if not isinstance(
        employee_id,
        ObjectId
    ):

        employee_id = ObjectId(
            employee_id
        )

    now = datetime.now(
        timezone.utc
    )

    notifications_col.insert_one({

        "employee_id":
            employee_id,

        "title":
            title,

        "message":
            message,

        "type":
            notification_type,

        "read":
            False,

        "created_at":
            now

    })


# =========================================================
# HELPER - NOTIFY ALL ADMINS
# =========================================================

def notify_admins(
    title,
    message,
    notification_type="general"
):

    admins = employees_col.find({

        "role":
            "admin"

    })

    for admin in admins:

        create_notification(

            admin["_id"],

            title,

            message,

            notification_type

        )


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "message":
            "Dayflow HRMS Backend is running"

    }


# =========================================================
# SIGN UP
# =========================================================

@app.post("/signup")
def signup(
    body: SignupRequest
):

    company = (
        body.company.strip()
    )

    name = (
        body.name.strip()
    )

    email = (
        body.email.strip().lower()
    )

    phone = (
        body.phone or ""
    ).strip()

    if not company:

        raise HTTPException(
            status_code=400,
            detail="Company name is required"
        )

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    if "@" not in email:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a valid "
                "email address"
            )
        )

    existing_email = (
        employees_col.find_one({

            "email":
                email

        })
    )

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail=(
                "An account with this "
                "email already exists"
            )
        )

    now = datetime.now(
        timezone.utc
    )

    joining_year = now.year

    joining_date = (
        now.date().isoformat()
    )

    login_id = generate_login_id(

        company,

        name,

        joining_year

    )

    temporary_password = (
        generate_initial_password()
    )

    employee = {

        "name":
            name,

        "email":
            email,

        "mobile":
            phone,

        "company":
            company,

        "login_id":
            login_id,

        "password_hash":
            hash_password(
                temporary_password
            ),

        "must_change_password":
            True,

        "role":
            "employee",

        "status":
            "Active",

        "joining_date":
            joining_date,

        "joining_year":
            joining_year,

        # -------------------------------------------------
        # WORK DEFAULTS
        # -------------------------------------------------

        "department":
            "",

        "job_position":
            "",

        "manager":
            "",

        "location":
            "",

        # -------------------------------------------------
        # PERSONAL INFORMATION
        # -------------------------------------------------

        "date_of_birth":
            "",

        "nationality":
            "",

        "address":
            "",

        # -------------------------------------------------
        # RESUME INFORMATION
        # -------------------------------------------------

        "about":
            "",

        "skills":
            "",

        "certifications":
            "",

        "experience":
            "",

        # -------------------------------------------------
        # SALARY DEFAULTS
        # -------------------------------------------------

        "basic_salary":
            0,

        "hra":
            0,

        "allowances":
            0,

        "deductions":
            0,

        "gross_salary":
            0,

        "net_salary":
            0,

        # -------------------------------------------------
        # BANK DEFAULTS
        # -------------------------------------------------

        "bank_name":
            "",

        "account_number":
            "",

        "ifsc_code":
            "",

        "created_at":
            now,

        "updated_at":
            now

    }

    result = (
        employees_col.insert_one(
            employee
        )
    )

    create_notification(

        result.inserted_id,

        "Welcome to Dayflow",

        (
            "Your employee account has "
            "been created successfully. "
            "Please save your Login ID "
            "and temporary password."
        ),

        "account"

    )

    return {

        "message":
            "Account created successfully.",

        "employee_id":
            str(
                result.inserted_id
            ),

        "login_id":
            login_id,

        "temporary_password":
            temporary_password,

        "email":
            email,

        "must_change_password":
            True

    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    body: LoginRequest
):

    login_value = (
        body.login.strip()
    )

    user = employees_col.find_one({

        "$or": [

            {
                "login_id":
                    login_value
            },

            {
                "email":
                    login_value.lower()
            }

        ]

    })

    if not user:

        raise HTTPException(

            status_code=401,

            detail=(
                "Invalid Login ID "
                "or password"
            )

        )

    if not verify_password(

        body.password,

        user["password_hash"]

    ):

        raise HTTPException(

            status_code=401,

            detail=(
                "Invalid Login ID "
                "or password"
            )

        )

    token = create_token({

        "sub":
            str(
                user["_id"]
            ),

        "role":
            user["role"]

    })

    return {

        "access_token":
            token,

        "token_type":
            "bearer",

        "role":
            user["role"],

        "name":
            user["name"],

        "login_id":
            user["login_id"],

        "must_change_password":
            user.get(
                "must_change_password",
                False
            )

    }


# =========================================================
# CHANGE PASSWORD
# =========================================================

@app.post("/change-password")
def change_password(

    body: ChangePasswordRequest,

    user: dict = Depends(
        get_current_user
    )

):

    employee = employees_col.find_one({

        "_id":
            ObjectId(
                user["sub"]
            )

    })

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    if not verify_password(

        body.current_password,

        employee["password_hash"]

    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "Current password "
                "is incorrect"
            )

        )

    if len(
        body.new_password
    ) < 8:

        raise HTTPException(

            status_code=400,

            detail=(
                "New password must be "
                "at least 8 characters"
            )

        )

    if (
        body.current_password
        ==
        body.new_password
    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "New password must be "
                "different from current password"
            )

        )

    employees_col.update_one(

        {

            "_id":
                employee["_id"]

        },

        {

            "$set": {

                "password_hash":
                    hash_password(
                        body.new_password
                    ),

                "must_change_password":
                    False,

                "updated_at":
                    datetime.now(
                        timezone.utc
                    )

            }

        }

    )

    create_notification(

        employee["_id"],

        "Password Changed",

        (
            "Your Dayflow password "
            "was changed successfully."
        ),

        "security"

    )

    return {

        "message":
            "Password changed successfully",

        "must_change_password":
            False

    }


# =========================================================
# GET MY PROFILE
# =========================================================

@app.get("/me")
def get_my_profile(

    user: dict = Depends(
        get_current_user
    )

):

    employee = employees_col.find_one({

        "_id":
            ObjectId(
                user["sub"]
            )

    })

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    return employee_response(
        employee
    )


# =========================================================
# UPDATE MY PROFILE
# EMPLOYEE ONLY
#
# Employee can update:
#
# - Mobile
# - Date of Birth
# - Nationality
# - Address
# - About
# - Skills
# - Certifications
# - Experience
#
# Employee CANNOT update:
#
# - Company
# - Department
# - Manager
# - Location
# - Job Position
# - Joining Date
# - Salary
# - Bank Information
# =========================================================

@app.put("/me/profile")
def update_my_profile(

    body: UpdateProfileRequest,

    user: dict = Depends(
        get_current_user
    )

):

    employee = employees_col.find_one({

        "_id":
            ObjectId(
                user["sub"]
            )

    })

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    submitted_updates = body.model_dump(

        exclude_unset=True,

        exclude_none=True

    )

    # -----------------------------------------------------
    # FIELDS EMPLOYEE IS ALLOWED TO CHANGE
    # -----------------------------------------------------

    employee_editable_fields = {

        "mobile",

        "date_of_birth",

        "nationality",

        "address",

        "about",

        "skills",

        "certifications",

        "experience"

    }

    # -----------------------------------------------------
    # FIELDS EMPLOYEE IS NOT ALLOWED TO CHANGE
    # -----------------------------------------------------

    protected_fields = {

        "company",

        "department",

        "manager",

        "location",

        "job_position",

        "joining_date",

        "basic_salary",

        "hra",

        "allowances",

        "deductions",

        "gross_salary",

        "net_salary",

        "bank_name",

        "account_number",

        "ifsc_code"

    }

    attempted_protected_fields = [

        field

        for field in submitted_updates

        if field in protected_fields

    ]

    if attempted_protected_fields:

        raise HTTPException(

            status_code=403,

            detail=(
                "You can only update your "
                "personal and resume information. "
                "Work, salary and bank information "
                "can only be updated by Admin."
            )

        )

    # -----------------------------------------------------
    # KEEP ONLY ALLOWED EMPLOYEE FIELDS
    # -----------------------------------------------------

    updates = {

        field: value

        for field, value in submitted_updates.items()

        if field in employee_editable_fields

    }

    # -----------------------------------------------------
    # SAVE TO MONGODB
    # -----------------------------------------------------

    if updates:

        updates["updated_at"] = (
            datetime.now(
                timezone.utc
            )
        )

        employees_col.update_one(

            {

                "_id":
                    employee["_id"]

            },

            {

                "$set":
                    updates

            }

        )

        create_notification(

            employee["_id"],

            "Profile Updated",

            (
                "Your personal profile "
                "information has been "
                "updated successfully."
            ),

            "profile"

        )

    # -----------------------------------------------------
    # RETURN UPDATED DATA
    # -----------------------------------------------------

    updated_employee = (
        employees_col.find_one({

            "_id":
                employee["_id"]

        })
    )

    return employee_response(
        updated_employee
    )


# =========================================================
# GET ALL EMPLOYEES
# ADMIN ONLY
# =========================================================

@app.get("/employees")
def get_employees(

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "admin":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only Admin can "
                "view all employees"
            )

        )

    employees = employees_col.find(

        {},

        {

            "password_hash":
                0

        }

    )

    return [

        employee_response(
            employee
        )

        for employee in employees

    ]


# =========================================================
# UPDATE EMPLOYEE
# ADMIN ONLY
#
# Admin can update:
#
# - Personal information
# - Resume information
# - Department
# - Job Position
# - Manager
# - Location
# - Joining Date
# - Salary
# - Bank Information
# =========================================================

@app.put("/employees/{employee_id}")
def update_employee(

    employee_id: str,

    body: UpdateProfileRequest,

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "admin":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only Admin can "
                "update employees"
            )

        )

    try:

        employee_object_id = ObjectId(
            employee_id
        )

    except Exception:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid employee ID"
            )

        )

    employee = employees_col.find_one({

        "_id":
            employee_object_id

    })

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    updates = body.model_dump(

        exclude_unset=True,

        exclude_none=True

    )

    # -----------------------------------------------------
    # SALARY VALIDATION
    # -----------------------------------------------------

    salary_fields = [

        "basic_salary",

        "hra",

        "allowances",

        "deductions",

        "gross_salary",

        "net_salary"

    ]

    for field in salary_fields:

        if field in updates:

            value = updates[field]

            if value < 0:

                raise HTTPException(

                    status_code=400,

                    detail=(
                        f"{field} cannot "
                        f"be negative"
                    )

                )

    # -----------------------------------------------------
    # AUTOMATIC SALARY CALCULATION
    #
    # Gross =
    # Basic + HRA + Allowances
    #
    # Net =
    # Gross - Deductions
    # -----------------------------------------------------

    salary_was_updated = any(

        field in updates

        for field in [

            "basic_salary",

            "hra",

            "allowances",

            "deductions"

        ]

    )

    if salary_was_updated:

        basic_salary = updates.get(

            "basic_salary",

            employee.get(
                "basic_salary",
                0
            )

        )

        hra = updates.get(

            "hra",

            employee.get(
                "hra",
                0
            )

        )

        allowances = updates.get(

            "allowances",

            employee.get(
                "allowances",
                0
            )

        )

        deductions = updates.get(

            "deductions",

            employee.get(
                "deductions",
                0
            )

        )

        gross_salary = (

            float(basic_salary)

            +

            float(hra)

            +

            float(allowances)

        )

        net_salary = (

            gross_salary

            -

            float(deductions)

        )

        updates["gross_salary"] = round(

            gross_salary,

            2

        )

        updates["net_salary"] = round(

            net_salary,

            2

        )

    # -----------------------------------------------------
    # UPDATED DATE
    # -----------------------------------------------------

    updates["updated_at"] = (

        datetime.now(
            timezone.utc
        )

    )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    employees_col.update_one(

        {

            "_id":
                employee_object_id

        },

        {

            "$set":
                updates

        }

    )

    # -----------------------------------------------------
    # GET UPDATED EMPLOYEE
    # -----------------------------------------------------

    updated_employee = (
        employees_col.find_one({

            "_id":
                employee_object_id

        })
    )

    # -----------------------------------------------------
    # NOTIFY EMPLOYEE
    # -----------------------------------------------------

    create_notification(

        employee_object_id,

        "Profile Updated",

        (
            "Your employee profile has "
            "been updated by Admin."
        ),

        "profile"

    )

    return {

        "message":
            "Employee updated successfully",

        "employee":
            employee_response(
                updated_employee
            )

    }


# =========================================================
# NOTIFICATIONS - MY NOTIFICATIONS
# =========================================================

@app.get("/notifications/me")
def get_my_notifications(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    notifications = (

        notifications_col.find({

            "employee_id":
                employee_id

        })

        .sort(
            "created_at",
            -1
        )

        .limit(50)

    )

    response = []

    for notification in notifications:

        response.append({

            "id":
                str(
                    notification["_id"]
                ),

            "title":
                notification.get(
                    "title",
                    ""
                ),

            "message":
                notification.get(
                    "message",
                    ""
                ),

            "type":
                notification.get(
                    "type",
                    "general"
                ),

            "read":
                notification.get(
                    "read",
                    False
                ),

            "created_at":
                datetime_iso(
                    notification.get(
                        "created_at"
                    )
                )

        })

    return response


# =========================================================
# NOTIFICATIONS - MARK AS READ
# =========================================================

@app.put(
    "/notifications/{notification_id}/read"
)
def mark_notification_read(

    notification_id: str,

    user: dict = Depends(
        get_current_user
    )

):

    try:

        notification_object_id = (
            ObjectId(
                notification_id
            )
        )

    except Exception:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid notification ID"
            )

        )

    result = (
        notifications_col.update_one(

            {

                "_id":
                    notification_object_id,

                "employee_id":
                    ObjectId(
                        user["sub"]
                    )

            },

            {

                "$set": {

                    "read":
                        True

                }

            }

        )
    )

    if result.matched_count == 0:

        raise HTTPException(

            status_code=404,

            detail="Notification not found"

        )

    return {

        "message":
            "Notification marked as read"

    }


# =========================================================
# ATTENDANCE - CHECK IN
# =========================================================

@app.post(
    "/attendance/check-in"
)
def check_in(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    employee = employees_col.find_one({

        "_id":
            employee_id

    })

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    now = datetime.now(
        timezone.utc
    )

    start_of_day = datetime(

        now.year,

        now.month,

        now.day,

        tzinfo=timezone.utc

    )

    existing = attendance_col.find_one({

        "employee_id":
            employee_id,

        "check_in": {

            "$gte":
                start_of_day

        },

        "check_out":
            None

    })

    if existing:

        raise HTTPException(

            status_code=400,

            detail=(
                "You are already "
                "checked in"
            )

        )

    attendance_col.insert_one({

        "employee_id":
            employee_id,

        "employee_name":
            employee.get(
                "name",
                ""
            ),

        "login_id":
            employee.get(
                "login_id",
                ""
            ),

        "check_in":
            now,

        "check_out":
            None

    })

    create_notification(

        employee_id,

        "Attendance",

        "You have successfully checked in.",

        "attendance"

    )

    return {

        "message":
            "Checked in successfully",

        "check_in":
            now.isoformat(),

        "check_out":
            None,

        "checked_in":
            True,

        "total_hours":
            0

    }


# =========================================================
# ATTENDANCE - CHECK OUT
# =========================================================

@app.post(
    "/attendance/check-out"
)
def check_out(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    now = datetime.now(
        timezone.utc
    )

    start_of_day = datetime(

        now.year,

        now.month,

        now.day,

        tzinfo=timezone.utc

    )

    attendance = (
        attendance_col.find_one(

            {

                "employee_id":
                    employee_id,

                "check_in": {

                    "$gte":
                        start_of_day

                },

                "check_out":
                    None

            },

            sort=[

                (
                    "check_in",
                    -1
                )

            ]

        )
    )

    if not attendance:

        raise HTTPException(

            status_code=400,

            detail=(
                "You are not currently "
                "checked in"
            )

        )

    check_in_time = (
        normalize_datetime(
            attendance.get(
                "check_in"
            )
        )
    )

    attendance_col.update_one(

        {

            "_id":
                attendance["_id"]

        },

        {

            "$set": {

                "check_out":
                    now

            }

        }

    )

    total_hours = calculate_hours(

        check_in_time,

        now

    )

    create_notification(

        employee_id,

        "Attendance",

        (
            f"You checked out successfully. "
            f"Total hours: {total_hours}"
        ),

        "attendance"

    )

    return {

        "message":
            "Checked out successfully",

        "check_in":
            datetime_iso(
                check_in_time
            ),

        "check_out":
            now.isoformat(),

        "checked_in":
            False,

        "total_hours":
            total_hours

    }


# =========================================================
# ATTENDANCE - MY STATUS TODAY
# =========================================================

@app.get(
    "/attendance/me"
)
def get_my_attendance(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    now = datetime.now(
        timezone.utc
    )

    start_of_day = datetime(

        now.year,

        now.month,

        now.day,

        tzinfo=timezone.utc

    )

    attendance = (
        attendance_col.find_one(

            {

                "employee_id":
                    employee_id,

                "check_in": {

                    "$gte":
                        start_of_day

                }

            },

            sort=[

                (
                    "check_in",
                    -1
                )

            ]

        )
    )

    if not attendance:

        return {

            "checked_in":
                False,

            "check_in":
                None,

            "check_out":
                None,

            "total_hours":
                0

        }

    check_in_time = (
        normalize_datetime(
            attendance.get(
                "check_in"
            )
        )
    )

    check_out_time = (
        normalize_datetime(
            attendance.get(
                "check_out"
            )
        )
    )

    return {

        "checked_in": (

            check_out_time is None

        ),

        "check_in":
            datetime_iso(
                check_in_time
            ),

        "check_out":
            datetime_iso(
                check_out_time
            ),

        "total_hours":
            calculate_hours(

                check_in_time,

                check_out_time

            )

    }


# =========================================================
# ATTENDANCE - MY DAILY SUMMARY
# =========================================================

@app.get(
    "/attendance/me/daily"
)
def get_my_daily_attendance(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    now = datetime.now(
        timezone.utc
    )

    start_of_day = datetime(

        now.year,

        now.month,

        now.day,

        tzinfo=timezone.utc

    )

    end_of_day = (

        start_of_day +

        timedelta(days=1)

    )

    records = (

        attendance_col.find({

            "employee_id":
                employee_id,

            "check_in": {

                "$gte":
                    start_of_day,

                "$lt":
                    end_of_day

            }

        })

        .sort(
            "check_in",
            1
        )

    )

    total_hours = 0

    formatted_records = []

    for record in records:

        check_in_time = (
            normalize_datetime(
                record.get(
                    "check_in"
                )
            )
        )

        check_out_time = (
            normalize_datetime(
                record.get(
                    "check_out"
                )
            )
        )

        hours = calculate_hours(

            check_in_time,

            check_out_time

        )

        total_hours += hours

        formatted_records.append({

            "id":
                str(
                    record["_id"]
                ),

            "check_in":
                datetime_iso(
                    check_in_time
                ),

            "check_out":
                datetime_iso(
                    check_out_time
                ),

            "total_hours":
                hours,

            "status": (

                "Working"

                if check_out_time is None

                else "Completed"

            )

        })

    return {

        "date":
            start_of_day
            .date()
            .isoformat(),

        "total_hours":
            round(
                total_hours,
                2
            ),

        "records":
            formatted_records

    }


# =========================================================
# ATTENDANCE - MY WEEKLY SUMMARY
# =========================================================

@app.get(
    "/attendance/me/weekly"
)
def get_my_weekly_attendance(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    now = datetime.now(
        timezone.utc
    )

    monday = (

        now -

        timedelta(
            days=now.weekday()
        )

    )

    start_of_week = datetime(

        monday.year,

        monday.month,

        monday.day,

        tzinfo=timezone.utc

    )

    end_of_week = (

        start_of_week +

        timedelta(days=7)

    )

    records = (

        attendance_col.find({

            "employee_id":
                employee_id,

            "check_in": {

                "$gte":
                    start_of_week,

                "$lt":
                    end_of_week

            }

        })

        .sort(
            "check_in",
            1
        )

    )

    days = []

    total_week_hours = 0

    present_days = set()

    for record in records:

        check_in_time = (
            normalize_datetime(
                record.get(
                    "check_in"
                )
            )
        )

        check_out_time = (
            normalize_datetime(
                record.get(
                    "check_out"
                )
            )
        )

        hours = calculate_hours(

            check_in_time,

            check_out_time

        )

        total_week_hours += hours

        if check_in_time:

            present_days.add(

                check_in_time.date()

            )

        days.append({

            "date": (

                check_in_time
                .date()
                .isoformat()

                if check_in_time

                else None

            ),

            "check_in":
                datetime_iso(
                    check_in_time
                ),

            "check_out":
                datetime_iso(
                    check_out_time
                ),

            "total_hours":
                hours,

            "status": (

                "Working"

                if check_out_time is None

                else "Completed"

            )

        })

    return {

        "week_start":
            start_of_week
            .date()
            .isoformat(),

        "week_end": (

            (
                end_of_week -

                timedelta(days=1)

            )
            .date()
            .isoformat()

        ),

        "present_days":
            len(
                present_days
            ),

        "total_hours":
            round(
                total_week_hours,
                2
            ),

        "records":
            days

    }


# =========================================================
# ATTENDANCE - ADMIN VIEW
# =========================================================

@app.get(
    "/attendance"
)
def get_all_attendance(

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "admin":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only Admin can "
                "view attendance"
            )

        )

    records = (

        attendance_col.find({})

        .sort(
            "check_in",
            -1
        )

    )

    response = []

    for record in records:

        check_in_time = (
            normalize_datetime(
                record.get(
                    "check_in"
                )
            )
        )

        check_out_time = (
            normalize_datetime(
                record.get(
                    "check_out"
                )
            )
        )

        response.append({

            "id":
                str(
                    record["_id"]
                ),

            "employee_id":
                str(
                    record["employee_id"]
                ),

            "employee_name":
                record.get(
                    "employee_name",
                    ""
                ),

            "login_id":
                record.get(
                    "login_id",
                    ""
                ),

            "check_in":
                datetime_iso(
                    check_in_time
                ),

            "check_out":
                datetime_iso(
                    check_out_time
                ),

            "total_hours":
                calculate_hours(

                    check_in_time,

                    check_out_time

                ),

            "status": (

                "Present"

                if check_out_time is None

                else "Completed"

            )

        })

    return response


# =========================================================
# LEAVE - APPLY
# =========================================================

@app.post(
    "/leave"
)
def apply_leave(

    body: LeaveRequest,

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "employee":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only employees can "
                "request leave"
            )

        )

    employee_id = ObjectId(
        user["sub"]
    )

    employee = employees_col.find_one({

        "_id":
            employee_id

    })

    if not employee:

        raise HTTPException(

            status_code=404,

            detail="Employee not found"

        )

    leave_type = (
        body.leave_type.strip()
    )

    start_date = (
        body.start_date.strip()
    )

    end_date = (
        body.end_date.strip()
    )

    reason = (
        body.reason or ""
    ).strip()

    if not leave_type:

        raise HTTPException(

            status_code=400,

            detail=(
                "Leave type is required"
            )

        )

    if not start_date:

        raise HTTPException(

            status_code=400,

            detail=(
                "Start date is required"
            )

        )

    if not end_date:

        raise HTTPException(

            status_code=400,

            detail=(
                "End date is required"
            )

        )

    start_date_obj = (
        parse_leave_date(
            start_date
        )
    )

    end_date_obj = (
        parse_leave_date(
            end_date
        )
    )

    if end_date_obj < start_date_obj:

        raise HTTPException(

            status_code=400,

            detail=(
                "End date cannot be "
                "before start date"
            )

        )

    today = datetime.now(
        timezone.utc
    ).date()

    if start_date_obj.date() < today:

        raise HTTPException(

            status_code=400,

            detail=(
                "Leave cannot start "
                "in the past"
            )

        )

    existing_leave = (
        leave_col.find_one({

            "employee_id":
                employee_id,

            "status": {

                "$in": [

                    "Pending",

                    "Approved"

                ]

            },

            "start_date": {

                "$lte":
                    end_date

            },

            "end_date": {

                "$gte":
                    start_date

            }

        })
    )

    if existing_leave:

        raise HTTPException(

            status_code=400,

            detail=(
                "You already have a "
                "leave request for "
                "these dates"
            )

        )

    now = datetime.now(
        timezone.utc
    )

    result = leave_col.insert_one({

        "employee_id":
            employee_id,

        "employee_name":
            employee.get(
                "name",
                ""
            ),

        "login_id":
            employee.get(
                "login_id",
                ""
            ),

        "leave_type":
            leave_type,

        "start_date":
            start_date,

        "end_date":
            end_date,

        "reason":
            reason,

        "status":
            "Pending",

        "created_at":
            now,

        "updated_at":
            now

    })

    leave_id = str(
        result.inserted_id
    )

    create_notification(

        employee_id,

        "Leave Request Submitted",

        (
            f"Your {leave_type} leave "
            f"request from {start_date} "
            f"to {end_date} has been "
            f"submitted and is pending approval."
        ),

        "leave"

    )

    admin_message = (

        f"Employee "
        f"{employee.get('name', '')} "
        f"({employee.get('login_id', '')}) "
        f"has submitted a "
        f"{leave_type} leave request "
        f"from {start_date} "
        f"to {end_date}."

    )

    notify_admins(

        "New Leave Request",

        admin_message,

        "leave"

    )

    return {

        "message":
            "Leave request submitted successfully",

        "leave_id":
            leave_id,

        "status":
            "Pending"

    }


# =========================================================
# LEAVE - MY REQUESTS
# =========================================================

@app.get(
    "/leave/me"
)
def get_my_leave_requests(

    user: dict = Depends(
        get_current_user
    )

):

    employee_id = ObjectId(
        user["sub"]
    )

    requests = (

        leave_col.find({

            "employee_id":
                employee_id

        })

        .sort(
            "created_at",
            -1
        )

    )

    response = []

    for request in requests:

        response.append({

            "id":
                str(
                    request["_id"]
                ),

            "leave_type":
                request.get(
                    "leave_type",
                    ""
                ),

            "start_date":
                request.get(
                    "start_date",
                    ""
                ),

            "end_date":
                request.get(
                    "end_date",
                    ""
                ),

            "reason":
                request.get(
                    "reason",
                    ""
                ),

            "status":
                request.get(
                    "status",
                    "Pending"
                ),

            "created_at":
                datetime_iso(
                    request.get(
                        "created_at"
                    )
                ),

            "updated_at":
                datetime_iso(
                    request.get(
                        "updated_at"
                    )
                )

        })

    return response


# =========================================================
# LEAVE - MY BALANCE
# =========================================================

@app.get(
    "/leave/balance"
)
def get_my_leave_balance(

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "employee":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only employees can "
                "view leave balance"
            )

        )

    employee_id = ObjectId(
        user["sub"]
    )

    current_year = datetime.now(
        timezone.utc
    ).year

    year_start = datetime(

        current_year,

        1,

        1

    ).date()

    year_end = datetime(

        current_year,

        12,

        31

    ).date()

    allocations = {

        "Casual Leave":
            12,

        "Sick Leave":
            10,

        "Paid Leave":
            15

    }

    used = {

        "Casual Leave":
            0,

        "Sick Leave":
            0,

        "Paid Leave":
            0

    }

    approved_requests = (
        leave_col.find({

            "employee_id":
                employee_id,

            "status":
                "Approved",

            "leave_type": {

                "$in":
                    list(
                        allocations.keys()
                    )

            }

        })
    )

    for request in approved_requests:

        leave_type = request.get(
            "leave_type"
        )

        start_value = request.get(
            "start_date"
        )

        end_value = request.get(
            "end_date"
        )

        if (

            leave_type not in used

            or not start_value

            or not end_value

        ):

            continue

        try:

            leave_start = (
                datetime.strptime(

                    start_value,

                    "%Y-%m-%d"

                ).date()
            )

            leave_end = (
                datetime.strptime(

                    end_value,

                    "%Y-%m-%d"

                ).date()
            )

        except (
            ValueError,
            TypeError
        ):

            continue

        effective_start = max(

            leave_start,

            year_start

        )

        effective_end = min(

            leave_end,

            year_end

        )

        if effective_end < effective_start:

            continue

        days = (

            effective_end -

            effective_start

        ).days + 1

        used[leave_type] += days

    balances = []

    total_allocated = 0
    total_used = 0
    total_remaining = 0

    for leave_type, allocated in allocations.items():

        leave_used = used.get(

            leave_type,

            0

        )

        remaining = max(

            allocated -

            leave_used,

            0

        )

        balances.append({

            "leave_type":
                leave_type,

            "allocated":
                allocated,

            "used":
                leave_used,

            "remaining":
                remaining

        })

        total_allocated += allocated
        total_used += leave_used
        total_remaining += remaining

    return {

        "year":
            current_year,

        "balances":
            balances,

        "total_allocated":
            total_allocated,

        "total_used":
            total_used,

        "total_remaining":
            total_remaining

    }


# =========================================================
# LEAVE - ADMIN VIEW ALL
# =========================================================

@app.get(
    "/leave"
)
def get_all_leave_requests(

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "admin":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only Admin can "
                "view leave requests"
            )

        )

    requests = (

        leave_col.find()

        .sort(
            "created_at",
            -1
        )

    )

    response = []

    for request in requests:

        response.append({

            "id":
                str(
                    request["_id"]
                ),

            "employee_id":
                str(
                    request["employee_id"]
                ),

            "employee_name":
                request.get(
                    "employee_name",
                    ""
                ),

            "login_id":
                request.get(
                    "login_id",
                    ""
                ),

            "leave_type":
                request.get(
                    "leave_type",
                    ""
                ),

            "start_date":
                request.get(
                    "start_date",
                    ""
                ),

            "end_date":
                request.get(
                    "end_date",
                    ""
                ),

            "reason":
                request.get(
                    "reason",
                    ""
                ),

            "status":
                request.get(
                    "status",
                    "Pending"
                ),

            "created_at":
                datetime_iso(
                    request.get(
                        "created_at"
                    )
                ),

            "updated_at":
                datetime_iso(
                    request.get(
                        "updated_at"
                    )
                ),

            "approved_at":
                datetime_iso(
                    request.get(
                        "approved_at"
                    )
                ),

            "rejected_at":
                datetime_iso(
                    request.get(
                        "rejected_at"
                    )
                )

        })

    return response


# =========================================================
# LEAVE - APPROVE
# ADMIN ONLY
# =========================================================

@app.put(
    "/leave/{leave_id}/approve"
)
def approve_leave(

    leave_id: str,

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "admin":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only Admin can "
                "approve leave requests"
            )

        )

    try:

        leave_object_id = ObjectId(
            leave_id
        )

    except Exception:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid leave request ID"
            )

        )

    leave_request = (
        leave_col.find_one({

            "_id":
                leave_object_id

        })
    )

    if not leave_request:

        raise HTTPException(

            status_code=404,

            detail=(
                "Leave request not found"
            )

        )

    if leave_request.get(
        "status"
    ) != "Pending":

        raise HTTPException(

            status_code=400,

            detail=(
                "Only pending leave "
                "requests can be approved"
            )

        )

    overlapping = (
        leave_col.find_one({

            "_id": {

                "$ne":
                    leave_object_id

            },

            "employee_id":
                leave_request[
                    "employee_id"
                ],

            "status":
                "Approved",

            "start_date": {

                "$lte":
                    leave_request[
                        "end_date"
                    ]

            },

            "end_date": {

                "$gte":
                    leave_request[
                        "start_date"
                    ]

            }

        })
    )

    if overlapping:

        raise HTTPException(

            status_code=400,

            detail=(
                "Employee already has "
                "approved leave for "
                "these dates"
            )

        )

    now = datetime.now(
        timezone.utc
    )

    leave_col.update_one(

        {

            "_id":
                leave_object_id

        },

        {

            "$set": {

                "status":
                    "Approved",

                "approved_at":
                    now,

                "updated_at":
                    now

            }

        }

    )

    employee = employees_col.find_one({

        "_id":
            leave_request[
                "employee_id"
            ]

    })

    if employee:

        employee_id = employee["_id"]

        leave_type = (
            leave_request.get(
                "leave_type",
                ""
            )
        )

        start_date = (
            leave_request.get(
                "start_date",
                ""
            )
        )

        end_date = (
            leave_request.get(
                "end_date",
                ""
            )
        )

        create_notification(

            employee_id,

            "Leave Approved",

            (
                f"Your {leave_type} leave "
                f"from {start_date} "
                f"to {end_date} "
                f"has been approved."
            ),

            "leave"

        )

    return {

        "message":
            "Leave request approved successfully",

        "leave_id":
            leave_id,

        "status":
            "Approved"

    }


# =========================================================
# LEAVE - REJECT
# ADMIN ONLY
# =========================================================

@app.put(
    "/leave/{leave_id}/reject"
)
def reject_leave(

    leave_id: str,

    user: dict = Depends(
        get_current_user
    )

):

    if user.get(
        "role"
    ) != "admin":

        raise HTTPException(

            status_code=403,

            detail=(
                "Only Admin can "
                "reject leave requests"
            )

        )

    try:

        leave_object_id = ObjectId(
            leave_id
        )

    except Exception:

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid leave request ID"
            )

        )

    leave_request = (
        leave_col.find_one({

            "_id":
                leave_object_id

        })
    )

    if not leave_request:

        raise HTTPException(

            status_code=404,

            detail=(
                "Leave request not found"
            )

        )

    if leave_request.get(
        "status"
    ) != "Pending":

        raise HTTPException(

            status_code=400,

            detail=(
                "Only pending leave "
                "requests can be rejected"
            )

        )

    now = datetime.now(
        timezone.utc
    )

    leave_col.update_one(

        {

            "_id":
                leave_object_id

        },

        {

            "$set": {

                "status":
                    "Rejected",

                "rejected_at":
                    now,

                "updated_at":
                    now

            }

        }

    )

    employee = employees_col.find_one({

        "_id":
            leave_request[
                "employee_id"
            ]

    })

    if employee:

        employee_id = employee["_id"]

        leave_type = (
            leave_request.get(
                "leave_type",
                ""
            )
        )

        start_date = (
            leave_request.get(
                "start_date",
                ""
            )
        )

        end_date = (
            leave_request.get(
                "end_date",
                ""
            )
        )

        create_notification(

            employee_id,

            "Leave Rejected",

            (
                f"Your {leave_type} leave "
                f"from {start_date} "
                f"to {end_date} "
                f"has been rejected."
            ),

            "leave"

        )

    return {

        "message":
            "Leave request rejected",

        "leave_id":
            leave_id,

        "status":
            "Rejected"

    }