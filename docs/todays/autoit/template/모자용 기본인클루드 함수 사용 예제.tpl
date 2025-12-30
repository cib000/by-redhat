; 모자용 기본인클루드 함수 사용 예제


#include "Byrh Common.au3" ; 같은 폴더에 있어야 함.

; GUI생성 직후 등록
GUIRegisterMsg($WM_LBUTTONDOWN, "WM_LBUTTONDOWN")

; 시본설정파일 변경 : Byrh Common.au3 에서 수정
Global $ini = @ScriptDir & "\Template Wizard cfg.ini"

; 소리재생시
SoundPlay($sSound, 0)

; 재시작 버튼 기능 
Case $btnRestart
    _Restart()

; 기본설정 파일에 자동 창 취지 저장됨  : 종료시 재시작시에 
    _save_pos() 

