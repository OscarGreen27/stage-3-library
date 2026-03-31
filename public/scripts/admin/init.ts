import { Book } from "./Book.js";

/**
 * Global function for rendering a table with books on the admin side
 * @param books array of books
 * @returns void
 */
window.renderBookTable = (books: Book[]) => {
  const table = document.getElementById("tbody");

  if (!(table instanceof HTMLElement)) {
    return;
  }
  table.innerHTML = "";

  books.forEach((book) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.numbersOfView}</td>
      <td><button class="delete-btn btn btn-danger" data-id="${book.id}">Видалити</button></td>
      `;

    table.appendChild(tr);
  });
};

/**
 * Global function for rendering the number of pages on the admin side
 * @param pageCount total number of books
 * @returns void
 */
window.renderButtons = (pageCount: number) => {
  const buttonContainer = document.getElementById("button-container");

  if (!(buttonContainer instanceof HTMLElement)) {
    return;
  }

  buttonContainer.innerHTML = "";

  for (let i = 0; i < pageCount; i++) {
    const button = document.createElement("button");
    button.id = `button${i}`;
    button.className = "navigation-button btn btn-link";
    button.dataset["pageNumber"] = i.toString();
    button.textContent = `${i + 1}`;
    buttonContainer.appendChild(button);
  }
};
