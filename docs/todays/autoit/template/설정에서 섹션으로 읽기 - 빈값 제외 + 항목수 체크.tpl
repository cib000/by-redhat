; 설정에서 섹션으로 읽기 - 빈값 제외 + 항목수 체크

✔ 목표
INI에서 섹션을 읽는다.
빈 값(= 값이 없는 항목) 은 빼버린다.
남은 값들만 세어서 그만큼 배열을 만든다.
그 배열 안에 값들을 차곡차곡 넣는다.

✅ 최종 함수 (빈 항목 제거 + 필요한 만큼만 배열 생성)


Func ReadSectionClean($sini, $sSection)

    Local $ini = IniReadSection($sini, $sSection)     ; 섹션 읽기
    If @error Then Return SetError(1, 0, 0)

    Local $temp[1] ; 임시 저장용, 크기는 나중에 자동 조정
    Local $count = 0    ; 실제 데이터 개수를 세기 위한 변수
    For $i = 1 To $ini[0][0]    ; 1번부터 시작 (0번은 개수 정보라 제외)
        Local $value = $ini[$i][1]
        If $value = "" Then ContinueLoop        ; 빈 항목이면 스킵
        ReDim $temp[$count + 1]        ; 새 값 저장 → 배열 확장
        $temp[$count] = $value
        $count += 1        ; 갯수 증가
    Next

    Return $temp  ; 최종적으로 "빈 값 제외된 배열"을 반환
EndFunc


✅ 사용 예시
예를 들어 INI 파일이 이렇게 생겼다면:

ini

[DATA]
A=100
B=
C=300
D=
E=500


✅ 아래처럼 호출하면:
Local $arr = ReadSectionClean("test.ini", "DATA")

For $i = 0 To UBound($arr) - 1
    ConsoleWrite($arr[$i] & @CRLF)
Next


✅ 출력은:
100
300
500

✅ 빈 값(B, D)은 자동으로 제거됩니다.




✅