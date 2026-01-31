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


def to_rgba_string(color, hex=False):
    """Convert hex, rgb string, or (r,g,b[,a]) tuple into:
       - 'R G B' (if alpha=1 and hex=False)
       - 'R G B / A' (if alpha<1 and hex=False)
       - '#RRGGBB' (if alpha=1 and hex=True)
       - '#RRGGBBAA' (if alpha<1 and hex=True)
    """
    import re

    def to_hex(r, g, b, a=255):
        if a == 255:
            return "#{:02X}{:02X}{:02X}".format(r, g, b)
        return "#{:02X}{:02X}{:02X}{:02X}".format(r, g, b, a)

    def normalize_alpha_int(a):
        """Ensure alpha is 0-255 int."""
        if isinstance(a, float) and 0 <= a <= 1.0:
            return int(a * 255)
        return int(a)

    def normalize_alpha_float(a):
        """Ensure alpha is 0-1 float."""
        if isinstance(a, int) and a > 1:
            return round(a / 255, 3)
        return round(float(a), 3)

    def output(r, g, b, a_val):
        """Return correct output depending on hex flag."""
        # a_val can be int (0-255) or float (0-1) depending on source
        # Normalize for output

        # For Hex, we need 0-255 int
        if isinstance(a_val, float) and a_val <= 1.0:
            a_int = int(a_val * 255)
        else:
            a_int = int(a_val)

        if hex:
            return to_hex(r, g, b, a_int)

        # For RGB string, we need 0-1 float for alpha
        if isinstance(a_val, int) and a_val > 1:
            a_float = round(a_val / 255, 3)
        else:
            a_float = round(float(a_val), 3)

        if a_float >= 1.0:
            return f"{r} {g} {b}"
        else:
            return f"{r} {g} {b} / {a_float}"

    # -------------------------------------------------------------
    # 1. HEX INPUT
    # -------------------------------------------------------------
    if isinstance(color, str) and color.startswith("#"):
        hex_val = color.lstrip("#")

        # Expand short hex (#RGB, #RGBA)
        if len(hex_val) in (3, 4):
            hex_val = "".join(c * 2 for c in hex_val)

        if len(hex_val) == 6:
            r = int(hex_val[0:2], 16)
            g = int(hex_val[2:4], 16)
            b = int(hex_val[4:6], 16)
            return output(r, g, b, 255)

        if len(hex_val) == 8:
            r = int(hex_val[0:2], 16)
            g = int(hex_val[2:4], 16)
            b = int(hex_val[4:6], 16)
            a = int(hex_val[6:8], 16)
            return output(r, g, b, a)

        raise ValueError(f"Invalid hex color: {color}")

    # -------------------------------------------------------------
    # 2. RGB / RGBA STRING INPUT
    # -------------------------------------------------------------
    if isinstance(color, str):
        nums = re.findall(r"[\d.]+", color)

        if len(nums) == 3:  # rgb
            r, g, b = map(int, nums)
            return output(r, g, b, 255)

        if len(nums) == 4:  # rgba
            r, g, b = map(int, nums[:3])
            a = float(nums[3])
            return output(r, g, b, a)

    # -------------------------------------------------------------
    # 3. TUPLE INPUT (r,g,b) or (r,g,b,a)
    # -------------------------------------------------------------
    if isinstance(color, tuple):
        if len(color) == 3:
            r, g, b = color
            return output(r, g, b, 255)

        if len(color) == 4:
            r, g, b, a = color
            return output(r, g, b, a)

    raise ValueError(f"Invalid color format: {color}")


def normalize_color_config(config, hex=False):
    """Convert config values.
       - If key ends in 'rgb' or 'RGB': convert to 'R G B' (space separated components).
       - Otherwise: convert to '#RRGGBB' or '#RRGGBBAA' (Hex string).
    """

    new_config = {}

    for mode, values in config.items():
        new_config[mode] = {}
        for key, color in values.items():
            # Heuristic: keys ending in 'rgb' are used in rgb() wrappers
            if key.lower().endswith('rgb'):
                new_config[mode][key] = to_rgba_string(color, hex=False)
            else:
                # Others are used directly (e.g. text-main, bg-primary) -> Force Hex
                new_config[mode][key] = to_rgba_string(color, hex=True)

    return new_config


def build_skills_data(master_skills):
    skills_data = defaultdict(list)
    # Check only for active items
    master_skills = [item for item in master_skills if item.get("active")]
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


def generate_css_gradient(config):
    """
    Generates a CSS gradient string from the advanced colors config object.
    Matches logic in advanced_colors.js (Linear, Radial, Conic).
    """
    if not config:
        return ""

    g_type = config.get('type', 'linear')
    # Default gamma to 50 if not present (midpoint)
    gamma = config.get('gamma', 50)
    stops = config.get('colorStops', [])

    # Sort stops by position
    stops = sorted(stops, key=lambda x: x.get('position', 0))

    if not stops:
        return "none"

    # Build stop string with potential gamma midpoints
    stop_strs = []
    for i, stop in enumerate(stops):
        color = stop.get('color', '#000000')
        # Ensure proper hex/rgba format if needed, but usually stored as Hex8 or Hex6
        # Data migration ensures hex8, but we can trust the value or use to_rgba_string if strictly needed.
        # Assuming direct mapping for now as JS does.

        pos = stop.get('position', 0)
        stop_strs.append(f"{color} {pos}%")

        # Add gamma hint if not last
        if i < len(stops) - 1:
            next_stop = stops[i+1]
            if gamma != 50:
                # Calculate midpoint hint
                # hint = start + (end - start) * (gamma / 100)
                next_pos = next_stop.get('position', 100)
                midpoint = pos + (next_pos - pos) * (gamma / 100)
                stop_strs.append(f"{midpoint:.2f}%")

    stops_joined = ", ".join(stop_strs)

    if g_type == 'linear':
        angle = config.get('angle', 90)
        return f"linear-gradient({angle}deg, {stops_joined})"

    elif g_type == 'radial':
        # Shape
        aspect_lock = config.get('aspectRatioLock', False)
        shape = 'circle' if aspect_lock else 'ellipse'

        # Size (Spread)
        spread = config.get('spread', 100)
        # JS logic:
        # Circle: `${spread}%`
        # Ellipse: `${spread}% ${spread}%` (simplified to same x/y for now in JS too)
        size_part = f"{spread}%"
        if not aspect_lock:
            size_part = f"{spread}% {spread}%"

        center_x = config.get('centerX', 50)
        center_y = config.get('centerY', 50)

        return f"radial-gradient({shape} {size_part} at {center_x}% {center_y}%, {stops_joined})"

    elif g_type == 'conic':
        angle = config.get('angle', 0)
        center_x = config.get('centerX', 50)
        center_y = config.get('centerY', 50)
        repeat = config.get('repeat', False)
        fn = "repeating-conic-gradient" if repeat else "conic-gradient"

        return f"{fn}(from {angle}deg at {center_x}% {center_y}%, {stops_joined})"

    return "none"


def get_portfolio_data(include_all_categories=False):
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
        "SOCIAL_PILLS": [],
        "USE_GRADIENTS": False,
        "ADVANCED_COLORS": {},
        "COLOR_PRESETS": [],
        "GRADIENT_BODY_LIGHT": "",
        "GRADIENT_BODY_DARK": "",
        "GRADIENT_NAV_LIGHT": "",
        "GRADIENT_NAV_DARK": ""
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
        live_activities = extract_list(
            get_firestore_data('PORTFOLIO/LIVE_ACTIVITIES'),
            'components'
        ) or []
        data["LIVE_ACTIVITIES_HTML_COMPONENTS"] = [activity.get(
            'html') for activity in live_activities if activity.get('active')]
        print("Loaded LIVE_ACTIVITIES from Firestore")

        # PROJECTS
        projects_doc = get_firestore_data('PORTFOLIO/PROJECTS') or {}
        projects = projects_doc.get('items', [])
        active_projects = [
            project for project in projects if project.get('active')]
        data["PROJECTS"] = active_projects
        project_categories = projects_doc.get('categories', [])
        if include_all_categories:
            data["PROJECT_CATEGORIES"] = [category.get('name') for category in project_categories if category.get('active') is not False]
        else:
            available_categories = set()
            for projectz in active_projects:
                print(projectz.get('category'))
                available_categories.add(projectz.get('category'))
            data["PROJECT_CATEGORIES"] = [category.get('name') for category in project_categories if category.get('name') in available_categories and category.get('active') is not False]
        print("Loaded all PROJECTS and Related from Firestore.")

        # SKILLS
        skills_main = extract_list(
            get_firestore_data('PORTFOLIO/SKILLS'),
            'items'
        ) or []
        data["SKILLS_DATA"], data["SKILL_CATEGORIES"] = build_skills_data(
            skills_main)
        print("Loaded SKILLS from Firestore")

        # EXPERIENCES
        experiences = extract_list(
            get_firestore_data('PORTFOLIO/EXPERIENCES'),
            'items'
        ) or []
        for i, exp in enumerate(experiences):
            exp["id"] = i
        active_experiences = []
        for exp in experiences:
            if exp.get('active'):
                active_roles = []
                for roles in exp.get('roles', []):
                    if roles.get('active'):
                        active_roles.append(roles)
                    else:
                        continue
                if active_roles:
                    exp["roles"] = active_roles
                    active_experiences.append(exp)
                else:
                    continue
            else:
                continue
        data["EXPERIENCES"] = active_experiences
        print("Loaded EXPERIENCES from Firestore")

        # EDUCATIONS
        edus = extract_list(
            get_firestore_data('PORTFOLIO/EDUCATIONS'),
            'items'
        ) or []
        data["EDUCATIONS"] = [edu for edu in edus if edu.get('active')]
        print("Loaded EDUCATIONS from Firestore")

        # CERTIFICATIONS
        certs = extract_list(
            get_firestore_data('PORTFOLIO/CERTIFICATIONS'),
            'items'
        ) or []
        data["CERTIFICATIONS"] = [cert for cert in certs if cert.get('active')]
        print("Loaded CERTIFICATIONS from Firestore")

        # ACHIEVEMENTS
        awards = extract_list(
            get_firestore_data('PORTFOLIO/ACHIEVEMENTS'),
            'items'
        ) or []
        data["ACHIEVEMENTS"] = [
            award for award in awards if award.get('active')]
        print("Loaded ACHIEVEMENTS from Firestore")

        # SOCIAL PILLS
        socials = extract_list(
            get_firestore_data('PORTFOLIO/SOCIAL_PILLS'),
            'items'
        ) or []
        data["SOCIAL_PILLS"] = [link for link in socials if link.get('active')]
        print("Loaded SOCIAL PILLS from Firestore")

        # ADVANCED COLORS
        adv_colors = get_firestore_data('PORTFOLIO/ADVANCED_COLORS') or {}
        ADVANCED_COLORS = adv_colors.get('items', {})
        data['USE_GRADIENTS'] = ADVANCED_COLORS.get('enabled', False)
        data['COLOR_PRESETS'] = adv_colors.get('presets', [])
        data["ADVANCED_COLORS"] = ADVANCED_COLORS

        if data['USE_GRADIENTS']:
            dark_conf = ADVANCED_COLORS.get('darkMode', {})
            light_conf = ADVANCED_COLORS.get('lightMode', {})

            # Body Gradients
            if dark_conf.get('applyTo', {}).get('body'):
                data["GRADIENT_BODY_DARK"] = generate_css_gradient(dark_conf)
            if light_conf.get('applyTo', {}).get('body'):
                data["GRADIENT_BODY_LIGHT"] = generate_css_gradient(light_conf)

            # Navbar Gradients
            if dark_conf.get('applyTo', {}).get('navbar'):
                data["GRADIENT_NAV_DARK"] = generate_css_gradient(dark_conf)
            if light_conf.get('applyTo', {}).get('navbar'):
                data["GRADIENT_NAV_LIGHT"] = generate_css_gradient(light_conf)

        print("Loaded ADVANCED_COLORS from Firestore")

    except Exception as e:
        print(f"Error loading Firestore data: {e}")

    return data
