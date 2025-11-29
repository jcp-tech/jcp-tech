from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.data import NAV_LINKS, LIVE_ACTIVITIES_HTML_COMPONENTS, PROJECTS, SKILL_CATEGORIES, SKILLS_DATA, EXPERIENCES, EDUCATIONS, CERTIFICATIONS, COLOR_CONFIG

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

@app.get("/")
async def read_root(request: Request):
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
        "color_config": COLOR_CONFIG
    })


@app.get("/health")
async def health_check():
    return {"status": "ok"}
