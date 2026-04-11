import React, { useState, useEffect } from 'react';

const ParticipantList = ({ participants }) => {
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    const newLoadingStates = {};
    participants.forEach((participant) => {
      newLoadingStates[participant.id] = true;
    });
    setLoadingStates(newLoadingStates);

    // Preload images to manage loading states
    participants.forEach((participant) => {
      const img = new Image();
      img.onload = () => {
        setLoadingStates((prev) => ({ ...prev, [participant.id]: false }));
      };
      img.onerror = () => {
        setLoadingStates((prev) => ({ ...prev, [participant.id]: false }));
      };
      img.src = participant.avatar;
    });
  }, [participants]);

  return (
    <div className="participant-list">
      {participants.map((participant) => (
        <div key={participant.id} className="participant-item">
          <div className="participant-avatar">
            {loadingStates[participant.id] && <div className="shimmer"></div>}
            <img
              src={participant.avatar}
              alt={participant.name}
              style={{ display: loadingStates[participant.id] ? 'none' : 'block' }}
            />
          </div>
          <div className="participant-info">
            <h3>{participant.name}</h3>
            <p>{participant.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantList;
