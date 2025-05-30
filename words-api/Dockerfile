FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir "fastapi[standard]" psutil

COPY . /app

EXPOSE 5000

CMD ["fastapi", "run", "server.py", "--port", "5000"]