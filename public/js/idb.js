// variable to hold indexDb connection
let db;
// establish connection to IndexDb database, we will call 'budget-tracker' and it will be version 1
const request = indexedDB.open('budget_tracker', 1);


// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
  };

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    if (navigator.onLine) {
      
      uploadTransaction();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('new_transaction');

    trackerObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('new_transaction');

    const getAll = trackerObjectStore.getAll();

    getAll.onsuccess = function() {
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

                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const trackerObjectStore = tracker.objectStore('new_transaction');

                trackerObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadTransaction);