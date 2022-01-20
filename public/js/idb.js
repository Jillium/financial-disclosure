// variable to hold indexDb connection
let db;
// establish connection to IndexDb database, we will call 'budget-tracker' and it will be version 1
const request = indexedDB.open('budget-tracker', 1);


request.onupgradeneeded = function(event) {
   
    const db = event.target.result;
    
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon successful request
request.onsuccess = function(event) {
    // when db is successfully created with its object store 
    db = event.target.result;

    // check if app is online, if yes run sendTransaction()
    if (navigator.online) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(GetAll.result),
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

                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const transactionObjectStore = transaction.objectStore('new_transaction');

                transactionObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadTransaction);