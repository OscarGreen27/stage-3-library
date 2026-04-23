import express, { Request, Response } from "express";
import path from "path";
import fsPromises from "fs/promises";
//import { Render } from "../view/render.js";
import QueryValidator from "../helper/query_validator.js";
import bookService from "../service/book-service.js";
import { Controller } from "../controllers/controller.js";

const router = express.Router();

//constants that store the path to the corresponding files are sent to the client and are responsible for displaying the content
const MAIN_PAGE = path.resolve(process.cwd(), "HTML", "books-page.html");
const BOOK_PAGE = path.resolve(process.cwd(), "HTML", "book-page.html");

//const render = new Render();
const queryVal = new QueryValidator();
const controller = new Controller();

// implementation of a router for interaction with the user and the database.
// The router is responsible for getting a list of all books and getting the page of a single book
router.get("/", async (req: Request, res: Response) => {
  res.sendFile(MAIN_PAGE);
});


router.get("/api/v1/books", controller.getAllBooks);
router.get("/api/v1/book/:id", controller.getBook);
router.put("/api/v1/want/", controller.incrementWant);

export default router;
