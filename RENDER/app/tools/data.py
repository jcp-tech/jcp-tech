from app.utils.firebase_utils import get_realtime_data, get_firestore_data
from pygments.formatters import HtmlFormatter
from pygments.lexers import PythonLexer
from pygments import highlight
from collections import defaultdict
import re
import os


def extract_list(doc_data, key='items'):
    if doc_data:
        if doc_data and key in doc_data:
            return doc_data[key]
        return doc_data
    return None


def to_rgb_string(color, hex=False):
    """Convert hex, rgb string, or (r,g,b) tuple into:
       - 'R G B'  (default)
       - '#RRGGBB' if hex=True
    """

    def to_hex(r, g, b): return "#{:02X}{:02X}{:02X}".format(r, g, b)

    # 1. Hex input
    if isinstance(color, str) and color.startswith("#"):
        hex_val = color.lstrip("#")
        if len(hex_val) == 3:
            hex_val = "".join([c*2 for c in hex_val])
        r = int(hex_val[0:2], 16)
        g = int(hex_val[2:4], 16)
        b = int(hex_val[4:6], 16)
        return to_hex(r, g, b) if hex else f"{r} {g} {b}"

    # 2. RGB-like string
    if isinstance(color, str):
        nums = re.findall(r"\d+", color)
        if len(nums) == 3:
            r, g, b = map(int, nums)
            return to_hex(r, g, b) if hex else f"{r} {g} {b}"

    # 3. Tuple
    if isinstance(color, tuple) and len(color) == 3:
        r, g, b = color
        return to_hex(r, g, b) if hex else f"{r} {g} {b}"

    raise ValueError(f"Invalid color format: {color}")


def normalize_color_config(config, hex=False):
    """Convert all VALUES in the config to 'R G B' format."""

    new_config = {}

    for mode, values in config.items():
        new_config[mode] = {}
        for key, color in values.items():
            new_config[mode][key] = to_rgb_string(color, hex)

    return new_config


def build_skills_data(master_skills):
    skills_data = defaultdict(list)
    # Add each item under its category
    for item in master_skills:
        skills_data[item["category"]].append(
            {"name": item["name"], "icon": item["icon"]}
        )
    # Build FEATURED list
    featured_items = [
        {"name": item["name"], "icon": item["icon"]}
        for item in master_skills if item.get("featured")
    ]
    # Add FEATURED category at the top
    skills_data = {"FEATURED": featured_items, **skills_data}
    return skills_data, [x for x in skills_data.keys()]


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
            formatter = HtmlFormatter(nowrap=True)
            code_html = highlight(code_content, PythonLexer(), formatter)
            control_flow_keywords = [
                "if", "elif", "else", "return", "for", "while", "try", "except",
                "finally", "raise", "yield", "break", "continue", "pass", "with",
                "async", "await"
            ]
            pattern = r'<span class="k">(' + \
                '|'.join(control_flow_keywords) + r')</span>'
            code_html = re.sub(
                pattern, r'<span class="kc">\1</span>', code_html)
            code_html = re.sub(
                r'<span class="n">([A-Z][a-zA-Z0-9_]*)</span>', r'<span class="nc">\1</span>', code_html)

            def replace_brackets(match):
                content = match.group(1)
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


def get_portfolio_data():
    """Fetch all portfolio data from Firebase."""
    print("Attempting to load data from Firebase...")

    data = {
        "MASTER_MAIN": {},
        "COLOR_CONFIG": {},
        "SYNTAX_COLORS": {},
        "NAV_LINKS": [],
        "NAV_BAR": [],
        "LIVE_ACTIVITIES_HTML_COMPONENTS": [],
        "PROJECTS": [],
        "SKILLS_DATA": {},
        "SKILL_CATEGORIES": [],
        "EXPERIENCES": [],
        "EDUCATIONS": [],
        "CERTIFICATIONS": [],
        "ACHIEVEMENTS": [],
        "PROJECT_CATEGORIES": [],
        "SOCIAL_PILLS": [
            {
                "name": "LinkedIn",
                "link": "https://www.linkedin.com/in/jcp-tech/",
                "svg_icon": """<svg class="w-5 h-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>""",
                "active": True
            },
            {
                "name": "GitHub",
                "link": "https://github.com/jcp-tech",
                "svg_icon": """<svg class="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/></svg>""",
                "active": True
            },
        ]
    }

    # 1. Realtime Database Updates
    try:
        data["MASTER_MAIN"] = get_realtime_data('PORTFOLIO/MAIN') or {}
        if data["MASTER_MAIN"]:
            print("Loaded MASTER_MAIN from Realtime DB")
        else:
            print("Failed to load MASTER_MAIN from Realtime DB")

        color_config_raw = get_realtime_data('PORTFOLIO/COLOR_CONFIG')
        if color_config_raw:
            print("Loaded COLOR_CONFIG_RAW from Realtime DB")
            data["COLOR_CONFIG"] = normalize_color_config(
                color_config_raw, False)
        else:
            print("Failed to load COLOR_CONFIG_RAW from Realtime DB")

        syntax_colors_raw = get_realtime_data('PORTFOLIO/SYNTAX_COLORS')
        if syntax_colors_raw:
            print("Loaded SYNTAX_COLORS_RAW from Realtime DB")
            syntax_colorz = normalize_color_config(syntax_colors_raw, True)
            data["SYNTAX_COLORS"] = syntax_colorz.get('items', {})
        else:
            print("Failed to load SYNTAX_COLORS_RAW from Realtime DB")

        all_navbar = get_realtime_data('PORTFOLIO/NAVBAR')
        if all_navbar:
            master_navbar = [link for link in all_navbar if link.get('active')]
            data["NAV_LINKS"] = master_navbar
        else:
            master_navbar = []
        if master_navbar:
            print("Loaded MASTER_NAVBAR from Realtime DB")
            data["NAV_BAR"] = [
                link for link in master_navbar if link.get('add_to_navbar')]
        else:
            print("Failed to load MASTER_NAVBAR from Realtime DB")

    except Exception as e:
        print(f"Error loading Realtime DB data: {e}")

    try:
        # Check if it's wrapped in 'components' key as per notebook
        data["LIVE_ACTIVITIES_HTML_COMPONENTS"] = extract_list(
            get_firestore_data('PORTFOLIO/LIVE_ACTIVITIES'),
            'components'
        ) or []
        print("Loaded LIVE_ACTIVITIES from Firestore")

        # PROJECTS
        projects_doc = get_firestore_data('PORTFOLIO/PROJECTS') or {}
        data["PROJECTS"] = projects_doc.get('items', [])
        data["PROJECT_CATEGORIES"] = projects_doc.get('categories', [])
        print("Loaded PROJECTS and CATEGORIES from Firestore")

        # SKILLS
        skills_main = extract_list(
            get_firestore_data('PORTFOLIO/SKILLS'),
            'items'
        ) or []
        data["SKILLS_DATA"], data["SKILL_CATEGORIES"] = build_skills_data(
            skills_main)
        print("Loaded SKILLS from Firestore")

        # EXPERIENCES
        data["EXPERIENCES"] = extract_list(
            get_firestore_data('PORTFOLIO/EXPERIENCES'),
            'items'
        ) or []
        for i, exp in enumerate(data["EXPERIENCES"]):
            exp["id"] = i
        print("Loaded EXPERIENCES from Firestore")

        # EDUCATIONS
        data["EDUCATIONS"] = extract_list(
            get_firestore_data('PORTFOLIO/EDUCATIONS'),
            'items'
        ) or []
        print("Loaded EDUCATIONS from Firestore")

        # CERTIFICATIONS
        data["CERTIFICATIONS"] = extract_list(
            get_firestore_data('PORTFOLIO/CERTIFICATIONS'),
            'items'
        ) or []
        print("Loaded CERTIFICATIONS from Firestore")

        # ACHIEVEMENTS
        data["ACHIEVEMENTS"] = extract_list(
            get_firestore_data('PORTFOLIO/ACHIEVEMENTS'),
            'items'
        ) or []
        print("Loaded ACHIEVEMENTS from Firestore")

    except Exception as e:
        print(f"Error loading Firestore data: {e}")

    return data
