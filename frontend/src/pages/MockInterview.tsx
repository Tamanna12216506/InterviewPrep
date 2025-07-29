// frontend/src/pages/MockInterview.tsx
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  MessageSquare,
  Code,
  Send
} from 'lucide-react';

const MockInterview: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [interviewId, setInterviewId] = useState('');
  const [isInInterview, setIsInInterview] = useState(false);
  const [messages, setMessages] = useState<Array<{ user: string; message: string; timestamp: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [code, setCode] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = () => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    const roomId = `interview_${Date.now()}`;
    setInterviewId(roomId);
    setSocket(newSocket);
    setIsInInterview(true);

    newSocket.emit('join-interview', {
      interviewId: roomId,
      username: user?.name
    });

    newSocket.on('user-joined', (data) => {
      toast({
        title: "User Joined",
        description: `${data.username} joined the interview`,
      });
    });

    newSocket.on('interview-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('code-change', (data) => {
      setCode(data.code);
    });
  };

  const endInterview = () => {
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setIsInInterview(false);
    setInterviewId('');
    setMessages([]);
    setCode('');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      interviewId,
      user: user?.name || 'Anonymous',
      message: newMessage,
    };

    socket.emit('interview-message', messageData);
    setMessages(prev => [...prev, { ...messageData, timestamp: new Date().toISOString() }]);
    setNewMessage('');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socket) {
      socket.emit('code-change', {
        interviewId,
        code: newCode,
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone On" : "Microphone Off",
      description: isMuted ? "You are now unmuted" : "You are now muted",
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: isVideoOff ? "Camera On" : "Camera Off",
      description: isVideoOff ? "Your camera is now on" : "Your camera is now off",
    });
  };

  if (!isInInterview) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mock Interview Session</h1>
          <p className="text-gray-600">Interview ID: {interviewId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={toggleMute} variant={isMuted ? "destructive" : "outline"}>
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={toggleVideo} variant={isVideoOff ? "destructive" : "outline"}>
            {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button onClick={endInterview} variant="destructive">
            <Phone className="h-4 w-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Editor */}
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
                placeholder="// Start coding here... Changes will be synced in real-time"
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat & Video */}
        <div className="space-y-4">
          {/* Video Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Video Call</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Video call would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
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
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
