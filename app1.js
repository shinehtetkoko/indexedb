let db;
const customerData = [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
    { ssn: "555-55-5554", name: "Donna1", age: 32, email: "donna1@home.org" },
  ];
let request = indexedDB.open("MyDatabase",2)
request.onupgradeneeded = function(event){
    db = event.target.result;
    db.createObjectStore("products",{keyPath : "id",autoIncrement : true})
    db.createObjectStore("names",{keyPath : "id",autoIncrement : true})
    const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
    objectStore.transaction.oncomplete = (event) => {
        // Store values in the newly created objectStore.
        const customerObjectStore = db
          .transaction("customers", "readwrite")
          .objectStore("customers");
        customerData.forEach((customer) => {
          customerObjectStore.add(customer);
        });
    }
    console.log("object is created",db);
}
request.onsuccess = function(event){
    db = event.target.result;
    console.log("Database opened sucess.");
}
request.onerror = (event)=>{
    db = event.target.result;
    console.log("Database opened fail.")
}
