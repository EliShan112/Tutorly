import { Request, Response, NextFunction } from "express";

const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) =>{
    console.error(error.stack);
    res.status(error.status || 500).json({
        message: error.message || "Internal Server Error"
    })
}

export default errorMiddleware;