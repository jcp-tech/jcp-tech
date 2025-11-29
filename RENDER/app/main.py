from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.tools.data import get_developer_profile_data
import app.utils.middleware_collection as mc
from app.routers import admin, contact

app = FastAPI()

app.include_router(admin.router)
app.include_router(contact.router)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# app.middleware("http")(mc.add_no_cache_header)

templates = Jinja2Templates(directory="app/templates")


@app.get("/")
async def read_root(request: Request):
    from app.tools.data import get_portfolio_data, get_developer_profile_data

    # Fetch fresh data from Firebase
    portfolio_data = get_portfolio_data()

    # Get developer profile data (code & terminal output)
    code_base, line_count, terminal_output = get_developer_profile_data()

    context = {
        "request": request,
        "nav_links": portfolio_data.get("NAV_LINKS", []),
        "live_activities": portfolio_data.get("LIVE_ACTIVITIES_HTML_COMPONENTS", []),
        "projects": portfolio_data.get("PROJECTS", []),
        "skill_categories": portfolio_data.get("SKILL_CATEGORIES", []),
        "skills_data": portfolio_data.get("SKILLS_DATA", {}),
        "experiences": portfolio_data.get("EXPERIENCES", []),
        "educations": portfolio_data.get("EDUCATIONS", []),
        "certifications": portfolio_data.get("CERTIFICATIONS", []),
        "achievements": portfolio_data.get("ACHIEVEMENTS", []),
        "color_config": portfolio_data.get("COLOR_CONFIG", {}),
        "syntax_colors": portfolio_data.get("SYNTAX_COLORS", {}),
        "code_base": code_base,
        "line_count": line_count,
        "terminal_output": terminal_output
    }
    context.update(portfolio_data.get("MASTER_MAIN", {}))
    return templates.TemplateResponse("index.html", context)


@app.get("/health")
async def health_check():
    # Check Firebase initialization status
    try:
        import firebase_admin
        firebase_initialized = bool(firebase_admin._apps)
    except Exception:
        firebase_initialized = False
    return {"status": "ok", "firebase_initialized": firebase_initialized}
