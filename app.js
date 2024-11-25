let db;

const request = indexedDB.open("MyDatabase",2)
request.onupgradeneeded = (event)=>{
    db = event.target.result;
    db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
    db.createObjectStore("cutomers",{keyPath : "id",autoIncrement : true})
}