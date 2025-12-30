;#cs
; =============================================
; 간단한 버튼 생성 예제
; =============================================

#include <GUIConstantsEx.au3>
#include <WindowsConstants.au3>

Global $ini = @ScriptDir & "\Template Wizard cfg.ini"
Global $pWidth = IniRead($ini, "SETTINGS", "Preview Width", "400")
Global $pheight = IniRead($ini, "SETTINGS", "Preview height", "300")
Global $px = IniRead($ini, "SETTINGS", "Px", "10")
Global $py = IniRead($ini, "SETTINGS", "Py", "10")
Global $title = "템플릿 미리보기 창"

Global $hgui

Local $hpopup = GUICreate($title, $pWidth, $pheight, $px, $py, -1, $WS_EX_TOPMOST, $hgui)
	GUISetIcon(@ScriptDir & "\Template\wizard-icon-3.ico")
	;GUISetBkColor($GUI_BKCOLOR_TRANSPARENT)
	GUIRegisterMsg($WM_LBUTTONDOWN, "WM_LBUTTONDOWN")

;#ce

#cs

; header.au3 예시
#include <GUIConstantsEx.au3>
Global $hPopup = GUICreate("미리보기 팝업", 400, 300)
GUISetState(@SW_SHOW)

#ce
