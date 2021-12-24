// create variable 
let db;

// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function(event) {

    // save a reference to the database
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};


request.onsuccess = function(event) {

    // when db is successfully created with its object store 
    db = event.target.result;
    if (navigator.onLine) {}
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const  budgetObjectStore = transaction.objectStore('new_transaction');
    budgetObjectStore.add(record);
}

function uploadTransaction() {

    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    const getAll = budgetObjectStore.getAll();
    getAll.onsuccess = function() {

        // if there was data in indexedDb's store send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');re
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    budgetObjectStore.clear();
                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);