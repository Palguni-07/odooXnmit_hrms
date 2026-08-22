import os

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["dayflow"]

employees_col = db["employees"]
attendance_col = db["attendance"]
leave_col = db["leave_requests"]