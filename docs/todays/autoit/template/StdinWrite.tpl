; StdinWrite

; https://www.autoitscript.com/autoit3/docs/functions/StdinWrite.htm

Writes a number of characters to the STDIN stream of a previously run child process.

StdinWrite ( process_id [, data] )

Parameters
process_id	The process ID of a child process, as returned by a previous call to Run.
data	[optional] The data you wish to output. This may either be text or binary.
Return Value
Success:	the number of characters written.
Failure:	sets the @error flag to non-zero if STDIN was not redirected for the process or other error.
Remarks
StdinWrite() writes to the console standard input stream for a child process, which is normally used by console applications to read input from the user i.e. from the keyboard. During the call to Run() for the child process you wish to write to the STD I/O parameter must have included the value of $STDIN_CHILD (1) for this function to work properly (see the Run() function).

The optional second parameter is the string that you wish StdinWrite() to write to the stream. If the function is called with no second argument, StdinWrite() closes the stream and invalidates it for further writing.

The stream is a first-in first-out buffer with an arbitrary limited size; if at any time when this function is called (unless it's being called to close the stream) there is no room for more characters to be written to the stream, the StdinWrite() function will block (pause) and not return until the child process closes the stream or reads enough characters from the stream to permit the write procedure to complete. This means that the AutoIt process will be halted, and there will be no processing of hotkeys, GUI messages, etc. until the child process reads from the STDIN stream.

Characters are converted to ANSI before being written.

Binary data is written as-is. It will not be converted to a string. To print the hex representation of binary data, use the String() function to explicitly cast the data to a string.

Related
Run, RunAs, StderrRead, StdioClose, StdoutRead

Example
#include <AutoItConstants.au3>
#include <MsgBoxConstants.au3>

Example()

Func Example()
        Local $iPID = Run("sort.exe", @SystemDir, @SW_HIDE, $STDIN_CHILD + $STDOUT_CHILD)

        ; Write a string of items to be sorted to child sort.exe's Stdin.
        StdinWrite($iPID, "Banana" & @CRLF & "Elephant" & @CRLF & "Apple" & @CRLF & "Deer" & @CRLF & "Car" & @CRLF)

        ; Calling StdinWrite without a second parameter closes the stream.
        StdinWrite($iPID)

        Local $sOutput = "" ; Store the output of StdoutRead to a variable.

        While 1
                $sOutput &= StdoutRead($iPID) ; Read the Stdout stream of the PID returned by Run.
                If @error Then ; Exit the loop if the process closes or StdoutRead returns an error.
                        ExitLoop
                EndIf
        WEnd

        MsgBox($MB_SYSTEMMODAL, "", "The sorted string is: " & @CRLF & $sOutput)
EndFunc   ;==>Example



