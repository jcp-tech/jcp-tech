import os
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import APIKeyCookie
from firebase_admin import auth
from typing import Optional
from app.utils.firebase_utils import get_firestore_data

# Cookie scheme for documentation/Swagger UI
cookie_scheme = APIKeyCookie(name="__session", auto_error=False)

async def get_current_user(request: Request, session: Optional[str] = Depends(cookie_scheme)):
    if not session:
        print("[Auth] No session cookie found.")
        return None

    try:
        # Verify the session cookie
        decoded_claims = auth.verify_session_cookie(
            session, check_revoked=True)
        return decoded_claims
    except auth.InvalidSessionCookieError:
        print("[Auth] Invalid session cookie.")
        return None
    except Exception as e:
        print(f"[Auth] Error verifying session cookie: {e}")
        return None


def require_admin(user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    email = user.get("email")
    uid = user.get("uid")
    provider_id = user.get("firebase", {}).get("sign_in_provider")

    print(f"Login Attempt: Email={email}, UID={uid}, Provider={provider_id}")

    # Check against Firestore: USERS/ADMIN
    # Structure: { "password": ["email1", "uid1"], "google.com": ["email2"], ... }
    allowed_users_doc = get_firestore_data('USERS/ADMIN')

    is_allowed = False

    if allowed_users_doc:
        # Check specific provider list
        if provider_id in allowed_users_doc:
            provider_allowed = allowed_users_doc[provider_id]
            if isinstance(provider_allowed, list):
                if email in provider_allowed or uid in provider_allowed:
                    is_allowed = True

        # Optional: Check a global "all" list if you want
        if not is_allowed and "all" in allowed_users_doc:
            if email in allowed_users_doc["all"] or uid in allowed_users_doc["all"]:
                is_allowed = True

    if not is_allowed:
        print(f"ACCESS DENIED for {email} ({uid}) via {provider_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return user

async def create_session_cookie(id_token: str, expires_in: int = 60 * 60 * 24 * 5):
    try:
        # Create the session cookie. This will also verify the ID token.
        session_cookie = auth.create_session_cookie(
            id_token, expires_in=expires_in)
        return session_cookie
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))