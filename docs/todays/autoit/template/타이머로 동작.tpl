; 타이머로 동작


    EndSwitch

    ; 5초(5000ms) 경과 시 종료
    If TimerDiff($timer) >= $time Then
        _save_pos()
        Exit
    EndIf

WEnd


