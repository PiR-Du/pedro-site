#!/usr/bin/env python3
"""
Board Game Score Tracker - Local Server
Run with: python server.py
Then open http://localhost:8765 in your browser
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

DATA_FILE = "game_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {"players": [], "rounds": [], "game_name": "Board Game"}

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress default logging

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path, content_type):
        try:
            with open(path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", len(content))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self.send_file("index.html", "text/html")
        elif path == "/api/game":
            self.send_json(load_data())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}

        data = load_data()

        if path == "/api/game/setup":
            # Setup new game
            data["players"] = [{"name": p, "color": c} for p, c in zip(body["players"], body["colors"])]
            data["rounds"] = []
            data["game_name"] = body.get("game_name", "Board Game")
            save_data(data)
            self.send_json({"ok": True, "data": data})

        elif path == "/api/game/round":
            # Add a round of scores
            data["rounds"].append({
                "round": len(data["rounds"]) + 1,
                "scores": body["scores"]  # list of ints, same order as players
            })
            save_data(data)
            self.send_json({"ok": True, "data": data})

        elif path == "/api/game/reset":
            data = {"players": [], "rounds": [], "game_name": "Board Game"}
            save_data(data)
            self.send_json({"ok": True})

        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    port = 8765
    server = HTTPServer(("localhost", port), Handler)
    print(f"🎲 Board Game Score Tracker running at http://localhost:{port}")
    print("   Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")