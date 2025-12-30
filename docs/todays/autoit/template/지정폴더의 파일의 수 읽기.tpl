; 지정폴더의 파일의 수 읽기

✅ 기본형: 폴더 내 파일 개수 함수 (하위 폴더 제외)
#include <File.au3>

Func GetFileCount($sFolder, $sPattern = "*")
    If Not FileExists($sFolder) Then Return SetError(1, 0, 0)

    Local $aFiles = _FileListToArray($sFolder, $sPattern, 1) ; 1 = 파일만
    If @error Then Return 0

    Return $aFiles[0]
EndFunc


▶ 사용 예
Local $iCnt = GetFileCount("C:\Test")
MsgBox(0, "결과", "파일 개수: " & $iCnt)


; 특정 확장자
Local $iTxtCnt = GetFileCount("C:\Test", "*.txt")

✅ 하위 폴더 포함 버전 (재귀 함수)
Func GetFileCountRecursive($sFolder, $sPattern = "*")
    Local $iCount = 0

    Local $hSearch = FileFindFirstFile($sFolder & "\*")
    If $hSearch = -1 Then Return 0

    While 1
        Local $sFile = FileFindNextFile($hSearch)
        If @error Then ExitLoop

        If $sFile = "." Or $sFile = ".." Then ContinueLoop

        Local $sFullPath = $sFolder & "\" & $sFile

        If StringInStr(FileGetAttrib($sFullPath), "D") Then
            $iCount += GetFileCountRecursive($sFullPath, $sPattern)
        Else
            If $sPattern = "*" Or StringRegExp($sFile, _
                StringReplace($sPattern, "*", ".*")) Then
                $iCount += 1
            EndIf
        EndIf
    WEnd

    FileClose($hSearch)
    Return $iCount
EndFunc

▶ 사용 예
Local $iAllCnt = GetFileCountRecursive("C:\Test")
Local $iLogCnt = GetFileCountRecursive("C:\Test", "*.log")

✅ 옵션형 함수 (확장성 좋음)
autoit
코드 복사
#include <File.au3>

Func GetFileCountEx($sFolder, $sPattern = "*", $bRecursive = False)
    If Not $bRecursive Then
        Return GetFileCount($sFolder, $sPattern)
    Else
        Return GetFileCountRecursive($sFolder, $sPattern)
    EndIf
EndFunc

📌 추천 구조
실무에서는 보통 이렇게 씁니다:
Local $iCnt = GetFileCountEx("C:\Data", "*.csv", True)










