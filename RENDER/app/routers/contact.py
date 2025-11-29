from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_admin import firestore
from datetime import datetime

router = APIRouter(
    prefix="/api/contact",
    tags=["contact"]
)


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


@router.post("/")
async def submit_contact_form(request: ContactRequest):
    try:
        db = firestore.client()
        doc_ref = db.collection('CONTACT_REQUESTS').document()
        doc_ref.set({
            'name': request.name,
            'email': request.email,
            'message': request.message,
            'status': 'Added',  # Default status
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        return {"message": "Contact request submitted successfully", "id": doc_ref.id}
    except Exception as e:
        print(f"Error saving contact request: {e}")
        raise HTTPException(status_code=500, detail=str(e))
