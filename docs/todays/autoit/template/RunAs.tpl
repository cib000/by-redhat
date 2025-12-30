; RunAs

; https://www.autoitscript.com/autoit3/docs/functions/RunAs.htm

다른 사용자의 컨텍스트에서 외부 프로그램을 실행합니다.
Runs an external program under the context of a different user.

RunAs ( "username", "domain", "password", logon_flag, "program" [, "workingdir" [, show_flag [, opt_flag]]] )

Parameters
username	The username to log on with.
domain	The domain to authenticate against.
password	The password for the user.
logon_flag	    $RUN_LOGON_NOPROFILE (0) - Interactive logon with no profile.
    $RUN_LOGON_PROFILE (1) - Interactive logon with profile.
    $RUN_LOGON_NETWORK (2) - Network credentials only.
    $RUN_LOGON_INHERIT (4) - Inherit the calling process's environment instead of the user's environment.

Constants are defined in "AutoItConstants.au3".
program	The full path of the program (EXE, BAT, COM, or PIF) to run (see remarks).
workingdir	[optional] The working directory. If not specified, then the value of @SystemDir will be used. This is not the path to the program.
show_flag	[optional] The "show" flag of the executed program:
    @SW_HIDE = Hidden window (or Default keyword)
    @SW_MINIMIZE = Minimized window
    @SW_MAXIMIZE = Maximized window
opt_flag	[optional] Controls various options related to how the parent and child process interact.
    $STDIN_CHILD (0x1) = Provide a handle to the child's STDIN stream
    $STDOUT_CHILD (0x2) = Provide a handle to the child's STDOUT stream
    $STDERR_CHILD (0x4) = Provide a handle to the child's STDERR stream
    $STDERR_MERGED (0x8) = Provides the same handle for STDOUT and STDERR. Implies both $STDOUT_CHILD and $STDERR_CHILD.
    $STDIO_INHERIT_PARENT (0x10) = Provide the child with the parent's STDIO streams. This flag can not be combined with any other STDIO flag. This flag is only useful when the parent is compiled as a Console application.
    $RUN_CREATE_NEW_CONSOLE (0x10000) = The child console process should be created with it's own window instead of using the parent's window. This flag is only useful when the parent is compiled as a Console application.

Constants are defined in AutoItConstants.au3
Return Value
Success:	the PID of the process that was launched.
Failure:	0 and sets the @error flag to non-zero.
Remarks
Paths with spaces need to be enclosed in quotation marks.

It is important to specify a working directory the user you are running as has access to, otherwise the function will fail.

It is recommended that you only load the user's profile if you are sure you need it. There is a small chance a profile can be stuck in memory under the right conditions. If a script using RunAs() happens to be running as the SYSTEM account (for example, if the script is running as a service) and the user's profile is loaded, then you must take care that the script remains running until the child process closes.

When running as an administrator, the Secondary Logon (RunAs()) service must be enabled or this function will fail. This does not apply when running as the SYSTEM account.

After running the requested program the script continues. To pause execution of the script until the spawned program has finished use the RunAsWait() function instead.

Providing the Standard I/O parameter with the proper values permits interaction with the child process through the StderrRead(), StdinWrite() and StdoutRead() functions. Combine the flag values (or use $STDERR_CHILD, $STDIN_CHILD & $STDOUT_CHILD) to manage more than one stream.

In order for the streams to close, the following conditions must be met:
1) The child process has closed its end of the stream (this happens when the child closes).
2) AutoIt must read any captured streams until there is no more data.
3) If STDIN is provided for the child, StdinWrite() must be called to close the stream. Once all streams are detected as no longer needed, all internal resources will automatically be freed.

StdioClose() can be used to force the STDIO streams closed.

The "load profile" and "network credentials only" options are incompatible. Using both will produce undefined results.

There is an issue in the Windows XP generation of Windows which prevents STDIO redirection and the show flag from working. See Microsoft Knowledge Base article KB818858 for more information about which versions are affected as well as a hotfix for the issue. Users running Windows XP SP2 or later, or Windows Vista or later are not affected.

Related
ProcessClose, Run, RunAsWait, RunWait, ShellExecute, ShellExecuteWait, StderrRead, StdinWrite, StdioClose, StdoutRead

Example
#include <AutoItConstants.au3>

Example()

Func Example()
        ; Change the username and password to the appropriate values for your system.
        Local $sUserName = "Username"
        Local $sPassword = "Password"

        ; Run Notepad with the window maximized. Notepad is run under the user previously specified.
        Local $iPID = RunAs($sUserName, @ComputerName, $sPassword, $RUN_LOGON_NOPROFILE, "notepad.exe", "", @SW_SHOWMAXIMIZED)

        ; Wait 10 seconds for the Notepad window to appear.
        WinWait("[CLASS:Notepad]", "", 10)

        ; Wait for 2 seconds.
        Sleep(2000)

        ; Close the Notepad process using the PID returned by RunAs.
        ProcessClose($iPID)
EndFunc   ;==>Example


