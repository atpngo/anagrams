lsof -i :port

e.g. check if client/server is running by doing:
lsof -i :3000
lsof -i :4000

gives PID to kill if needed
kill -9 PID



docker compose up --build  -d
docker compose down
