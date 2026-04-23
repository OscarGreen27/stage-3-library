import { Pool } from "pg";
import dotenv from "dotenv";
import { BookDto, BookDtoSchema } from "../dto/books_dto.js";
import { BookEntity, BookEntitySchema } from "../entity/book_entity.js";
import z from "zod/v4";

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
  public async getBooks(offset: number, limit: number): Promise<BookEntity[]> {
    const result = await this.pool.query(
      `SELECT books.*, json_agg(authors.name) AS authors FROM books 
      LEFT JOIN book_author ON books.id = book_author.book_id 
      LEFT JOIN authors ON book_author.author_id = authors.id 
      GROUP BY books.id 
      ORDER BY books.id 
      LIMIT $1 OFFSET $2;`,
      [limit, offset],
    );
    return z.array(BookEntitySchema).parse(result.rows);
  }

  /**
   * The method queries the database to retrieve a record of a single book.
   * @param id book id
   * @returns a single-element array containing a book object
   */
  public async getBook(id: number): Promise<BookEntity> {
    const result = await this.pool.query(
      `SELECT books.*, json_agg(authors.name) AS authors FROM books 
      LEFT JOIN book_author ON books.id = book_author.book_id 
      LEFT JOIN authors ON book_author.author_id = authors.id 
      GROUP BY books.id 
      ORDER BY books.id 
      WHERE books.id = $1`,
      [id],
    );
    const book = BookEntitySchema.parse(result);

    await this.pool.query(
      `UPDATE clicks SET "clicks_count" = "clicks_count" + 1 WHERE id = $1`,
      [id],
    );

    return book;
  }

  public updateWantCount = async (book_id: number) => {
    await this.pool.query(
      `UPDATE want SET "want_count" = "want_count" + 1
     WHERE book_id = $1`,
      [book_id],
    );
  };

  /**
   * The method queries the database to add a new book.
   * @param newBook an object that contains data about a new book
   * @returns new book id
   */
  public async addBook(data: BookDto): Promise<number> {
    if (!data) throw new Error("Data is undefined!");
    BookDtoSchema.safeParse(data);

    const { authors, ...newBook } = data;

    if (!newBook) throw new Error("New book is undefined!");

    const keys = Object.keys(newBook);
    const values = Object.values(newBook);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

    return await this.insertNewValIntoDB(keys, values, placeholders, authors);
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
  public async incrementWantCount(id: number) {
    const result = await this.pool.query(
      `UPDATE books SET "wantCount" = "wantCount" + 1 WHERE id = $1 RETURNING "wantCount";`,
      [id],
    );
    const newCount = result.rows[0].wantCount;
    return result.rows[0].wantCount;
  }

  private async insertNewValIntoDB(
    keys: string[],
    values: (string | number)[],
    placeholders: string,
    authors: number[],
  ) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      //1. Insert new book
      const bookRes = await client.query(
        `INSERT INTO books (${keys.join(", ")}) VALUES (${placeholders}) RETURNING id)`,
        values,
      );
      const bookId = bookRes.rows[0].id;

      //2. Making new relations between authors and books
      for (const authorId of authors) {
        await client.query(
          `INSERT INTO book_authors (book_id, authors_id) VALUES ($1, $2)`,
          [bookId, authorId],
        );
      }
      //3. Insert new book id into want and click tables
      await client.query(`INSERT INTO want (book_id) VALUES ($1) `, [bookId]);
      await client.query(`INSERT INTO click (book_id) VALUES ($1) `, [bookId]);

      client.query("COMMIT");

      return bookId;
    } catch (err) {
      client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

const bookService: BookService = await BookService.create();
export default bookService;
