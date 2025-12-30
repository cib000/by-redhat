;간단한 윈도우 색상 선택기 함수 예제

#include <Misc.au3> ; _ChooseColor 함수가 기본 내장되어 있음

Func SelectColor($vDefaultColor = 0xFFFFFF, $vReturnType = 0, $hWndOwner = 0)
    ; $vDefaultColor : 기본 선택 색상 (RGB)
    ; $vReturnType : 0=COLORREF RGB, 1=BGR 16진수, 2=RGB 16진수
    ; $hWndOwner : 대화상자 소유자 윈도우 핸들 (없으면 0)

    Local $iColor = _ChooseColor($vReturnType, $vDefaultColor, $vReturnType, $hWndOwner)
    If @error Then
        Return SetError(1, 0, -1) ; 선택 실패 또는 취소
    EndIf
    Return $iColor
EndFunc

#cs
사용 예시

Local $color = SelectColor(0xFF0000, 0, 0) ; 기본 빨간색, RGB 반환, 소유자 없음
If @error Then
    MsgBox(16, "오류", "색상 선택이 취소되었거나 실패했습니다.")
Else
    MsgBox(64, "선택한 색상", "색상 값: 0x" & Hex($color, 6))
EndIf
#ce
