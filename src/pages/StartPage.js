import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/firebase';
import { PAGE_LOBBY_PATH } from '../misc/constants';

function StartPage() {
    const [lobbyId, setLobbyId] = useState('');
    const [errorText, setErrorText] = useState('');
    const navigate = useNavigate();
  
    const checkLobbyExists = async (lobbyId) => {
      try {
        const docRef = await db.getLobbyDocRef(lobbyId);
  
        if (docRef) {
          return { status: true, text: 'Lobby gefunden' };
        } else {
          return { status: false, text: "Keine Lobby mit dieser ID gefunden." };
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Lobby:', error);
        return { status: false, text: "Fehler beim Abrufen der Lobby" };
      }
    };
  
    const handleCreateLobby = () => {
      const newLobbyId = Math.random().toString(36).substr(2, 8).toLowerCase();
      db.collection('lobbies').add({ lobbyId: newLobbyId, currentRoundIndex: -1, rounds: []});
      navigate(`/${PAGE_LOBBY_PATH}/${newLobbyId}`, { state: { isPlayerOne: true } });
    };
  
    const handleJoinLobby = () => {
      let _lobbyId = lobbyId.toLowerCase();
      checkLobbyExists(_lobbyId).then((exists) => {
        if (exists.status) {
          navigate(`/${PAGE_LOBBY_PATH}/${_lobbyId}`);
        } else {
          setErrorText(exists.text);
        }
      });
    };
  
    const handleInputChange = (e) => {
      setLobbyId(e.target.value);
    };
  
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Lobby-System</h1>
        <button onClick={handleCreateLobby}>Lobby erstellen</button>
        <br /><br />
        <input
          type="text"
          value={lobbyId}
          onChange={handleInputChange}
          placeholder="Lobby ID eingeben"
        />
        <button onClick={handleJoinLobby}>Lobby beitreten</button>
        <h2>{errorText}</h2>
      </div>
    );
  }

  export default StartPage;