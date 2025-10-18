import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ChatWindow from './ChatWindow';
import './MeetingPage.css';

const MeetingPage = () => {
    const { roomId } = useParams();
    const socketRef = useRef();
    const myVideoRef = useRef();
    const peersRef = useRef({});
    const [remoteStreams, setRemoteStreams] = useState({});
    const localStreamRef = useRef();
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenTrackRef = useRef(null);

    useEffect(() => {
        socketRef.current = io.connect("https://vedweb.onrender.com/");

        navigator.mediaDevices.getUserMedia({ video: true, audio: true})
            .then(stream => {
                console.log("Successfully got user media stream:", stream);
                console.log("My video element ref:", myVideoRef.current);
                localStreamRef.current = stream;
                if(myVideoRef.current) {
                    myVideoRef.current.srcObject = stream;
                }
                socketRef.current.emit('join-room', roomId, socketRef.current.id);

                socketRef.current.on('user-connected', (userId) => {
                    console.log(`User ${userId} connected, creating peer connection`);
                    const peer = createPeer(userId, socketRef.current.id, stream);
                    peersRef.current[userId] = peer;
                });

                socketRef.current.on('offer', (payload) => {
                    console.log('Received offer from', payload.callerId);
                    const peer = addPeer(payload.callerId, socketRef.current.id, stream);
                    peer.setRemoteDescription(new RTCSessionDescription(payload.signal));
                    peer.createAnswer()
                        .then(answer => {
                            peer.setLocalDescription(answer);
                            const payload = {
                                target: payload.callerId,
                                callerId: socketRef.current.id,
                                signal: answer,
                            };
                            socketRef.current.emit('answer', payload);
                        });
                    peersRef.current[payload.callerId] = peer;
                });

                socketRef.current.on('answer', (payload) => {
                    console.log('Received answer from', payload.callerId);
                    const peer = peersRef.current[payload.callerId];
                    peer.setRemoteDescription(new RTCSessionDescription(payload.signal));
                });

                socketRef.current.on('ice-candidate', (candidate) => {
                    const peer = peersRef.current[candidate.sender];
                    if (peer) {
                        peer.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                socketRef.current.on('user-disconnected', (userId) => {
                    console.log(`User ${userId} disconnected`);
                    if (peersRef.current[userId]) {
                        peersRef.current[userId].close();
                    }
                    delete peersRef.current[userId];
                    setRemoteStreams(prev => {
                        const newStreams = { ...prev };
                        delete newStreams[userId];
                        return newStreams;
                    });
                });
            })
            .catch(error => {
                console.error("Error accessing media devices.", error);
                alert("Could not access camera and microphone. Please check your browser permissions.");
            });

            function createPeer(userToSignal, callerId, stream) {
                const peer = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });
                stream.getTracks().forEach(track => peer.addTrack(track, stream));
                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socketRef.current.emit('ice-candidate', {
                            target: userToSignal,
                            candidate: event.candidate,
                        });
                    }
                };
                peer.ontrack = (event) => {
                    setRemoteStreams(prev => ({...prev, [userToSignal]: event.streams[0]}));
                };
                peer.createOffer()
                    .then(offer => {
                        peer.setLocalDescription(offer);
                        const payload = {
                            target: userToSignal,
                            callerId,
                            signal: offer,
                        };
                        socketRef.current.emit('offer', payload);
                    });

                return peer;
            }
            function addPeer(callerId, receiverId, stream) {
                const peer = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });

                stream.getTracks().forEach(track => peer.addTrack(track, stream));

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socketRef.current.emit('ice-candidate', {
                            target: callerId,
                            candidate: event.candidate,
                        });
                    }
                };

                peer.ontrack = (event) => {
                    setRemoteStreams(prev => ({...prev, [callerId]: event.streams[0]}));
                };

                return peer;
            }

        return () => {
            if(socketRef.current) {
                socketRef.current.disconnect();
            }
            Object.values(peersRef.current).forEach(peer => peer.close());
        };
    }, [roomId]);

    const toggleAudio = () => {
        if(localStreamRef.current) {
            localStreamRef.current.getAudioTracks()[0].enabled = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    const toggleVideo = () => {
        if(localStreamRef.current) {
            localStreamRef.current.getVideoTracks()[0].enabled = !isVideoOff;
            setIsVideoOff(!isVideoOff);
        }   
    }
    
    const toggleScreenShare = () => {
        if (!isScreenSharing) {
            navigator.mediaDevices.getDisplayMedia({ cursor: true })
                .then(stream => {
                    const screenTrack = stream.getVideoTracks()[0];
                    screenTrackRef.current = screenTrack; // Save screen track
                    
                    // Replace the video track for all peers
                    Object.values(peersRef.current).forEach(peer => {
                        const sender = peer.getSenders().find(s => s.track.kind === 'video');
                        sender.replaceTrack(screenTrack);
                    });
                    
                    // Listen for when the user clicks the browser's "Stop sharing" button
                    screenTrack.onended = () => {
                        stopScreenShare();
                    };

                    setIsScreenSharing(true);
                }).catch(err => {
                    console.error("Error sharing screen", err);
                });
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        // Get the original camera track back
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        
        // Replace the screen track with the camera track for all peers
        Object.values(peersRef.current).forEach(peer => {
            const sender = peer.getSenders().find(s => s.track.kind === 'video');
            sender.replaceTrack(cameraTrack);
        });

        // Stop the screen track
        if (screenTrackRef.current) {
            screenTrackRef.current.stop();
        }
        
        setIsScreenSharing(false);
    };

    return (
        <div className="meeting-container">
            {/* We'll move the chat window for a better layout later if needed */}
            {/* <ChatWindow socket={socketRef.current} roomId={roomId} /> */}

            <div className="videos-container">
                <video
                    ref={myVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="video-player"
                />
                {Object.entries(remoteStreams).map(([peerId, stream]) => (
                    <video
                        key={peerId}
                        autoPlay
                        playsInline
                        ref={video => { if (video) video.srcObject = stream; }}
                        className="video-player"
                    />
                ))}
            </div>

            <div className="controls-container">
                <button className="control-button secondary" onClick={toggleAudio}>
                    {isMuted ? "🎤" : "🔇"}
                </button>
                <button className="control-button secondary" onClick={toggleVideo}>
                    {isVideoOff ? "📷" : "🚫"}
                </button>
                <button className="control-button" onClick={toggleScreenShare}>
                    🖥️
                </button>
            </div>
        </div>
    );
};

export default MeetingPage;