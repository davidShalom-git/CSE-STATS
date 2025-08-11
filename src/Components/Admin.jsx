import React, { useEffect, useState, useCallback } from 'react';

// RoleStats Component (unchanged)
const RoleStats = ({ roleData, roleTitle, roleIcon }) => {
  const { role, totalUsers, votedUsers, votingPercentage, candidateStats } = roleData;

  const getRoleColors = (index) => {
    const colors = [
      'from-blue-500 via-blue-600 to-blue-700',
      'from-emerald-500 via-green-600 to-teal-700',
      'from-purple-500 via-violet-600 to-indigo-700',
      'from-red-500 via-pink-600 to-rose-700',
      'from-orange-500 via-amber-600 to-yellow-700'
    ];
    return colors[index % colors.length];
  };

  const getCandidateEmoji = (index) => {
    const emojis = ['👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '🧑‍💼'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-center mb-6">
        <span className="text-4xl mr-3">{roleIcon}</span>
        <h2 className="text-2xl font-bold text-white">{roleTitle}</h2>
      </div>

      {/* Role Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-blue-300">{totalUsers}</h3>
          <p className="text-purple-200 text-sm">👥 Total Voters</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-green-300">{votedUsers}</h3>
          <p className="text-purple-200 text-sm">✅ Votes Cast</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-purple-300">{votingPercentage}%</h3>
          <p className="text-purple-200 text-sm">📈 Participation</p>
        </div>
      </div>

      {/* Candidates Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-purple-200 mb-4">
          🏆 Candidate Results
        </h3>
        {candidateStats.map((candidate, index) => (
          <div key={candidate._id} className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r ${getRoleColors(index)}`}>
                  <span className="text-xl">{getCandidateEmoji(index)}</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{candidate.name}</h4>
                  <p className="text-sm text-purple-300">Candidate</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-xl">{candidate.percentage}%</div>
                <div className="text-purple-300 text-sm">{candidate.count} votes</div>
              </div>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getRoleColors(index)} transition-all duration-500`}
                style={{ width: `${candidate.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Vote Distribution Chart */}
      {votedUsers > 0 && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h4 className="text-center text-purple-200 mb-4">📊 Vote Distribution</h4>
          <div className="flex items-end justify-center space-x-2 h-24">
            {candidateStats.map((candidate, index) => {
              const maxHeight = Math.max(...candidateStats.map(c => parseFloat(c.percentage)));
              const height = maxHeight > 0 ? (parseFloat(candidate.percentage) / maxHeight) * 80 : 8;
              return (
                <div key={candidate._id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 bg-gradient-to-t ${getRoleColors(index)} rounded-t-lg transition-all duration-500 flex items-end justify-center`}
                    style={{ height: `${Math.max(height, 8)}px` }}
                  >
                    <span className="text-xs text-white font-bold mb-1">
                      {candidate.percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-purple-300 mt-1 text-center w-12 truncate">
                    {candidate.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Admin Component without authentication
const Admin = () => {
  const [allStats, setAllStats] = useState({
    overall: { totalUsers: 0, votedUsers: 0, votingPercentage: 0 },
    roleStats: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');

  // Role configuration
  const roleConfig = {
    president: {
      title: 'President',
      icon: '🏛️'
    },
    vicePresident: {
      title: 'Vice President',
      icon: '🎖️'
    },
    secretary: {
      title: 'Secretary',
      icon: '📋'
    },
    treasury: {
      title: 'Treasury',
      icon: '💰'
    }
  };

  // Fetch all voting stats (no auth header)
  const fetchAllStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:1200/api/vote/stats');
      const data = await response.json();

      if (response.ok && data.success) {
        setAllStats(data);
      } else {
        setError(data.message || 'Failed to fetch voting stats');
      }
    } catch (error) {
      setError('Network error fetching stats');
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllStats();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-300 mx-auto mb-4"></div>
          <p className="text-xl">📊 Loading voting statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-300 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="text-center">
          <p className="text-xl mb-4">❌ {error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-purple-600 text-white hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-blue-300 text-transparent bg-clip-text">
            🗳️ Live Voting Statistics Dashboard
          </h1>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-6 py-2 rounded-full text-white transition-all duration-200 ${
              isRefreshing 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 shadow-lg'
            }`}
          >
            {isRefreshing ? (
              <>
                <span className="animate-spin inline-block mr-2">⟳</span>
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh Stats
              </>
            )}
          </button>
        </div>

        {/* Overall Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-purple-200">
            📈 Overall Voting Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl text-center border border-blue-400/30">
              <h3 className="text-4xl font-bold text-blue-300 mb-2">{allStats.overall.totalUsers}</h3>
              <p className="text-blue-200">👥 Registered Voters</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-xl text-center border border-green-400/30">
              <h3 className="text-4xl font-bold text-green-300 mb-2">{allStats.overall.votedUsers}</h3>
              <p className="text-green-200">✅ Active Participants</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl text-center border border-purple-400/30">
              <h3 className="text-4xl font-bold text-purple-300 mb-2">{allStats.overall.votingPercentage}%</h3>
              <p className="text-purple-200">📊 Participation Rate</p>
            </div>
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedRole === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              📋 All Roles
            </button>
            {Object.entries(roleConfig).map(([roleKey, config]) => (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedRole === roleKey
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                {config.icon} {config.title}
              </button>
            ))}
          </div>
        </div>

        {/* Role-Specific Stats */}
        <div className="space-y-8">
          {selectedRole === 'all' ? (
            // Show all roles
            Object.entries(allStats.roleStats).map(([roleKey, roleData]) => (
              <RoleStats
                key={roleKey}
                roleData={roleData}
                roleTitle={roleConfig[roleKey]?.title || roleKey}
                roleIcon={roleConfig[roleKey]?.icon || '📊'}
              />
            ))
          ) : (
            // Show selected role only
            allStats.roleStats[selectedRole] && (
              <RoleStats
                roleData={allStats.roleStats[selectedRole]}
                roleTitle={roleConfig[selectedRole]?.title || selectedRole}
                roleIcon={roleConfig[selectedRole]?.icon || '📊'}
              />
            )
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">
              🏆 Election Summary
            </h3>
            <p className="text-purple-300">
              {allStats.overall.votedUsers} out of {allStats.overall.totalUsers} eligible voters have participated
            </p>
            <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${allStats.overall.votingPercentage}%` }}
              />
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {Object.entries(allStats.roleStats).map(([roleKey, roleData]) => (
                <div key={roleKey} className="bg-white/5 p-3 rounded-lg">
                  <div className="text-2xl mb-1">{roleConfig[roleKey]?.icon || '📊'}</div>
                  <div className="text-sm text-purple-300">{roleConfig[roleKey]?.title || roleKey}</div>
                  <div className="font-bold text-white">{roleData.votingPercentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
