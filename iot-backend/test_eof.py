import requests

data = {
    "language": "python",
    "source_code": "x = input()\nprint(x)\ny = input()\nprint(y)",
    "stdin": "hello\nworld"
}

resp = requests.post("http://localhost:8000/lab/code/execute", json=data)
print(resp.json())
