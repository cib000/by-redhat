; 재시작 함수
Func _SelfRestart()
	If Not @Compiled Then
		Run('"' & @AutoItExe & '" "' & @ScriptFullPath & '"')
		Else
		Run('"' & @ScriptFullPath & '"')
	EndIf
	Exit
EndFunc  ;==> _SelfRestart
;~ -----------
