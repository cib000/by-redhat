; 파일선택 예제 템플릿

FileOpenDialog ( "title", "init dir", "filter" [, options = 0 [, "default name" [, hwnd]]] )

    $FD_FILEMUSTEXIST (1) = File Must Exist (if user types a filename)
    $FD_PATHMUSTEXIST (2) = Path Must Exist (if user types a path, ending with a backslash)
    $FD_MULTISELECT (4) = Allow MultiSelect
    $FD_PROMPTCREATENEW (8) = Prompt to Create New File (if does not exist)


Example 2
#include <FileConstants.au3>
#include <MsgBoxConstants.au3>

Example()

Func Example()
        ; Create a constant variable in Local scope of the message to display in FileOpenDialog.
        Local Const $sMessage = "Select a single file of any type."
        Local $sFileOpenDialog = FileOpenDialog($sMessage, @WindowsDir & "\", "All (*.*)", $FD_FILEMUSTEXIST)
        If @error Then
                MsgBox($MB_SYSTEMMODAL, "", "No file was selected.")
                FileChangeDir(@ScriptDir)
        Else
                FileChangeDir(@ScriptDir)
                $sFileOpenDialog = StringReplace($sFileOpenDialog, "|", @CRLF)
                MsgBox($MB_SYSTEMMODAL, "", "You chose the following file:" & @CRLF & $sFileOpenDialog)
        EndIf

EndFunc   ;==>Example
