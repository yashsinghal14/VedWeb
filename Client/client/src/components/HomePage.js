import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

const HomePage = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const createAndJoin = () => {
        const newRoomId = uuidV4();
        navigate(`/room/${newRoomId}`);
    };

    const joinRoom = () => {
        if (roomId) {
            navigate(`/room/${roomId}`);
        } else {
            alert("Please provide a valid room id");
        }
    };

    return (
        <div>
            <h1>Video Calling App</h1>
            <div>
                <button onClick={createAndJoin}>Create a new room</button>
            </div>
            <hr />
            <div>
                <input
                    type="text"
                    placeholder="Enter room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={joinRoom}>Join room</button>
            </div>  
        </div>
    );
};

export default HomePage;