import React from 'react';
import './App.css';
import Providers from "./provider/Providers";
import ScreenRoutes from "./ui/routing/ScreenRoutes";
import {BrowserRouter} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Providers>
          <BrowserRouter>
            <ScreenRoutes />
          </BrowserRouter>
      </Providers>
    </div>
  );
}

export default App;
