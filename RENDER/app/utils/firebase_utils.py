import firebase_admin
from firebase_admin import credentials, db, firestore
import os
import json

# Initialize Firebase Admin SDK
# Check if app is already initialized to avoid errors during hot reloads
if not firebase_admin._apps:
    # Path to service account key
    # Try to find it in likely locations or use environment variable
    cred_path = os.environ.get(
        'FIREBASE_CREDENTIALS', 'app/tools/serviceAccountKey.json')

    # If running from root, path might be different
    if not os.path.exists(cred_path):
        # Fallback for local testing if running from root
        potential_paths = [
            'app/tools/serviceAccountKey.json',
            'tools/serviceAccountKey.json',
            'serviceAccountKey.json'
        ]
        for p in potential_paths:
            if os.path.exists(p):
                cred_path = p
                break

    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://cv-jcp-default-rtdb.firebaseio.com'
        })
    else:
        print(
            f"Warning: Firebase credentials not found at {cred_path}. Firebase features will be disabled.")


def get_realtime_data(path):
    """Fetch data from Realtime Database."""
    if not firebase_admin._apps:
        return None
    try:
        ref = db.reference(path)
        return ref.get()
    except Exception as e:
        print(f"Error fetching Realtime DB data from {path}: {e}")
        return None


def update_realtime_data(path, data):
    """Update data in Realtime Database."""
    if not firebase_admin._apps:
        return False
    try:
        ref = db.reference(path)
        ref.set(data)
        return True
    except Exception as e:
        print(f"Error updating Realtime DB data at {path}: {e}")
        return False


def get_firestore_data(path: str):
    """
    Unified Firestore fetch:
    - If path ends on a DOCUMENT (even segments) → return that document's data.
    - If path ends on a COLLECTION (odd segments) → return list of documents in that collection.
    """
    if not firebase_admin._apps:
        return None

    if path.endswith("/"):
        path = path[:-1]

    try:
        db_fs = firestore.client()

        # Split path into segments
        segments = [p for p in path.split(
            "/") if p.strip()]  # clean empty parts
        total = len(segments)

        # Odd segments => COLLECTION
        if total % 2 == 1:
            collection_path = "/".join(segments)
            col_ref = db_fs.collection(collection_path)
            docs = col_ref.stream()

            return [
                {**d.to_dict(), "id": d.id}
                for d in docs
            ]

        # Even segments => DOCUMENT
        else:
            collection_path = "/".join(segments[:-1])
            document_id = segments[-1]

            doc_ref = db_fs.collection(collection_path).document(document_id)
            doc = doc_ref.get()

            if not doc.exists:
                return None

            data = doc.to_dict()
            data["id"] = doc.id
            return data

    except Exception as e:
        print(f"Error fetching Firestore data from {path}: {e}")
        return None


def update_firestore_data(path: str, data: dict):
    """
    Update data in Firestore.
    Path should point to a DOCUMENT.
    Data must be a dictionary.
    """
    if not firebase_admin._apps:
        return False

    if path.endswith("/"):
        path = path[:-1]

    try:
        db_fs = firestore.client()
        segments = [p for p in path.split("/") if p.strip()]

        # Ensure path points to a document (even number of segments)
        if len(segments) % 2 != 0:
            print(
                f"Error: Path {path} must point to a document, not a collection.")
            return False

        collection_path = "/".join(segments[:-1])
        document_id = segments[-1]

        doc_ref = db_fs.collection(collection_path).document(document_id)
        doc_ref.set(data)
        return True

    except Exception as e:
        print(f"Error updating Firestore data at {path}: {e}")
        return False
