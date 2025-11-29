#!/bin/bash

# Run the profile injection script
echo "Running profile injection..."
# Prefer python3 if available, otherwise fall back to python
if command -v python3 >/dev/null 2>&1; then
	python3 app/utils/inject_profile.py
elif command -v python >/dev/null 2>&1; then
	python app/utils/inject_profile.py
else
	echo "Error: python or python3 is not installed in PATH." >&2
fi

# Execute the CMD passed to the docker container
echo "Starting application..."
exec "$@"
