import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BASE_URL } from "@/lib/api"; // adjust path if needed

import { 
  Search, 
  Filter, 
  Lightbulb, 
  Eye, 
  Code,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { Question } from '../types';

const Questions: React.FC = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [userCode, setUserCode] = useState('');
  const [hint, setHint] = useState('');
  const [solution, setSolution] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const topics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  const fetchRandomQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/questions/random`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedQuestion(response.data);
      setUserCode('');
      setHint('');
      setSolution('');
      setShowSolution(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuestion = async () => {
    if (!selectedTopic) {
      toast({
        title: "Select Topic",
        description: "Please select a topic first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/questions/generate', {
        topic: selectedTopic,
        difficulty: selectedDifficulty || 'Medium'
      });
      setSelectedQuestion(response.data);
      setUserCode('');
      setHint('');
      setSolution('');
      setShowSolution(false);
      toast({
        title: "Success",
        description: "New question generated!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHint = async () => {
    if (!selectedQuestion) return;

    try {
      const response = await axios.post(`/api/questions/${selectedQuestion._id}/hint`, {
        currentCode: userCode
      });
      setHint(response.data.hint);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get hint",
        variant: "destructive",
      });
    }
  };

  const getSolution = async () => {
    if (!selectedQuestion) return;

    try {
      const response = await axios.get(`/api/questions/${selectedQuestion._id}/solution`);
      setSolution(response.data.solution);
      setShowSolution(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get solution",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (status: 'solved' | 'attempted') => {
    if (!selectedQuestion) return;

    try {
      await axios.post('/api/performance/update', {
        questionId: selectedQuestion._id,
        status,
        code: userCode,
        timeSpent: 30 // Mock time spent
      });
      toast({
        title: "Progress Updated",
        description: `Question marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !selectedQuestion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coding Questions</h1>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button onClick={fetchRandomQuestion} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Random Question
          </Button>
          <Button onClick={generateNewQuestion} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Display */}
      {selectedQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedQuestion.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600">{selectedQuestion.topic}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Problem Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.description}</p>
              </div>
              
              {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Test Cases</h4>
                  <div className="space-y-2">
                    {selectedQuestion.testCases.map((testCase, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p><strong>Input:</strong> {testCase.input}</p>
                        <p><strong>Output:</strong> {testCase.expectedOutput}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={getHint} variant="outline" size="sm">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get Hint
                </Button>
                <Button onClick={getSolution} variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Solution
                </Button>
              </div>

              {hint && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Hint</h4>
                  <p className="text-blue-800">{hint}</p>
                </div>
              )}

              {showSolution && solution && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="font-medium text-green-900 mb-2">✅ Solution</h4>
                  <pre className="text-green-800 whitespace-pre-wrap text-sm">{solution}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Your Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="// Write your solution here..."
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={() => updateProgress('solved')}>
                  Mark as Solved
                </Button>
                <Button onClick={() => updateProgress('attempted')} variant="outline">
                  Save Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Questions;