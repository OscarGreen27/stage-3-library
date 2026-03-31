import { Book } from "./Book.js";

window.params = {
  page: 0,
  adminLimit: 10,
  total: 0,
};

document.addEventListener("DOMContentLoaded", async () => {
  const queryString = new URLSearchParams({
    page: window.params["page"].toString(),
    adminLimit: window.params["adminLimit"].toString(),
  }).toString();
  const res = await fetch(
    `http://localhost:8080/admin/api/v1/books?${queryString}`
  );
  const data: { books: Book[]; total: number } = await res.json();
  const books = data.books;

  window.params["total"] = data["total"];
  const pageCount = Math.ceil(data["total"] / window.params["adminLimit"]);

  window.renderButtons(pageCount);
  window.renderBookTable(books);

  const buttonContainer = document.getElementById("button-container");

  if (!(buttonContainer instanceof HTMLElement)) {
    return;
  }
  buttonContainer.addEventListener("click", async (event) => {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      target.classList.contains("navigation-button")
    ) {
      const pageNumber = Number(target.dataset["pageNumber"]);
      window.params.page = pageNumber;

      const queryString = new URLSearchParams({
        page: window.params["page"].toString(),
        adminLimit: window.params["adminLimit"].toString(),
        total: window.params["total"].toString(),
      }).toString();
      const res = await fetch(
        `http://localhost:8080/admin/api/v1/books?${queryString}`
      );
      const data = await res.json();
      const books = data.books;
      window.renderBookTable(books);
    }
  });
});
