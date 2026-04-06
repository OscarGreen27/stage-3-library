import { Request, Response } from "express";
import QueryValidator from "../helper/query_validator.js";
import bookService from "../service/book-service.js";
export class Controller {
  private queryValidator: QueryValidator;
  constructor() {
    this.queryValidator = new QueryValidator();
  }
  public async getAllBooks(req: Request, res: Response) {
    const filter = req.query.filter;
    const offset = this.queryValidator.offsetCheck(req.query.offset);
    const limit = this.queryValidator.userLimitCheck(req.query.somthing);
    try {
      const books = await bookService.getAllBooks(offset, limit);
      res.status(200).json({
        status: "success",
        data: books,
      });
    } catch (err) {
      //todo
    }
  }

  public async getBook(req: Request, res: Response) {
    const id = Number(req.params.id);
    try {
      const book = await bookService.getBook(id);
      res.status(200).json({
        status: "success",
        data: book,
      });
    } catch (err) {
      //todo
    }
  }

  public async incrementWant(req: Request, res: Response) {
    const id = Number(req.query.id);
    try {
      const result = await bookService.incrementWantCount(id);
      res.status(200).json({
        status: "success",
        data: { wantCount: result },
      });
    } catch (err) {
      //todo
    }
  }
}
