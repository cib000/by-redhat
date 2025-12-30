;  창 이동 처리

; 메인창만 이동
Func WM_LBUTTONDOWN2($hWnd, $iMsg, $wParam, $lParam)
    Local $allowedGui = $GIFGUI ; 메인 GUI 핸들 등 지정
    If $hWnd <> $allowedGui Then Return $hWnd ; 이동 허용 대상이 아니면 무시
    If BitAND(WinGetState($hWnd), 32) Then Return $hWnd
    DllCall("user32.dll", "long", "SendMessage", "hwnd", $hWnd, "int", $WM_SYSCOMMAND, "int", 0xF009, "int", 0)
    Return $hWnd
EndFunc   ;==>WM_LBUTTONDOWN    ; GUIRegisterMsg($WM_LBUTTONDOWN, "WM_LBUTTONDOWN2")
#ce


;###################################################################################################
; 창 끌고 다니기    ####################################################################################
;###################################################################################################
Func WM_LBUTTONDOWN2($GIFGUI, $iMsg, $wParam, $lParam)
	If BitAND(WinGetState($GIFGUI), 32) Then Return $GIFGUI
	DllCall("user32.dll", "long", "SendMessage", "hwnd", $GIFGUI, "int", $WM_SYSCOMMAND, "int", 0xF009, "int", 0)
	;Sleep(40000)
EndFunc   ;==>WM_LBUTTONDOWN    ; GUIRegisterMsg($WM_LBUTTONDOWN, "WM_LBUTTONDOWN2")




