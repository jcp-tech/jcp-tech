#!/bin/bash

echo "Starting deployment process..."

# Firebase Deploy
echo "Deploying to Firebase..."
firebase deploy

# Check if Firebase deploy was successful
if [ $? -ne 0 ]; then
  echo "Firebase deployment failed. Aborting Git operations."
  exit 1
fi

# Git Operations
echo "Performing Git operations..."
git add .

# Commit with today's date
# Use ISO 8601 format for consistency (YYYY-MM-DD)
commit_message="Update $(date +'%Y-%m-%d %H:%M:%S')"
git commit -m "$commit_message"

# Check if commit was successful (e.g., if there were no changes)
if [ $? -ne 0 ]; then
  echo "Git commit failed or no changes to commit. Aborting push."
  # Exit gracefully if there's nothing to commit
  if git diff-index --quiet HEAD --; then
    echo "No changes detected to commit."
    exit 0
  else
    exit 1
  fi
fi

git push

# Check if push was successful
if [ $? -ne 0 ]; then
  echo "Git push failed."
  exit 1
fi

echo "Deployment and Git operations completed successfully!"

# Optional: Pause if running interactively in Git Bash
# read -p "Press Enter to continue..."
