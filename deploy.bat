@echo off
echo Starting deployment process...

:: Firebase Deploy
echo Deploying to Firebase...
firebase deploy

:: Git Operations
echo Performing Git operations...
git add .
git commit -m "Update %date%"
git push

echo Deployment and Git operations completed successfully!
pause