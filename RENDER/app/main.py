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
    from app.tools.data import (
        NAV_LINKS, LIVE_ACTIVITIES_HTML_COMPONENTS, MASTER_MAIN,
        PROJECTS, SKILL_CATEGORIES, SKILLS_DATA,
        COLOR_CONFIG, SYNTAX_COLORS,
        EXPERIENCES, EDUCATIONS,
        CERTIFICATIONS, ACHIEVEMENTS,
    )
    code_base, line_count, terminal_output = get_developer_profile_data()
    context = {
        "request": request,
        "nav_links": NAV_LINKS,
        "live_activities": LIVE_ACTIVITIES_HTML_COMPONENTS,
        "projects": PROJECTS,
        "skill_categories": SKILL_CATEGORIES,
        "skills_data": SKILLS_DATA,
        "experiences": EXPERIENCES,
        "educations": EDUCATIONS,
        "certifications": CERTIFICATIONS,
        "achievements": ACHIEVEMENTS,
        "color_config": COLOR_CONFIG,
        "syntax_colors": SYNTAX_COLORS,
        "code_base": code_base,
        "line_count": line_count,
        "terminal_output": terminal_output
    }
    context.update(MASTER_MAIN)
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
