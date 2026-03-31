//script responsible for outputting the book
document.addEventListener("click", async (event) => {
  //we form a request for deletion
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.classList.contains("delete-btn")
  ) {
    const bookId = target.dataset["id"];
    if (!bookId) {
      return;
    }

    if (!confirm("Ви дійсно хочете видалити цю книгу?")) {
      return;
    }

    const res = await fetch(`http://localhost:8080/admin/api/v1/${bookId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Книгу НЕ видалено!");
      return;
    }

    alert("Книгу видадено!");

    //if the table is empty after deleting the book, refresh the page
    const row = target.closest("tr");
    if (row && row.parentElement) {
      row.parentElement.removeChild(row);
    }

    const tableBody = document.getElementById("tbody");
    const hasBooks =
      tableBody instanceof HTMLElement && tableBody.children.length > 0;

    if (!hasBooks && window.params["page"] > 0) {
      window.params["page"] -= 1;
      const query = new URLSearchParams({
        page: window.params["page"].toString(),
        adminLimit: window.params["adminLimit"].toString(),
        total: window.params["total"].toString(),
      }).toString();

      const refreshRes = await fetch(
        `http://localhost:8080/admin/api/v1/books?${query}`
      );

      const data = await refreshRes.json();
      window.params["total"] = data.total;
      window.renderButtons(Math.ceil(data.total / window.params["adminLimit"]));
      window.renderBookTable(data.books);
    }
  }
});
