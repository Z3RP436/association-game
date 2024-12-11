import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../db/firebase';
import SetNamePopup from '../popups/SetNamePopup';
import { CATEGORIES } from '../misc/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primereact/button';

function LobbyPage() {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [lobbyExists, setLobbyExists] = useState(false);
  const [errorText, setErrorText] = useState('');
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isPlayerOne, setIsPlayerOne] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [lobbyData, setLobbyData] = useState(null);
  const [playerInput, setPlayerInput] = useState('');
  const [timer, setTimer] = useState(3);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        const docRef = await db.getLobbyDocRef(lobbyId);

        if (docRef) {
          setLobbyExists(true);

          const lobbySnapshot = await docRef.get();
          if (lobbySnapshot.exists) {
            const lobbyDoc = lobbySnapshot.data();
            setLobbyData(lobbyDoc);
          }

          const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
              const data = doc.data();
              setLobbyData(data);

              setIsPopupOpen((!data.playerOneName && isPlayerOne) || (!data.playerTwoName && !isPlayerOne));
            } else {
              console.error('Lobby wurde nicht gefunden.');
              setLobbyData(null);
            }
          });

          return () => unsubscribe();
        } else {
          setLobbyExists(false);
          setErrorText('Diese Lobby existiert nicht.');
          setTimeout(() => {
            navigate(`/`);
          }, 3000);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Lobby-Daten:', error);
      }
    };

    if (location.state && location.state.isPlayerOne) {
      setIsPlayerOne(location.state.isPlayerOne);
    } else {
      setIsPlayerOne(false);
    }

    fetchLobbyData();
  }, [lobbyId, navigate, location, isPlayerOne]);

  useEffect(() => {
    if (lobbyData?.rounds?.[lobbyData.currentRoundIndex]?.bothPlayersSubmitted && !lobbyData?.rounds?.[lobbyData.currentRoundIndex]?.accepted) {
      setTimer(3);
      setShowResult(false);

      const countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(countdown);
            setShowResult(true);
            setPlayerInput("");
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      setShowResult(false);
    }
  }, [lobbyData]);

  if (lobbyExists === null) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Lade...</div>;
  }

  if (!lobbyExists) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>{errorText}</h2>
      </div>
    );
  }

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleSendButton = () => {
    updateRoundPlayerInput(isPlayerOne, playerInput);
  }

  const handleStartButton = () => {
    nextRound();
  }

  const nextRound = () => {
    let category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    addRound(lobbyId, category);
  }

  const handleLeaveButton = () => {
    navigate(`/`);
  }

  const handleConfirmName = () => {
    if (playerName.trim() !== '') {
      updatePlayerNameInLobby(lobbyId, playerName, isPlayerOne);
      setIsPopupOpen(false);
    } else {
      alert('Bitte gib einen gültigen Namen ein.');
    }
  }

  const handleAcceptButton = () => {
    acceptRound();
    nextRound();
  }

  const acceptRound = async () => {
    try {
      const docRef = await db.getLobbyDocRef(lobbyId);

      if (docRef) {
        const currentRound = lobbyData.rounds[lobbyData.currentRoundIndex];
        currentRound.accepted = true;

        lobbyData.rounds[lobbyData.currentRoundIndex] = currentRound;
        await docRef.update({
          rounds: lobbyData.rounds
        });


        console.log('Lobby erfolgreich aktualisiert');
      } else {
        console.error('Lobby mit dieser ID wurde nicht gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Lobby:', error);
    }
  }

  const updateRoundPlayerInput = async (isPlayerOne, playerInput) => {
    try {
      const docRef = await db.getLobbyDocRef(lobbyId);

      if (docRef) {
        const currentRound = lobbyData.rounds[lobbyData.currentRoundIndex];

        currentRound[isPlayerOne ? 'playerOneInput' : 'playerTwoInput'] = playerInput;
        currentRound.bothPlayersSubmitted = !!(currentRound.playerOneInput && currentRound.playerTwoInput);

        lobbyData.rounds[lobbyData.currentRoundIndex] = currentRound;
        await docRef.update({
          rounds: lobbyData.rounds
        });


        console.log('Lobby erfolgreich aktualisiert');
      } else {
        console.error('Lobby mit dieser ID wurde nicht gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Lobby:', error);
    }
  }

  const addRound = async (lobbyId, category) => {
    try {
      const docRef = await db.getLobbyDocRef(lobbyId);
      if (docRef) {
        const newRounds = lobbyData.rounds;
        newRounds.push({ category: category });


        await docRef.update({
          currentRoundIndex: lobbyData.currentRoundIndex + 1,
          rounds: newRounds,
          bothPlayersSubmitted: false,
          accepted: false
        });

        console.log('Lobby erfolgreich aktualisiert');
      } else {
        console.error('Lobby mit dieser ID wurde nicht gefunden.');
      }

    } catch (error) {
      console.error(error);
    }
  }

  const updatePlayerNameInLobby = async (lobbyId, playerName, isPlayerOne) => {
    try {
      const docRef = await db.getLobbyDocRef(lobbyId);

      if (docRef) {
        const updateData = isPlayerOne
          ? { playerOneName: playerName }
          : { playerTwoName: playerName };

        await docRef.update(updateData);

        console.log('Lobby erfolgreich aktualisiert mit dem Spielernamen:', playerName);
      } else {
        console.error('Lobby mit dieser ID wurde nicht gefunden.');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Lobby:', error);
    }
  };

  const getCurrentRound = () => {
    return lobbyData?.rounds?.[lobbyData.currentRoundIndex] || null;
  };

  const isInputSubmitted = () => {
    const currentRound = getCurrentRound();
    return currentRound && ((isPlayerOne && currentRound.playerOneInput) || (!isPlayerOne && currentRound.playerTwoInput));
  }

  const isLobbyFull = () => {
    return lobbyData && lobbyData.playerOneName && lobbyData.playerTwoName;
  }


  return (
    <div>
      <SetNamePopup
        isOpen={isPopupOpen}
        playerName={playerName}
        onNameChange={handleNameChange}
        onConfirm={handleConfirmName}
      />


      {lobbyExists && (
        <div className='grid text-center'>
          <button onClick={handleLeaveButton} className='fixed' style={{ float: 'left', top: '50px', left: '50px' }}>Zurück</button>
          <div className='col-10'>
            <div className='grid'>
              <div className='col-12'>
                <h1>Assoziationsspiel</h1>
              </div>
              <div className='col-6'>
                <h2>{lobbyData?.playerOneName}</h2>
                <h3>{showResult && getCurrentRound().playerOneInput}</h3>
              </div>
              <div className='col-6'>
                <h2>{lobbyData?.playerTwoName}</h2>
                <h3>{showResult && getCurrentRound().playerTwoInput}</h3>
              </div>
              {lobbyData?.rounds?.[lobbyData.currentRoundIndex]?.bothPlayersSubmitted && timer !== 0 && (
                <div className='col-12'>
                  <p>{timer}</p>
                </div>
              )}
              <div className='col-12'>
                <span className='text-lg font-bold'>{lobbyData?.currentRoundIndex !== -1 && lobbyData?.rounds[lobbyData?.currentRoundIndex].category}</span>
                {(showResult && isPlayerOne) && (<button onClick={handleAcceptButton}>Ok</button>)}
              </div>
              {(lobbyData && lobbyData.currentRoundIndex !== -1) && (
                <div className='col-12'>
                  <input
                    type="text"
                    value={playerInput}
                    placeholder="Deine Antwort"
                    disabled={isInputSubmitted()}
                    onChange={(e) => setPlayerInput(e.target.value)}
                  />
                  <button onClick={handleSendButton} disabled={isInputSubmitted()} className='p-button-outlined ml-2'>
                    <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} />
                    Send
                  </button>
                </div>
              )}
            </div>
            {isPlayerOne && (
              <div className='col-12 mt-8 text-left pl-8'>
                <h3>Nur sichtbar für Spieler Eins</h3>
                <button onClick={handleStartButton} disabled={!isLobbyFull()}>Starten</button>
              </div>
            )}
          </div>
          <div className='col-2 pr-4'>
            <ul className='pl-0 w-full'>
              {lobbyData?.rounds?.slice(0, -1).map((round, index) => (
                <li className='list-none px-1 py-2' key={index} >
                  <div className={`grid border-round ${round.accepted ? 'bg-green-800' : 'bg-red-800'}`}>
                    <div className='col-12 text-lg font-bold'>
                      {round.category}
                    </div>
                    <div className='col-6 text-sm text-color-secondary'>
                      {round.playerOneInput}
                    </div>
                    <div className='col-6 text-sm text-color-secondary'>
                      {round.playerTwoInput}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default LobbyPage;