import React from "react";
import "./App.css";
import "./components/auth/Login";
// import { Register } from "./components/auth/Register";
import { Login } from "./components/auth/Login";
import { Dashboard } from "./components/dashboard/Dashboard"
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col justify-start p-4 bg-grey-200">
        <h1 className="text-3xl font-bold mb-4">Todo app</h1>
        <BrowserRouter>
          <Login />
          {/* <Register /> */}
          <Dashboard />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
