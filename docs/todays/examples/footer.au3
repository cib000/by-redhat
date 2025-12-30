;#cs
; =============================================
; GUI Footer
; =============================================
Local $btnClose = GUICtrlCreateButton("  닫기", 30, $pheight - 33, $pwidth-60, 30)
    GUICtrlSetImage($btnClose, "shell32.dll", -132, 0)
    GUICtrlSetCursor($btnClose , 0)
    GUICtrlSetTip($btnClose, @CRLF & " 미리보기 창을 닫습니다.", "창닫기", 1 )

GUISetState()

While True
    $msg = GUIGetMsg()
    If $msg = $btnClose Or $msg = $GUI_EVENT_CLOSE Then
        _save_pos()
        FileDelete( @ScriptDir & "\preview_script.au3" )
        Exit
    EndIf
WEnd
Func WM_LBUTTONDOWN($hGUI, $iMsg, $wParam, $lParam)
	If BitAND(WinGetState($hGUI), 32) Then Return $hGUI
	DllCall("user32.dll", "long", "SendMessage", "hwnd", $hGUI, "int", $WM_SYSCOMMAND, "int", 0xF009, "int", 0)
EndFunc
Func _save_pos()
	$Dim_SPos = WinGetPos($hpopup)
	IniWrite($Ini, "SETTINGS", "pX", $Dim_SPos[0])
	IniWrite($Ini, "SETTINGS", "pY", $Dim_SPos[1])
EndFunc
;#ce


#cs


; footer.au3 예시
While 1
    Switch GUIGetMsg()
        Case $GUI_EVENT_CLOSE
            ExitLoop
    EndSwitch
WEnd
Exit

#ce
