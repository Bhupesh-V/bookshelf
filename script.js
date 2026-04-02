async function fetchBooks() {
  const response = await fetch("https://gist.githubusercontent.com/Bhupesh-V/ecfbb6a7cc7f57051f45968bef8f1f77/raw/bookshelf.json");
  return response.json();
}

async function fetchGistMetadata() {
  const response = await fetch("https://api.github.com/gists/ecfbb6a7cc7f57051f45968bef8f1f77");
  return response.json();
}

async function fetchWishlist() {
  const response = await fetch("https://gist.githubusercontent.com/Bhupesh-V/22c83b506d72b78d65a8b997d017881d/raw/wishlist.json");
  return response.json();
}

function showThoughts(title, thoughts) {
  const modal = document.getElementById('thoughtsModal');
  const titleElement = document.getElementById('thoughtsTitle');
  const contentElement = document.getElementById('thoughtsContent');

  titleElement.innerHTML = `My Thoughts on <i>"${title}"</i>`;
  contentElement.textContent = thoughts;
  modal.style.display = 'block';
}

function hideThoughts() {
  const modal = document.getElementById('thoughtsModal');
  modal.style.display = 'none';
}

function createBookHTML(book) {
  const thoughtsButton = book.thoughts
    ? `<button class="thoughts-btn" onclick="showThoughts('${book.title.replace(/'/g, "\\'")}', '${book.thoughts.replace(/'/g, "\\'")}')">✍🏽 Thoughts</button>`
    : "";

  return `
    <div class="book ${book.recommended ? "recommended" : ""}">
      <p style="font-weight: bold;">${book.title}</p>
      <p><strong>By</strong> <i>${book.author}</i></p>
      ${thoughtsButton}
    </div>
  `;
}

async function loadBooks() {
  fetchBooks().then((books) => {
    const booksTableBody = document.getElementById("books-table-body");
    const genres = {};
    let onTheShelfCount = 0;
    let currentlyReadingCount = 0;
    let finishedReadingCount = 0;

    // Group books by genre
    books.forEach((book) => {
      if (!genres[book.genre]) {
        genres[book.genre] = {
          currently_reading: "",
          on_the_shelf: "",
          read: "",
        };
      }

      const bookHTML = createBookHTML(book);

      if (book.status === "currently_reading") {
        genres[book.genre].currently_reading += bookHTML;
        currentlyReadingCount++;
      } else if (book.status === "on_the_shelf") {
        genres[book.genre].on_the_shelf += bookHTML;
        onTheShelfCount++;
      } else if (book.status === "read") {
        genres[book.genre].read += bookHTML;
        finishedReadingCount++;
      }
    });

    // Update headers with counts
    document.getElementById(
      "on-the-shelf-header"
    ).innerText = `On the Shelf (${onTheShelfCount})`;
    document.getElementById(
      "currently-reading-header"
    ).innerText = `Reading (${currentlyReadingCount})`;
    document.getElementById(
      "finished-reading-header"
    ).innerText = `Finished (${finishedReadingCount})`;

    // Add rows to the table for each genre
    for (const genre in genres) {
      booksTableBody.innerHTML += `
        <tr>
          <td><strong>${genre}</strong></td>
          <td>${genres[genre].on_the_shelf || ""}</td>
          <td>${genres[genre].currently_reading || ""}</td>
          <td>${genres[genre].read || ""}</td>
        </tr>
      `;
    }
  });
}

async function loadWishlist() {
  fetchWishlist().then((wishlist) => {
    const wishlistGrid = document.getElementById("wishlist-grid");
    const wishlistCount = document.getElementById("wishlist-count");
    const genreList = document.getElementById("genre-list");

    // Update the count
    wishlistCount.textContent = wishlist.length;

    // Calculate genre counts
    const genreCounts = {};
    wishlist.forEach((item) => {
      genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    });

    // Populate genre summary
    genreList.innerHTML = "";
    Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .forEach(([genre, count]) => {
        const genreItem = `
          <div class="genre-item">
            <span class="genre-name">${genre}</span>
            <span class="genre-count">${count}</span>
          </div>
        `;
        genreList.innerHTML += genreItem;
      });

    wishlist.forEach((item) => {
      const wishlistItem = `
        <div class="wishlist-item">
          <h3>${item.title}</h3>
          <p class="author">By ${item.author}</p>
          <span class="genre">${item.genre}</span>
        </div>
      `;
      wishlistGrid.innerHTML += wishlistItem;
    });
  });
}

async function updateLastUpdatedTime() {
  fetchGistMetadata().then((data) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const lastUpdated = new Date(data.updated_at).toLocaleDateString('en-US', options);
    const welcomeText = document.getElementById("last-updated");
    welcomeText.innerHTML = `<b>Last updated: ${lastUpdated}</b>` + welcomeText.innerHTML;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    loadBooks(),
    loadWishlist(),
    updateLastUpdatedTime()
  ]).then(() => {
    console.log("Bookshelf data loaded successfully.");
  }).catch((error) => {
    console.error("Error loading bookshelf data:", error);
  });

  // Close modal when clicking the close button or outside the modal
  const modal = document.getElementById('thoughtsModal');
  const closeBtn = document.querySelector('.close');

  closeBtn.onclick = hideThoughts;

  window.onclick = function (event) {
    if (event.target == modal) {
      hideThoughts();
    }
  }
});
