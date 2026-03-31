import express, { Request, Response } from "express";
import path from "path";
import fsPromises from "fs/promises";
import lib from "../model/librarian.js";
import { Render } from "../view/render.js";
import queryValidator from "../class/query_validator.js";

const router = express.Router();

//constants that store the path to the corresponding files are sent to the client and are responsible for displaying the content
const MAIN_PAGE = path.resolve(process.cwd(), "HTML", "books-page.html");
const BOOK_PAGE = path.resolve(process.cwd(), "HTML", "book-page.html");

const render = new Render();
const queryVal = new queryValidator();

// implementation of a router for interaction with the user and the database.
// The router is responsible for getting a list of all books and getting the page of a single book
router
  .get("/", async (req: Request, res: Response) => {
    res.sendFile(MAIN_PAGE);
  })
  .get("/api/v1/books", async (req: Request, res: Response) => {
    const filter = req.query["filter"];
    let offset: number = queryVal.offsetCheck(req.query["offset"]);

    let limit: number = queryVal.userLimitCheck(req.query["limit"]);
    try {
      const allBooks = await lib.getAllBooks();
      const paginatedBook = allBooks.slice(offset, offset + limit);
      res.json({
        books: paginatedBook,
        filter,
        offset: offset + paginatedBook.length,
        limit,
        total: allBooks.length,
      });
    } catch (err) {
      res.sendStatus(404);
    }
  })
  .get("/book/:id", async (req: Request, res: Response) => {
    const id: number = Number(req.params["id"]);
    try {
      const books = await lib.getBook(id);
      const bookPage = await fsPromises.readFile(BOOK_PAGE, "utf-8");

      const page = render.getBookPage(books, bookPage);

      res.send(page);
    } catch (err) {
      res.sendStatus(404);
    }
  })
  .post("/book/:id/want", async (req: Request, res: Response) => {
    const id = Number(req.params["id"]);
    if (isNaN(id)) {
      res.status(400).json({ ok: false });
      return;
    }

    try {
      const updated = await lib.incrementWantCount(id);
      if (updated) {
        res.status(200).json({ ok: true });
      } else {
        res.status(404).json({ ok: false });
      }
    } catch (error) {
      console.error("INCREMENT ERROR:", error);
      res.status(500).json({ error: "Помилка сервера" });
    }
  });

export default router;
