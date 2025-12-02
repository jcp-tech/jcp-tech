from fastapi import UploadFile, File
from fastapi import APIRouter, Request, Depends, HTTPException, status, Response, Body
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from app.utils.auth import get_current_user, create_session_cookie, require_admin
from app.utils.firebase_utils import get_realtime_data, update_realtime_data, get_firestore_data, update_firestore_data
from firebase_admin import firestore
from pydantic import BaseModel
from typing import Any, List, Dict, Union
import shutil
import os
from datetime import datetime
from app.tools.data import get_portfolio_data

router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory="app/templates")

class LoginRequest(BaseModel):
    idToken: str

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    # If already logged in, redirect to dashboard
    user = await get_current_user(request, request.cookies.get("__session"))
    if user:
        return RedirectResponse(url="/admin", status_code=302)

    portfolio_data = get_portfolio_data()
    color_config = portfolio_data.get("COLOR_CONFIG", {})

    return templates.TemplateResponse("admin/login.html", {
        "request": request,
        "color_config": color_config
    })

@router.post("/login")
async def login(request: Request, login_request: LoginRequest):
    try:
        # Create session cookie
        session_cookie = await create_session_cookie(login_request.idToken)

        print(f"[DEBUG] Login Request Scheme: {request.url.scheme}")
        print(f"[DEBUG] Login Request Headers: {request.headers}")

        response = Response(content="Login successful")
        # Set session cookie
        # Secure=True should be used in production (HTTPS)
        # Samesite='Lax' or 'Strict'
        # No max_age means it's a session cookie (clears on browser close)
        response.set_cookie(
            key="__session",
            value=session_cookie,
            httponly=True,
            # Set to True in production | NOTE: Need to take from env after adding to it.
            secure=True,
            samesite="none",
        )
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_class=HTMLResponse)
async def admin_dashboard(request: Request, user: dict = Depends(get_current_user)):
    if not user:
        # DEBUG: Check if cookie exists to distinguish error
        cookie = request.cookies.get("__session")
        error_code = "session_missing" if not cookie else "session_invalid"
        return RedirectResponse(url=f"/admin/login?error={error_code}", status_code=302)

    # Check permissions (will raise 403 if not allowed)
    try:
        require_admin(user)
    except HTTPException as e:
        # If access denied, we might want to show a 403 page or redirect to home
        # For now, let's re-raise to show the standard error page or JSON
        raise e

    portfolio_data = get_portfolio_data()
    color_config = portfolio_data.get("COLOR_CONFIG", {})

    return templates.TemplateResponse("admin/dashboard.html", {
        "request": request,
        "user": user,
        "project_categories": portfolio_data.get("PROJECT_CATEGORIES", []),
        "color_config": color_config
    })


@router.post("/logout")
async def logout(response: Response):
    response = RedirectResponse(url="/admin/login", status_code=302)
    response.delete_cookie("__session")
    return response


@router.get("/logout")
async def logout_get():
    response = RedirectResponse(url="/admin/login", status_code=302)
    response.delete_cookie("__session")
    return response


@router.get("/api/data/{section}")
async def get_data(section: str, user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    require_admin(user)

    # Realtime Database Paths
    rtdb_map = {
        "main": "PORTFOLIO/MAIN",
        "navbar": "PORTFOLIO/NAVBAR",
        "color_config": "PORTFOLIO/COLOR_CONFIG",
        "syntax_colors": "PORTFOLIO/SYNTAX_COLORS"
    }

    # Firestore Paths
    firestore_map = {
        "live_activities": "PORTFOLIO/LIVE_ACTIVITIES",
        "projects": "PORTFOLIO/PROJECTS",
        "project_categories": "PORTFOLIO/PROJECTS",
        "skills": "PORTFOLIO/SKILLS",
        "experiences": "PORTFOLIO/EXPERIENCES",
        "educations": "PORTFOLIO/EDUCATIONS",
        "certifications": "PORTFOLIO/CERTIFICATIONS",
        "achievements": "PORTFOLIO/ACHIEVEMENTS",
        "social_pills": "PORTFOLIO/SOCIAL_PILLS"
    }

    if section in rtdb_map:
        data = get_realtime_data(rtdb_map[section])
        if section == "main":
            # Fetch resume_last_updated separately as it's a sibling
            resume_last_updated = get_realtime_data(
                "PORTFOLIO/resume_last_updated")
            if data is None:
                data = {}
            if resume_last_updated:
                data["resume_last_updated"] = resume_last_updated
        return data or {}

    elif section in firestore_map:
        data = get_firestore_data(firestore_map[section])
        if not data:
            return []

        # Unwrap list from document
        if section == "live_activities":
            return data.get("components", [])
        elif section == "project_categories":
            return data.get("categories", [])
        else:
            return data.get("items", [])


@router.post("/api/data/{section}")
async def save_data(section: str, payload: Union[Dict, List] = Body(...), user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    require_admin(user)

    # Realtime Database Paths
    rtdb_map = {
        "main": "PORTFOLIO/MAIN",
        "navbar": "PORTFOLIO/NAVBAR",
        "color_config": "PORTFOLIO/COLOR_CONFIG",
        "syntax_colors": "PORTFOLIO/SYNTAX_COLORS"
    }

    # Firestore Paths
    firestore_map = {
        "live_activities": "PORTFOLIO/LIVE_ACTIVITIES",
        "projects": "PORTFOLIO/PROJECTS",
        "project_categories": "PORTFOLIO/PROJECTS",
        "skills": "PORTFOLIO/SKILLS",
        "experiences": "PORTFOLIO/EXPERIENCES",
        "educations": "PORTFOLIO/EDUCATIONS",
        "certifications": "PORTFOLIO/CERTIFICATIONS",
        "achievements": "PORTFOLIO/ACHIEVEMENTS",
        "social_pills": "PORTFOLIO/SOCIAL_PILLS"
    }

    if section in rtdb_map:
        # For RTDB, payload can be dict or list, update_realtime_data handles it
        success = update_realtime_data(rtdb_map[section], payload)
        if success:
            return {"message": "Data saved successfully"}
        else:
            raise HTTPException(
                status_code=500, detail="Failed to save to Realtime Database")

    elif section in firestore_map:
        # For Firestore, we need to wrap lists in a document structure
        data_to_save = {}
        if isinstance(payload, list):
            if section == "live_activities":
                data_to_save = {"components": payload}
            elif section == "project_categories":
                data_to_save = {"categories": payload}
            else:
                data_to_save = {"items": payload}
        elif isinstance(payload, dict):
            data_to_save = payload
        else:
            raise HTTPException(status_code=400, detail="Invalid data format")

        success = update_firestore_data(firestore_map[section], data_to_save)
        if success:
            return {"message": "Data saved successfully"}
        else:
            raise HTTPException(
                status_code=500, detail="Failed to save to Firestore")

    else:
        raise HTTPException(status_code=404, detail="Section not found")

class CRMStatusRequest(BaseModel):
    id: str
    status: str

@router.get("/api/crm")
async def get_crm_data(user: dict = Depends(require_admin)):
    try:
        db = firestore.client()
        docs = db.collection('CONTACT_REQUESTS').order_by(
            'timestamp', direction=firestore.Query.DESCENDING).stream()
        requests = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            if data.get('timestamp'):
                data['timestamp'] = data['timestamp'].isoformat()
            requests.append(data)
        return requests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/crm/status")
async def update_crm_status(request: CRMStatusRequest, user: dict = Depends(require_admin)):
    try:
        db = firestore.client()
        doc_ref = db.collection('CONTACT_REQUESTS').document(request.id)
        doc_ref.update({'status': request.status})
        return {"message": "Status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/crm/{id}")
async def delete_crm_request(id: str, user: dict = Depends(require_admin)):
    try:
        db = firestore.client()
        db.collection('CONTACT_REQUESTS').document(id).delete()
        return {"message": "Request deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/users")
async def get_admin_users(user: dict = Depends(require_admin)):
    try:
        data = get_firestore_data('USERS/ADMIN')
        return data or {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/users")
async def update_admin_users(payload: dict = Body(...), user: dict = Depends(require_admin)):
    try:
        update_firestore_data('USERS/ADMIN', payload)
        return {"message": "Admin users updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/dashboard-stats")
async def get_dashboard_stats(user: dict = Depends(require_admin)):
    import httpx

    # 1. System Status
    # Server Health (Self-check)
    server_health = "Operational"

    # Database Connection (Firebase)
    try:
        db = firestore.client()
        # Simple read to verify connection
        db.collection('PORTFOLIO').document('MAIN').get()
        db_connection = "Connected"
    except Exception:
        db_connection = "Disconnected"

    # API Uptime (Mock for now, or check external service)
    # Since we are the API, if this code runs, we are up.
    # But maybe we want to check GitHub API availability as a proxy for external connectivity?
    api_uptime = "Operational"

    # 2. Recent Activities (GitHub Actions)
    recent_activities = []
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/repos/jcp-tech/jcp-tech/actions/runs",
                params={"per_page": 5},
                headers={"User-Agent": "FastAPI-App"}
            )
            if response.status_code == 200:
                data = response.json()
                for run in data.get("workflow_runs", []):
                    # Determine status color/icon based on conclusion
                    status_icon = "check_circle"
                    status_color = "text-[var(--admin-success-text)]"
                    if run["conclusion"] == "failure":
                        status_icon = "cancel"
                        status_color = "text-[var(--admin-error-text)]"
                    elif run["status"] == "in_progress" or run["status"] == "queued":
                        status_icon = "pending"
                        status_color = "text-[var(--admin-warning-text)]"

                    # Format date
                    from datetime import datetime
                    created_at = datetime.strptime(
                        run["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                    formatted_date = created_at.strftime("%b %d, %H:%M")

                    recent_activities.append({
                        "title": run["display_title"],
                        "description": f"{run['name']} #{run['run_number']}: Commit {run['head_sha'][:7]} pushed by {run['triggering_actor']['login']}",
                        "date": formatted_date,
                        "icon": status_icon,
                        "icon_color": status_color,
                        "url": run["html_url"]
                    })
    except Exception as e:
        print(f"Error fetching GitHub Actions: {e}")
        # Don't fail the whole request, just return empty activities
        pass

    return {
        "system_status": [
            {"name": "Server Health", "status": server_health, "color": "text-[var(--admin-success-text)]" if server_health == "Operational" else "text-[var(--admin-error-text)]"},
            {"name": "Database Connection", "status": db_connection, "color": "text-[var(--admin-success-text)]" if db_connection == "Connected" else "text-[var(--admin-error-text)]"},
            {"name": "API Uptime", "status": api_uptime, "color": "text-[var(--admin-warning-text)]" if api_uptime != "Operational" else "text-[var(--admin-success-text)]"}  # Mocking yellow for demo if needed, but logic says green
        ],
        "recent_activities": recent_activities
    }

@router.post("/api/upload-resume")
async def upload_resume(file: Any = Body(...), user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    require_admin(user)

    # Note: 'file' argument in the function signature above is a placeholder.
    # We need to use UploadFile for the actual file handling.
    # However, since we can't easily change the signature in this replace block without imports,
    # let's do the imports inside and use the request body directly or define the handler correctly.
    # Actually, let's just define the handler correctly with the imports available or added.
    pass

# Redefining the function with correct signature and imports

@router.post("/api/upload-resume")
async def upload_resume_endpoint(file: UploadFile = File(...), user: dict = Depends(get_current_user)):

    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    require_admin(user)

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400, detail="Only PDF files are allowed")

    try:
        file_location = "app/media/pdfs/Jonathan Chacko - Resume.pdf"
        os.makedirs(os.path.dirname(file_location), exist_ok=True)

        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)

        # Update Realtime Database
        timestamp = datetime.now().isoformat()
        update_realtime_data("PORTFOLIO/resume_last_updated", timestamp)

        return {"message": "Resume uploaded successfully", "timestamp": timestamp}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
