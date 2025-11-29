from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.data import NAV_LINKS, LIVE_ACTIVITIES_HTML_COMPONENTS, PROJECTS, SKILL_CATEGORIES, SKILLS_DATA, EXPERIENCES, EDUCATIONS, CERTIFICATIONS, COLOR_CONFIG

import os
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


def get_developer_profile_data():
    # Read and format the code
    code_path = os.path.join("app", "static", "code", "developer_profile.py")
    try:
        with open(code_path, "r") as f:
            code_content = f.read()
            formatter = HtmlFormatter(style="monokai", cssclass="source")
            code_html = highlight(code_content, PythonLexer(), formatter)
            code_style = formatter.get_style_defs('.source')
    except Exception as e:
        code_html = f"Error reading code: {e}"
        code_style = ""

    # Read the log output
    log_path = "/tmp/developer_profile.log"
    fallback_log_path = os.path.join(
        "app", "static", "code", "developer_profile.log")
    try:
        if os.path.exists(log_path):
            with open(log_path, "r") as f:
                terminal_output = f.read()
        elif os.path.exists(fallback_log_path):
            with open(fallback_log_path, "r") as f:
                terminal_output = f.read()
        else:
            terminal_output = "Log file not found. Run the container to generate it."
    except Exception as e:
        terminal_output = f"Error reading log: {e}"

    return code_html, code_style, terminal_output


@app.get("/")
async def read_root(request: Request):
    code_base, code_style, terminal_output = get_developer_profile_data()
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
        "code_base": code_base,
        "code_style": code_style,
        "terminal_output": terminal_output
    })


@app.get("/health")
async def health_check():
    return {"status": "ok"}
