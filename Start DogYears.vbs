Option Explicit
Dim shell, files, gameRoot
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
gameRoot = files.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = gameRoot
shell.Run "node " & Chr(34) & gameRoot & "\serve.mjs" & Chr(34) & " --open", 0, False
