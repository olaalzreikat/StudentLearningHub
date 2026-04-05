import { useState, useEffect } from 'react';
import { addActivity, checkAndAwardAchievements, getProgress } from '../utils/localStorage';
import styles from './Problems.module.css';

function Problems() {
    const [currentProblemSet, setCurrentProblemSet] = useState(null);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
    const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false);

    // Tools state
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
        const problemData = localStorage.getItem('currentProblemSet');
        if (problemData) {
            const problemSet = JSON.parse(problemData);
            setCurrentProblemSet(problemSet);

            const savedNotes = localStorage.getItem(`problems-notes-${problemSet.id}`);
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
        if (currentProblemSet) {
            localStorage.setItem(`problems-notes-${currentProblemSet.id}`, notes);
            alert(' Notes saved!');
        }
    };

    const checkAnswer = () => {
        if (!currentAnswer.trim()) {
            alert('Please enter an answer first!');
            return;
        }

        const problem = currentProblemSet.problems[currentProblemIndex];
        const isCorrect = currentAnswer.trim().toLowerCase() === problem.answer.toLowerCase();

        setHasSubmittedAnswer(true);

        if (isCorrect) {
            const newAnswers = { ...userAnswers };
            newAnswers[currentProblemIndex] = currentAnswer;
            setUserAnswers(newAnswers);
            setIsAnsweredCorrectly(true);
        }
    };

    const tryAgain = () => {
        setCurrentAnswer('');
        setHasSubmittedAnswer(false);
    };

    const nextProblem = () => {
        if (currentProblemIndex < currentProblemSet.problems.length - 1) {
            setCurrentProblemIndex(currentProblemIndex + 1);

            const nextAnswered = userAnswers[currentProblemIndex + 1] !== undefined;
            setCurrentAnswer(nextAnswered ? userAnswers[currentProblemIndex + 1] : '');
            setHasSubmittedAnswer(nextAnswered);
            setIsAnsweredCorrectly(nextAnswered);
        }
    };

    const previousProblem = () => {
        if (currentProblemIndex > 0) {
            setCurrentProblemIndex(currentProblemIndex - 1);

            const prevAnswered = userAnswers[currentProblemIndex - 1] !== undefined;
            setCurrentAnswer(prevAnswered ? userAnswers[currentProblemIndex - 1] : '');
            setHasSubmittedAnswer(prevAnswered);
            setIsAnsweredCorrectly(prevAnswered);
        }
    };

    const goToProblem = (index) => {
        setCurrentProblemIndex(index);

        const isAnswered = userAnswers[index] !== undefined;
        setCurrentAnswer(isAnswered ? userAnswers[index] : '');
        setHasSubmittedAnswer(isAnswered);
        setIsAnsweredCorrectly(isAnswered);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitProblems = () => {
        let correct = 0;
        const total = currentProblemSet.problems.length;

        currentProblemSet.problems.forEach((problem, index) => {
            const userAnswer = (userAnswers[index] || '').trim().toLowerCase();
            const correctAnswer = problem.answer.toLowerCase();

            if (userAnswer === correctAnswer) {
                correct++;
            }
        });

        const percentage = Math.round((correct / total) * 100);
        setScore(percentage);

        const progress = getProgress();
        if (percentage === 100 && !progress.completedProblems.includes(currentProblemSet.id)) {
            progress.completedProblems.push(currentProblemSet.id);
            localStorage.setItem('mathmaster-progress', JSON.stringify(progress));
        }

        addActivity('problems', currentProblemSet.title, currentProblemSet.topic);
        checkAndAwardAchievements();

        setShowResults(true);
    };

    if (!currentProblemSet) {
        return (
            <div className={styles.problemsPage}>
                <button className={styles.closeTabBtn} onClick={() => window.close()}>
                    ✕ Close Tab
                </button>
                <div className={styles.problemsContainer}>
                    <h2>Problems Not Found</h2>
                    <p>Unable to load problem data. Please return to the resources page and try again.</p>
                </div>
            </div>
        );
    }

    if (showResults) {
        let performanceMessage = '';
        if (score >= 90) {
            performanceMessage = ' Excellent! You\'ve mastered these problems!';
        } else if (score >= 70) {
            performanceMessage = ' Great job! You\'re doing well!';
        } else if (score >= 50) {
            performanceMessage = ' Good effort! Keep practicing!';
        } else {
            performanceMessage = ' Keep studying! You\'ll improve with practice!';
        }

        return (
            <div className={styles.problemsPage}>
                <button className={styles.closeTabBtn} onClick={() => window.close()}>
                    ✕ Close Tab
                </button>

                <div className={styles.problemsWrapper}>
                    <div className={styles.problemsHeader}>
                        <div className={styles.headerContent}>
                            <span className={styles.unitLabel}>
                                {currentProblemSet.topic?.toUpperCase() || 'PROBLEMS'} • PRACTICE
                            </span>
                            <h1 className={styles.problemsTitle}>Problems Complete! 🎉</h1>
                            <p className={styles.problemsObjective}>You've finished {currentProblemSet.title}</p>
                        </div>
                    </div>

                    <div className={styles.problemsLayout}>
                        <div className={styles.problemsMainContent}>
                            <div className={styles.resultsContainer}>
                                <div className={styles.scoreDisplay}>
                                    <div className={styles.scoreCircle}>
                                        <span className={styles.scoreNumber}>{score}%</span>
                                    </div>
                                    <h2 className={styles.scoreMessage}>{performanceMessage}</h2>
                                    <p className={styles.scoreDetails}>
                                        You got {Object.keys(userAnswers).length} out of {currentProblemSet.problems.length} problems correct
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

    const problem = currentProblemSet.problems[currentProblemIndex];
    const isCorrect = isAnsweredCorrectly;
    const isIncorrect = hasSubmittedAnswer && !isAnsweredCorrectly;

    return (
        <div className={styles.problemsPage}>
            <button className={styles.closeTabBtn} onClick={() => window.close()}>
                ✕ Close Tab
            </button>

            <div className={styles.problemsWrapper}>
                {/* HEADER SECTION */}
                <div className={styles.problemsHeader}>
                    <div className={styles.headerContent}>
                        <span className={styles.unitLabel}>
                            {currentProblemSet.topic?.toUpperCase() || 'PROBLEMS'} • PRACTICE
                        </span>

                        <h1 className={styles.problemsTitle}>{currentProblemSet.title}</h1>
                        <p className={styles.problemsObjective}>{currentProblemSet.description || 'Solve practice problems'}</p>

                        {/* Progress Bar */}
                        <div className={styles.problemsProgressBar}>
                            <div
                                className={styles.problemsProgressFill}
                                style={{ width: `${Math.round(((currentProblemIndex + 1) / currentProblemSet.problems.length) * 100)}%` }}
                            ></div>
                        </div>
                        <div className={styles.problemsProgressText}>
                            Problem {currentProblemIndex + 1} of {currentProblemSet.problems.length}
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className={styles.problemsLayout}>
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className={styles.problemsMainContent}>
                        <div className={styles.problemBox}>
                            <h2 className={styles.problemTitle}>
                                Problem {currentProblemIndex + 1}
                            </h2>
                            <p className={styles.problemText}>{problem.question}</p>

                            {/* Answer Input */}
                            <div className={styles.answerSection}>
                                <input
                                    type="text"
                                    className={`${styles.answerInput} ${
                                        isCorrect ? styles.correct : ''
                                    } ${
                                        isIncorrect ? styles.incorrect : ''
                                    }`}
                                    placeholder="Enter your answer"
                                    value={currentAnswer}
                                    onChange={(e) => !isAnsweredCorrectly && setCurrentAnswer(e.target.value)}
                                    disabled={isAnsweredCorrectly}
                                />
                                {isCorrect && (
                                    <span className={styles.answerBadge}>✓ Correct</span>
                                )}
                                {isIncorrect && (
                                    <span className={styles.answerBadgeWrong}>✗ Incorrect</span>
                                )}
                            </div>

                            {/* SHOW FEEDBACK AFTER SUBMISSION */}
                            {hasSubmittedAnswer && (
                                <div className={styles.explanationSection}>
                                    {isCorrect ? (
                                        <div className={styles.correctFeedback}>
                                            <div className={styles.feedbackHeader}>
                                                <span className={styles.feedbackIcon}></span>
                                                <h3>Correct!</h3>
                                            </div>
                                            {problem.explanation && (
                                                <div className={styles.workShown}>
                                                    <h4>Explanation:</h4>
                                                    <p>{problem.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={styles.incorrectFeedback}>
                                            <div className={styles.feedbackHeader}>
                                                <span className={styles.feedbackIcon}></span>
                                                <h3>Not quite right</h3>
                                            </div>
                                            <div className={styles.workShown}>
                                                <h4>Try again! Hint:</h4>
                                                <p>Check your calculation and make sure your answer is in the correct format.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className={styles.problemNavigation}>
                                <button
                                    className={`${styles.btnNav} ${styles.btnPrevious}`}
                                    onClick={previousProblem}
                                    disabled={currentProblemIndex === 0}
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
                                ) : currentProblemIndex === currentProblemSet.problems.length - 1 ? (
                                    <button
                                        className={`${styles.btnNav} ${styles.btnSubmit}`}
                                        onClick={submitProblems}
                                    >
                                        Submit All
                                    </button>
                                ) : (
                                    <button
                                        className={`${styles.btnNav} ${styles.btnNext}`}
                                        onClick={nextProblem}
                                    >
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className={styles.problemsSidebar}>
                        {/* Problem Navigator */}
                        <div className={styles.problemNavCard}>
                            <h3>Problems</h3>
                            <div className={styles.problemNav}>
                                {currentProblemSet.problems.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.problemNavItem} ${
                                            currentProblemIndex === index ? styles.active : ''
                                        } ${
                                            userAnswers[index] !== undefined ? styles.answered : ''
                                        }`}
                                        onClick={() => goToProblem(index)}
                                    >
                                        <span className={styles.problemNumber}>{index + 1}</span>
                                        {userAnswers[index] !== undefined && (
                                            <span className={styles.problemCheck}>✓</span>
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
                                <span></span>
                                Calculator
                            </button>

                            <button
                                className={styles.toolIconBtn}
                                onClick={() => setShowNotes(true)}
                                title="Notes"
                            >
                                <span></span>
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
                        <button onClick={() => setShowCalculator(false)}>✕</button>
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
                        <button onClick={() => setShowNotes(false)}>✕</button>
                    </div>
                    <div className={styles.toolBody}>
                        <textarea
                            className={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Take notes while solving problems..."
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

export default Problems;