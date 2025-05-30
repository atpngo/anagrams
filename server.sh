cd socket-server
source venv/bin/activate
nohup python3 server.py >/dev/null 2>&1 &
deactivate
