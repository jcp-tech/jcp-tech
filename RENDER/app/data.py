from app.utils.firebase_utils import get_realtime_data, get_firestore_data
from collections import defaultdict
import re


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
    print("----------------")
    print("Loaded SYNTAX_COLORS_RAW from Realtime DB")
    print(SYNTAX_COLORS_RAW)
    print(type(SYNTAX_COLORS_RAW))
    print("----------------")
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
