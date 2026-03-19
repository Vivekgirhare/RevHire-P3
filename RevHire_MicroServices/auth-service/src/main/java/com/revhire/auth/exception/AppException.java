package com.revhire.auth.exception;

public class AppException extends RuntimeException {
    private int statusCode;
    public AppException(String message)                     { super(message); this.statusCode = 400; }
    public AppException(String message, int statusCode)     { super(message); this.statusCode = statusCode; }
    public int getStatusCode() { return statusCode; }
}
