package com.revhire.application.exception;
public class AppException extends RuntimeException {
    private int statusCode;
    public AppException(String m)          { super(m); this.statusCode = 400; }
    public AppException(String m, int s)   { super(m); this.statusCode = s;   }
    public int getStatusCode() { return statusCode; }
}
