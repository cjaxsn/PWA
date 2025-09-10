const strDBName = "TestDatabase";

function checkIndexedDBSupport()
{
    if (window.indexedDB)
    {
        console.log("Indexed DB supported");
        document.getElementById("btnCreateDB").disabled = false;
        document.getElementById("btnCreateObjectStore").disabled = false;
        document.getElementById("btnCalcStorage").disabled = false;
    }
    else
    {
        alert("Sorry! Your browser does not support IndexedDB");
    }
}

function createDatabase()
{
    // Let us open our database
    const request = window.indexedDB.open(strDBName, 1);

    request.onsuccess = (event) => {
        console.log("database created successfully");
        document.getElementById("btnCreateObjectStore").disabled = false;
        //const db = event.target.result;
    };

    request.onerror = (event) => {
        console.log("error creating database");
    };
}

function createObjectStore()
{
    const request = indexedDB.open(strDBName, 3); // Version 2

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        const customerData = [
            { id: "1", name: "Bill", age: 35, email: "bill@company.com" },
            { id: "2", name: "Donna", age: 32, email: "donna@home.org" },
        ];

        // This is the correct place to create or delete object stores
        if (!db.objectStoreNames.contains('MainStore')) {
            const objectStore = db.createObjectStore('MainStore', { keyPath: 'id' });
            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("email", "email", { unique: true });

            // Use transaction oncomplete to make sure the objectStore creation is
            // finished before adding data into it.
            objectStore.transaction.oncomplete = (event) => {
                // Store values in the newly created objectStore.
                const customerObjectStore = db
                    .transaction("MainStore", "readwrite")
                    .objectStore("MainStore");
                        customerData.forEach((customer) => {
                        customerObjectStore.add(customer);
                });
            };
        }
        // You can also add or modify indexes here
    };
}

async function checkStorage()
{
    console.log("Checking Storage");
    if (navigator.storage && navigator.storage.estimate)
    {
        const objStorage = await navigator.storage.estimate();
        // .quota -> Maximum number of bytes available for total storage of a device
        console.log("quota" + objStorage.quota);
        document.getElementById("storageQuota").innerText = objStorage.quota.toString();
        document.getElementById("storageQuotaGB").innerText = byteToGigaByte(objStorage.quota);

        // .usage -> Number of bytes being used by site
        console.log("quota" + objStorage.usage);
        document.getElementById("storageBytesAvailable").innerText = objStorage.usage.toString();

        const percentageUsed = (objStorage.usage / objStorage.quota) * 100;
        console.log(`You've used ${percentageUsed}% of the available storage.`);
        document.getElementById("storagePctUsed").innerText = percentageUsed.toFixed(2);

        const remaining = objStorage.quota - objStorage.usage;
        document.getElementById("storageRemaining").innerHTML = remaining.toString();
        console.log(`You can write up to ${remaining} more bytes.`);
    }
}
function byteToGigaByte(n) {
    return  (n / 1073741824).toFixed(2);
}