from fastapi import APIRouter
from models.schemas import CodeExecuteRequest, CodeExecuteResponse
from services.multi_lang_engine import execute_code as multi_lang_execute

router = APIRouter(tags=["Code Execution"])

@router.post("/code/execute", response_model=CodeExecuteResponse)
async def execute_code(request: CodeExecuteRequest):
    # This calls the custom Docker-based multi-language engine
    result = multi_lang_execute(
        language=request.language,
        source_code=request.source_code,
        stdin=request.stdin,
        filename=request.filename
    )
    
    return CodeExecuteResponse(
        stdout=result.get("stdout"),
        stderr=result.get("stderr"),
        compile_output=result.get("compile_output"),
        exit_status=result.get("exit_status", 1),
        execution_time=result.get("execution_time", 0)
    )
