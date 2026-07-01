// Quiz page — opens in a new tab, one question at a time with instant feedback
// Students must get each answer correct before moving on; wrong answers show a "Try Again" button
import { useState, useEffect } from 'react';
import { addActivity, checkAndAwardAchievements, getProgress, saveProgress, getQuizScoresKey } from '../utils/localStorage';
import styles from './Quiz.module.css';

function Quiz() {
    // Quiz data loaded from localStorage (set by Resources page before opening this tab)
    const [currentQuiz, setCurrentQuiz] = useState(null);

    // Tracks which question is showing and what the user has answered so far
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    // Per question answer state selection, submission, and correctness
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
    const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false);

    // Floating tools — same calculator and notes panels as the lesson page
    const [showCalculator, setShowCalculator] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [calculatorInput, setCalculatorInput] = useState('');
    const [calculatorResult, setCalculatorResult] = useState('');
    const [notes, setNotes] = useState('');
    const [calcPosition, setCalcPosition] = useState({ x: 100, y: 100 });
    const [notesPosition, setNotesPosition] = useState({ x: 150, y: 150 });
    const [isDragging, setIsDragging] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const quizData = localStorage.getItem('currentQuiz');
        if (quizData) {
            const quiz = JSON.parse(quizData);
            setCurrentQuiz(quiz);
            setUserAnswers(new Array(quiz.questionsData.length).fill(null));
            
            const savedNotes = localStorage.getItem(`quiz-notes-${quiz.id}`);
            if (savedNotes) setNotes(savedNotes);
        }
    }, []);

    // Dragging handlers
    const handleMouseDown = (e, type) => {
        setIsDragging(type);
        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging === 'calc') {
                setCalcPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            } else if (isDragging === 'notes') {
                setNotesPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const addToCalculator = (value) => {
        if (value === '=') {
            try {
                const result = eval(calculatorInput);
                setCalculatorResult(result);
            } catch {
                setCalculatorResult('Error');
            }
        } else {
            setCalculatorInput(calculatorInput + value);
            setCalculatorResult('');
        }
    };

    const clearCalculator = () => {
        setCalculatorInput('');
        setCalculatorResult('');
    };

    const saveNotes = () => {
        if (currentQuiz) {
            localStorage.setItem(`quiz-notes-${currentQuiz.id}`, notes);
            alert(' Notes saved!');
        }
    };

    const selectAnswer = (index) => {
        if (!isAnsweredCorrectly) {
            setSelectedAnswer(index);
            setHasSubmittedAnswer(false);
        }
    };

    const checkAnswer = () => {
        if (selectedAnswer === null) {
            alert('Please select an answer first!');
            return;
        }
        
        const question = currentQuiz.questionsData[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct;
        
        setHasSubmittedAnswer(true);
        
        if (isCorrect) {
            const newAnswers = [...userAnswers];
            newAnswers[currentQuestionIndex] = selectedAnswer;
            setUserAnswers(newAnswers);
            setIsAnsweredCorrectly(true);
        }
    };

    const tryAgain = () => {
        setSelectedAnswer(null);
        setHasSubmittedAnswer(false);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < currentQuiz.questionsData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            
            // Check if next question is already answered
            const nextAnswered = userAnswers[currentQuestionIndex + 1] !== null;
            setSelectedAnswer(nextAnswered ? userAnswers[currentQuestionIndex + 1] : null);
            setHasSubmittedAnswer(nextAnswered);
            setIsAnsweredCorrectly(nextAnswered);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            
            // Check if previous question is already answered
            const prevAnswered = userAnswers[currentQuestionIndex - 1] !== null;
            setSelectedAnswer(prevAnswered ? userAnswers[currentQuestionIndex - 1] : null);
            setHasSubmittedAnswer(prevAnswered);
            setIsAnsweredCorrectly(prevAnswered);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
        
        const isAnswered = userAnswers[index] !== null;
        setSelectedAnswer(isAnswered ? userAnswers[index] : null);
        setHasSubmittedAnswer(isAnswered);
        setIsAnsweredCorrectly(isAnswered);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitQuiz = () => {
        let correct = 0;
        currentQuiz.questionsData.forEach((q, index) => {
            if (userAnswers[index] === q.correct) {
                correct++;
            }
        });

        const percentage = Math.round((correct / currentQuiz.questionsData.length) * 100);
        setScore(percentage);

        const progress = getProgress();
        if (!progress.completedQuizzes.includes(currentQuiz.id)) {
            progress.completedQuizzes.push(currentQuiz.id);
            saveProgress(progress);
        }

        // Save score with timestamp for progress charts
        const scoresKey = getQuizScoresKey();
        const savedScores = localStorage.getItem(scoresKey);
        const scoresHistory = savedScores ? JSON.parse(savedScores) : [];
        scoresHistory.push({ quizId: currentQuiz.id, title: currentQuiz.title, topic: currentQuiz.topic, score: percentage, timestamp: new Date().toISOString() });
        localStorage.setItem(scoresKey, JSON.stringify(scoresHistory));

        addActivity('quiz', currentQuiz.title, currentQuiz.topic);
        checkAndAwardAchievements();

        setShowResults(true);
    };

    if (!currentQuiz) {
        return (
            <div className={styles.quizPage}>
                <button className={styles.closeTabBtn} onClick={() => window.close()}>
                    ✕ Close Tab
                </button>
                <div className={styles.quizContainer}>
                    <h2>Quiz Not Found</h2>
                    <p>Unable to load quiz data. Please return to the resources page and try again.</p>
                </div>
            </div>
        );
    }

    if (showResults) {
        let performanceMessage = '';
        if (score >= 90) {
            performanceMessage = 'Excellent! You\'ve mastered this topic!';
        } else if (score >= 70) {
            performanceMessage = ' Great job! You\'re doing well!';
        } else if (score >= 50) {
            performanceMessage = ' Good effort! Keep practicing!';
        } else {
            performanceMessage = ' Keep studying! You\'ll improve with practice!';
        }

        return (
            <div className={styles.quizPage}>
                <button className={styles.closeTabBtn} onClick={() => window.close()}>
                    ✕ Close Tab
                </button>
                
                <div className={styles.quizWrapper}>
                    <div className={styles.quizHeader}>
                        <div className={styles.headerContent}>
                            <span className={styles.unitLabel}>
                                {currentQuiz.topic?.toUpperCase() || 'QUIZ'} • ASSESSMENT
                            </span>
                            <h1 className={styles.quizTitle}>Quiz Complete! </h1>
                            <p className={styles.quizObjective}>You've finished {currentQuiz.title}</p>
                        </div>
                    </div>

                    <div className={styles.quizLayout}>
                        <div className={styles.quizMainContent}>
                            <div className={styles.resultsContainer}>
                                <div className={styles.scoreDisplay}>
                                    <div className={styles.scoreCircle}>
                                        <span className={styles.scoreNumber}>{score}%</span>
                                    </div>
                                    <h2 className={styles.scoreMessage}>{performanceMessage}</h2>
                                    <p className={styles.scoreDetails}>
                                        You got {userAnswers.filter((ans, i) => ans === currentQuiz.questionsData[i].correct).length} out of {currentQuiz.questionsData.length} questions correct
                                    </p>
                                </div>

                                <div className={styles.resultsActions}>
                                    <button className={styles.btnPrimary} onClick={() => window.close()}>
                                        Close Tab
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const question = currentQuiz.questionsData[currentQuestionIndex];
    const isCorrect = isAnsweredCorrectly;
    const isIncorrect = hasSubmittedAnswer && !isAnsweredCorrectly;

    return (
        <div className={styles.quizPage}>
            <button className={styles.closeTabBtn} onClick={() => window.close()}>
                ✕ Close Tab
            </button>

            <div className={styles.quizWrapper}>
                {/* HEADER SECTION */}
                <div className={styles.quizHeader}>
                    <div className={styles.headerContent}>
                        <span className={styles.unitLabel}>
                            {currentQuiz.topic?.toUpperCase() || 'QUIZ'} • ASSESSMENT
                        </span>
                        
                        <h1 className={styles.quizTitle}>{currentQuiz.title}</h1>
                        <p className={styles.quizObjective}>{currentQuiz.description || 'Test your knowledge'}</p>
                        
                        {/* Progress Bar */}
                        <div className={styles.quizProgressBar}>
                            <div 
                                className={styles.quizProgressFill} 
                                style={{ width: `${Math.round(((currentQuestionIndex + 1) / currentQuiz.questionsData.length) * 100)}%` }}
                            ></div>
                        </div>
                        <div className={styles.quizProgressText}>
                            Question {currentQuestionIndex + 1} of {currentQuiz.questionsData.length}
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className={styles.quizLayout}>
                    {/* LEFT COLUMN MAIN CONTENT */}
                    <div className={styles.quizMainContent}>
                        <div className={styles.questionBox}>
                            <h2 className={styles.questionTitle}>
                                Question {currentQuestionIndex + 1}
                            </h2>
                            <p className={styles.questionText}>{question.question}</p>

                            {/* Answer Options DONT SHOW CORRECT UNTIL THEY GET IT RIGHT */}
                            {/* role="radiogroup" makes screen readers announce this as a group of choices */}
                            <div className={styles.answersGrid} role="radiogroup" aria-label="Answer choices">
                                {question.options.map((option, index) => {
                                    const isSelected = selectedAnswer === index;
                                    const isCorrectAnswer = index === question.correct;

                                    // Only show correct styling if they've answered correctly
                                    const showAsCorrect = isAnsweredCorrectly && isCorrectAnswer;
                                    const showAsWrong = hasSubmittedAnswer && isSelected && !isCorrect;

                                    return (
                                        <div
                                            key={index}
                                            role="radio"
                                            aria-checked={isSelected}
                                            tabIndex={isAnsweredCorrectly ? -1 : 0}
                                            aria-disabled={isAnsweredCorrectly}
                                            className={`${styles.answerOption} ${
                                                isSelected && !hasSubmittedAnswer ? styles.selected : ''
                                            } ${
                                                showAsCorrect ? styles.correct : ''
                                            } ${
                                                showAsWrong ? styles.incorrect : ''
                                            } ${
                                                isAnsweredCorrectly ? styles.disabled : ''
                                            }`}
                                            onClick={() => selectAnswer(index)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectAnswer(index); } }}
                                        >
                                            <div className={styles.answerLetter}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <div className={styles.answerContent}>
                                                <span className={styles.answerText}>{option}</span>
                                                {showAsCorrect && (
                                                    <span className={styles.answerBadge}>
                                                         Correct
                                                    </span>
                                                )}
                                                {showAsWrong && (
                                                    <span className={styles.answerBadgeWrong}>
                                                         Incorrect
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* SHOW EXPLANATION ONLY FOR SELECTED ANSWER */}
                            {hasSubmittedAnswer && selectedAnswer !== null && question.explanations && question.explanations[selectedAnswer] && (
                                <div className={styles.explanationSection}>
                                    {isCorrect ? (
                                        <div className={styles.correctFeedback}>
                                            <div className={styles.feedbackHeader}>
                                                <span className={styles.feedbackIcon}></span>
                                                <h3>Correct!</h3>
                                            </div>
                                            <div className={styles.workShown}>
                                                <h4>Why this is correct:</h4>
                                                <p>{question.explanations[selectedAnswer]}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.incorrectFeedback}>
                                            <div className={styles.feedbackHeader}>
                                                <span className={styles.feedbackIcon}></span>
                                                <h3>Not quite right</h3>
                                            </div>
                                            <div className={styles.workShown}>
                                                <h4>Why this is incorrect:</h4>
                                                <p>{question.explanations[selectedAnswer]}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className={styles.questionNavigation}>
                                <button 
                                    className={`${styles.btnNav} ${styles.btnPrevious}`}
                                    onClick={previousQuestion}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    ← Previous
                                </button>

                                {!hasSubmittedAnswer ? (
                                    <button 
                                        className={`${styles.btnNav} ${styles.btnCheck}`}
                                        onClick={checkAnswer}
                                    >
                                        Check Answer
                                    </button>
                                ) : isIncorrect ? (
                                    <button 
                                        className={`${styles.btnNav} ${styles.btnTryAgain}`}
                                        onClick={tryAgain}
                                    >
                                        Try Again
                                    </button>
                                ) : currentQuestionIndex === currentQuiz.questionsData.length - 1 ? (
                                    <button 
                                        className={`${styles.btnNav} ${styles.btnSubmit}`}
                                        onClick={submitQuiz}
                                    >
                                        Submit Quiz
                                    </button>
                                ) : (
                                    <button 
                                        className={`${styles.btnNav} ${styles.btnNext}`}
                                        onClick={nextQuestion}
                                    >
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className={styles.quizSidebar}>
                        {/* Question Navigator */}
                        <div className={styles.questionNavCard}>
                            <h3>Questions</h3>
                            <div className={styles.questionNav}>
                                {currentQuiz.questionsData.map((_, index) => (
                                    <div
                                        key={index}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Go to question ${index + 1}${userAnswers[index] !== null ? ', answered' : ''}`}
                                        aria-current={currentQuestionIndex === index ? 'true' : undefined}
                                        className={`${styles.questionNavItem} ${
                                            currentQuestionIndex === index ? styles.active : ''
                                        } ${
                                            userAnswers[index] !== null ? styles.answered : ''
                                        }`}
                                        onClick={() => goToQuestion(index)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToQuestion(index); } }}
                                    >
                                        <span className={styles.questionNumber}>{index + 1}</span>
                                        {userAnswers[index] !== null && (
                                            <span className={styles.questionCheck} aria-hidden="true">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tools */}
                        <div className={styles.toolsCard}>
                            <h3>Tools</h3>
                            
                            <button
                                className={styles.toolIconBtn}
                                onClick={() => setShowCalculator(true)}
                                title="Calculator"
                            >
                                <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                    <rect x="6" y="6" width="4" height="2" rx="0.5" fill="currentColor"/>
                                    <rect x="12" y="6" width="4" height="2" rx="0.5" fill="currentColor"/>
                                    <rect x="6" y="10" width="4" height="2" rx="0.5" fill="currentColor"/>
                                    <rect x="12" y="10" width="4" height="2" rx="0.5" fill="currentColor"/>
                                    <rect x="6" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
                                    <rect x="12" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
                                </svg>
                                Calculator
                            </button>

                            <button
                                className={styles.toolIconBtn}
                                onClick={() => setShowNotes(true)}
                                title="Notes"
                            >
                                <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                    <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <line x1="7" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <line x1="7" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculator Tool */}
            {showCalculator && (
                <div 
                    className={styles.floatingTool}
                    style={{ left: calcPosition.x, top: calcPosition.y }}
                >
                    <div
                        className={styles.toolHeader}
                        onMouseDown={(e) => handleMouseDown(e, 'calc')}
                    >
                        <span> Calculator</span>
                        <button onClick={() => setShowCalculator(false)} aria-label="Close calculator">✕</button>
                    </div>
                    <div className={styles.toolBody}>
                        <input
                            type="text"
                            className={styles.calcDisplay}
                            value={calculatorInput}
                            onChange={(e) => setCalculatorInput(e.target.value)}
                            placeholder="0"
                        />
                        {calculatorResult && (
                            <div className={styles.calcResult}>= {calculatorResult}</div>
                        )}
                        <div className={styles.calcButtons}>
                            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(btn => (
                                <button
                                    key={btn}
                                    className={styles.calcBtn}
                                    onClick={() => addToCalculator(btn)}
                                >
                                    {btn}
                                </button>
                            ))}
                            <button className={`${styles.calcBtn} ${styles.clear}`} onClick={clearCalculator}>C</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Tool */}
            {showNotes && (
                <div 
                    className={styles.floatingTool}
                    style={{ left: notesPosition.x, top: notesPosition.y }}
                >
                    <div
                        className={styles.toolHeader}
                        onMouseDown={(e) => handleMouseDown(e, 'notes')}
                    >
                        <span> Notes</span>
                        <button onClick={() => setShowNotes(false)} aria-label="Close notes">✕</button>
                    </div>
                    <div className={styles.toolBody}>
                        <textarea
                            className={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Take notes while you learn..."
                            rows="10"
                        />
                        <button className={styles.saveNotesBtn} onClick={saveNotes}>
                             Save Notes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Quiz;