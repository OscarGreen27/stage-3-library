//script to send a request to add a new book to the database
document.addEventListener("DOMContentLoaded", () => {
  //button that opens the form for adding a new book
  const addNewBook = document.getElementById("add-new-book");
  //element for adding a new book
  const addBookForm = document.getElementById("add-book-container");
  //button to close the add elememt
  const closeButton = document.getElementById("close-butoon");
  //button that sends a request to add a book
  const submit = document.getElementById("submit");

  if (
    !(addNewBook instanceof HTMLElement) ||
    !(addBookForm instanceof HTMLElement) ||
    !(closeButton instanceof HTMLElement) ||
    !(submit instanceof HTMLElement)
  ) {
    return;
  }

  //hide or show an element with an addition formula
  addNewBook.addEventListener("click", () => {
    addBookForm.style.display = "flex";
  });
  closeButton.addEventListener("click", () => {
    addBookForm.style.display = "none";
  });

  submit.addEventListener("click", async () => {
    const form = document.getElementById("add-book-form");

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    //get all input elements in the form
    const inputs = form.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input[data-field], textarea[data-field]");

    //we form an object with data from inputs to send to the server
    const formData = new FormData();
    inputs.forEach((input) => {
      const key = input.dataset["field"];
      if (!key) return;

      if (input instanceof HTMLInputElement && input.type === "file") {
        if (input.files && input.files.length > 0 && input.files[0]) {
          formData.append(key, input.files[0]);
        }
      } else {
        formData.append(key, input.value);
      }
    });

    try {
      const res = await fetch("http://localhost:8080/admin/api/v1", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Книгу додано");
        form.reset();
      } else {
        alert("Книгу не додано, перевірте параметри!");
      }
    } catch (err) {
      console.error("Помилка при запиті:", err);
      alert("Сталася помилка при надсиланні форми");
    }
  });
});
