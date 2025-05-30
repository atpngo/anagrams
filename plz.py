# example.py
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print("✔ connected")

@sio.event
def message(data):
    print("📨", data)

@sio.event
def disconnect():
    print("❌ disconnected")

sio.connect("http://localhost:4000")
sio.emit("message", "hello!")
sio.wait()