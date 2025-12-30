; 메인창만 이동 가능하게 템플릿
;- 하위창이던 탭이 있어도 각각 지정 가능한 함수 템플릿

;- 내용

;#cs - 메인창만 이동
Func WM_LBUTTONDOWN($hWnd, $iMsg, $wParam, $lParam)
    Local $allowedGui = $hGUI ; 메인 GUI 핸들 등 지정
    If $hWnd <> $allowedGui Then Return $hWnd ; 이동 허용 대상이 아니면 무시
    If BitAND(WinGetState($hWnd), 32) Then Return $hWnd
    DllCall("user32.dll", "long", "SendMessage", "hwnd", $hWnd, "int", $WM_SYSCOMMAND, "int", 0xF009, "int", 0)
    Return $hWnd
EndFunc   ;==>WM_LBUTTONDOWN    ; GUIRegisterMsg($WM_LBUTTONDOWN, "WM_LBUTTONDOWN")
;#ce


; 사용법 창을 만드는 곳에서 아래 내용을 등록
GUIRegisterMsg($WM_LBUTTONDOWN, "WM_LBUTTONDOWN")

