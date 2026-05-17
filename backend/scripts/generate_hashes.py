from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

users = {
    "superadmin": "SuperAdmin@2026",
    "progadmin":  "ProgAdmin@2026",
    "mentor01":   "Mentor@2026",
    "company01":  "Company@2026",
    "partner01":  "Partner@2026",
}

for username, password in users.items():
    print(f'{username}: {pwd.hash(password)}')
