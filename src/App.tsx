import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { Volume2, VolumeX, Trophy, RotateCcw, Share2, X, Info, AlertCircle, Check, Flame } from 'lucide-react';
import { FACTS, Fact, Difficulty } from './constants';

type GameState = 'START' | 'FLASH_INTRO' | 'PLAYING' | 'GAMEOVER';
type RoundType = 'NORMAL' | 'TRICK' | 'CHAOS' | 'SPEED' | 'PULSE';

const NORMAL_TIMER = 8000;
const SPEED_TIMER = 3000;
const PULSE_TIMER = 5000;

const FLASH_PHRASES = [
  "YOU WILL FAIL.",
  "MOST PEOPLE SCORE BELOW 7.",
  "LET'S SEE YOU."
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [flashIndex, setFlashIndex] = useState(0);
  const [memoryFact, setMemoryFact] = useState<Fact | null>(null);
  const [isRepeatRound, setIsRepeatRound] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>('NORMAL');
  const [timerDuration, setTimerDuration] = useState(NORMAL_TIMER);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('realOrFakeBestScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'CORRECT' | 'WRONG', message: string } | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const [usedFactIndices, setUsedFactIndices] = useState<Set<number>>(new Set());
  const [challengeScore, setChallengeScore] = useState<number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challenge = params.get('challenge');
    if (challenge) {
      setChallengeScore(parseInt(challenge, 10));
    }
  }, []);

  // Score spring for count-up animation
  const springScore = useSpring(0, { stiffness: 100, damping: 20 });
  useEffect(() => {
    springScore.set(currentScore);
  }, [currentScore, springScore]);

  // Sound generator
  const playSound = useCallback((type: 'click' | 'correct' | 'wrong' | 'tick') => {
    if (!isSoundEnabled) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(110, now + 0.3); // A2
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }, [isSoundEnabled]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getNextFact = useCallback((score: number, usedIndices: Set<number>) => {
    let pool;
    if (score < 2) {
      // First two questions are always easy
      pool = FACTS.map((f, i) => ({ ...f, index: i }))
        .filter(f => f.difficulty === 'easy' && !usedIndices.has(f.index));
    } else {
      // After that, shuffle everything
      pool = FACTS.map((f, i) => ({ ...f, index: i }))
        .filter(f => !usedIndices.has(f.index));
    }

    if (pool.length === 0) {
      // Reset if we run out of questions
      setUsedFactIndices(new Set());
      return getNextFact(score, new Set());
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    setUsedFactIndices(prev => new Set(prev).add(selected.index));
    return selected;
  }, []);

  const handleAnswer = useCallback((answer: boolean | null) => {
    if (gameState !== 'PLAYING' || feedback) return;
    
    stopTimer();

    // 100ms delay before showing result for "Micro Polish"
    setTimeout(() => {
      const isCorrect = answer !== null && answer === currentFact?.isReal;

      if (isCorrect) {
        playSound('correct');
        setFeedback({ type: 'CORRECT', message: 'CORRECT' });
        setLastAnswerCorrect(answer);
        
        const nextScore = currentScore + 1;
        const nextStreak = streak + 1;
        setCurrentScore(nextScore);
        setStreak(nextStreak);

        // Memory Effect: Store this fact to repeat later
        if (nextScore % 3 === 1) {
          setMemoryFact(currentFact);
        }

        if (nextScore > bestScore) {
          setBestScore(nextScore);
          localStorage.setItem('realOrFakeBestScore', nextScore.toString());
        }

        setTimeout(() => {
          setFeedback(null);
          setLastAnswerCorrect(null);
          setTimeLeft(100);
          
          // Determine next round type
          const rand = Math.random();
          let nextRound: RoundType = 'NORMAL';
          let isRepeat = false;

          // Memory Effect: Repeat a fact 2 turns later
          if (nextScore % 3 === 0 && memoryFact) {
            isRepeat = true;
          }

          if (nextScore > 3) {
            if ((nextScore + 1) % 6 === 0) nextRound = 'PULSE'; // Speed Variation
            else if (rand < 0.1) nextRound = 'SPEED';
            else if (rand < 0.2) nextRound = 'TRICK';
            else if (rand < 0.25) nextRound = 'CHAOS';
          }
          
          setRoundType(nextRound);
          setIsRepeatRound(isRepeat);
          setTimerDuration(
            nextRound === 'SPEED' ? SPEED_TIMER : 
            nextRound === 'PULSE' ? PULSE_TIMER : 
            NORMAL_TIMER
          );

          if (isRepeat && memoryFact) {
            setCurrentFact(memoryFact);
          } else {
            setCurrentFact(getNextFact(nextScore, usedFactIndices));
          }
          
          playSound('tick'); // New question tick
        }, 600);
      } else {
        playSound('wrong');
        const wrongMessages = [
          "THAT LOOKED REAL. ALMOST GOT YOU.",
          "THIS IS WHERE MOST PEOPLE FAIL.",
          "WRONG",
          "SO CLOSE."
        ];
        setFeedback({ 
          type: 'WRONG', 
          message: wrongMessages[Math.floor(Math.random() * wrongMessages.length)] 
        });
        setLastAnswerCorrect(answer);
        setStreak(0);
        setTimeout(() => {
          setGameState('GAMEOVER');
        }, 1500);
      }
    }, 100);
  }, [gameState, feedback, currentFact, currentScore, streak, bestScore, playSound, stopTimer, getNextFact, usedFactIndices, memoryFact]);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = performance.now();
    
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / timerDuration) * 100);
      
      // Play tick sound when time is low (last 3 seconds)
      const secondsLeft = Math.ceil((timerDuration - elapsed) / 1000);
      const prevSecondsLeft = Math.ceil((timerDuration - (elapsed - 16)) / 1000); // approx 1 frame ago
      
      if (secondsLeft <= 3 && secondsLeft !== prevSecondsLeft && secondsLeft > 0) {
        playSound('tick');
      }

      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        handleAnswer(null); // Timeout
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };
    
    timerRef.current = requestAnimationFrame(tick);
  }, [handleAnswer, stopTimer, timerDuration, playSound]);

  // Effect to trigger timer when currentFact changes
  useEffect(() => {
    if (gameState === 'PLAYING' && currentFact && !feedback) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentFact, gameState, feedback, startTimer, stopTimer]);

  const startGame = () => {
    playSound('click');
    const randomIndex = Math.floor(Math.random() * FLASH_PHRASES.length);
    setFlashIndex(randomIndex);
    setGameState('FLASH_INTRO');
    setCurrentScore(0);
    setStreak(0);
    setMemoryFact(null);
    setIsRepeatRound(false);
  };

  // Flash Intro Effect
  useEffect(() => {
    if (gameState === 'FLASH_INTRO') {
      const timer = setTimeout(() => {
        const firstFact = getNextFact(0, new Set());
        setCurrentFact(firstFact);
        setRoundType('NORMAL');
        setTimerDuration(NORMAL_TIMER);
        setFeedback(null);
        setLastAnswerCorrect(null);
        setGameState('PLAYING');
        setTimeLeft(100);
        setUsedFactIndices(new Set([FACTS.findIndex(f => f.text === firstFact.text)]));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, getNextFact]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'START' && e.key === 'Enter') {
        startGame();
      } else if (gameState === 'PLAYING') {
        if (e.key === 'ArrowLeft') handleAnswer(true);
        if (e.key === 'ArrowRight') handleAnswer(false);
      } else if (gameState === 'GAMEOVER' && e.key === 'Enter') {
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleAnswer]);

  const getNearMissMessage = () => {
    if (currentScore === 0) return "Give it another shot!";
    if (currentScore === bestScore - 1 && bestScore > 1) return "You were 1 away from your best!";
    if (currentScore < 10 && currentScore >= 7) return `So close to 10!`;
    if (currentScore < 20 && currentScore >= 17) return `So close to 20!`;
    if (currentScore < bestScore) return `Can you beat ${bestScore}?`;
    return "New Personal Best! Can you go further?";
  };

  const getStreakText = (s: number) => {
    if (s >= 10) return "UNSTOPPABLE";
    if (s >= 5) return "SHARP";
    if (s >= 3) return "NICE";
    return "";
  };

  const shareScore = () => {
    playSound('click');
    const text = `I scored ${currentScore} in REAL OR FAKE. Bet you can't beat it.`;
    if (navigator.share) {
      navigator.share({
        title: 'REAL OR FAKE',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const challengeFriend = () => {
    playSound('click');
    const baseUrl = window.location.origin + window.location.pathname;
    const challengeUrl = `${baseUrl}?challenge=${currentScore}`;
    const text = `I scored ${currentScore} in REAL OR FAKE. I bet you can't beat me. Try here: ${challengeUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'REAL OR FAKE CHALLENGE',
        text: text,
        url: challengeUrl,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Challenge link copied to clipboard!');
    }
  };

  return (
    <motion.div 
      animate={{
        backgroundColor: ["#0a0a0a", "#111111", "#090909", "#0a0a0a"]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="min-h-screen text-white font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col relative"
    >
      {/* Background Texture & Ambient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        
        <motion.div
          animate={{
            x: ["-5%", "5%", "-2%", "-5%"],
            y: ["-5%", "2%", "5%", "-5%"],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-white/[0.02] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: ["5%", "-5%", "2%", "5%"],
            y: ["5%", "-2%", "-5%", "5%"],
            scale: [1, 0.9, 1.05, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-white/[0.015] rounded-full blur-[120px]"
        />
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 pointer-events-none ${
              feedback.type === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Timer Bar */}
      {gameState === 'PLAYING' && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-white/5">
          <div
            style={{ 
              width: `${timeLeft}%`,
              backgroundColor: timeLeft < 20 ? "#ef4444" : timeLeft < 40 ? "#f97316" : "#ffffff",
              transition: 'width 0.1s linear, background-color 0.3s ease'
            }}
            className="h-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
        </div>
      )}

      {/* Flash Intro */}
      <AnimatePresence>
        {gameState === 'FLASH_INTRO' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <motion.div
              key={flashIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-3xl md:text-5xl font-black tracking-tighter text-white text-center px-6"
            >
              {FLASH_PHRASES[flashIndex]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      {gameState === 'START' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10"
        >
          <motion.img 
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            src="/logo-transparent.png" 
            alt="Real or Fake Logo" 
            className="w-32 h-32 md:w-48 md:h-48 mb-6 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-4"
          >
            REAL OR FAKE
          </motion.h1>
          
          {challengeScore !== null && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mb-2">Challenge Received</p>
              <p className="text-3xl font-black tracking-tighter">BEAT {challengeScore}</p>
            </motion.div>
          )}

          <p className="text-xl md:text-2xl text-gray-400 mb-12 font-medium tracking-tight">
            Separate fact from fiction.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="group relative px-12 py-6 bg-white text-black font-bold text-2xl tracking-widest transition-all"
          >
            START GAME
          </motion.button>

          {bestScore > 0 && (
            <div className="mt-12 flex items-center gap-2 text-gray-500">
              <Trophy size={20} />
              <span className="text-lg font-mono tracking-wider uppercase">Best: {bestScore}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Game Screen */}
      {gameState === 'PLAYING' && (
        <motion.div 
          animate={{
            x: timeLeft < 15 ? [0, -1, 1, -1, 1, 0] : 0,
            y: timeLeft < 15 ? [0, 1, -1, 1, -1, 0] : 0,
          }}
          transition={{ duration: 0.1, repeat: timeLeft < 15 ? Infinity : 0 }}
          className="flex-1 flex flex-col z-10"
        >
          {/* Top Bar */}
          <div className="p-6 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">Score</span>
              <motion.span 
                className="text-4xl font-black font-mono"
              >
                {currentScore}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-8">
              {streak >= 3 && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={`streak-${streak}`}
                  className="flex flex-col items-center text-orange-500"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Streak</span>
                  <div className="flex items-center gap-1">
                    <Flame size={20} fill="currentColor" />
                    <span className="text-2xl font-black font-mono">{streak}</span>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col items-end">
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">Best</span>
                <span className="text-2xl font-black font-mono text-gray-400">{bestScore}</span>
              </div>
              <button 
                onClick={() => {
                  playSound('click');
                  setIsSoundEnabled(!isSoundEnabled);
                }}
                className="p-2 hover:bg-white/10 transition-colors rounded-full"
              >
                {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-24 text-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFact?.text}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: feedback?.type === 'WRONG' ? [0, -10, 10, -10, 10, 0] : 0
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="max-w-5xl"
              >
                {isRepeatRound && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 inline-block px-3 py-1 bg-white text-black font-black text-[10px] tracking-[0.2em] rounded-sm"
                  >
                    YOU SAW THIS BEFORE
                  </motion.div>
                )}
                {roundType !== 'NORMAL' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 inline-block px-4 py-1 font-black tracking-[0.3em] text-xs border ${
                      roundType === 'SPEED' ? 'border-yellow-500 text-yellow-500' :
                      roundType === 'TRICK' ? 'border-purple-500 text-purple-500' :
                      roundType === 'PULSE' ? 'border-blue-500 text-blue-500' :
                      'border-orange-500 text-orange-500'
                    }`}
                  >
                    {roundType === 'SPEED' ? '⚡ SPEED ROUND' : 
                     roundType === 'TRICK' ? '🟡 TRICK ROUND' : 
                     roundType === 'PULSE' ? '🌀 SPEED PULSE' :
                     '🔴 50/50 CHAOS'}
                  </motion.div>
                )}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  {currentFact?.text}
                </h2>
                
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`mt-8 font-black text-xl md:text-3xl tracking-widest ${
                        feedback.type === 'CORRECT' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {feedback.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Actions */}
          <div className="grid grid-cols-2 h-48 md:h-64 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(true)}
              disabled={!!feedback}
              className={`flex flex-col items-center justify-center transition-all group ${
                feedback?.type === 'CORRECT' && lastAnswerCorrect === true ? 'bg-green-500 text-black' : 
                feedback?.type === 'WRONG' && lastAnswerCorrect === true ? 'bg-red-500 text-black' :
                'hover:text-white'
              }`}
            >
              <span className="text-xs uppercase tracking-[0.3em] mb-2 font-bold opacity-30 group-hover:opacity-100">← REAL</span>
              <span className="text-4xl md:text-6xl font-black tracking-tighter">REAL</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(false)}
              disabled={!!feedback}
              className={`flex flex-col items-center justify-center transition-all group border-l border-white/10 ${
                feedback?.type === 'CORRECT' && lastAnswerCorrect === false ? 'bg-green-500 text-black' : 
                feedback?.type === 'WRONG' && lastAnswerCorrect === false ? 'bg-red-500 text-black' :
                'hover:text-white'
              }`}
            >
              <span className="text-xs uppercase tracking-[0.3em] mb-2 font-bold opacity-30 group-hover:opacity-100">FAKE →</span>
              <span className="text-4xl md:text-6xl font-black tracking-tighter">FAKE</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-red-950/10 z-10 overflow-y-auto"
        >
          <div className="mb-8 mt-8">
            <h2 className="text-2xl uppercase tracking-[0.4em] text-red-500 font-black mb-2">Game Over</h2>
            <p className="text-white/60 font-bold tracking-widest mb-6 uppercase text-sm">
              {getNearMissMessage()}
            </p>
            <div className="flex flex-col items-center mb-8">
              <span className="text-8xl md:text-9xl font-black font-mono mb-2">{currentScore}</span>
              <span className="text-gray-500 uppercase tracking-widest font-bold text-xs">You Scored</span>
            </div>
          </div>

          {currentFact && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl w-full mb-12 overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                <div className={`p-5 flex items-center justify-between ${currentFact.isReal ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${currentFact.isReal ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                      {currentFact.isReal ? <Check size={24} strokeWidth={4} /> : <X size={24} strokeWidth={4} />}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">The Truth</span>
                      <span className={`text-2xl font-black uppercase tracking-widest ${currentFact.isReal ? 'text-green-500' : 'text-red-500'}`}>
                        {currentFact.isReal ? "REAL" : "FAKE"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 text-left border-t border-white/10">
                  <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 mb-2 block">Statement</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      "{currentFact.text}"
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-4 w-full max-w-md mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-white text-black font-bold text-xl tracking-widest transition-transform"
            >
              <RotateCcw size={24} />
              PLAY AGAIN
            </motion.button>
            
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={challengeFriend}
                className="flex-1 flex items-center justify-center gap-3 px-4 py-6 bg-orange-600 text-white font-bold text-lg tracking-widest transition-all"
              >
                CHALLENGE
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareScore}
                className="flex-1 flex items-center justify-center gap-3 px-4 py-6 border border-white text-white font-bold text-lg tracking-widest transition-all"
              >
                <Share2 size={24} />
                SHARE
              </motion.button>
            </div>
          </div>

          <div className="pb-8 flex items-center gap-2 text-gray-600">
            <Trophy size={16} />
            <span className="text-sm font-mono tracking-widest uppercase">Personal Best: {bestScore}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
