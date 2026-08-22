from database import employees_col
from auth import hash_password
import secrets
import string


# ============================================================
# DEMO COMPANY
# ============================================================

COMPANY_NAME = "Odoo India"
COMPANY_CODE = "OI"


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_password(length=10):
    characters = string.ascii_letters + string.digits

    return "".join(
        secrets.choice(characters)
        for _ in range(length)
    )


def generate_login_id(
    company_code,
    first_name,
    last_name,
    joining_year,
    serial_number
):
    first_part = first_name[:2].upper()
    last_part = last_name[:2].upper()

    return (
        f"{company_code.upper()}"
        f"{first_part}"
        f"{last_part}"
        f"{joining_year}"
        f"{serial_number:04d}"
    )


# ============================================================
# CLEAR OLD DEMO EMPLOYEES
# ============================================================

employees_col.delete_many({})


# ============================================================
# CREATE ADMIN
# ============================================================

admin_password = "admin123"

admin_id = employees_col.insert_one({
    "email": "admin@dayflow.com",

    "login_id": "ADMIN001",

    "password_hash": hash_password(admin_password),

    "role": "admin",

    "name": "Admin User",

    "company_name": COMPANY_NAME,

    "job_position": "HR Manager",

    "department": "HR",

    "phone": "",

    "joining_year": 2026,

    "joining_serial": 1,

    "salary": {
        "monthly_wage": 80000,
        "basic_pct": 50,
        "hra_pct": 25,
        "standard_pct": 15,
        "bonus_pct": 10
    },

    "leave_balance": {
        "paid": 24,
        "sick": 7,
        "unpaid": 0
    },

    "must_change_password": False

}).inserted_id


# ============================================================
# DEMO EMPLOYEES
# ============================================================

employees = [
    {
        "first_name": "Riya",
        "last_name": "Sharma",
        "email": "riya.sharma@dayflow.com",
        "phone": "9876543210",
        "job_position": "Software Engineer",
        "department": "Engineering",
        "joining_year": 2026
    },

    {
        "first_name": "Arjun",
        "last_name": "Mehta",
        "email": "arjun.mehta@dayflow.com",
        "phone": "9876543211",
        "job_position": "Software Engineer",
        "department": "Engineering",
        "joining_year": 2026
    },

    {
        "first_name": "Sana",
        "last_name": "Khan",
        "email": "sana.khan@dayflow.com",
        "phone": "9876543212",
        "job_position": "Software Engineer",
        "department": "Engineering",
        "joining_year": 2026
    },

    {
        "first_name": "Vikram",
        "last_name": "Rao",
        "email": "vikram.rao@dayflow.com",
        "phone": "9876543213",
        "job_position": "Software Engineer",
        "department": "Engineering",
        "joining_year": 2026
    },

    {
        "first_name": "Priya",
        "last_name": "Nair",
        "email": "priya.nair@dayflow.com",
        "phone": "9876543214",
        "job_position": "Software Engineer",
        "department": "Engineering",
        "joining_year": 2026
    }
]


# ============================================================
# INSERT EMPLOYEES
# ============================================================

generated_credentials = []

for index, employee in enumerate(employees, start=1):

    first_name = employee["first_name"]
    last_name = employee["last_name"]
    joining_year = employee["joining_year"]

    login_id = generate_login_id(
        COMPANY_CODE,
        first_name,
        last_name,
        joining_year,
        index
    )

    temporary_password = generate_password()

    employee_id = employees_col.insert_one({

        "login_id": login_id,

        "email": employee["email"],

        "password_hash": hash_password(
            temporary_password
        ),

        "role": "employee",

        "name": f"{first_name} {last_name}",

        "first_name": first_name,

        "last_name": last_name,

        "company_name": COMPANY_NAME,

        "job_position": employee["job_position"],

        "department": employee["department"],

        "phone": employee["phone"],

        "joining_year": joining_year,

        "joining_serial": index,

        "salary": {
            "monthly_wage": 50000,
            "basic_pct": 50,
            "hra_pct": 25,
            "standard_pct": 15,
            "bonus_pct": 10
        },

        "leave_balance": {
            "paid": 24,
            "sick": 7,
            "unpaid": 0
        },

        "must_change_password": True

    }).inserted_id

    generated_credentials.append({
        "name": f"{first_name} {last_name}",
        "login_id": login_id,
        "password": temporary_password,
        "id": employee_id
    })


# ============================================================
# DISPLAY DEMO CREDENTIALS
# ============================================================

print()
print("==============================================")
print("        DAYFLOW HRMS DATABASE SEEDED")
print("==============================================")
print()

print("ADMIN")
print("----------------------------------------------")
print("Login ID: ADMIN001")
print("Email: admin@dayflow.com")
print("Password: admin123")
print()

print("EMPLOYEES")
print("----------------------------------------------")

for credential in generated_credentials:

    print(f"Employee: {credential['name']}")
    print(f"Login ID: {credential['login_id']}")
    print(f"Temporary Password: {credential['password']}")
    print()

print("==============================================")
print("Employees must change their password after")
print("their first successful login.")
print("==============================================")