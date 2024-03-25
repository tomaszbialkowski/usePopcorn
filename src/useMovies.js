import { useEffect, useState } from "react";

const KEY = "55ca2044";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      // opakowujemy w dodatkową funkcję ponieważ funkcja przekazana bezpośrednio jako 1 parametr useEffect nie może być asynchroniczna, po kodzie tej asynchronicznej funckji od razu następuje jej wywołąnie, a potem jest 2 parametr useEffect czyli DEPENDECIES jako tablica
      const controller = new AbortController(); //czyszczenie fetcha ze zbyt wielu zapytań do bazy

      //   callback?.();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Sth went wrong with getting data");

          const data = await res.json();
          if (data.Resposne === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
          // powyższe ignoruje błąd wywoływany przez funkcję czyszcząca efekt, który dla nas jest nieistotny i mói o tym że użytkownik przerwał wysyłanie zapytanie - co faktycznie robi funckja czyszcząca po to żeby nie wysyłać zbyt wielu zapytań do bazy - o to chodzi lo żęby tak działało
        } finally {
          // zawsze się wykona bez względu na błąd
          setIsLoading(false);
        }
      }
      if (query.length < 2) {
        setMovies([]);
        setError("");
        return;
      }

      //   handleCloseMovie(); // funckcja ktora oryginalnie była wywoływana tutaj a teraz jest orzekazana do tego hooka jako callback i wywoływana na początku hooka
      fetchMovies();

      // cleanup function ze zbyt wielu zapytań do bazy. jak to działa: każda zmiana query (czyli to co wpisujemy do inputu do search) wywołuje re-render, a funkcja czyszcząca jest wywoływana przed re-renderem i po wymontowaniu komponentu
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  // są 3 sposoby określenia kiedy udeEffect ma być uruchomiony:
  // pusta tablica przekazana po funckji ktora ma byc wykonana oznacza ze useEffect ma być uruchomiony tylko PO initial render
  // bez tego paramteru(czyli bez niczego): useEfect zostanie uruchomiony zawsze przy renderingu komponentu
  // z wpisanymi zmiennymi do tablicy: useEfect zostanie uruchomiony gdy któraś ze zmiennych podanych w tabeli dependecies zostanie zmieniona (!!! każdy state i prop uzyty w funckji useEffect musi być wpisany do tablicy !!!)
  return { movies, isLoading, error };
}
