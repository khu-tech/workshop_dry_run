@echo off
CALL :SetQualifier value1
echo "VAlue1="%value1%
FOR /F "tokens=* USEBACKQ" %%F in (`aws sts get-caller-identity --query "Account" --output text`) DO (SET CDK_DEFAULT_ACCOUNT=%%F)
echo %CDK_DEFAULT_ACCOUNT%

FOR /F "tokens=* USEBACKQ" %%F in (`aws configure get region`) DO (SET CDK_DEFAULT_REGION=%%F)
echo %CDK_DEFAULT_REGION%
EXIT /B %ERRORLEVEL%

:SetQualifier
Setlocal EnableDelayedExpansion
Set _RNDLength=8
Set _Alphanumeric=abcdefghijklmnopqrstuvwxyz0123456789
Set _Str=%_Alphanumeric%987654321
:_LenLoop
IF NOT "%_Str:~18%"=="" SET _Str=%_Str:~9%& SET /A _Len+=9& GOTO :_LenLoop
SET _tmp=%_Str:~9,1%
SET /A _Len=_Len+_tmp
Set _count=0
SET _QUALIFIER=
:_loop
Set /a _count+=1
SET _RND=%Random%
Set /A _RND=_RND%%%_Len%
SET _QUALIFIER=!_QUALIFIER!!_Alphanumeric:~%_RND%,1!
If !_count! lss %_RNDLength% goto _loop
set /a "%~1 = %_QUALIFIER%"
set CDK_DEFAULT_QUALIFIER=%_QUALIFIER%
echo "%_QUALIFIER% %CDK_DEFAULT_QUALIFIER%"
EXIT /b CDK_DEFAULT_QUALIFIER