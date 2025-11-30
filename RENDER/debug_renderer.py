from app.tools.data import get_portfolio_data
import sys
import os
from fastapi import Request
from fastapi.templating import Jinja2Templates

# Add current directory to sys.path
sys.path.append(os.getcwd())


def debug():
    print("Fetching portfolio data...")
    try:
        portfolio_data = get_portfolio_data()
        print("Portfolio Data Keys:", portfolio_data.keys())
        print("COLOR_CONFIG:", portfolio_data.get("COLOR_CONFIG"))
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    templates = Jinja2Templates(directory="app/templates")

    context = {
        "request": {"scope": {}},  # Mock request
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
        "code_base": "",
        "line_count": 0,
        "terminal_output": ""
    }
    context.update(portfolio_data.get("MASTER_MAIN", {}))

    print("\nAttempting to render index.html...")
    try:
        templates.get_template("index.html").render(context)
        print("Render successful!")
    except Exception as e:
        print(f"\nRender FAILED: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    debug()
