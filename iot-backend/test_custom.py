import requests

# Test custom C++ file
data_cpp = {
    "language": "cpp",
    "source_code": "#include <iostream>\nint main() { std::cout << \"Hello from Custom.cpp\" << std::endl; return 0; }",
    "filename": "Custom.cpp"
}
print("CPP:", requests.post("http://localhost:8000/lab/code/execute", json=data_cpp).json())

# Test custom Java file
data_java = {
    "language": "java",
    "source_code": "public class CustomClass {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from CustomClass\");\n    }\n}",
    "filename": "CustomClass.java"
}
print("Java:", requests.post("http://localhost:8000/lab/code/execute", json=data_java).json())
