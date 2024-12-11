import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import React from 'react';
import StartPage from './pages/StartPage';
import LobbyPage from './pages/LobbyPage';
import { PAGE_LOBBY_PATH } from './misc/constants';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={`/*`} element={<StartPage />} />
        <Route path={`/${PAGE_LOBBY_PATH}/:lobbyId`} element={<LobbyPage />} />
      </Routes>
    </Router>
  );
}


export default App;