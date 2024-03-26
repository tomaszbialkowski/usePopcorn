import { useEffect, useState, useRef } from "react";
import StarRating from "./starRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "55ca2044";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query); //uzycie customowego hooka

  const [watched, setWatched] = useLocalStorageState([], "watched");

  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue);
  // }); //przeniesione do hook useLocalStorageState

  // nigdy nie rób funkcji fetch ani nie ustawiaj state w top level code - bo spowodujesz niekończącą sie pętle renderowania.
  // setState wewnątrz returna tak jak w przypdaku componentu Search a do fetcha uzywaj useEffect, który pozwala na bezpieczne pisanie kodu z sideeffect (kontakt ze światem zewnętrznym np pobieranie danych z bazy danych lub ustawianie jakiś zmiennych)

  function handleSelectMovie(id) {
    id === selectedId ? setSelectedId(null) : setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // poniżej trzeba przekazać tablicę z obejrzanymi filmami, jednak nie możemy tego zrobić po prostu jako watched bo nie ma tutaj dostępu do zaktualizowanego stanu mimo że robimy powyżej setWatched, jednak ten stan w tym momencie będzie jeszcze stary "stale", nowy stan będzie dostęny po renderingu
    //w local storage przechowujemy pary klucz, wartość - obie muszą być typu string dlatego zamieniamy tablice na string z wykorzystaniem metody JSON.stringify()
    // poniższa instrukcja zostaje zakomentowana bo te funckjonalnosć przeniosłem do useEffect, to tylko przykłąd że moze tu być
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </Navbar>

      <Main>
        {/* <Box>{isLoading ? <Loader /> : <MoviesList movies={movies} />}</Box>  */}
        {/*# chcąc do tej instrukcji dodać założenie wyświetl błąd jeśli coś poszło nie tak powinniśmy przy niespełnieniu warunku isLoading dodać "jesli wszytko jest OK wyswietl <MovieList> jesli coś poszło nie tak wyświetl blad. nie jest tp ładne i tę konstrukcję zastąpimy poniższą*/}
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MoviesList
              movies={movies}
              onSelectMovie={handleSelectMovie}
              onCloseMovie={handleCloseMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <>
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watchedList={watched}
              />
              {/* <button className={btn}>$llpr;</button> */}
            </>
          ) : (
            <>
              <WatchedMoviesSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

const Loader = () => <p className="loader">Loading...</p>;

const ErrorMessage = ({ message }) => (
  <p className="error">
    <span>🛑</span>
    {message}
    <span>🛑</span>
  </p>
);

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// przykład napisania componentu z uzyciem funkcji strzałkowej
const Logo = () => (
  <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
);

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("enter", function () {
    if (document.activeElement === inputEl.current) return;

    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies ? movies.length : "NO"}</strong> results.
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, onSelectMovie, onCloseMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>📅</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// function WatchedBox() {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedMoviesSummary watched={watched} />
//           <WatchedMoviesList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watchedList }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);
  // zmiany wartośći Refów nie możemy robić w render logic, zamiast tego musimy wykorzystać useEfect
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = watchedList
    .map((movie) => movie.imdbID)
    .includes(selectedId);

  const watchedUserRating = watchedList.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Actors: actors,
    Director: director,
    Genre: genre,
    Plot: plot,
    Poster: poster,
    Released: released,
    Title: title,
    Year: year,
    Runtime: runtime,
    imdbRating,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecision: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  // poniższy effect przeniesiony do custom hooka useKey
  // useEffect(
  //   function () {
  //     function callback(e) {
  //       e.code === "Escape" && onCloseMovie();
  //       console.log("closed by escape key");
  //     }

  //     document.addEventListener("keydown", callback);

  //     //cleanup function uzywamy tutaj dlatego ze każde "otwarcie" filmu powoduje uruchomienie tego efektu, więc powstaje nagromadzenie przypiętych eventListenerów do body, nawet do filmów któe już zostały zamlniete poprzez otwarcie kolejnego filmu
  //     return function () {
  //       document.removeEventListener("keydown", callback);
  //     };
  //   },
  //   [onCloseMovie]
  // );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `MOVIE | ${title}`;

      // cleanup effect function - usuwamy efekt po odmontowaniu komponentu i po każdym re-rendrze
      return function () {
        document.title = "usePopcorn";
        console.log("cleanup function");
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &#x2B05;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onExportState={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You already rated this movie with ⭐{watchedUserRating}</p>
              )}
            </div>
            <p>Directed by: {director}</p>
            <p>Staring: {actors}</p>
            <p>
              <em>{plot}</em>
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMoviesSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed()} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
