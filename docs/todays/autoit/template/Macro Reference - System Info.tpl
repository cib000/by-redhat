; Macro Reference - System Info
Below is a list of System information macros.

The full list of macros can be found here.

 

Macro	Description
@CPUArch	Returns "X86" when the CPU is a 32-bit CPU and "X64" when the CPU is 64-bit.
@KBLayout	Returns code denoting Keyboard Layout. See Appendix for possible values.
@MUILang	Returns code denoting Multi Language if available (Vista is OK by default). See Appendix for possible values.
@OSArch	                 Returns one of the following: "X86", "IA64", "X64" - this is the architecture type of the currently running operating system.
@OSLang	                 Returns code denoting OS Language. See Appendix for possible values.
@OSType	                 Returns "WIN32_NT" for XP/2003/Vista/2008/Win7/2008R2/Win8/2012/Win8.1/2012R2.
@OSVersion	Returns one of the following: "WIN_11", "WIN_10", "WIN_81", "WIN_8", "WIN_7", "WIN_VISTA", "WIN_XP", "WIN_XPe",
    for Windows servers: "WIN_2019", "WIN_2022", "WIN_2016", "WIN_2012R2", "WIN_2012", "WIN_2008R2", "WIN_2008", "WIN_2003"".
@OSBuild	                Returns the OS build number. For example, Windows 2003 Server returns 3790
@OSServicePack	Service pack info in the form of "Service Pack 3".
@ComputerName	Computer's network name.
@UserName	ID of the currently logged on user.
@IPAddress1	IP address of first network adapter. Tends to return 127.0.0.1 on some computers.
@IPAddress2	IP address of second network adapter. Returns 0.0.0.0 if not applicable.
@IPAddress3	IP address of third network adapter. Returns 0.0.0.0 if not applicable.
@IPAddress4	IP address of fourth network adapter. Returns 0.0.0.0 if not applicable.

@DesktopHeight	Height of the primary display in pixels. (Vertical resolution)
@DesktopWidth	Width of the primary display in pixels. (Horizontal resolution)
@DesktopDepth	Depth of the primary display in bits per pixel.
@DesktopRefresh	Refresh rate of the primary display in hertz.


https://www.autoitscript.com/autoit3/docs/macros/SystemInfo.htm



