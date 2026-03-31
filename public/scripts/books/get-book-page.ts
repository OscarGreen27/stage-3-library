document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.classList.contains("book_item")) {
      const bookId = target.dataset["bookId"];
      console.log(bookId);
      const res = await fetch(`http://localhost:8080/book/${bookId}`);
    }
  });
});
