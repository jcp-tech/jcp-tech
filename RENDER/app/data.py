from collections import defaultdict
import re

##### FUNCTIONS #####

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

def normalize_color_config(config):
    """Convert all VALUES in the config to 'R G B' format."""
    new_config = {}

    for mode, values in config.items():
        new_config[mode] = {}
        for key, color in values.items():
            new_config[mode][key] = to_rgb_string(color)

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


##### REALTIME DATABASE DATA (RARE CHANGES) #####

COLOR_CONFIG_RAW = {
    "light": {
        "primary-rgb": "22 163 74",  # Green-600
        "bg-rgb": "240 244 248",     # Light Blue-Grey
        "card-bg-rgb": "255 255 255",  # White cards
        "text-main": "17 24 39",     # Gray-900
        "text-muted": "75 85 99",    # Gray-600
        "border-color": "229 231 235"  # Gray-200
    },
    "dark": {
        "primary-rgb": "74 222 128",  # Green-400
        "bg-rgb": "16 16 24",        # Deep Blue-Black
        "card-bg-rgb": "255 255 255",  # White (used with low opacity)
        "text-main": "255 255 255",  # White
        "text-muted": "156 163 175",  # Gray-400
        "border-color": "255 255 255"  # White (used with low opacity)
    }
}

SYNTAX_COLORS_RAW = {
    "background": "#1f1f1f",
    "comments": "#6f9953",

    "keywords": "#669cd8",
    "control_keywords": "#9179c1",

    "functions": "#dbdca8",
    "function_brackets": "#f8d700",

    "variables": "#a7dcff",
    "class_names": "#5cc9b0",

    "operators_punctuation": "#cccccc",

    "strings": "#c79163",
    "string_escapes": "#b1ba7a",
    "fstrings_rstrings": "#397fd8",

    "numbers": "#4e9d9c",
    "booleans_none": "#86e3ce",

    "builtins_functions": "#dbdca8",
    "builtins_classes": "#5cc9b0",

    "decorators": "#ea5b9b",
    "module_names": "#a4c9ff",

    "indent_guides": "#1f1f1f",
    "errors": "#ff5555",
    "warnings": "#ffcc00"
}

MASTER_NAVBAR = [
    {'name': 'Home', 'href': '#home', 'template': 'hero', 'active': True},
    {'name': 'Projects', 'href': '#projects', 'template': 'projects', 'active': False},
    {'name': 'Skills', 'href': '#skills', 'template': 'skills', 'active': False},
    {'name': 'Experience', 'href': '#experience', 'template': 'experience', 'active': False},
    {'name': 'Contact', 'href': '#contact', 'template': 'contact', 'active': False},
]

##### FIRESTORE DATABASE DATA (FREQUENT CHANGES) #####

LIVE_ACTIVITIES_HTML_COMPONENTS = [
    # 1. Discord Status
    """
        <img 
            src="https://discord-readme-badge.vercel.app/api?id=686190428634349751" 
            alt="Discord Status" 
            class="w-full h-auto object-cover"
            loading="lazy"
        />
    """,
    # 2. Spotify
    """
        <a href="https://spotify-readme-133611191593.us-central1.run.app/link" target="_blank" rel="noopener noreferrer" class="block w-full">
            <img
              src="https://spotify-readme-133611191593.us-central1.run.app?theme=dark"
              alt="Current Spotify Song"
              class="w-full h-auto hidden dark:block"
            />
             <img
              src="https://spotify-readme-133611191593.us-central1.run.app"
              alt="Current Spotify Song"
              class="w-full h-auto block dark:hidden"
            />
        </a>
    """,
    # 3. GitHub Stats
    """
        <img 
            src="https://github-readme-stats-teal-six-35.vercel.app/api?username=jcp-tech&include_all_commits=true&show_icons=true&title_color=fff&text_color=9ca3af&icon_color=4ade80&bg_color=0d1117&hide_border=true&locale=en" 
            alt="GitHub Stats"
            class="w-full h-auto hidden dark:block"
        />
        <img 
            src="https://github-readme-stats-teal-six-35.vercel.app/api?username=jcp-tech&include_all_commits=true&show_icons=true&title_color=000&text_color=4b5563&icon_color=16a34a&bg_color=ffffff&hide_border=true&locale=en" 
            alt="GitHub Stats"
            class="w-full h-auto block dark:hidden"
        />
    """,
    # 4. Top Languages
    """
        <img 
            src="https://github-readme-stats-teal-six-35.vercel.app/api/top-langs?username=jcp-tech&show_icons=true&locale=en&layout=compact&title_color=fff&text_color=9ca3af&bg_color=0d1117&hide_border=true" 
            alt="Top Languages"
            class="w-full h-auto hidden dark:block"
        />
         <img 
            src="https://github-readme-stats-teal-six-35.vercel.app/api/top-langs?username=jcp-tech&show_icons=true&locale=en&layout=compact&title_color=000&text_color=4b5563&bg_color=ffffff&hide_border=true" 
            alt="Top Languages"
            class="w-full h-auto block dark:hidden"
        />
    """,
]

PROJECTS = [  # TODO: Add projects
    {
        'id': '1',
        'title': 'AI-Powered Automation Suite',
        'description': 'An enterprise-level platform for automating complex business workflows using TensorFlow and Python.',
        'category': 'AI/ML',
        'image': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEmLOc-BehZy8q8tXz4nUpYOmUlk7i_5VTH3JDcxdUleYUQmcMLseb3bD3HwEM7sRh6jK-RwrZia2JVB74dVkGhn4E6QtwwAvXHHe3kM1uxGJckhH5GiH4t6zdQRuNDWANqb3eKwp1t6phYjzc4lHd9uf7ifgUZwZoRRHO8PhPV4Vp3EVHIrIpDz_NvGtwDrItpixYg8Ao2DnAyuEDy6WDPlxMNxvlxwS1R3eB_yJvswvOhb1f_7MYpb3ambxJ2hZYDo8cWv0YX9w',
        'tags': ['Python', 'TensorFlow', 'React']
    },
    {
        'id': '2',
        'title': 'Next-Gen E-commerce Engine',
        'description': 'A scalable and performant e-commerce backend built with a modern, headless architecture.',
        'category': 'Full-Stack',
        'image': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG7ZMO_CDWFfVw6zlxBjKMBcPtxIdwJvBPm0l0xze4AvbF19buH888TDfSwnOxkT-QEOG0xU6MYCbElSL3YEAR4f9Gt7vCCq2882JW7K-ycfPSd3WgvuTBzdEtRviUMQJ2oflESWlPEms1cs6whdVr4NtX33ZtxjWhHB6koXj1DstkiBRqBlOIl7KyDAa18Zp9j4mooP-9yvlX_faRRJBanCWdewU5B4Wj8FbNM4AENYzcVuMzyhsSwjRxZ7HxgYFEmbudrOfVBCc',
        'tags': ['Node.js', 'GraphQL', 'Vue.js']
    },
    {
        'id': '3',
        'title': 'Interactive Data Viz Hub',
        'description': 'A dynamic dashboard for visualizing complex datasets with real-time updates and interactive controls.',
        'category': 'UI/UX',
        'image': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVeD1TowluxZ4gbaRDFCR4Mnl6JEeNfVE8at0a9KcTKgMF5f1ZTGxns9RON9CZFEOGwEHZt8Sq9LzmQIVuE9wXFPW1R5Hhh-VY-1rohw6D1tdN8nxu37yH7UKw10Ag8YGHyoHxx3cAM0E9H2tmQJpYI9quub_MCG1uQsNPMAvonO70zv82LMiA2I1AAO4MbmvMr0JR-W73zUDQlKiNyRdgtKs2qJSigfDX3dKM-zUw7oiasfcOHwcV2nGcL8lYYoBXqcsrA7BX3KI',
        'tags': ['D3.js', 'Next.js', 'PostgreSQL']
    },
    {
        'id': '4',
        'title': 'Cloud Deployment Pipeline',
        'description': 'CI/CD pipeline for automated testing, building, and deploying applications to cloud infrastructure.',
        'category': 'Automation',
        'image': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC9wkhzMhGdU2h9Ja9NLgCUpkyrzS1AagJql8v5FyapUeKOrU0653wpDB8c6k5Zsui3bxyvjo2zkBxikR86s0wPyyztg21i2sRcn5MZ95kT0B-2mwXY3SwEj0Zv8C2VaH7fEzROrQfv5BlpCsO9nSfvW0OJcT8jY-aaKXg8G4ppc60yWCHdMOOP-BC6A1nQPtf5STsr892Wcp2-6vghjE2oBrAJROYRuSONFxubj8Ahl0ydU7CowymXbYTQ8jPolOjl-Mm_FKhRw0',
        'tags': ['Docker', 'Kubernetes', 'AWS']
    },
    {
        'id': '5',
        'title': 'Real-time Chat Application',
        'description': 'A full-stack chat app with WebSockets, authentication, and a modern, responsive user interface.',
        'category': 'Full-Stack',
        'image': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlqeZxWBQRCPmtpR1Rjn-gNSpyAMIOf8HlyrDet7rThIB9m2gfJfybbb4z4YQe6YqOKNXebvMp78kq3eD3x8LlhgZz6B5pDCf2ViENwRIeI40Om03GjrkM-b-gYC1GG6hCaflCeuWARjvAKnDI58g_zbwtUJ0szTW037Wa_FUh5M0Ct_GJ5wF8A7LaVgBo14zy0znxT3X1lWhoOhiPvNrt3Q3Z6dsXvFVVRccfq7cOacaoJVPmXRnhPN6kyWuvB55_aLUfizm7Xp8',
        'tags': ['WebSockets', 'Express.js', 'Svelte']
    },
    {
        'id': '6',
        'title': 'Smart Recommendation System',
        'description': 'A collaborative filtering engine to provide personalized content recommendations for users.',
        'category': 'AI/ML',
        'image': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHJjjr6_gBNB1wYbEy5EiakBItyQkIRJ2qzhjlwAoge8jIajxJOWlPJcRkwq_mVJ-YKBmTPppAo2sY1ZidMq5EkW2oHvsZhbiO3q3zfBI6h-RG6qSzJVRATYlQmRLgde18hBwLINjrqsp3HvDCukJkRZayo91JrL1Ab8Tfu7RTQmP9Cj7VqkIjx7MowIOlvfkJlQgo4y9pqfsVvbGldyzvENk_BrkbgXU7GctvIQkFdMqgh5TXjSj8VLY5-UkJy-NsYU0nXZL544M',
        'tags': ['SciPy', 'Pandas', 'Flask']
    }
]

SKILLS_MAIN = [
    {"name": "Python", "icon": "psychology", "category": "AI/ML", "featured": True},
    {"name": "TensorFlow", "icon": "hub", "category": "AI/ML", "featured": True},
    {"name": "PyTorch", "icon": "model_training", "category": "AI/ML", "featured": False},
    {"name": "AWS", "icon": "cloud", "category": "DevOps", "featured": True},
    {"name": "Docker", "icon": "deployed_code", "category": "DevOps", "featured": True},
    {"name": "Kubernetes", "icon": "sailing", "category": "DevOps", "featured": False},
    {"name": "React", "icon": "javascript", "category": "Frontend", "featured": True},
    {"name": "Next.js", "icon": "webhook", "category": "Frontend", "featured": False},
    {"name": "PostgreSQL", "icon": "database", "category": "Backend", "featured": False},
    {"name": "FastAPI", "icon": "bolt", "category": "Backend", "featured": True},
] 

EXPERIENCES = [
    {
        'id': '1',
        'company': 'MSS',
        'roles': [
            {
                'title': 'CTO',
                'period': '2024 - Present',
                'points': [
                    'Defining the technical vision and strategy for AI-driven product expansion.',
                    'Overseeing a department of 20+ engineers and data scientists.',
                    'Spearheading the adoption of Generative AI across the core platform.'
                ]
            },
            {
                'title': 'Lead Dev',
                'period': '2023 - 2024',
                'points': [
                    'Led a team of 5 engineers in developing and deploying machine learning models.',
                    'Architected a scalable MLOps pipeline, reducing model deployment time by 40%.',
                    'Mentored junior developers and established code quality standards.'
                ]
            },
            {
                'title': 'Developer',
                'period': '2022 - 2023',
                'points': [
                    'Developed core backend services using Python and FastAPI.',
                    'Integrated third-party APIs for real-time data processing.',
                    'Optimized database queries reducing latency by 30%.'
                ]
            },
            {
                'title': 'Junior Developer',
                'period': '2021 - 2022',
                'points': [
                    'Collaborated with senior engineers to implement UI components in React.',
                    'Wrote unit and integration tests to ensure system reliability.',
                    'Participated in agile sprints and daily stand-ups.'
                ]
            },
            {
                'title': 'Intern',
                'period': '2021',
                'points': [
                    'Assisted in data preprocessing and feature engineering for large-scale datasets.',
                    'Built internal tools to visualize model training metrics.',
                    'Learned best practices in version control and CI/CD.'
                ]
            }
        ]
    },
    {
        'id': '2',
        'company': 'Smooth-Ocean',
        'roles': [
            {
                'title': 'Senior Automation Developer',
                'period': '2020 - 2022',
                'points': [
                    'Developed automation scripts that increased operational efficiency by 25%.',
                    'Maintained and improved CI/CD pipelines for several enterprise applications.'
                ]
            }
        ]
    },
    {
        'id': '3',
        'company': 'JCP-Vision',
        'roles': [
            {
                'title': 'Full-Stack Developer',
                'period': '2018 - 2020',
                'points': [
                    'Contributed to the development of a high-traffic e-commerce platform using React and Node.js.',
                    'Implemented features that improved user engagement by 15%.'
                ]
            }
        ]
    }
]

EDUCATIONS = [
    {
        'school': 'Carnegie Mellon University',
        'degree': 'M.S. in Machine Learning',
        'location': 'Pittsburgh, PA',
        'year': '2018',
        'icon': 'school'
    },
    {
        'school': 'Stanford University',
        'degree': 'AI Graduate Certificate',
        'location': 'Online',
        'year': '2017',
        'icon': 'workspace_premium'
    },
    {
        'school': 'University of Waterloo',
        'degree': 'B.S. in Computer Science',
        'location': 'Waterloo, ON',
        'year': '2016',
        'icon': 'computer'
    }
]

CERTIFICATIONS = [
    {'name': 'TensorFlow Developer Certificate', 'issuer': 'Google'},
    {'name': 'AWS Certified Machine Learning - Specialty', 'issuer': 'Amazon Web Services'},
    {'name': 'Microsoft Certified: Azure AI Engineer Associate', 'issuer': 'Microsoft'},
    {'name': 'Certified Kubernetes Application Developer', 'issuer': 'The Linux Foundation'},
    {'name': 'Professional Scrum Master™ I (PSM I)', 'issuer': 'Scrum.org'},
    {'name': 'HashiCorp Certified: Terraform Associate', 'issuer': 'HashiCorp'},
]

##### PROCCESSED DATA #####

NAV_LINKS = [link for link in MASTER_NAVBAR if link['active']]
COLOR_CONFIG = normalize_color_config(COLOR_CONFIG_RAW)
SYNTAX_COLORS = normalize_color_config(SYNTAX_COLORS_RAW)
SKILLS_DATA, SKILL_CATEGORIES = build_skills_data(SKILLS_MAIN)