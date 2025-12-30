; StdoutRead

; https://www.autoitscript.com/autoit3/docs/functions/StdoutRead.htm

Reads from the STDOUT stream of a previously run child process.

StdoutRead ( process_id [, peek = False [, binary = False]] )

Parameters
process_id	The process ID of a child process, as returned by a previous call to Run.
peek	[optional] If True the function does not remove the read characters from the stream.
binary	[optional] If True the function reads the data as binary instead of text (default is text).
Return Value
Success:	the data read. @extended contains the number of bytes read.
Failure:	sets the @error flag to non-zero if EOF is reached, STDOUT was not redirected for the process or other error.
Remarks
StdoutRead() reads from the console standard output stream of a child process, which is normally used by console applications to write to the screen. During the call to Run() for the child process you wish to read from the STD I/O parameter must have included the value of $STDOUT_CHILD (2) for this function to work properly (see the Run() function).
StdoutRead() does not block, it will return immediately. In order to get all data, it must be called in a loop.
Peeking on the stream does not remove the data from the buffer, however, it does return the available data as normal.
By default, data is returned in text format. By using the binary option, the data will be returned in binary format.

Related
Run, RunAs, StderrRead, StdinWrite, StdioClose

Example
#include <AutoItConstants.au3>
#include <MsgBoxConstants.au3>
#include <Array.au3> ; Required for _ArrayDisplay only.

; Recursively display a list of files in a directory.
Example()

Func Example()
        Local $sFilePath = @ScriptDir ; Search the current script directory.
        Local $sFilter = "*.*" ; Search for all files in the current directory. For a list of valid wildcards, search for 'Wildcards' in the Help file.

        ; If the file path isn't a directory then return from the 'Example' function.
        If Not StringInStr(FileGetAttrib($sFilePath), "D") Then
                Return SetError(1, 0, 0)
        EndIf

        ; Remove trailing backslashes and append a single trailing backslash.
        $sFilePath = StringRegExpReplace($sFilePath, "[\\/]+\z", "") & "\"

        #cs
                Commandline parameters for DIR:
                /B - Simple output.
                /A-D - Search for all files, minus folders.
                /S - Search within subfolders.
        #ce
        Local $iPID = Run(@ComSpec & ' /C DIR "' & $sFilePath & $sFilter & '" /B /A-D /S', $sFilePath, @SW_HIDE, $STDOUT_CHILD)
        ; If you want to search with files that contains unicode characters, then use the /U commandline parameter.

        ; Wait until the process has closed using the PID returned by Run.
        ProcessWaitClose($iPID)

        ; Read the Stdout stream of the PID returned by Run. This can also be done in a while loop. Look at the example for StderrRead.
        Local $sOutput = StdoutRead($iPID)

        ; Use StringSplit to split the output of StdoutRead to an array. All carriage returns (@CRLF) are stripped and @CRLF (line feed) is used as the delimiter.
        Local $aArray = StringSplit(StringTrimRight(StringStripCR($sOutput), StringLen(@LF)), @LF)
        If @error Then
                MsgBox($MB_SYSTEMMODAL, "", "It appears there was an error trying to find all the files in the current script directory.")
        Else
                ; Display the results.
                _ArrayDisplay($aArray)
        EndIf
EndFunc   ;==>Example



