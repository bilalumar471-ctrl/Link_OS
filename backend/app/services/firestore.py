"""
Firestore client singleton for LinkOS.

Initializes Firebase Admin SDK and provides a single shared Firestore client
instance across the entire backend application.
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import AsyncClient
from google.oauth2 import service_account
from app.config import settings


_app: firebase_admin.App | None = None
_db: AsyncClient | None = None


def _init_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK once."""
    global _app
    if _app is not None:
        return _app

    cred_path = settings.google_application_credentials

    # If a service-account JSON file exists on disk, use it.
    # Otherwise fall back to Application Default Credentials (ADC),
    # which works automatically on Cloud Run / GCE / local gcloud auth.
    if os.path.isfile(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred, {
        "projectId": settings.google_cloud_project,
    })
    return _app


def get_firestore_client() -> AsyncClient:
    """Return the shared async Firestore client (creates it on first call)."""
    global _db
    if _db is not None:
        return _db

    _init_firebase()

    cred_path = settings.google_application_credentials
    if os.path.isfile(cred_path):
        # Pass credentials explicitly so AsyncClient doesn't rely on ADC
        creds = service_account.Credentials.from_service_account_file(cred_path)
        _db = AsyncClient(
            project=settings.google_cloud_project,
            database=settings.firestore_database,
            credentials=creds,
        )
    else:
        # On Cloud Run, ADC works automatically
        _db = AsyncClient(
            project=settings.google_cloud_project,
            database=settings.firestore_database,
        )
    return _db

