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

    to_hex = lambda r, g, b: "#{:02X}{:02X}{:02X}".format(r, g, b)

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

# --- Attempt to Load from Firebase ---
print("Attempting to load data from Firebase...")

# 1. Realtime Database Updates
try:
    COLOR_CONFIG_RAW = get_realtime_data('PORTFOLIO/COLOR_CONFIG')
    if COLOR_CONFIG_RAW:
        print("Loaded COLOR_CONFIG_RAW from Realtime DB")
        COLOR_CONFIG = normalize_color_config(COLOR_CONFIG_RAW, False)
    else:
        print("Failed to load COLOR_CONFIG_RAW from Realtime DB")
        COLOR_CONFIG = {}

    SYNTAX_COLORS_RAW = get_realtime_data('PORTFOLIO/SYNTAX_COLORS')
    if SYNTAX_COLORS_RAW:
        print("Loaded SYNTAX_COLORS_RAW from Realtime DB")
        SYNTAX_COLORZ = normalize_color_config(SYNTAX_COLORS_RAW, True)
        SYNTAX_COLORS = SYNTAX_COLORZ['items']
    else:
        print("Failed to load SYNTAX_COLORS_RAW from Realtime DB")
        SYNTAX_COLORS = {}

    MASTER_NAVBAR = get_realtime_data('PORTFOLIO/MASTER_NAVBAR')
    if MASTER_NAVBAR:
        print("Loaded MASTER_NAVBAR from Realtime DB")
        NAV_LINKS = [link for link in MASTER_NAVBAR if link.get('active')]
    else:
        print("Failed to load MASTER_NAVBAR from Realtime DB")
        NAV_LINKS = []

except Exception as e:
    print(f"Error loading Realtime DB data: {e}")


# 2. Firestore Updates
try:
    # Check if it's wrapped in 'components' key as per notebook
    LIVE_ACTIVITIES_HTML_COMPONENTS = extract_list(
        get_firestore_data('PORTFOLIO/LIVE_ACTIVITIES'),
        'components'
    )
    print("Loaded LIVE_ACTIVITIES from Firestore")

    # PROJECTS
    PROJECTS = extract_list(
        get_firestore_data('PORTFOLIO/PROJECTS'),
        'items'
    )
    print("Loaded PROJECTS from Firestore")

    # SKILLS
    SKILLS_MAIN = extract_list(
        get_firestore_data('PORTFOLIO/SKILLS'),
        'items'
    )
    SKILLS_DATA, SKILL_CATEGORIES = build_skills_data(SKILLS_MAIN)
    print("Loaded SKILLS from Firestore")

    # EXPERIENCES
    EXPERIENCES = extract_list(
        get_firestore_data('PORTFOLIO/EXPERIENCES'),
        'items'
    )
    print("Loaded EXPERIENCES from Firestore")

    # EDUCATIONS
    EDUCATIONS = extract_list(
        get_firestore_data('PORTFOLIO/EDUCATIONS'),
        'items'
    )
    print("Loaded EDUCATIONS from Firestore")

    # CERTIFICATIONS
    CERTIFICATIONS = extract_list(
        get_firestore_data('PORTFOLIO/CERTIFICATIONS'),
        'items'
    )
    print("Loaded CERTIFICATIONS from Firestore")
except Exception as e:
    print(f"Error loading Firestore data: {e}")