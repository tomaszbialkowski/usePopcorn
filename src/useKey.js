import { useEffect } from "react";

export function useKey(key, actionCallback) {
  useEffect(
    function () {
      function callback(e) {
        e.code.toLowerCase() === key.toLowerCase() && actionCallback();
      }

      document.addEventListener("keydown", callback);

      //cleanup function uzywamy tutaj dlatego ze każde "otwarcie" filmu powoduje uruchomienie tego efektu, więc powstaje nagromadzenie przypiętych eventListenerów do body, nawet do filmów któe już zostały zamlniete poprzez otwarcie kolejnego filmu
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [actionCallback, key]
  );
}
