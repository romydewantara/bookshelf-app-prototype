const books = []; //Wadah Buku
const filteredBooks = []; //Hasil Pencarian Buku
const RENDER_EVENT = "render-book";
const SEARCH_EVENT = "search-event";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const checkboxBookForm = document.getElementById("bookFormIsComplete");
  const submitButton = document.getElementById("bookFormSubmit");
  const submitBookForm = document.getElementById("bookForm");
  const searchBooks = document.getElementById("searchBook");

  checkboxBookForm.addEventListener("change", function (event) {
    event.preventDefault();
    console.log("checked")
    if (checkboxBookForm.checked) submitButton.innerHTML = "Masukkan Buku Ke Rak Selesai Dibaca";
    else submitButton.innerHTML = "Masukkan Buku Ke Rak Belum Selesai Dibaca";
  })
  submitBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    const bookTitle = document.getElementById("bookFormTitle").value;
    alert(`Berhasil Menambahkan Buku "${bookTitle}" ke dalam Rak!`);
  });
  searchBooks.addEventListener("submit", function(event) {
    event.preventDefault();
    console.log(`keyword: ${getKeyword()}`)
    searchBook(getKeyword());
  })

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Kriteria Wajib 1: Gunakan localStorage sebagai Penyimpanan
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Oops… Your browser is not support with the local storage!");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}


/** Format objek beserta tipe data nilainya.
 * [
 *    {
 *      id: string | number,
 *      title: string,
 *      author: string,
 *      year: number,
 *      isComplete: boolean,
 *    }
 * ]
 *
 * Contoh data riil:
 *    {
 *      id: 3657848524,
 *      title: 'Harry Potter and the Philosopher\'s Stone',
 *      author: 'J.K Rowling',
 *      year: 1997,
 *      isComplete: false,
 *    }
 */
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Kriteria Wajib 2: Mampu Menambahkan Buku
function addBook() {
  const textTitle = document.getElementById("bookFormTitle").value;
  const textAuthor = document.getElementById("bookFormAuthor").value;
  const textYear = document.getElementById("bookFormYear").value;
  const isComplete = document.querySelector("#bookFormIsComplete").checked;

  console.log(`checked: ${isComplete}`);
  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textTitle,
    textAuthor,
    parseInt(textYear),
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Generate Elements
function generateBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  console.log(`id: ${id}, title: ${title}, author: ${author}`)

  const textTitle = document.createElement("h3");
  textTitle.style.margin = "0";
  textTitle.style.fontWeight = "bold";
  textTitle.style.fontSize = "24px";
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.style.margin = "0";
  textAuthor.style.marginTop = "10px"
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement("p");
  textYear.style.margin = "0";
  textYear.style.marginTop = "6px";
  textYear.innerText = `Tahun: ${year}`;

  const checkedButton = document.createElement("button");
  checkedButton.style.color = "#FFFFFF";
  checkedButton.style.padding = "8px";
  checkedButton.style.border = "none";
  checkedButton.style.borderRadius = "6px";
  checkedButton.innerText = isComplete? "Belum Selesai Dibaca": "Sudah Dibaca";
  if (isComplete) {
    checkedButton.style.backgroundColor = "#05445E";
    checkedButton.addEventListener("click", function () {
      markAsIncompleted(id);
    });
  } else {
    checkedButton.style.backgroundColor = "#18A558";
    checkedButton.addEventListener("click", function () {
      markAsCompleted(id);
    });
  }
  // Add Hover to Buttons
  checkedButton.addEventListener("mouseover", checkedMouseOver, false);
  checkedButton.addEventListener("mouseout", checkedMouseOut, false);
  function checkedMouseOver() {
    if (isComplete) checkedButton.style.backgroundColor = "#050A30"; 
    else checkedButton.style.backgroundColor = "#116530";
  }
  function checkedMouseOut() {
    if (isComplete) checkedButton.style.backgroundColor = "#05445E";
    else checkedButton.style.backgroundColor = "#18A558";
  }

  const deleteButton = document.createElement("button");
  deleteButton.style.backgroundColor = "#FF2511"
  deleteButton.style.color = "#FFFFFF";
  deleteButton.style.padding = "8px";
  deleteButton.style.border = "none";
  deleteButton.style.borderRadius = "6px";
  deleteButton.style.marginLeft = "10px";

  deleteButton.innerText = "Hapus Buku";
  deleteButton.addEventListener("click", function() {
    removeCompletedBook(id);
    alert(`Anda telah menghapus buku ${title} dari Rak.`);
  });
  deleteButton.addEventListener("mouseover", mouseOver, false);
  deleteButton.addEventListener("mouseout", mouseOut, false);
  function mouseOver() {
    deleteButton.style.backgroundColor = "#BA0F30";
  }
  function mouseOut() {
    deleteButton.style.backgroundColor = "#FF2511";
  }
  
  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginTop = "6px";
  buttonContainer.classList.add("inner", "button-container");
  buttonContainer.append(checkedButton, deleteButton);

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear, buttonContainer);

  const container = document.createElement("div");
  container.classList.add("item", "container-book"); //container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  if (isComplete) {
    document.getElementById("completeBookList").appendChild(container);
  } else {
    document.getElementById("incompleteBookList").appendChild(container);
  }

  return container;
}

// Kriteria Wajib 4: Dapat Memindahkan Buku Antar Rak [markAsCompleted(id) vs markAsInompleted(id)]
function markAsCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function markAsIncompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
  
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// Kriteria Wajib 5: Dapat Menghapus Data Buku
function removeCompletedBook(bookId) {
  const bookTarget = findBooksIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBooksIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    console.log(`item: ${parsed}`);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Kriteria Wajib 3: Memiliki Dua Rak Buku
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  console.log(`make book now!`);
  for (const bookItem of books) {
    console.log(`eventListener - bookItem: ${bookItem}`);
    const bookElement = generateBook(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
});

// Kriteria Opsional 1: Menambahkan Fitur Pencarian Buku
function searchBook(keyword) {

  if (books.length == 0) return; // if books array is empty then return!

  filteredBooks.splice(0, filteredBooks.length); // Refresh the array
  for (const key in books) {
    var keyInsensitive = keyword.toUpperCase();
    var booksInsensitive = books[key].title.toUpperCase();
    if(booksInsensitive.includes(keyInsensitive)) {
      filteredBooks.push(books[key]);
    }
  }

  document.dispatchEvent(new Event(SEARCH_EVENT));
}

function getKeyword() {
  return document.getElementById("searchBookTitle").value;
}

document.addEventListener(SEARCH_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const newBook in filteredBooks) {
    const bookElement = generateBook(filteredBooks[newBook]);
    if (filteredBooks[newBook].isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
});