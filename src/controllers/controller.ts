import { Request, Response } from "express";
import QueryValidator from "../helper/query_validator.js";
import bookService from "../service/book-service.js";
export class Controller {
  private queryValidator: QueryValidator;
  constructor() {
    this.queryValidator = new QueryValidator();
  }
  public getAllBooks = async (req: Request, res: Response) => {
    const filter = req.query.filter;
    const offset = this.queryValidator.offsetCheck(req.query.offset);
    const limit = this.queryValidator.userLimitCheck(req.query.limit);
    try {
      const books = await bookService.getBooks(offset, limit);
      console.log(books);
      res.status(200).json({
        status: "success",
        data: books,
      });
    } catch (err) {
      console.log(err);
    }
  };

  public getBook = async (req: Request, res: Response) => {
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
  };

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

  public async addBook(req: Request, res: Response) {
    const data = req.body.data;

    try {
      const result = await bookService.addBook(data);
    } catch (err) {
      //todo
    }
  }
}
