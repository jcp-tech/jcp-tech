from fastapi import Request


async def add_no_cache_header(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/admin"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        # Allow popups for Google Sign-In
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response