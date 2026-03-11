using System.Collections.Generic;

namespace DeniyorumButigi.Api.Responses
{
    public class ApiResponse
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse Success(string? message = null)
        {
            return new ApiResponse { IsSuccess = true, Message = message };
        }

        public static ApiResponse Fail(string error, string? message = null)
        {
            return new ApiResponse { IsSuccess = false, Message = message, Errors = new List<string> { error } };
        }

        public static ApiResponse Fail(List<string> errors, string? message = null)
        {
            return new ApiResponse { IsSuccess = false, Message = message, Errors = errors };
        }
    }

    public class ApiResponse<T> : ApiResponse
    {
        public T? Data { get; set; }

        public static ApiResponse<T> Success(T data, string? message = null)
        {
            return new ApiResponse<T> { Data = data, IsSuccess = true, Message = message };
        }

        public new static ApiResponse<T> Fail(string error, string? message = null)
        {
            return new ApiResponse<T> { IsSuccess = false, Message = message, Errors = new List<string> { error } };
        }

        public new static ApiResponse<T> Fail(List<string> errors, string? message = null)
        {
            return new ApiResponse<T> { IsSuccess = false, Message = message, Errors = errors };
        }
    }
}
