import express, { Request, Response } from "express";
import path from "path";
import upload from "../middelware/upload.js";
import queryValidator from "../class/query_validator.js";
import bookService from "../service/book-service.js";

const ADMIN_PAGE = path.resolve(process.cwd(), "HTML", "admin_page.html");

const adminRouter = express.Router();
const queryVal = new queryValidator();

//router implementation for the administrator.
// Responsible for displaying books on the administrator page, adding and deleting books
adminRouter
  .get("/admin/api/v1/", async (req: Request, res: Response) => {
    res.sendFile(ADMIN_PAGE);
  })
  .get("/admin/api/v1/books/", async (req: Request, res: Response) => {
    const adminLimit = queryVal.adminLimitCheck(req.query["adminLimit"]);
    const page = queryVal.pageCheck(req.query["page"]);

    const allBook = await bookService.getAllBooks();
    const firstIndex = page * adminLimit;
    const lastInsex = page * adminLimit + adminLimit;

    res.json({
      books: allBook.slice(firstIndex, lastInsex),
      total: allBook.length,
    });
  })
  .post(
    "/admin/api/v1/",
    upload.single("cover"),
    async (req: Request, res: Response) => {
      if (req.file === undefined) {
        res.status(400).json({ error: "Cover file not found!" });
        return;
      }
      console.log(req.file);
      try {
        const coverPath = req.file["filename"];
        const book = bookService.normalizedBook(req.body);
        book.cover = coverPath;

        const newBookId = await bookService.addBook(book);
        res.json({
          ok: true,
          id: newBookId,
        });
      } catch (err) {
        res.json({
          ok: false,
        });
      }
    },
  )
  .delete("/admin/api/v1/:id", async (req: Request, res: Response) => {
    const id = Number(req.params["id"]);
    const result = await bookService.deleteBook(id);

    if (result) {
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  });

export default adminRouter;
