; Useful WMIC Queires

WMIC 설치 방법은 다음과 같습니다:
설정 열기: 시작 메뉴를 열고 설정에 액세스합니다.
선택적 기능 클릭: 시스템 → 선택적 기능을 클릭합니다.
WMIC 검색: 검색창에서 WMIC를 검색하고 확인란을 선택한 후 추가를 누릅니다. 
DISM 명령 사용: Windows 11에서 WMIC를 설치하려면 명령 프롬프트에서 
DISM /Online /Add-Capability /CapabilityName:WMIC~~
를 입력하고 Enter 키를 누릅니다. 
설치 완료: 설치가 완료되면 WMIC를 사용할 수 있습니다. 
이 방법을 통해 WMIC를 설치할 수 있습니다.

baseboard
get Manufacturer, Model, Name, PartNumber, slotlayout, serialnumber, poweredon
bios
get name, version, serialnumber
bootconfig
get BootDirectory, Caption, TempDirectory, Lastdrive
cdrom
get Name, Drive, Volumename
computersystem
get Name, domain, Manufacturer, Model, NumberofProcessors, PrimaryOwnerName,Username, Roles, totalphysicalmemory /format:list
cpu
get Name, Caption, MaxClockSpeed, DeviceID, status
datafile
where name=’c:\boot.ini’ get Archive, FileSize, FileType, InstallDate, Readable, Writeable, System, Version
dcomapp
get Name, AppID /format:list
desktop
get Name, ScreenSaverExecutable, ScreenSaverActive, Wallpaper /format:list
desktopmonitor
get screenheight, screenwidth
diskdrive
get Name, Manufacturer, Model, InterfaceType, MediaLoaded, MediaType
diskquota
get User, Warninglimit, DiskSpaceUsed, QuotaVolume
environment
get Description, VariableValue
fsdir
where name=’c:\windows’ get Archive, CreationDate, LastModified, Readable, Writeable, System, Hidden, Status
group
get Caption, InstallDate, LocalAccount, Domain, SID, Status
idecontroller
get Name, Manufacturer, DeviceID, Status
irq
get Name, Status
job
get Name, Owner, DaysOfMonth, DaysOfWeek, ElapsedTime, JobStatus, StartTime, Status
loadorder
get Name, DriverEnabled, GroupOrder, Status
logicaldisk
get Name, Compressed, Description, DriveType, FileSystem, FreeSpace, SupportsDiskQuotas, VolumeDirty, VolumeName
memcache
get Name, BlockSize, Purpose, MaxCacheSize, Status
memlogical
get AvailableVirtualMemory, TotalPageFileSpace, TotalPhysicalMemory, TotalVirtualMemory
memphysical
get Manufacturer, Model, SerialNumber, MaxCapacity, MemoryDevices
netclient
get Caption, Name, Manufacturer, Status
netlogin
get Name, Fullname, ScriptPath, Profile, UserID, NumberOfLogons, PasswordAge, LogonServer, HomeDirectory, PrimaryGroupID
netprotocol
get Caption, Description, GuaranteesSequencing, SupportsBroadcasting, SupportsEncryption, Status
netuse
get Caption, DisplayType, LocalName, Name, ProviderName, Status
nic
get AdapterType, AutoSense, Name, Installed, MACAddress, PNPDeviceID,PowerManagementSupported, Speed, StatusInfo
nicconfig
get MACAddress, DefaultIPGateway, IPAddress, IPSubnet, DNSHostName, DNSDomain
nicconfig
get MACAddress, IPAddress, DHCPEnabled, DHCPLeaseExpires, DHCPLeaseObtained, DHCPServer
nicconfig
get MACAddress, IPAddress, DNSHostName, DNSDomain, DNSDomainSuffixSearchOrder, DNSEnabledForWINSResolution, DNSServerSearchOrder
nicconfig
get MACAddress, IPAddress, WINSPrimaryServer, WINSSecondaryServer, WINSEnableLMHostsLookup, WINSHostLookupFile
ntdomain
get Caption, ClientSiteName, DomainControllerAddress, DomainControllerName, Roles, Status
ntevent
where (LogFile=’system’ and SourceName=’W32Time’) get Message, TimeGenerated
ntevent
where (LogFile=’system’ and SourceName=’W32Time’ and Message like ‘%timesource%’) get Message, TimeGenerated
ntevent
where (LogFile=’system’ and SourceName=’W32Time’ and EventCode!=’29’) get TimeGenerated, EventCode, Message
onboarddevice
get Description, DeviceType, Enabled, Status
os
get Version, Caption, CountryCode, CSName, Description, InstallDate, SerialNumber, ServicePackMajorVersion, WindowsDirectory /format:list
os
get CurrentTimeZone, FreePhysicalMemory, FreeVirtualMemory, LastBootUpTime, NumberofProcesses, NumberofUsers, Organization, RegisteredUser, Status
pagefile
get Caption, CurrentUsage, Status, TempPageFile
pagefileset
get Name, InitialSize, MaximumSize
partition
get Caption, Size, PrimaryPartition, Status, Type
printer
get DeviceID, DriverName, Hidden, Name, PortName, PowerManagementSupported, PrintJobDataType, VerticalResolution, Horizontalresolution
printjob
get Description, Document, ElapsedTime, HostPrintQueue, JobID, JobStatus, Name, Notify, Owner, TimeSubmitted, TotalPages
process
get Caption, CommandLine, Handle, HandleCount, PageFaults, PageFileUsage, PArentProcessId, ProcessId, ThreadCount
product
get Description, InstallDate, Name, Vendor, Version
qfe
get description, FixComments, HotFixID, InstalledBy, InstalledOn, ServicePackInEffect
quotasetting
get Caption, DefaultLimit, Description, DefaultWarningLimit, SettingID, State
recoveros
get AutoReboot, DebugFilePath, WriteDebugInfo, WriteToSystemLog
Registry
get CurrentSize, MaximumSize, ProposedSize, Status
scsicontroller
get Caption, DeviceID, Manufacturer, PNPDeviceID
server
get ErrorsAccessPermissions, ErrorsGrantedAccess, ErrorsLogon, ErrorsSystem, FilesOpen, FileDirectorySearches
service
get Name, Caption, State, ServiceType, StartMode, pathname
share
get name, path, status
sounddev
get Caption, DeviceID, PNPDeviceID, Manufacturer, status
startup
get Caption, Location, Command
sysaccount
get Caption, Domain, Name, SID, SIDType, Status
sysdriver
get Caption, Name, PathName, ServiceType, State, Status
systemenclosure
get Caption, Height, Depth, Manufacturer, Model, SMBIOSAssetTag, AudibleAlarm, SecurityStatus, SecurityBreach, PoweredOn, NumberOfPowerCords
systemslot
get Number, SlotDesignation, Status, SupportsHotPlug, Version, CurrentUsage, ConnectorPinout
tapedrive
get Name, Capabilities, Compression, Description, MediaType, NeedsCleaning, Status, StatusInfo
timezone
get Caption, Bias, DaylightBias, DaylightName, StandardName
useraccount
get AccountType, Description, Domain, Disabled, LocalAccount, Lockout, PasswordChangeable, PasswordExpires, PasswordRequired, SID


http://blogs.technet.microsoft.com/askperf/2012/02/17/useful-wmic-queries