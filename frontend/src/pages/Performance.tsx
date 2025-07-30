
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  Calendar,
  Target,
  Award
} from 'lucide-react';
import type { Performance, PerformanceStats } from '../types';

const PerformancePage: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [history, setHistory] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPerformanceData();
  }, [currentPage]);

  const formatTimeSpent = (minutes: number): string => `${minutes} min`;

  const fetchPerformanceData = async () => {
    try {
      const [statsResponse, historyResponse] = await Promise.all([
        axios.get('/api/performance/stats'),
        axios.get(`/api/performance/history?page=${currentPage}&limit=10`)
      ]);
      setStats(statsResponse.data);
      setHistory(historyResponse.data.history);
      setTotalPages(historyResponse.data.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
        return 'text-green-600 bg-green-100';
      case 'attempted':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateSuccessRate = () => {
    if (!stats) return 0;
    const totalAttempts = stats.solved + stats.attempted;
    if (totalAttempts === 0) return 0;
    return Math.round((stats.solved / totalAttempts) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     {/* Header */}
      <div>
         <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-600">Track your coding interview preparation progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Solved Problems</p>
                <p className="text-2xl font-bold">{stats?.solved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Attempted</p>
                <p className="text-2xl font-bold">{stats?.attempted || 0}</p>
              </div>
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Total Time</p>
                <p className="text-2xl font-bold">{formatTimeSpent(stats?.totalTime || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{calculateSuccessRate()}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Practice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length > 0 ? history.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{item.questionId.title}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className={`px-2 py-1 rounded ${getDifficultyColor(item.questionId.difficulty)}`}>
                      {item.questionId.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatTimeSpent(item.timeSpent)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.lastAttemptedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-6">No practice history available.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;
