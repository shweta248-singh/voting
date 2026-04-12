import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import socketIOClient from "socket.io-client";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import AdminPanel from "./components/AdminPanel";
import Register from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import { Navigate } from "react-router-dom";

import { useEffect } from "react";
import {
  Routes,
  Route,


  Link,


} from "react-router-dom"



function App() {
  const { user, logout, login, setUser } = useContext(AuthContext);
  const [votes, setVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    show:false,
    message: "",
    type: "info",
  });
  const socket = socketIOClient(process.env.REACT_APP_API, {
    transports: ["websocket"],
    withCredentials: true,
  });
  const fetchVotes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/votes`);
      if (!response.ok) throw new Error("Failed to fetch votes");
      const data = await response.json();
      setVotes(data);
    } catch (error) {
      setError(error?.message);

    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchVotes();
    socket.on("voteCreated", (newVote) => {
      setVotes((prev) => [...prev, newVote]);
      showNotification("Vote updated!", "info");
    });

    socket.on("voteUpdated", (updatedVote) => {
      setVotes((prev) =>
        prev.map((v) => (v?._id === updatedVote?._id ? updatedVote : v))
      );
      showNotification("Vote updated!", "info");
    });

    socket.on("voteDeleted", (voteId) => {
      setVotes((prev) =>
        prev.filter((item) => item._id !== voteId));
      showNotification("Vote deleted successfully!", "sucess");
    });

    return () => {
      socket.off("voteUpdated");
      socket.off("voteCreated");
      socket.off("voteDeleted");
    }
  }, []);
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  if (isLoading) return <div className="loading">Loading...</div>;



  return (

    <div className="app-container">
      <Header
        user={user}
        logout={logout}
        showNotification={showNotification}
      />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                votes={votes}
                error={error}
                user={user}
                setUser={setUser}
                setVotes={setVotes}
                
                showNotification={showNotification}
              />
            }
          />

          <Route
            path="/login"
            element={
              user?.role === "admin" ? (
                <Navigate to="/admin" />
              ) :
                user ? (
                  <Navigate to="/" />
                ) : (
                  <LoginPage
                    showNotification={showNotification}
                    login={login}
                  />
                )
            }
          />

          <Route
            path="/register"
            element={
              user?.role === "admin" ? (
                <Navigate to="/" />
              ) : (
                <Register login={login} showNotification={showNotification} />
              )

            }
          />
          {/* {user?.role === "admin"&&(
            <Route
            path="/admin"
            element={
              <AdminPanel
              votes={votes}
              setVotes={setVotes}
              showNotification={showNotification}
              />
            }
          />

          )} */}

          <Route
  path="/admin"
  element={
    user?.role === "admin" ? (
      <AdminPanel
        votes={votes}
        setVotes={setVotes}
        showNotification={showNotification}
      />
    ) : (
      <Navigate to="/login" />
    )
  }
/>


          
        </Routes>
      </main>
      {
        (notification.
          show &&(
            <div className={`notification ${notification.type}`}>
              {notification.message}
              </div>
          )
        )
      }

    </div>

  )

}

export default App;
