"""Quick import verification script."""
try:
    from app.api import api_router
    print("OK: All API routers imported")
except Exception as e:
    print(f"FAIL: {e}")

try:
    from app.api.auth import TEST_USERS
    print(f"OK: Test users loaded: {list(TEST_USERS.keys())}")
except Exception as e:
    print(f"FAIL auth: {e}")

try:
    from app.core.auth import create_access_token, verify_password, hash_password
    print("OK: Core auth functions imported")
except Exception as e:
    print(f"FAIL core auth: {e}")
