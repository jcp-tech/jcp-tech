import os
import subprocess
import re
import sys


def main():
    base_dir = os.getcwd()
    profile_script = os.path.join(
        base_dir, 'app', 'static', 'code', 'developer_profile.py')
    log_file = os.path.join(base_dir, 'app', 'static',
                            'code', 'developer_profile.log')
    hero_html = os.path.join(
        base_dir, 'app', 'templates', 'components', 'hero.html')

    print(f"Running {profile_script}...")

    # 1. Run the developer_profile.py script and capture output
    try:
        # Use the same Python interpreter that's running this script to execute
        # the developer_profile script so we don't rely on an external "python"
        # executable being present in PATH.
        result = subprocess.run(
            [sys.executable, profile_script], capture_output=True, text=True, check=True)
        output = result.stdout
        print("Script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running script: {e}")
        output = f"Error running profile script: {e}\n{e.stderr}"
    except FileNotFoundError as e:
        print(f"Error: could not find the profile script or python interpreter: {e}")
        output = f"Error running profile script: {e}\n"

    # 2. Store output to log file
    with open(log_file, 'w') as f:
        f.write(output)
    print(f"Output saved to {log_file}")

    # 3. Format output for HTML injection
    # We want to wrap each line in a div to simulate terminal output
    html_lines = []
    for line in output.splitlines():
        if not line.strip():
            html_lines.append('<div class="h-4"></div>')  # Empty line
        else:
            # Escape HTML characters if necessary, though simple text is likely fine
            safe_line = line.replace('<', '&lt;').replace('>', '&gt;')
            html_lines.append(f'<div>{safe_line}</div>')

    # Add the cursor at the end
    html_lines.append(
        '<div class="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 mt-1"></div>')

    injected_content = "".join(html_lines)

    # 4. Inject into hero.html
    print(f"Reading {hero_html}...")
    with open(hero_html, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the terminal-content div and replace its content
    # Looking for <div id="terminal-content" ...> ... </div>
    # We need to be careful with regex matching the closing div.
    # Since the content inside is what we want to replace, we can look for the specific structure we saw.

    pattern = r'(<div id="terminal-content"[^>]*>)(.*?)(</div>)'

    # Using re.DOTALL to match across newlines
    match = re.search(pattern, content, re.DOTALL)

    if match:
        print("Found terminal-content div.")
        new_content = match.group(
            1) + '\n                ' + injected_content + '\n            ' + match.group(3)

        # Replace the matched section with new content
        updated_content = content.replace(match.group(0), new_content)

        with open(hero_html, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Successfully injected output into {hero_html}")
    else:
        print("Could not find terminal-content div in hero.html")


if __name__ == "__main__":
    main()
