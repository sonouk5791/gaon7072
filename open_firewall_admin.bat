@echo off
echo 포트 5500 방화벽 허용 중...
netsh advfirewall firewall add rule name="Port 5500" dir=in action=allow protocol=TCP localport=5500
echo.
echo 완료! 이제 모바일에서 http://192.168.0.15:5500 으로 접속하세요.
pause
