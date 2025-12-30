; 가로 구분선 

 ; ─── 구분선 생성 (Label을 이용한 얇은 가로선) ───
GUICtrlCreateLabel("", 10, $height - 45, $width-20, 2) ; (x, y, width, height)
GUICtrlSetBkColor(-1, 0x808080) ; 회색선 (중간톤)

; ─── 가로 실선 ───1
GUICtrlCreateLabel("", 10, $iHeight-35, $iWidth-20, 1)
GUICtrlSetBkColor(-1, 0x999999)

; ─── 가로 실선 ───
GUICtrlCreateLabel("", 20, 40, 360, 1)
GUICtrlSetBkColor(-1, 0x999999)

; ─── 세로 실선 ───
GUICtrlCreateLabel("", 200, 60, 1, 150)
GUICtrlSetBkColor(-1, 0x999999)

; ─── 점선은 GDI+ 사용 필요 ───
_GDIPlus_Startup()
Global $hGraphics = _GDIPlus_GraphicsCreateFromHWND($hGUI)
Global $hPen = _GDIPlus_PenCreate(0xFF000000, 1) ; 검정, 두께 1
_GDIPlus_PenSetDashStyle($hPen, 2) ; 점선 스타일 (2 = DashDot)

; GUI 내 점선 직접 그리기
_GDIPlus_GraphicsDrawLine($hGraphics, 20, 220, 380, 220, $hPen)
