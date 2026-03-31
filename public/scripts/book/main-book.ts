document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".btnBookID");
  const bookContainer = document.querySelector("[book-id]");

  if (
    !(button instanceof HTMLButtonElement) ||
    !(bookContainer instanceof HTMLElement)
  ) {
    return;
  }

  const bookIdRaw = bookContainer.getAttribute("book-id");

  if (!bookIdRaw) {
    return;
  }
  const bookId = Number(bookIdRaw);

  button.addEventListener("click", async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/book/${bookId}/want`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("Додано до списку бажаного читання!");
      } else {
        alert("Не вдалося додати. Спробуйте ще раз.");
      }
    } catch (err) {
      console.error("Помилка запиту:", err);
      alert("Сталася помилка при відправці запиту.");
    }
  });
});
