// creating a variable based on teh browser being used
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
// creating a variable named db
let db;
// creating a variable named request that opens a table named budget - 
const request = indexedDB.open("bank", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("transaction", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["transaction"], "readwrite");
  const store = transaction.objectStore("transaction");

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["transaction"], "readwrite");
  const store = transaction.objectStore("transaction");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {        
        return response.json();
      })
      .then(() => {
        // delete records if successful
        const transaction = db.transaction(["transaction"], "readwrite");
        const store = transaction.objectStore("transaction");
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);