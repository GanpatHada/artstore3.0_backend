class ApiResponse{
    constructor(statusCode,message,data)
    {
        this.statusCode=statusCode;
        this.message=message;
        this.success=statusCode<300;
        this.data=data;
    }
}
export default ApiResponse;