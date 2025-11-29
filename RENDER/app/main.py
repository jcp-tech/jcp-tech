from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.data import NAV_LINKS, LIVE_ACTIVITIES_HTML_COMPONENTS, PROJECTS, SKILL_CATEGORIES, SKILLS_DATA, EXPERIENCES, EDUCATIONS, CERTIFICATIONS, COLOR_CONFIG, SYNTAX_COLORS, get_developer_profile_data

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# @app.middleware("http")
# async def add_no_cache_header(request: Request, call_next):
#     response = await call_next(request)
#     response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#     response.headers["Pragma"] = "no-cache"
#     response.headers["Expires"] = "0"
#     return response

templates = Jinja2Templates(directory="app/templates")

@app.get("/")
async def read_root(request: Request):
    code_base, line_count, terminal_output = get_developer_profile_data()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "nav_links": NAV_LINKS,
        "live_activities": LIVE_ACTIVITIES_HTML_COMPONENTS,
        "projects": PROJECTS,
        "skill_categories": SKILL_CATEGORIES,
        "skills_data": SKILLS_DATA,
        "experiences": EXPERIENCES,
        "educations": EDUCATIONS,
        "certifications": CERTIFICATIONS,
        "color_config": COLOR_CONFIG,
        "syntax_colors": SYNTAX_COLORS,
        "code_base": code_base,
        "line_count": line_count,
        "terminal_output": terminal_output
    })


@app.get("/health")
async def health_check():
    return {"status": "ok"}
