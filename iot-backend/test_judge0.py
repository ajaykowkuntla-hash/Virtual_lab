import httpx
import asyncio

async def test():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("--- Test 1: Python Success ---")
        res1 = await client.post("http://localhost:8000/lab/code/execute", json={
            "language": "python",
            "source_code": "print('Hello from Python!')"
        })
        print(res1.json())
        
        print("\n--- Test 2: Python Syntax Error ---")
        res2 = await client.post("http://localhost:8000/lab/code/execute", json={
            "language": "python",
            "source_code": "print('Missing parenthesis"
        })
        print(res2.json())
        
        print("\n--- Test 3: C++ Compile Error ---")
        res3 = await client.post("http://localhost:8000/lab/code/execute", json={
            "language": "cpp",
            "source_code": "#include <iostream>\nint main() {\n  std::cout << \"Hello\" << std::endl\n  return 0;\n}"
        })
        print(res3.json())
        
        print("\n--- Test 4: C++ Success ---")
        res4 = await client.post("http://localhost:8000/lab/code/execute", json={
            "language": "cpp",
            "source_code": "#include <iostream>\nint main() {\n  std::cout << \"Hello from C++!\" << std::endl;\n  return 0;\n}"
        })
        print(res4.json())
        
        print("\n--- Test 5: Java Success ---")
        res5 = await client.post("http://localhost:8000/lab/code/execute", json={
            "language": "java",
            "source_code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello from Java!\");\n  }\n}"
        })
        print(res5.json())

if __name__ == "__main__":
    asyncio.run(test())
