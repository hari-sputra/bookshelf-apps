// modal
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementsByClassName("close-modal")[0];
const addBookButton = document.getElementsByClassName("add-book")[0];

openModalBtn.onclick = function () {
    modal.style.display = "block";
}

closeModalBtn.onclick = function () {
    modal.style.display = "none";
}
addBookButton.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('add-book-form');
    submitForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addBook();
        let inputs = document.querySelectorAll("input");
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = "";
        }
    });

    if (isStorageExist()) {
        loadData();
    }
});

// add book
const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener(RENDER_EVENT, function () {
    const unreadBookList = document.getElementById('books');
    unreadBookList.innerHTML = '';

    const readBookList = document.getElementById('read-books');
    readBookList.innerHTML = '';

    for (const bookList of books) {
        const bookElement = makeBook(bookList);

        if (!bookList.isCompleted) {
            unreadBookList.append(bookElement);
        } else {
            readBookList.append(bookElement);
        }
    }
});

function addBook() {
    const titleBook = document.getElementById('title').value;
    const authorBook = document.getElementById('author').value;
    const timestamp = document.getElementById('year').value;
    const isRead = document.getElementById('isRead');

    let status;

    if (isRead.checked) {
        status = true;
    } else {
        status = false;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, titleBook, authorBook, timestamp, status);
    books.push(bookObject);

    isRead.checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// generate id
function generateId() {
    return +new Date();
}

// generate object book
function generateBookObject(id, title, author, timestamp, isCompleted) {
    return {
        id,
        title,
        author,
        timestamp,
        isCompleted
    }
}


function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    const bookAuthor = document.createElement('p');
    const bookTimestamp = document.createElement('p');

    const bookContainer = document.createElement('div');
    const container = document.createElement('div');

    // memberikan data pada element yang dibuat
    bookTitle.innerText = bookObject.title;
    bookTitle.classList.add('book-title');
    bookAuthor.innerText = `Author: ${bookObject.author}`;
    bookTimestamp.innerText = `Year: ${bookObject.timestamp}`;

    // menambahkan class inner dan memasukan data pada class inner
    bookContainer.classList.add('inner');
    bookContainer.append(bookTitle, bookAuthor, bookTimestamp);

    // menambahkan class item dan shadow pada container "parent dari bookContainer"
    container.classList.add('item', 'shadow');
    container.append(bookContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    // jika buku sudah di baca
    if (bookObject.isCompleted) {
        // membuat element button untuk unread book
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('unread-button');
        unreadButton.addEventListener('click', () => unreadBook(bookObject.id));

        // membuat element button untuk menghapus buku
        const destroyButton = document.createElement('button');
        destroyButton.classList.add('destroy-button');
        destroyButton.addEventListener('click', () => destroyBook(bookObject.id));

        // menambahkan elemenet button destroy dan unread ke dalam variabel container
        container.append(unreadButton, destroyButton);
    } else {
        const readButton = document.createElement('button');
        readButton.classList.add('read-button');
        readButton.addEventListener('click', () => readBook(bookObject.id));

        const destroyButton = document.createElement('button');
        destroyButton.classList.add('destroy-button');
        destroyButton.addEventListener('click', () => destroyBook(bookObject.id));

        container.append(readButton, destroyButton);
    }

    return container;
}

function readBook(bookId) {
    const book = findBook(bookId);

    if (book == null) return;

    book.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function unreadBook(bookId) {
    const book = findBook(bookId);

    if (book == null) return;

    book.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookList of books) {
        if (bookList.id == bookId) {
            return bookList;
        }
    }
    return null;
}

function destroyBook(bookId) {
    const book = findBookIndex(bookId);

    if (book === -1) return;

    books.splice(book, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    showDialog()
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// local storage
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Your browser does not support local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadData() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


// custom dialog
const dialog = document.getElementById("custom-dialog");
const closeBtn = document.querySelector(".close-btn");

closeBtn.addEventListener("click", () => {
    dialog.style.display = "none";
});

function showDialog() {
    dialog.style.display = "block";
}

// search
const search = document.getElementById('search');
search.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBook();
});

const reset = document.querySelector('.reset');
reset.addEventListener('click', () => {
    document.getElementById('input-search').value = "";
    searchBook();
});

const searchBook = () => {
    const search = document.getElementById('input-search').value.toLowerCase();

    const book = document.getElementsByClassName('item');

    for (let index = 0; index < book.length; index++) {
        const titleBook = book[index].querySelector('.book-title');

        if (titleBook.textContent.toLowerCase().includes(search)) {
            book[index].classList.remove('hidden');
        } else {
            book[index].classList.add('hidden');
        }

    }
}

