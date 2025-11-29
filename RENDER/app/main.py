from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.data import NAV_LINKS, LIVE_ACTIVITIES_HTML_COMPONENTS, PROJECTS, SKILL_CATEGORIES, SKILLS_DATA, EXPERIENCES, EDUCATIONS, CERTIFICATIONS, COLOR_CONFIG, SYNTAX_COLORS

import os
import re
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


def get_developer_profile_data():
    # Read and format the code
    code_path = os.path.join("app", "static", "code", "developer_profile.py")
    line_count = 0
    code_html = ""
    try:
        with open(code_path, "r") as f:
            code_content = f.read()
            line_count = len(code_content.splitlines())
            if code_content.endswith('\n'):
                line_count += 1
            # Use nowrap=True to get just the spans, we'll handle wrapping and styling in the template
            formatter = HtmlFormatter(nowrap=True)
            code_html = highlight(code_content, PythonLexer(), formatter)

            # Post-process to distinguish Control Flow keywords (Purple) from Declaration keywords (Blue)
            # Pygments PythonLexer marks both 'if' and 'def' as 'k' (Keyword).
            # We want 'if', 'else', 'return', etc. to be 'kc' (Keyword.Control).
            control_flow_keywords = [
                "if", "elif", "else", "return", "for", "while", "try", "except",
                "finally", "raise", "yield", "break", "continue", "pass", "with",
                "async", "await"
            ]
            # Create a regex pattern to match these keywords wrapped in <span class="k">
            pattern = r'<span class="k">(' + \
                '|'.join(control_flow_keywords) + r')</span>'
            code_html = re.sub(
                pattern, r'<span class="kc">\1</span>', code_html)

            # Generic Class Name Detection:
            # Look for CapitalizedWords that are currently marked as generic Names (.n)
            # and change them to Class Names (.nc).
            # This makes it work "even if code changes".
            # Regex: <span class="n">([A-Z][a-zA-Z0-9_]*)</span>
            code_html = re.sub(
                r'<span class="n">([A-Z][a-zA-Z0-9_]*)</span>', r'<span class="nc">\1</span>', code_html)

            # Post-process Brackets to be Gold (.pb) instead of Gray (.p)
            # Pygments often groups punctuation like '([])' or '):' or '()' into a single <span class="p">.
            # We need to find these spans and wrap the brackets inside them with <span class="pb">.
            def replace_brackets(match):
                content = match.group(1)
                # Replace brackets with wrapped brackets
                # We use a temporary marker to avoid recursive replacement issues if we were doing this differently,
                # but here we can just insert the span.
                # Note: We are nesting spans: <span class="p">...<span class="pb">(</span>...</span>
                # This requires CSS to handle nested spans correctly (inner span color should win).
                for b in ['(', ')', '[', ']', '{', '}']:
                    content = content.replace(
                        b, f'<span class="pb">{b}</span>')
                return f'<span class="p">{content}</span>'

            code_html = re.sub(
                r'<span class="p">([^<]+)</span>', replace_brackets, code_html)

    except Exception as e:
        code_html = f"Error reading code: {e}"
        line_count = 0

    # Read the log output
    log_path = "/tmp/developer_profile.log"
    fallback_log_path = os.path.join(
        "app", "static", "code", "developer_profile.log")
    terminal_output = ""
    try:
        if os.path.exists(log_path):
            with open(log_path, "r") as f:
                terminal_output = f.read()
        elif os.path.exists(fallback_log_path):
            with open(fallback_log_path, "r") as f:
                terminal_output = f.read()
            print("Log file not found. Using Backup.")
        else:
            terminal_output = "Log file not found. Run the container to generate it."
    except Exception as e:
        terminal_output = f"Error reading log: {e}"

    return code_html, line_count, terminal_output


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
