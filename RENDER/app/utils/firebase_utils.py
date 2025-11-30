import firebase_admin
from firebase_admin import credentials, db, firestore
import os
import json
import base64
import binascii

# Initialize Firebase Admin SDK ~ Check if app is already initialized to avoid errors during hot reloads
if not firebase_admin._apps:
    cred_source = os.environ.get(
        "FIREBASE_CREDENTIALS", "app/tools/serviceAccountKey.json")
    print(f"[DEBUG] cred_source type: {type(cred_source)}")
    if cred_source:
        print(f"[DEBUG] cred_source starts with: '{cred_source[:10]}...'")
        print(f"[DEBUG] cred_source length: {len(cred_source)}")

    db_url = os.environ.get("FIREBASE_DATABASE_URL",
                            "https://cv-jcp-default-rtdb.firebaseio.com")
    print(f"[DEBUG] FIREBASE_DATABASE_URL: {db_url}")

    def init_firebase(cred_obj):
        firebase_admin.initialize_app(cred_obj, {"databaseURL": db_url})

    # Case 1 — FIREBASE_CREDENTIALS contains raw JSON
    if cred_source.strip().startswith("{"):
        try:
            init_firebase(credentials.Certificate(json.loads(cred_source)))
        except Exception as e:
            print(f"[Firebase] Invalid JSON in FIREBASE_CREDENTIALS: {e}")

    # Case 1.5 - Try Base64 Decoding
    elif cred_source and not os.path.exists(cred_source):
        try:
            decoded = base64.b64decode(cred_source).decode('utf-8')
            if decoded.strip().startswith("{"):
                print("[Firebase] Detected Base64 encoded credentials.")
                init_firebase(credentials.Certificate(json.loads(decoded)))
            else:
                print("[Firebase] Base64 decoded content is not JSON.")
        except (binascii.Error, UnicodeDecodeError):
            # Not base64 or not utf-8, proceed to file check
            pass

    # Case 2 — FIREBASE_CREDENTIALS is a file path
    if not firebase_admin._apps:  # Only if not yet initialized
        possible_paths = [
            cred_source,
            "app/tools/serviceAccountKey.json",
            "tools/serviceAccountKey.json",
            "serviceAccountKey.json",
        ]

        cred_path = next(
            (p for p in possible_paths if os.path.exists(p)), None)

        if cred_path:
            try:
                init_firebase(credentials.Certificate(cred_path))
            except Exception as e:
                print(
                    f"[Firebase] Failed to initialize with file '{cred_path}': {e}")
        else:
            print("[Firebase] No valid service account file found. Firebase disabled.")


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
        segments = [p for p in path.split("/") if p.strip()]
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
