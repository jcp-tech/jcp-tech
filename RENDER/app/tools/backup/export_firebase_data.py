import sys
import os
import json
import firebase_admin
from firebase_admin import db, firestore

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

try:
    from app.utils.firebase_utils import get_realtime_data
except ImportError:
    # Fallback if running from a different context
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
    from app.utils.firebase_utils import get_realtime_data

def get_document_data(doc):
    doc_data = doc.to_dict() or {}
    # Check for subcollections
    # Note: This might be slow for very large databases, but fine for this use case
    for sub_col in doc.reference.collections():
        doc_data[sub_col.id] = get_collection_data(sub_col)
    return doc_data

def get_collection_data(collection_ref):
    col_data = {}
    for doc in collection_ref.stream():
        col_data[doc.id] = get_document_data(doc)
    return col_data

def get_all_firestore_data(db_fs):
    data = {}
    for collection in db_fs.collections():
        data[collection.id] = get_collection_data(collection)
    return data

def export_data():
    print("Starting export...")
    
    # Ensure Firebase is initialized (handled by import, but we can verify)
    if not firebase_admin._apps:
        print("Firebase not initialized. Checking credentials...")
        # The import should have handled it, but if not, we might need to manually init
        # This part depends on how the utils script behaves. 
        # Based on the file content, it runs init logic at module level.
        pass

    # Realtime DB
    print("Fetching Realtime DB data...")
    try:
        realtime_data = get_realtime_data('/')
        print("Realtime DB data fetched.")
    except Exception as e:
        print(f"Error fetching Realtime DB: {e}")
        realtime_data = {"error": str(e)}
    
    # Firestore
    print("Fetching Firestore data...")
    try:
        db_fs = firestore.client()
        firestore_data = get_all_firestore_data(db_fs)
        print("Firestore data fetched.")
    except Exception as e:
        print(f"Error fetching Firestore: {e}")
        firestore_data = {"error": str(e)}

    full_data = {
        "REALTIME": realtime_data,
        "FIRESTORE": firestore_data
    }
    
    output_path = os.path.join(os.path.dirname(__file__), "56cdf0549e21084f82eba54015e4e64d", 'firebase_data_backup.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(full_data, f, indent=4, default=str)
        
    print(f"Export completed. Data saved to {output_path}")

if __name__ == "__main__":
    sys.exit(1) # TEMPORARY STOPPING THE CODE CAUSE ALREADY EXPORTED.
    export_data()