import requests

data = {
    "language": "java",
    "source_code": "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String line = scanner.nextLine();\n        System.out.println(\"Read: \" + line);\n    }\n}",
    "stdin": "hello java"
}

resp = requests.post("http://localhost:8000/lab/code/execute", json=data)
print(resp.json())
