import os
import subprocess
import re
import sys

def main():
    base_dir = os.getcwd()
    profile_script = os.path.join(
        base_dir, 'app', 'static', 'code', 'developer_profile.py')
    log_file = '/tmp/developer_profile.log'

    print(f"Running {profile_script}...")

    # 1. Run the developer_profile.py script and capture output
    try:
        result = subprocess.run(
            [sys.executable, profile_script], capture_output=True, text=True, check=True)
        output = result.stdout
        print("Script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running script: {e}")
        output = f"Error running profile script: {e}\n{e.stderr}"
    except FileNotFoundError as e:
        print(
            f"Error: could not find the profile script or python interpreter: {e}")
        output = f"Error running profile script: {e}\n"

    # 2. Store output to log file
    with open(log_file, 'w') as f:
        f.write(output)
    print(f"Output saved to {log_file}")

if __name__ == "__main__":
    main()
