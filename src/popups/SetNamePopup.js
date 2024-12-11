import React from 'react';

function SetNamePopup({ isOpen, playerName, onNameChange, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          backgroundColor: 'var(--surface-hover)',
          zIndex: 1000,
        }}
        className='border-round'
      >
        <h2>Gib deinen Spielernamen ein</h2>
        <input
          type="text"
          value={playerName}
          onChange={onNameChange}
          placeholder="Spielername"
        />
        <button onClick={onConfirm}>Bestätigen</button>
      </div>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
      ></div>
    </>
  );
}

export default SetNamePopup;
