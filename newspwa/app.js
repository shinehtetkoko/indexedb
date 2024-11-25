const dbName = 'newsDB';
const storeName = 'newsStore';

let db;

// Open IndexedDB
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'article_id' }); // Use article_id as the unique key
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db); // Resolve the promise when DB is initialized
        };

        request.onerror = (event) => {
            console.error('Error opening DB:', event.target.error);
            reject(event.target.error);
        };
    });
};

// Save news to IndexedDB (only if unique)
const saveToDB = (newsData) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    // Flag to track if any article was added
    let isDataSaved = false;

    newsData.forEach((article) => {
        const request = store.get(article.article_id); // Try to get the article by its article_id
        request.onsuccess = (event) => {
            if (!request.result) { // If article doesn't exist, put it in the store
                const putRequest = store.put(article);
                putRequest.onsuccess = () => {
                    console.log(`Article ${article.article_id} saved successfully.`);
                    isDataSaved = true; // Mark as saved
                };
                putRequest.onerror = (error) => {
                    console.error('Error saving article:', error.target.error);
                };
            } else {
                console.log(`Article ${article.article_id} already exists in the DB.`);
            }
        };

        request.onerror = (error) => {
            console.error('Error checking article existence:', error.target.error);
        };
    });

    transaction.oncomplete = () => {
        if (isDataSaved) {
            console.log('All new articles were saved successfully.');
        } else {
            console.log('No new articles to save.');
        }
    };

    transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.error);
    };
};

// Fetch news from IndexedDB
const fetchFromDB = () => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event) => {
        const data = event.target.result;
        console.log('Data fetched from IndexedDB:', data);
        displayNews(data); // Display the data on the page
    };

    request.onerror = (event) => {
        console.error('Error fetching data:', event.target.error);
    };
};

// Fetch live news and store it
const fetchAndStoreNews = async () => {
    try {
        const response = await fetch('https://newsdata.io/api/1/latest?apikey=pub_59377fabc6c0149b94662d5f71b78966f9b94&q=pizza');
        const newsData = await response.json();
        saveToDB(newsData.results); // Store the data in IndexedDB (avoid duplicates)
        displayNews(newsData.results); // Display the data on the page
    } catch (error) {
        console.error('Error fetching or saving news:', error);
    }
};

// Display news on the page
const displayNews = (articles) => {
    const newsContainer = document.getElementById('newsContainer');
    newsContainer.innerHTML = articles.map((article) => `
        <article>
            <img src="${article.image_url || 'placeholder.jpg'}" alt="" width="100px">
            <div class="card-content">
                <h2 class="card-title">${article.title || 'No Title Available'}</h2>
                <div class="card-item"><strong>Link:</strong> <a href="${article.link}" target="_blank">Read more</a></div>
                <div class="card-item"><strong>Creator:</strong> ${article.creator || 'Unknown'}</div>
                <div class="card-item description"><strong>Description:</strong> ${article.description || 'No Description Available'}</div>
                <div class="card-item"><strong>Published Date:</strong> ${article.pubDate || 'Unknown'}</div>
            </div>
            <div class="card-footer">
                <span>Source Priority: 94729</span>
                <a href="https://www.lavoz.com.ar" target="_blank">Visit Source</a>
            </div>
        </article>
    `).join('');
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await openDB(); // Initialize the database
    if (navigator.onLine) {
        fetchAndStoreNews(); // Fetch live data if online
    } else {
        fetchFromDB(); // Fetch offline data from IndexedDB
    }
});
