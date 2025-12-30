; =============================================
; 간단한 버튼 생성 예제
; =============================================

#include <GUIConstantsEx.au3>

$hGUI = GUICreate("버튼 예제", 300, 200)

$btnExample = GUICtrlCreateButton("버튼 클릭하세요", 100, 70, 100, 40)

GUISetState(@SW_SHOW)

While 1
    $msg = GUIGetMsg()
    If $msg = $GUI_EVENT_CLOSE Then Exit
    If $msg = $btnExample Then MsgBox(64, "알림", "버튼이 클릭되었습니다!")
WEnd

