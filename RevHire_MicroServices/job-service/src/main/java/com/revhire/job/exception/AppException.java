package com.revhire.job.exception;
public class AppException extends RuntimeException {
    private int statusCode;
    public AppException(String message)               { super(message); this.statusCode = 400; }
    public AppException(String message, int s)        { super(message); this.statusCode = s;   }
    public int getStatusCode() { return statusCode; }
}
