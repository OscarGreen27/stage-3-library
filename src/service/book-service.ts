import { Connection, Pool } from "pg";
import dotenv from "dotenv";
import { BookDto, BookSchema } from "../model/books_schema.js";

dotenv.config();

//the class is responsible for working with the database
class BookService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * method creates a connection to the database
   * @returns instance of the Librarian class
   */
  public static async create(): Promise<BookService> {
    const pool = new Pool({
      host: process.env["DB_HOST"],
      port: Number(process.env["DB_PORT"]) || 5432,
      database: process.env["DB_NAME"],
      user: process.env["DB_USER"],
      password: process.env["DB_PASS"],
    });
    try {
      const conection = await pool.connect();

      conection.release();
      return new BookService(pool);
    } catch (err) {
      throw err;
    }
  }

  /**
   * The method queries the database to retrieve all records.
   * @returns array with book objects
   */
  public async getAllBooks(): Promise<BookDto[]> {
    try {
      const result = await this.pool.query("SELECT * FROM books");
      return this.parseBooks(result.rows);
    } catch (err) {
      throw new Error("Database connection failed");
    }
  }

  /**
   * The method queries the database to retrieve a record of a single book.
   * @param id book id
   * @returns a single-element array containing a book object
   */
  public async getBook(id: number): Promise<BookDto[]> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM books WHERE id = $1",
        [id],
      );
      const books = this.parseBooks(result.rows);

      await this.pool.query(
        `UPDATE books SET "numbersOfView" = "numbersOfView" + 1 WHERE id = $1`,
        [id],
      );

      return books;
    } catch (err) {
      throw new Error("Book id is invalid or DB connection failed");
    }
  }

  /**
   * The method queries the database to add a new book.
   * @param newBook an object that contains data about a new book
   * @returns new book id
   */
  public async addBook(newBook: BookDto): Promise<number> {
    const validated = BookSchema.safeParse(newBook);

    if (!validated.success) {
      console.error("Invalid book format:", validated.error.format());
      throw new Error("Invalid book data");
    }

    const book = validated.data;
    const keys: (keyof BookDto)[] = [
      "title",
      "year",
      "author",
      "pages",
      "isbn",
      "description",
      "cover",
    ];
    const values = keys.map((key) => book[key]);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.pool.query(
      `INSERT INTO books (${keys.join(
        ", ",
      )}) VALUES (${placeholders}) RETURNING id`,
      values,
    );

    return result.rows[0].id;
  }

  /**
   * The method queries the database to delete the book.
   * @param id ID of the book you want to delete
   * @returns true if the book is deleted, false if not deleted
   */
  public async deleteBook(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query("DELETE FROM books WHERE id = $1", [
        id,
      ]);
      if (typeof result.rowCount === "number") {
        return result.rowCount > 0;
      }
      return false;
    } catch (err) {
      throw new Error("Deletion failed!");
    }
  }

  /**
   * Increments the wantCount field by 1 for the book with the corresponding id
   * @param id The ID of the book
   * @returns true if the book was updated
   */
  public async incrementWantCount(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE books SET "wantCount" = "wantCount" + 1 WHERE id = $1`,
        [id],
      );
      if (typeof result.rowCount === "number") {
        return result.rowCount > 0;
      }
      return false;
    } catch (err) {
      console.error("DB ERROR in incrementWantCount:", err);
      throw new Error("Failed to increase counter add to wishlist");
    }
  }

  /**
   * The method changes the data type from string to number in the year, pages, isbn fields of the book object.
   * @param raw object book received from client
   * @returns object of type BookDto
   */
  public normalizedBook(raw: Record<string, string>): BookDto {
    return BookSchema.parse({
      title: raw["title"],
      year: this.isNumber(raw["year"]),
      author: raw["author"],
      pages: this.isNumber(raw["pages"]),
      isbn: this.isNumber(raw["isbn"]),
      description: raw["description"],
    });
  }

  /**
   *The method converts raw rows obtained from the database into valid objects of type BookDto.
   * @param rows - an array of objects from the database
   * @returns - an array of BookDto objects that have passed validation
   */
  private parseBooks(rows: any[]): BookDto[] {
    const validBooks: BookDto[] = [];

    for (const row of rows) {
      const transformed = {
        ...row,
        id: Number(row.id),
        year: Number(row.year),
        pages: Number(row.pages),
        numbersOfView: Number(row.numbersOfView),
        wantCount: Number(row.wantCount),
        isbn: Number(row.isbn),
      };

      const parsed = BookSchema.safeParse(transformed);
      if (parsed.success) {
        validBooks.push(parsed.data);
      } else {
        console.error("Validation failed:", parsed.error.format());
      }
    }
    return validBooks;
  }

  private isNumber(param: any): number {
    if (!isNaN(Number(param))) {
      return Number(param);
    }
    return 0;
  }
}

const bookService: BookService = await BookService.create();
export default bookService;
