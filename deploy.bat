@echo off
echo Starting Git and deployment process...

REM Git Operations First
echo Performing Git operations...
git add .

REM Commit with today's date and time
for /f "tokens=2 delims==" %%I in ('wmic os get LocalDateTime /value') do set datetime=%%I
set commit_message=Update %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

git commit -m "%commit_message%"

REM Check commit status
if %errorlevel% equ 0 (
  echo Commit successful. Proceeding to push.
) else (
  git diff-index --quiet HEAD --
  if %errorlevel% equ 0 (
    echo No changes detected to commit. Proceeding to deploy.
    REM No need to push if nothing was committed
    goto DeployFirebase
  ) else (
    echo Git commit failed with errorlevel %errorlevel%. Aborting.
    exit /b %errorlevel%
  )
)

REM Push changes
git push

REM Check push status
if %errorlevel% neq 0 (
  echo Git push failed. Aborting deployment.
  exit /b %errorlevel%
)

:DeployFirebase
REM Firebase Deploy Second
echo Deploying to Firebase...
firebase use cv-jcp
firebase deploy --only hosting

REM Check Firebase deploy status
if %errorlevel% neq 0 (
  echo Firebase deployment failed.
  exit /b %errorlevel%
)

echo Git operations and Firebase deployment completed successfully!

REM Optional: Pause if running interactively
REM pause
