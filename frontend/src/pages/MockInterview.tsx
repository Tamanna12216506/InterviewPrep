import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSearchParams } from 'react-router-dom';
import {
  Video, Mic, MicOff, VideoOff, Phone, MessageSquare, Code, Send, Users,
} from 'lucide-react';

const generateInterviewId = () => `interview_${Date.now()}`;

const MockInterview: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const hasConnected = useRef(false);

  const [interviewId, setInterviewId] = useState('');
  const [isInInterview, setIsInInterview] = useState(false);
  const [messages, setMessages] = useState<Array<{ user: string; message: string; timestamp: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [code, setCode] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchParams] = useSearchParams();
  const inviteInterviewId = searchParams.get('interviewId');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle invite link case - only run once
  useEffect(() => {
    if (inviteInterviewId && !hasConnected.current) {
      console.log('Joining interview from invite link:', inviteInterviewId);
      setInterviewId(inviteInterviewId);
      setIsInInterview(true);
      hasConnected.current = true;
    }
  }, [inviteInterviewId]);

  // Socket connection effect - simplified
  useEffect(() => {
    if (!isInInterview || !interviewId || socketRef.current) {
      return;
    }

    console.log('Connecting to socket for interview:', interviewId);
    setIsConnecting(true);

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnecting(false);
      
      // Join the interview room after connection
      newSocket.emit('join-interview', {
        interviewId: interviewId,
        username: user?.name || 'Guest',
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnecting(false);
    });

    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data);
    });

    newSocket.on('participants-update', ({ count }) => {
      console.log('Participants update received:', count);
      setParticipants(count);
    });

    newSocket.on('interview-message', (data) => {
      console.log('Message received:', data);
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on('code-change', (data) => {
      console.log('Code change received:', data);
      setCode(data.code);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnecting(false);
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
      socketRef.current = null;
      setIsConnecting(false);
    };
  }, [isInInterview, interviewId]);

  const startInterview = () => {
    if (hasConnected.current) return; // Prevent multiple starts
    
    const roomId = generateInterviewId();
    console.log('Starting new interview:', roomId);
    setInterviewId(roomId);
    setIsInInterview(true);
    hasConnected.current = true;
  };

  const endInterview = () => {
    console.log('Ending interview');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsInInterview(false);
    setInterviewId('');
    setMessages([]);
    setCode('');
    setParticipants(0);
    setIsConnecting(false);
    hasConnected.current = false;
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const messageData = {
      interviewId,
      user: user?.name || 'Anonymous',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', messageData);
    socketRef.current.emit('interview-message', messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socketRef.current) {
      const codeData = { interviewId, code: newCode };
      console.log('Sending code change:', codeData);
      socketRef.current.emit('code-change', codeData);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/mock-interview?interviewId=${interviewId}`;
    navigator.clipboard.writeText(link)
      .then(() => toast({ 
        title: 'Invite Link Copied!', 
        description: 'Share this link with your interview partner' 
      }))
      .catch(() => toast({ 
        title: 'Error', 
        description: 'Failed to copy invite link'
      }));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Microphone On' : 'Microphone Off',
      description: isMuted ? 'You are now unmuted' : 'You are now muted',
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: isVideoOff ? 'Camera On' : 'Camera Off',
      description: isVideoOff ? 'Your camera is now on' : 'Your camera is now off',
    });
  };

  // Show start screen only if not in interview and no invite link
  if (!isInInterview && !inviteInterviewId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Start a Mock Interview Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Practice your coding interview skills in a real-time collaborative environment.
              Share your screen, communicate with your interviewer, and solve problems together.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">What to expect:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Real-time code collaboration</li>
                <li>• Voice and video communication</li>
                <li>• Interactive problem solving</li>
                <li>• Instant feedback and hints</li>
              </ul>
            </div>

            <Button onClick={startInterview} className="w-full">
              <Video className="mr-2 h-4 w-4" />
              Start Mock Interview
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Before the Interview</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Test your microphone and camera</li>
                  <li>• Prepare a quiet environment</li>
                  <li>• Have a notepad ready</li>
                  <li>• Review common algorithms</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">During the Interview</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Think out loud</li>
                  <li>• Ask clarifying questions</li>
                  <li>• Start with a simple solution</li>
                  <li>• Test your code with examples</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mock Interview Session</h1>
          <p className="text-gray-600">Interview ID: {interviewId}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="w-4 h-4" /> 
              {isConnecting ? 'Connecting...' : `${participants} participant${participants !== 1 ? 's' : ''}`}
            </p>
            {socketRef.current?.connected && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected"></div>
            )}
            {isConnecting && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Connecting"></div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopyLink} disabled={!interviewId}>
            Copy Invite Link
          </Button>
          <Button onClick={toggleMute} variant={isMuted ? 'destructive' : 'outline'}>
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={toggleVideo} variant={isVideoOff ? 'destructive' : 'outline'}>
            {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button onClick={endInterview} variant="destructive">
            <Phone className="h-4 w-4 mr-2" />
            End
          </Button>
        </div>
      </div>

      {participants < 2 && !isConnecting && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded border border-yellow-300 text-sm text-center">
          Waiting for another user to join... ({participants}/2 participants)
        </div>
      )}

      {isConnecting && (
        <div className="bg-blue-100 text-blue-800 p-3 rounded border border-blue-300 text-sm text-center">
          Connecting to interview session...
        </div>
      )}

      {participants >= 2 && (
        <div className="bg-green-100 text-green-800 p-3 rounded border border-green-300 text-sm text-center">
          Interview session is ready! Both participants are connected.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Collaborative Code Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="// Start coding here...
// This editor is synchronized with your interview partner"
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={!socketRef.current?.connected}
              />
              {!socketRef.current?.connected && (
                <p className="text-xs text-gray-500 mt-2">
                  Code editor is disabled until connection is established
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Call</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Video call would appear here</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {participants >= 2 ? 'Ready for video call' : 'Waiting for participants'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-blue-600">{msg.user}</div>
                          <div className="text-gray-700">{msg.message}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={!socketRef.current?.connected}
                  />
                  <Button 
                    onClick={sendMessage} 
                    size="icon"
                    disabled={!socketRef.current?.connected || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!socketRef.current?.connected && (
                  <p className="text-xs text-gray-500">
                    Chat is disabled until connection is established
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;