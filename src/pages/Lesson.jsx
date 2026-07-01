// Lesson page opens in a new tab, walks the student through a 5 section lesson
// Sections: Warm Up, Instruction, Guided Practice, Independent Practice, Exit Ticket
import { useState, useEffect } from 'react';
import { addActivity, checkAndAwardAchievements, getProgress, saveProgress } from '../utils/localStorage';
import styles from './Lesson.module.css';

function Lesson() {
    // Lesson data loaded from localStorage (set by Resources page before opening this tab)
    const [currentLesson, setCurrentLesson] = useState(null);

    // Which of the 5 sections the student is currently on, and which ones they've finished
    const [currentSection, setCurrentSection] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completedSections, setCompletedSections] = useState([]);

    // Floating tools state — calculator and notes panel
    const [notes, setNotes] = useState('');
    const [showCalculator, setShowCalculator] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [calculatorInput, setCalculatorInput] = useState('');
    const [calculatorResult, setCalculatorResult] = useState('');

    // Drag state for the floating calculator and notes panels
    const [calcPosition, setCalcPosition] = useState({ x: 100, y: 100 });
    const [notesPosition, setNotesPosition] = useState({ x: 150, y: 150 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dragTarget, setDragTarget] = useState(null);

    useEffect(() => {
        const lessonData = localStorage.getItem('currentLesson');
        if (lessonData) {
            const lesson = JSON.parse(lessonData);
            setCurrentLesson(lesson);

            const progress = getProgress();
            if (progress.completedLessons && progress.completedLessons.includes(lesson.id)) {
                setIsCompleted(true);
            }

            const savedNotes = localStorage.getItem(`notes-${lesson.id}`);
            if (savedNotes) setNotes(savedNotes);
        }
    }, []);

    const handleMouseDown = (e, target) => {
        setIsDragging(true);
        setDragTarget(target);
        const position = target === 'calc' ? calcPosition : notesPosition;
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging && dragTarget) {
            const newPosition = {
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            };
            if (dragTarget === 'calc') {
                setCalcPosition(newPosition);
            } else {
                setNotesPosition(newPosition);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragTarget(null);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragTarget, dragOffset]);

    const markSectionComplete = () => {
        if (!completedSections.includes(currentSection)) {
            setCompletedSections([...completedSections, currentSection]);
        }
    };

    const nextSection = () => {
        markSectionComplete();
        if (sections && currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const previousSection = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToSection = (index) => {
        setCurrentSection(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const markComplete = () => {
        if (isCompleted || !currentLesson) return;

        console.log('Marking lesson complete:', currentLesson.id);

        const progress = getProgress();
        
        if (!progress.completedLessons) {
            progress.completedLessons = [];
        }
        
        if (!progress.completedLessons.includes(currentLesson.id)) {
            progress.completedLessons.push(currentLesson.id);

            saveProgress(progress);

            addActivity('lesson', currentLesson.title, currentLesson.topic);
            checkAndAwardAchievements();
        }

        setIsCompleted(true);
    };

    const resetCompletion = () => {
        if (!currentLesson) return;
        
        const progress = getProgress();
        if (progress.completedLessons) {
            progress.completedLessons = progress.completedLessons.filter(id => id !== currentLesson.id);
            saveProgress(progress);
            setIsCompleted(false);
            alert('Reset! You can now mark this lesson complete again.');
        }
    };

    const saveNotes = () => {
        if (currentLesson) {
            localStorage.setItem(`notes-${currentLesson.id}`, notes);
            alert(' Notes saved!');
        }
    };

    const handleCalculate = () => {
        try {
            const sanitized = calculatorInput.replace(/[^0-9+\-*/().]/g, '');
            const result = Function('"use strict"; return (' + sanitized + ')')();
            setCalculatorResult(result.toString());
        } catch (error) {
            setCalculatorResult('Error');
        }
    };

    const addToCalculator = (value) => {
        if (value === '=') {
            handleCalculate();
        } else {
            setCalculatorInput(prev => prev + value);
        }
    };

    const clearCalculator = () => {
        setCalculatorInput('');
        setCalculatorResult('');
    };

    const downloadPDF = () => {
        if (!currentLesson) return;
        
        alert(`Study Guide\n\nA comprehensive study guide for "${currentLesson.title}" is available in the Resources section under Downloadable Materials.`)
    };

    if (!currentLesson) {
        return (
            <div className={styles.lessonPage}>
                <button className={styles.closeTabBtn} onClick={() => window.close()}>
                    ✕ Close Tab
                </button>
                <div className="lesson-container">
                    <h2>Lesson Not Found</h2>
                    <p>Unable to load lesson data. Please return to the resources page and try again.</p>
                </div>
            </div>
        );
    }

    const sections = generateLessonSections(currentLesson, styles);

    return (
        <div className={styles.lessonPage}>
            <button className={styles.closeTabBtn} onClick={() => window.close()}>
                ✕ Close Tab
            </button>

            <div className={styles.lessonWrapper}>
                {/* HEADER SECTION Full Width Purple Background */}
                <div className={styles.lessonHeader}>
                    <div className={styles.headerContent}>
                        {currentLesson.topic && (
                            <span className={styles.topicPill}>{currentLesson.topic}</span>
                        )}
                        <h1 className={styles.lessonTitle}>{currentLesson.title}</h1>
                        <p className={styles.lessonObjective}>{currentLesson.description}</p>
                        
                        {/* Progress Bar */}
                        <div className={styles.lessonProgressBar}>
                            <div 
                                className={styles.lessonProgressFill} 
                                style={{ width: `${Math.round((completedSections.length / sections.length) * 100)}%` }}
                            ></div>
                        </div>
                        <div className={styles.lessonProgressText}>
                            {completedSections.length} of {sections.length} sections completed ({Math.round((completedSections.length / sections.length) * 100)}%)
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION Light Gray Background with 3 Columns */}
                <div className={styles.lessonLayout}>
                    {/* LEFT SIDEBAR Table of Contents */}
                    <div className={styles.lessonSidebar}>
                        <h3>Table of contents</h3>
                        <div className={styles.tocList}>
                            {sections.map((section, index) => (
                                <div
                                    key={index}
                                    className={`${styles.tocItem} ${currentSection === index ? styles.active : ''} ${completedSections.includes(index) ? styles.completed : ''}`}
                                    onClick={() => goToSection(index)}
                                >
                                    <span className={styles.tocNumber}>{completedSections.includes(index) ? '✓' : index + 1}</span>
                                    <span className={styles.tocTitle}>{section.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CONTENT Center Column */}
                    <div className={styles.lessonMain}>
                        <div className={styles.materialBox}>
                            <div className="section-content">
                                <h2 className={styles.sectionTitle}>{sections[currentSection].title}</h2>
                                <div className={styles.sectionBody}>
                                    {sections[currentSection].content}
                                </div>
                            </div>

                            <div className={styles.sectionNavigation}>
                                <button 
                                    className={`${styles.btnNav} ${styles.btnPrevious}`}
                                    onClick={previousSection}
                                    disabled={currentSection === 0}
                                >
                                    ← Previous
                                </button>

                                {currentSection === sections.length - 1 ? (
                                    <button 
                                        className={`${styles.btnNav} ${styles.btnComplete} ${isCompleted ? styles.completed : ''}`}
                                        onClick={markComplete}
                                        disabled={isCompleted}
                                    >
                                        {isCompleted ? '✓ Lesson Completed' : 'Mark Lesson Complete'}
                                    </button>
                                ) : (
                                    <button 
                                        className={`${styles.btnNav} ${styles.btnNext}`}
                                        onClick={nextSection}
                                    >
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR Tools */}
                    <div className={styles.lessonSidebar}>
                        <h3>Tools</h3>
                        
                        <button
                            className={styles.toolIconBtn}
                            onClick={() => setShowCalculator(true)}
                            title="Calculator"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="2" width="16" height="20" rx="2"/>
                                <line x1="8" y1="6" x2="16" y2="6"/>
                                <line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/>
                                <line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/>
                                <line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>
                            </svg>
                            Calculator
                        </button>

                        <button
                            className={styles.toolIconBtn}
                            onClick={() => setShowNotes(true)}
                            title="Notes"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            Notes
                        </button>

                        <button
                            className={styles.toolIconBtn}
                            onClick={downloadPDF}
                            title="Download Study Guide"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                <line x1="12" y1="7" x2="16" y2="7"/>
                                <line x1="12" y1="11" x2="16" y2="11"/>
                            </svg>
                            Study Guide
                        </button>

                      
                    </div>
                </div>
            </div>

            {/* FLOATING CALCULATOR */}
            {showCalculator && (
                <div 
                    className={`${styles.floatingTool} ${styles.calculatorPopup}`}
                    style={{ left: calcPosition.x, top: calcPosition.y }}
                >
                    <div 
                        className={styles.toolHeader}
                        onMouseDown={(e) => handleMouseDown(e, 'calc')}
                    >
                        <span>Calculator</span>
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

            {/* FLOATING NOTES */}
            {showNotes && (
                <div 
                    className={`${styles.floatingTool} ${styles.notesPopup}`}
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
                            placeholder="Take notes while you learn..."
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

// Generates the 5 lesson section objects (title + JSX content) from the lesson data
function generateLessonSections(lesson, styles) {
    return [
        // SECTION 1: WARM UP
        {
            title: "Warm-Up",
            content: (
                <div>
                    <div className={styles.objectiveBox}>
                        <h3>Objective</h3>
                        <p className={styles.objective}>
                            I can {lesson.content.introduction.toLowerCase()}
                        </p>
                    </div>

                    <div className={styles.warmUpBox}>
                        <h3>Warm-Up Question</h3>
                        <p>{lesson.content.examples[0]?.problem || "What do you already know about " + lesson.title + "?"}</p>
                    </div>
                </div>
            ),
            keyTakeaways: ["Understand the goal", "Activate prior knowledge"]
        },

        // SECTION 2: INSTRUCTION
        {
            title: "Instruction",
            content: (
                <div>
                    <div className={styles.instructionBox}>
                        <h3>What You Need to Know</h3>
                        
                        {lesson.content.keyPoints.map((point, i) => (
                            <div key={i} className={styles.conceptItem}>
                                <p className={styles.conceptText}>
                                    <strong>{i + 1}.</strong> {point}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.examplesBox}>
                        <h3>Examples</h3>
                        {lesson.content.examples.slice(0, 2).map((example, i) => (
                            <div key={i} className={styles.simpleExample}>
                                <p className={styles.exampleProblem}>{example.problem}</p>
                                <p className={styles.exampleSolution}>→ {example.solution}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
            keyTakeaways: lesson.content.keyPoints.slice(0, 2)
        },

        // SECTION 3: GUIDED PRACTICE
        {
            title: "Guided Practice",
            content: (
                <div>
                    <div className={styles.guidedBox}>
                        <h3>Let's Try Together</h3>
                        <p>Work through these problems. Click to see the steps:</p>
                        
                        {lesson.content.examples.map((example, i) => (
                            <div key={i} className={styles.guidedProblem}>
                                <p className={styles.problemNumber}>Problem {i + 1}</p>
                                <p className={styles.problemText}>{example.problem}</p>
                                
                                <details className={styles.stepsDropdown}>
                                    <summary>Show Steps</summary>
                                    <div className={styles.stepsList}>
                                        {example.steps?.map((step, j) => (
                                            <p key={j} className={styles.step}>
                                                <strong>Step {j + 1}:</strong> {step}
                                            </p>
                                        ))}
                                        <p className={styles.answer}>
                                            <strong>Answer:</strong> {example.solution}
                                        </p>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            ),
            keyTakeaways: ["Follow the steps", "Learn the process", "Practice together"]
        },

        // SECTION 4: INDEPENDENT PRACTICE
        {
            title: "Independent Practice",
            content: (
                <div>
                    <div className={styles.practiceBox}>
                        <h3>Your Turn</h3>
                        <p>Try these on your own. <strong>Need help? Use the hints!</strong></p>
                        
                        {lesson.content.examples.map((example, i) => (
                            <div key={i} className={styles.practiceProblemBox}>
                                <p className={styles.practiceNum}>{i + 1}.</p>
                                <p className={styles.practiceQuestion}>{example.problem}</p>
                                
                                <div className={styles.helpSection}>
                                    <details className={styles.hintDropdown}>
                                        <summary> Hint 1: What to remember</summary>
                                        <div className={styles.hintContent}>
                                            <p><strong>Key concept:</strong> {lesson.content.keyPoints[Math.min(i, lesson.content.keyPoints.length - 1)]}</p>
                                        </div>
                                    </details>

                                    <details className={styles.hintDropdown}>
                                        <summary> Hint 2: How to start</summary>
                                        <div className={styles.hintContent}>
                                            <p>{example.steps?.[0] || "Break the problem into smaller parts"}</p>
                                        </div>
                                    </details>

                                    <details className={styles.answerDropdown}>
                                        <summary> Check Answer</summary>
                                        <p className={styles.correctAnswer}>{example.solution}</p>
                                    </details>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.tipBox}>
                        <h4> Study Tips</h4>
                        <ul>
                            <li>Try the problem first before using hints</li>
                            <li>Use Hint 1, then try again before Hint 2</li>
                            <li>Check your answer only after you've tried</li>
                            <li>If you're stuck, review the Guided Practice examples</li>
                        </ul>
                    </div>
                </div>
            ),
            keyTakeaways: ["Try first, then hints", "Check your work", "Learn from mistakes"]
        },

        // SECTION 5: EXIT TICKET
        {
            title: "Exit Ticket",
            content: (
                <div>
                    <div className={styles.exitTicketBox}>
                        <h3>Quick Check</h3>
                        <p>Answer this to show you understand:</p>
                        
                        <p className={styles.exitQuestion}>
                            {lesson.content.examples[0]?.problem}
                        </p>

                        <details className={styles.exitAnswer}>
                            <summary>Show Answer</summary>
                            <div>
                                {lesson.content.examples[0]?.steps?.map((step, i) => (
                                    <p key={i}>{step}</p>
                                ))}
                                <p className={styles.finalExitAnswer}>
                                    <strong>{lesson.content.examples[0]?.solution}</strong>
                                </p>
                            </div>
                        </details>
                    </div>

                  

                    <div className={styles.completionBox}>
                        <p className={styles.completionText}>
                             Mark lesson complete when you understand the concepts
                        </p>
                    </div>
                </div>
            ),
            keyTakeaways: ["Review if needed", "Practice more problems", "Ask questions"]
        }
    ];
}

export default Lesson;