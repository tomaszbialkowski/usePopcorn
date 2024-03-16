import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import "./index.css";
import App from "./App";

import StarRating from "./starRating";

// dodanie możliwośći wyciągniecia stanu z innego componentu, do testu "exportujemy" stan ze StarRating
// function Test() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <StarRating
//         color="lightblue"
//         maxRating={10}
//         onExportState={setMovieRating}
//       />
//       <p>this movie is {movieRating} stars rated</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />

    {/* do testowania gwiazd */}
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Poor", "OK", "Good", "Excellent"]}
    />
    <StarRating
      maxRating={8}
      size={24}
      color={"gray"}
      className="test"
      defaultRating={3}
    />
    <Test /> */}
  </React.StrictMode>
);
