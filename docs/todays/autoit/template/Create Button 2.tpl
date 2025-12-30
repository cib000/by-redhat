; =============================================
; 간단한 버튼 생성 예제
; =============================================

GUICtrlCreateButton("버튼 클릭하세요", 100, 70, 100, 40)
    GUICtrlSetFont(-1, 8, 600)
    GUICtrlSetColor(-1, 0x0000ff)
    GUICtrlSetBkColor(-1, 0x7FFFD4)
    GUICtrlSetState(-1, $GUI_FOCUS)

