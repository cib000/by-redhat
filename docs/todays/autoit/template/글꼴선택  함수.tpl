글꼴선택  함수 구간
; #include <Misc.au3> ; 함수가 기본 내장되어 있음
; 기본구문 : _ChooseFont() ;_Fontselector()

Local $a_vFont = _ChooseFont()
If (@error) Then                    
	MsgBox($MB_SYSTEMMODAL, "ERROR", "Error _ChooseFont: " & @error)
Else
	MsgBox($MB_SYSTEMMODAL, "", "Font Name: " & $a_vFont[2] & @CRLF & "Size: " & $a_vFont[3] & @CRLF & "Weight: " & $a_vFont[4] & @CRLF & "COLORREF rgbColors: " & $a_vFont[5] & @CRLF & "Hex BGR Color: " & $a_vFont[6] & @CRLF & "Hex RGB Color: " & $a_vFont[7])
	;GUICtrlSetData($Svalue02, $a_vFont[3])   ; 편집기 클자크기
	;GUICtrlSetData($SMbgcolor2, $a_vFont[7])   ; 편집기 글자색
	;GUICtrlSetData($SMFont, $a_vFont[2])   ; 편집기 글꼴
EndIf

#cs
; 참고
Font Name: " & $a_vFont[2]
Size: " & $a_vFont[3]
Weight: " & $a_vFont[4]

COLORREF rgbColors: " & $a_vFont[5] :: 16711680
Hex BGR Color: " & $a_vFont[6]  :: 0xFF0000
"Hex RGB Color: " & $a_vFont[7])  :: 0x0000FF
#ce
