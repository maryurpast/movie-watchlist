const apiKey = "54ecc24";
let filmlist = [];
let watchlist = [];
let filmsHtml = ``;

// ------- Searching films --------

if (document.querySelector("#searching-form")) {
  document
    .querySelector("#searching-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      filmsHtml = "";
      renderFilms();

      const inputValue = document.querySelector(".searching-bar-input").value;
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=${apiKey}&s=${inputValue}/`
      );
      const data = await response.json();

      if (data.Response === "True") {
        data.Search.forEach((data) => {
          getFilmsDetails(data);
        });
      } else {
        renderPlaceholder();
      }
    });
} else {
  getFromStorage();
}

async function getFilmsDetails(filmData) {
  let response = await fetch(
    `http://www.omdbapi.com/?apikey=${apiKey}&t=${filmData.Title}/`
  );
  let filmDetails = await response.json();
  filmlist = [...filmlist, filmDetails];
  if (filmDetails.Response === "True") {
    filmsHtml += getFilmsHtml(filmDetails);
  }
  renderFilms();
}

// ------- Store and Render --------

function renderFilms() {
  document.querySelector(".content").innerHTML = filmsHtml;
  handleStorage();
}

function handleStorage() {
  document.querySelectorAll(".film-add").forEach((film) =>
    film.addEventListener("click", (e) => {
      const clicked =
        e.target.closest("div.film-info").children[0].children[0].textContent;

      filmlist.forEach((filmItem) => {
        if (filmItem.Title === clicked) {
          localStorage.setItem(`${filmItem.Title}`, JSON.stringify(filmItem));

          if (e.target.closest("span").textContent === "Watchlist") {
            e.target.closest("span").textContent = "Remove";
            film.children[0].src = "images/remove-icon.png";
          } else {
            localStorage.removeItem(filmItem.Title);
            e.target.closest("span").textContent = "Watchlist";
            film.children[0].src = "images/add-icon.png";
          }
        }
      });
    })
  );
}

// ------- Watchlist --------

function getFromStorage() {
  for (let key of Object.entries(localStorage)) {
    let addedFilm = JSON.parse(localStorage.getItem(key[0]));
    addedFilm.isInWatchlist = true;
    watchlist = [...watchlist, addedFilm];
  }
  if (watchlist.length > 0) {
    renderWatchlist();
  }
}

function renderWatchlist() {
  let watchlistContent = ``;
  watchlist.forEach((film) => {
    watchlistContent += getFilmsHtml(film);
  });
  document.querySelector(".watchlist-placeholder").style.display = "none";
  document.querySelector(".watchlist-content").innerHTML = watchlistContent;
  handleWatchlist();
}

function handleWatchlist() {
  document.querySelectorAll(".film-add").forEach((film) => {
    film.children[1].textContent = "Remove";
    film.children[0].src = "images/remove-icon.png";

    film.addEventListener("click", (e) => {
      const clicked =
        e.target.closest("div.film-info").children[0].children[0].textContent;
      console.log(clicked);
      watchlist.forEach((watchlistItem) => {
        if (watchlistItem.Title === clicked) {
          console.log(`${watchlistItem.Title} will be deleted`);
          localStorage.removeItem(watchlistItem.Title);
          location.reload();
        }
      });
    });
  });
}

// ------- HTML --------

function getFilmsHtml(data) {
  return `
	<article class="film">
            <img
              src=${data.Poster}
              alt="Recommended movie"
              class="film-img"
            />
            <div class="film-info">
              <div class="film-header">
                <h2 class="film-name">${data.Title}</h2>
                <img src="images/star.png" alt="star-icon" class="film-likes" />
                <p class="film-likes-amount">${data.imdbRating}</p>
              </div>
              <div class="film-details">
                <p class="film-duration">${data.Runtime}</p>
                <p class="film-genre">${data.Genre}</p>
                <div class="film-add">
                <img src="images/add-icon.png"/>
                   <span>Watchlist</span>
                </div>
              </div>
              <div class="film-description">
                <p class="film-description-text">
                  ${data.Plot}
                </p>
              </div>
            </div>
          </article>
	`;
}

function renderPlaceholder() {
  document.querySelector(".content").innerHTML = `
	<p class="placeholder placeholder-text">
            Unable to find what you are looking for. Please try another search.
          </p>
	`;
}
