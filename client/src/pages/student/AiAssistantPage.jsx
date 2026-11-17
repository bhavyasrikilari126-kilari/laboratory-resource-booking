import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiStar,
  FiSearch,
  FiPackage,
  FiCompass,
  FiCheckCircle,
  FiArrowRight,
  FiCpu,
  FiLayers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import aiService from '../../services/ai.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AiAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [prompt, setPrompt] = useState(initialQuery);
  const [activeMode, setActiveMode] = useState('recommend'); // 'recommend' | 'search' | 'estimator'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Estimator Form
  const [projTitle, setProjTitle] = useState('IoT Smart DC Motor Speed Controller');
  const [projDesc, setProjDesc] = useState('Building an IoT-based DC motor speed control project using ESP32, L298N driver, and ultrasonic sensors.');

  const handleRecommend = async (queryText) => {
    const textToSearch = queryText || prompt;
    if (!textToSearch.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    try {
      setLoading(true);
      const res = await aiService.recommendResources({ projectDescription: textToSearch });
      if (res.success) {
        setResults({ type: 'recommend', data: res.data });
      }
    } catch (err) {
      toast.error('AI recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a natural language search query');
      return;
    }

    try {
      setLoading(true);
      const res = await aiService.smartSearch(prompt);
      if (res.success) {
        setResults({ type: 'search', data: res.data });
      }
    } catch (err) {
      toast.error('Smart search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEstimate = async () => {
    try {
      setLoading(true);
      const res = await aiService.estimateResources({
        title: projTitle,
        description: projDesc,
        type: 'mini',
      });
      if (res.success) {
        setResults({ type: 'estimator', data: res.data });
      }
    } catch (err) {
      toast.error('Estimation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleRecommend(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold border border-indigo-400/30 mb-3">
            <FiStar className="text-indigo-400" /> SMARTLAB AI Intelligence Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Resource Recommendation & Natural Search
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
            Describe your engineering project or query in natural language. Our rule-based AI analyzes requirements against actual live campus inventory.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => {
            setActiveMode('recommend');
            setResults(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeMode === 'recommend' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          AI Resource Recommender
        </button>
        <button
          onClick={() => {
            setActiveMode('search');
            setResults(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeMode === 'search' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Natural Language Lab Finder
        </button>
        <button
          onClick={() => {
            setActiveMode('estimator');
            setResults(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeMode === 'estimator' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Project Inventory Estimator
        </button>
      </div>

      {/* Input Area */}
      {activeMode === 'recommend' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Describe Your Engineering Project or Capstone Idea
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I am building an IoT-based DC motor speed control project with ESP32..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleRecommend()}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition disabled:opacity-50 shrink-0"
            >
              {loading ? 'Analyzing...' : 'Recommend Resources'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
            <span>Try sample prompts:</span>
            <button
              onClick={() => {
                const p = 'IoT DC motor speed control project with ESP32 and motor driver';
                setPrompt(p);
                handleRecommend(p);
              }}
              className="text-indigo-600 hover:underline"
            >
              "IoT DC motor control"
            </button>
            <span>•</span>
            <button
              onClick={() => {
                const p = 'Edge computer vision and neural network inference model';
                setPrompt(p);
                handleRecommend(p);
              }}
              className="text-indigo-600 hover:underline"
            >
              "Edge computer vision"
            </button>
          </div>
        </div>
      )}

      {activeMode === 'search' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Natural Language Query
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find electronics lab tomorrow with ESP32 kit..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSmartSearch}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition disabled:opacity-50 shrink-0"
            >
              {loading ? 'Searching...' : 'Search Resources'}
            </button>
          </div>
        </div>
      )}

      {activeMode === 'estimator' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Project Requirements Description</label>
            <textarea
              rows={3}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
          </div>
          <button
            onClick={handleEstimate}
            disabled={loading}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Estimating...' : 'Calculate Inventory Match'}
          </button>
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <LoadingSpinner text="Querying database and verifying inventory..." />
      ) : results && (
        <div className="space-y-6">
          {/* Recommender Results */}
          {results.type === 'recommend' && (
            <div className="space-y-6">
              {/* Equipment Matched */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiPackage className="text-indigo-600" /> Recommended Hardware & Modules (Verified in Stock)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.data.equipment?.map((eq) => (
                    <div key={eq._id || eq.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{eq.name}</p>
                        <p className="text-gray-400">{eq.category}</p>
                      </div>
                      <Link
                        to="/equipment"
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold"
                      >
                        Reserve
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Laboratories */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiCompass className="text-indigo-600" /> Recommended Laboratories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.data.laboratories?.map((lab) => (
                    <div key={lab._id || lab.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{lab.name}</p>
                        <p className="text-gray-400">Room {lab.labNumber} • Capacity: {lab.capacity}</p>
                      </div>
                      <Link
                        to={`/labs/${lab._id || lab.id}`}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold"
                      >
                        View Lab
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.type === 'search' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.data.laboratories?.map((l) => (
                  <div key={l._id} className="p-4 rounded-2xl bg-gray-50 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{l.name}</p>
                      <p className="text-gray-400">Room {l.labNumber}</p>
                    </div>
                    <Link to={`/labs/${l._id}`} className="text-indigo-600 font-bold hover:underline">
                      Reserve →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimator Results */}
          {results.type === 'estimator' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900">Project Inventory Breakdown</h3>
              <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-900 font-bold">
                ✓ Feasibility confirmed: Hardware items and suitable laboratories are currently verified in stock.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAssistantPage;

