; 마우스커서 제어

MouseGetCursor
Returns the cursor ID Number for the current Mouse Cursor.

MouseGetCursor ( )

Return Value
Returns a cursor ID Number:
    $MCID_UNKNOWN (-1) : (@error can be set if the handle to the cursor cannot be found)
    $MCID_HAND (0)
    $MCID_APPSTARTING (1)
    $MCID_ARROW (2)
    $MCID_CROSS (3)
    $MCID_HELP (4)
    $MCID_IBEAM (5)
    $MCID_ICON (6) (Obsolete for applications marked version 4.0 or later)
    $MCID_NO (7)
    $MCID_SIZE (8) (Obsolete for applications marked version 4.0 or later)
    $MCID_SIZEALL (9)
    $MCID_SIZENESW (10)
    $MCID_SIZENS (11)
    $MCID_SIZENWSE (12)
    MCID_SIZEWE (13)
    $MCID_UPARROW (14)
    $MCID_WAIT (15)
    $MCID_NONE (16)

    Constants are defined in "AutoItConstants.au3".
Related
MouseGetPos

1 = 앱 시작
2 = 화살표
3 = 십자가
4 = 도움
5 = 아이빔
6 = 아이콘
7 = 아니오
8 = 크기
9 = 사이즈올
10 = 크기
11 = 사이즈
12 = 크기
13 = 사이즈
14 = 업어로우
15 = 기다리다





