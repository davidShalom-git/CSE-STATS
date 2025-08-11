import React, { useEffect, useState, useCallback } from 'react';

const VotingStats = () => {
  const [token] = useState(() => localStorage.getItem('token'));

  const [candidates, setCandidates] = useState([]);
  const [votingStats, setVotingStats] = useState({
    totalUsers: 0,
    votedUsers: 0,
    votingPercentage: 0,
    candidateStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch candidates dynamically
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:1200/api/vote/candidates');
      const data = await res.json();
      if (res.ok && data.success) {
        const styledCandidates = data.candidates.map((candidate, idx) => ({
          id: candidate._id,
          name: candidate.name,
          party: candidate.party || 'Independent Party',
          image: ['👨‍💼', '👩‍💼', '👨‍🎓'][idx % 3],
          color: ['from-blue-500 via-blue-600 to-blue-700', 'from-emerald-500 via-green-600 to-teal-700', 'from-purple-500 via-violet-600 to-indigo-700'][idx % 3]
        }));
        setCandidates(styledCandidates);
      } else {
        setError(data.message || 'Failed to load candidates');
      }
    } catch {
      setError('Network error fetching candidates');
    }
  }, []);

  // Fetch voting stats
  const fetchVotingStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:1200/api/vote/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setVotingStats(data);
      } else {
        setError(data.message || 'Failed to fetch voting stats');
      }
    } catch {
      setError('Network error fetching stats');
    }
  }, [token]);

  // Combined fetch function to call both APIs
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchCandidates(), fetchVotingStats()]);
    setIsLoading(false);
  }, [fetchCandidates, fetchVotingStats]);

  useEffect(() => {
    if (token) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchAllData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl mb-4">🔒 Login Required</h2>
          <button
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:scale-105 transition-all"
            onClick={() => window.location.replace('/')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <p className="text-xl">📊 Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-300 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <p className="text-xl">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8 px-4 sm:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-300 to-blue-300 text-transparent bg-clip-text">
        🗳️ Live Voting Statistics
      </h1>

      {/* Refresh Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-5 py-2 rounded-full text-white transition-transform duration-200 ${
            isRefreshing ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105'
          }`}
        >
          {isRefreshing ? 'Refreshing...' : '🔄 Refresh Stats'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-blue-300">{votingStats.totalUsers}</h2>
            <p className="text-purple-200 mt-2">👥 Total Voters</p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-green-300">{votingStats.votedUsers}</h2>
            <p className="text-purple-200 mt-2">✅ Votes Cast</p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-purple-300">{votingStats.votingPercentage}%</h2>
            <p className="text-purple-200 mt-2">📈 Participation Rate</p>
          </div>
        </div>

        {/* Candidate Stats */}
        <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-center">🏆 Candidate Results</h3>
        <div className="space-y-4">
          {candidates.map(candidate => {
            // Find stats by candidate _id (adjust if your stats use name or other field)
            const stat = votingStats.candidateStats?.find(s => s._id === candidate.id || s._id === candidate.name);
            const count = stat?.count || 0;
            const percentage = votingStats.votedUsers > 0
              ? ((count / votingStats.votedUsers) * 100).toFixed(1)
              : 0;

            return (
              <div key={candidate.id} className="bg-white/10 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r ${candidate.color}`}>
                      <span className="text-xl">{candidate.image}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{candidate.name}</h4>
                      <p className="text-sm text-purple-300">{candidate.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-xl">{percentage}%</div>
                    <div className="text-purple-300 text-sm">{count} votes</div>
                  </div>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${candidate.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VotingStats;
