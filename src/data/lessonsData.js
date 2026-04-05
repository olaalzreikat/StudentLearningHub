
export const lessonsData = [

    // ====================================================================================================
    // ALGEBRA 1 (alg1-u1-l1 through alg1-u4-l2)
    // Based on: Units 1-9 covering Foundations, Equations, Functions, Linear Equations, Systems,
    // Exponents, Polynomials, Quadratics, Data Analysis
    // ====================================================================================================

    // UNIT 1: FOUNDATIONS FOR ALGEBRA
    {
        id: 'alg1-u1-l1',
        title: "Variables and Expressions",
        description: "Learn variables and algebraic expressions",
        topic: "algebra",
        difficulty: "beginner",
        duration: "20 min",
        sections: 6,
        content: {
            introduction: "Variables are letters representing unknown values. Algebraic expressions combine numbers, variables, and operations. This is the foundation of algebra.",
            keyPoints: [
                "Variables represent unknown or changing values (x, y, z)",
                "Constants are fixed numbers",
                "Expressions combine variables, numbers, and operations",
                "Terms are separated by + or - signs",
                "Coefficients are numbers multiplied by variables",
                "Like terms have the same variable parts"
            ],
            examples: [
                { problem: "Write 'five more than a number'", solution: "x + 5", steps: ["Let x = the number", "Add 5 to x", "Expression: x + 5"] },
                { problem: "Identify coefficient in 3x + 7", solution: "3", steps: ["Coefficient is number with variable", "In 3x, coefficient = 3"] },
                { problem: "Simplify 2x + 3x", solution: "5x", steps: ["Combine like terms", "2 + 3 = 5", "Result: 5x"] }
            ],
            realWorldApplications: [
                { title: "Shopping", example: "Cost of x apples at $2 each = 2x dollars" },
                { title: "Travel", example: "Distance = 60t miles when driving 60 mph for t hours" },
                { title: "Earnings", example: "Pay = 15h dollars when earning $15/hour for h hours" }
            ]
        }
    },

    {
        id: 'alg1-u1-l2',
        title: "Properties of Real Numbers",
        description: "Rational and irrational numbers",
        topic: "algebra",
        difficulty: "beginner",
        duration: "18 min",
        sections: 5,
        content: {
            introduction: "Real numbers include rationals (fractions) and irrationals (like π). Properties help us manipulate expressions correctly.",
            keyPoints: [
                "Rational: Can be written as fractions (1/2, 0.75)",
                "Irrational: Cannot be fractions (π, √2)",
                "Commutative: a + b = b + a, ab = ba",
                "Associative: (a+b)+c = a+(b+c)",
                "Distributive: a(b+c) = ab + ac"
            ],
            examples: [
                { problem: "Is √16 rational?", solution: "Yes, √16 = 4 = 4/1", steps: ["√16 = 4", "4 can be written as 4/1", "Therefore rational"] },
                { problem: "Simplify 5(x + 3)", solution: "5x + 15", steps: ["Use distributive property", "5×x + 5×3", "= 5x + 15"] },
                { problem: "Simplify 8 + (2 + x)", solution: "10 + x", steps: ["Use associative", "(8+2) + x", "= 10 + x"] }
            ],
            realWorldApplications: [
                { title: "Measurements", example: "π in circle calculations is irrational" },
                { title: "Money", example: "Distributive: 5($3+$2 tax) = $15+$10 = $25" },
                { title: "Construction", example: "Properties ensure accurate calculations" }
            ]
        }
    },

    {
        id: 'alg1-u1-l3',
        title: "Powers, Exponents, and Order of Operations",
        description: "Master PEMDAS",
        topic: "algebra",
        difficulty: "beginner",
        duration: "22 min",
        sections: 7,
        content: {
            introduction: "PEMDAS ensures correct evaluation order: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction.",
            keyPoints: [
                "P - Parentheses first",
                "E - Exponents (powers)",
                "MD - Multiply/Divide left to right",
                "AS - Add/Subtract left to right",
                "Exponents: x² means x×x, x³ means x×x×x",
                "Always work inside parentheses first"
            ],
            examples: [
                { problem: "Evaluate 2 + 3 × 4", solution: "14", steps: ["Multiply first: 3×4 = 12", "Then add: 2+12 = 14"] },
                { problem: "Evaluate (8-2)² ÷ 3", solution: "12", steps: ["Parentheses: 8-2 = 6", "Exponent: 6² = 36", "Divide: 36÷3 = 12"] },
                { problem: "Evaluate 2³", solution: "8", steps: ["2³ = 2×2×2", "= 4×2", "= 8"] }
            ],
            realWorldApplications: [
                { title: "Programming", example: "Code uses PEMDAS for calculations" },
                { title: "Finance", example: "Compound interest: P(1+r)^t" },
                { title: "Physics", example: "Kinetic energy: ½mv²" }
            ]
        }
    },

    {
        id: 'alg1-u1-l4',
        title: "Simplifying and Evaluating Expressions",
        description: "Combine like terms",
        topic: "algebra",
        difficulty: "beginner",
        duration: "22 min",
        sections: 7,
        content: {
            introduction: "Simplifying means combining like terms. Evaluating means finding the value when variables are known.",
            keyPoints: [
                "Like terms have same variables: 3x and 5x",
                "Combine by adding/subtracting coefficients",
                "Use distributive to remove parentheses",
                "Cannot combine unlike terms: 3x and 3y",
                "Evaluate by substituting values",
                "Check work by substituting back"
            ],
            examples: [
                { problem: "Simplify 5x + 3x - 2", solution: "8x - 2", steps: ["Combine like terms: 5x+3x", "= 8x", "Result: 8x-2"] },
                { problem: "Simplify 4(2x+1) - 3x", solution: "5x + 4", steps: ["Distribute: 8x+4", "Combine: 8x-3x = 5x", "Result: 5x+4"] },
                { problem: "Evaluate 3x+7 when x=4", solution: "19", steps: ["Substitute: 3(4)+7", "= 12+7", "= 19"] }
            ],
            realWorldApplications: [
                { title: "Shopping", example: "3 shirts at $x + 2 at $x = 5x total" },
                { title: "Perimeter", example: "Rectangle: 2l+2w = 2(l+w)" },
                { title: "Income", example: "15h+20h+10h = 45h total" }
            ]
        }
    },

    // UNIT 2: SOLVING EQUATIONS
    {
        id: 'alg1-u2-l1',
        title: "One-Step, Two-Step, Multi-Step Equations",
        description: "Solve linear equations",
        topic: "algebra",
        difficulty: "beginner",
        duration: "15 min",
        sections: 5,
        content: {
            introduction: "Solving equations means isolating the variable using inverse operations. Work backwards through PEMDAS.",
            keyPoints: [
                "One-step: Single operation (add, subtract, multiply, divide)",
                "Two-step: Undo addition/subtraction first, then multiply/divide",
                "Multi-step: Distribute, combine like terms, then solve",
                "What you do to one side, do to the other",
                "Check by substituting solution back"
            ],
            examples: [
                { problem: "Solve x + 5 = 12", solution: "x = 7", steps: ["Subtract 5 from both sides", "x = 12-5 = 7"] },
                { problem: "Solve 3x - 7 = 14", solution: "x = 7", steps: ["Add 7: 3x = 21", "Divide by 3: x = 7"] },
                { problem: "Solve 2(x+3) = 16", solution: "x = 5", steps: ["Distribute: 2x+6 = 16", "Subtract 6: 2x = 10", "Divide: x = 5"] }
            ],
            realWorldApplications: [
                { title: "Phone Plans", example: "30 + 0.10x = 45, find texts sent" },
                { title: "Temperature", example: "F = (9/5)C + 32, solve for C" },
                { title: "Business", example: "Revenue = Cost + Profit, find break-even" }
            ]
        }
    },

    {
        id: 'alg1-u2-l2',
        title: "Variables on Both Sides",
        description: "Equations with variables on both sides",
        topic: "algebra",
        difficulty: "beginner",
        duration: "25 min",
        sections: 8,
        content: {
            introduction: "When variables appear on both sides, collect all variable terms on one side and constants on the other.",
            keyPoints: [
                "Move variables to one side (usually left)",
                "Move constants to other side (usually right)",
                "Eliminate smaller variable coefficient first",
                "One solution: x = number",
                "No solution: False statement (5 = 3)",
                "Infinite solutions: True statement (5 = 5)"
            ],
            examples: [
                { problem: "Solve 5x+3 = 2x+12", solution: "x = 3", steps: ["Subtract 2x: 3x+3 = 12", "Subtract 3: 3x = 9", "Divide: x = 3"] },
                { problem: "Solve 2(x+3) = 2x+6", solution: "Infinite solutions", steps: ["Distribute: 2x+6 = 2x+6", "Subtract 2x: 6 = 6", "Always true!"] },
                { problem: "Solve 3x+5 = 3x-2", solution: "No solution", steps: ["Subtract 3x: 5 = -2", "Never true!"] }
            ],
            realWorldApplications: [
                { title: "Business", example: "Company A: 50+2x, Company B: 30+3x, when equal?" },
                { title: "Travel", example: "Car A at 50mph + 100mi head start vs Car B at 60mph" },
                { title: "Savings", example: "Account A: $200+$10/week vs B: $100+$15/week" }
            ]
        }
    },

    {
        id: 'alg1-u2-l3',
        title: "Solving Literal Equations",
        description: "Rearranging formulas",
        topic: "algebra",
        difficulty: "beginner",
        duration: "30 min",
        sections: 9,
        content: {
            introduction: "Literal equations have multiple variables. Solve for one variable by treating others as constants.",
            keyPoints: [
                "Treat target variable as only variable",
                "Treat other variables like numbers",
                "Use same solving techniques",
                "Common: d=rt, A=lw, P=2l+2w",
                "Answer contains other variables",
                "Check by substituting back"
            ],
            examples: [
                { problem: "Solve d=rt for t", solution: "t = d/r", steps: ["Divide both sides by r", "t = d/r"] },
                { problem: "Solve P=2l+2w for w", solution: "w = (P-2l)/2", steps: ["Subtract 2l: P-2l = 2w", "Divide by 2: w = (P-2l)/2"] },
                { problem: "Solve A=½bh for h", solution: "h = 2A/b", steps: ["Multiply by 2: 2A = bh", "Divide by b: h = 2A/b"] }
            ],
            realWorldApplications: [
                { title: "Physics", example: "F=ma, solve for a: a=F/m" },
                { title: "Finance", example: "I=Prt, solve for r: r=I/(Pt)" },
                { title: "Temperature", example: "F=(9/5)C+32, solve for C" }
            ]
        }
    },

    {
        id: 'alg1-u2-l4',
        title: "Linear Inequalities",
        description: "Writing, solving, graphing inequalities",
        topic: "algebra",
        difficulty: "beginner",
        duration: "30 min",
        sections: 9,
        content: {
            introduction: "Inequalities compare expressions using <, >, ≤, ≥. Solutions are ranges, not single values.",
            keyPoints: [
                "< less than, > greater than",
                "≤ less than or equal, ≥ greater than or equal",
                "FLIP sign when multiplying/dividing by negative",
                "Compound 'and': both conditions true",
                "Compound 'or': either condition true",
                "Graph: open circle for < >, closed for ≤ ≥"
            ],
            examples: [
                { problem: "Solve 3x-5 ≤ 10", solution: "x ≤ 5", steps: ["Add 5: 3x ≤ 15", "Divide by 3: x ≤ 5"] },
                { problem: "Solve -2x+3 > 11", solution: "x < -4", steps: ["Subtract 3: -2x > 8", "Divide by -2, FLIP: x < -4"] },
                { problem: "Solve -3 < 2x+1 < 7", solution: "-2 < x < 3", steps: ["Left: -3 < 2x+1 → -4 < 2x → -2 < x", "Right: 2x+1 < 7 → 2x < 6 → x < 3"] }
            ],
            realWorldApplications: [
                { title: "Budgeting", example: "15x ≤ 100, how many $15 items?" },
                { title: "Speed Limits", example: "45 ≤ s ≤ 70 mph" },
                { title: "Manufacturing", example: "|actual - target| ≤ 0.01 tolerance" }
            ]
        }
    },

    // ====================================================================================================
    // STATISTICS - COMPLETE 5 UNITS (15 LESSONS)
    // Based on AP Statistics curriculum you provided
    // ====================================================================================================

    // UNIT 1: EXPLORING DATA
    {
        id: 'stats-u1-l1',
        title: "Analyzing Categorical Data",
        description: "Frequency tables, bar charts, pie charts",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "25 min",
        sections: 7,
        content: {
            introduction: "Categorical data represents qualities divided into groups. We organize with tables and visualize with charts.",
            keyPoints: [
                "Categorical variables: Groups/categories (colors, brands)",
                "Frequency table: Count in each category",
                "Relative frequency: Proportion of total",
                "Bar chart: Height shows frequency",
                "Pie chart: Sectors show proportions",
                "Mosaic plot: Two categorical variables"
            ],
            examples: [
                { problem: "Frequency table for: Dog,Cat,Dog,Bird,Cat,Dog", solution: "Dog:3, Cat:2, Bird:1", steps: ["Count each", "Dog=3, Cat=2, Bird=1"] },
                { problem: "Relative frequency of Dogs", solution: "50%", steps: ["Dogs: 3/6 = 0.5", "= 50%"] },
                { problem: "Pie vs bar chart?", solution: "Pie for parts of whole, bar for comparing", steps: ["Pie: shows 100%", "Bar: compares categories"] }
            ],
            realWorldApplications: [
                { title: "Marketing", example: "Customer preferences by category" },
                { title: "Polling", example: "Voting preferences by party" },
                { title: "Medical", example: "Disease rates by treatment group" }
            ]
        }
    },

    {
        id: 'stats-u1-l2',
        title: "Describing Quantitative Data",
        description: "Dotplots, stemplots, histograms, box plots",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "22 min",
        sections: 6,
        content: {
            introduction: "Quantitative data is numerical. Different plots reveal shape, center, spread, and outliers.",
            keyPoints: [
                "Dotplot: Dots above number line",
                "Stemplot: Stem (tens), Leaf (ones)",
                "Histogram: Bins show frequency",
                "Box plot: Five-number summary",
                "Shape: Symmetric, skewed left/right",
                "Outliers: Far from rest of data"
            ],
            examples: [
                { problem: "Stemplot for 23,25,31,33", solution: "2|3 5\n3|1 3", steps: ["Stem=tens", "Leaf=ones"] },
                { problem: "Histogram: most left, tail right", solution: "Skewed right", steps: ["Bulk on left", "Tail right", "Positively skewed"] },
                { problem: "Box plot vs histogram?", solution: "Box: summary, Histogram: shape", steps: ["Box: quartiles", "Histogram: distribution shape"] }
            ],
            realWorldApplications: [
                { title: "Education", example: "Test score distributions" },
                { title: "Quality Control", example: "Product measurements" },
                { title: "Climate", example: "Temperature distributions" }
            ]
        }
    },

    {
        id: 'stats-u1-l3',
        title: "Measures of Center and Variability",
        description: "Mean, median, range, IQR, standard deviation",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "22 min",
        sections: 6,
        content: {
            introduction: "Center tells typical value. Variability tells spread. Both needed to describe data.",
            keyPoints: [
                "Mean: Sum/count, affected by outliers",
                "Median: Middle value, resistant to outliers",
                "Mode: Most frequent value",
                "Range: Max - Min",
                "IQR: Q3 - Q1 (middle 50%)",
                "Standard deviation: Average distance from mean"
            ],
            examples: [
                { problem: "Mean of 5,7,8,12,15", solution: "9.4", steps: ["Sum: 47", "Count: 5", "47/5 = 9.4"] },
                { problem: "Median of 5,7,8,12,15", solution: "8", steps: ["Order data", "Middle value", "= 8"] },
                { problem: "IQR of 2,5,7,10,12,15,18", solution: "10", steps: ["Q1=6, Q3=16", "IQR = 16-6 = 10"] }
            ],
            realWorldApplications: [
                { title: "Economics", example: "Median income preferred (not skewed by rich)" },
                { title: "Sports", example: "SD shows player consistency" },
                { title: "Manufacturing", example: "IQR measures quality consistency" }
            ]
        }
    },

    // UNIT 2: TWO-VARIABLE DATA
    {
        id: 'stats-u2-l1',
        title: "Scatterplots and Correlation",
        description: "Visualizing relationships",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "25 min",
        sections: 7,
        content: {
            introduction: "Scatterplots show relationships. Correlation (r) measures strength and direction of linear relationships.",
            keyPoints: [
                "Scatterplot: x=explanatory, y=response",
                "Correlation r: -1 to +1",
                "r=1: perfect positive, r=-1: perfect negative",
                "r>0: positive (both increase)",
                "r<0: negative (one increases, other decreases)",
                "Correlation ≠ causation!"
            ],
            examples: [
                { problem: "Interpret r=0.85", solution: "Strong positive linear", steps: ["Close to +1", "Strong relationship", "Both variables increase together"] },
                { problem: "r=-0.92 for study vs errors?", solution: "Strong negative", steps: ["Close to -1", "More study → fewer errors"] },
                { problem: "Does correlation prove causation?", solution: "No", steps: ["Shows association only", "Need experiment for causation"] }
            ],
            realWorldApplications: [
                { title: "Health", example: "Exercise vs heart disease (negative correlation)" },
                { title: "Real Estate", example: "Square footage vs price (positive)" },
                { title: "Education", example: "Attendance vs grades" }
            ]
        }
    },

    {
        id: 'stats-u2-l2',
        title: "Linear Regression",
        description: "Modeling with least-squares line",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "32 min",
        sections: 9,
        content: {
            introduction: "Regression finds best-fit line. Residuals measure prediction errors.",
            keyPoints: [
                "Regression line: ŷ = a + bx",
                "Slope b: Change in ŷ per unit x",
                "Intercept a: Predicted y when x=0",
                "Residual: actual - predicted (y - ŷ)",
                "Residual plot checks model fit",
                "r²: Percent variability explained"
            ],
            examples: [
                { problem: "ŷ=50+5x, predict when x=10", solution: "100", steps: ["Substitute x=10", "ŷ=50+5(10) = 100"] },
                { problem: "If y=110, find residual", solution: "10", steps: ["Residual = y - ŷ", "= 110 - 100 = 10"] },
                { problem: "Interpret slope=5", solution: "+1 unit x → +5 units y", steps: ["Each additional x", "Increases ŷ by 5"] }
            ],
            realWorldApplications: [
                { title: "Business", example: "Predict sales from advertising spend" },
                { title: "Environment", example: "Predict CO2 from temperature" },
                { title: "Medicine", example: "Predict recovery time from age" }
            ]
        }
    },

    {
        id: 'stats-u2-l3',
        title: "Normal Distributions",
        description: "Bell curves and z-scores",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "28 min",
        sections: 8,
        content: {
            introduction: "Normal distribution is symmetric bell curve. Z-scores standardize values.",
            keyPoints: [
                "Normal: Symmetric, bell-shaped",
                "Defined by mean μ and SD σ",
                "68-95-99.7 Rule: % within 1σ, 2σ, 3σ",
                "Z-score: z = (x-μ)/σ",
                "Standard normal: μ=0, σ=1",
                "Area under curve = probability"
            ],
            examples: [
                { problem: "SAT: μ=500, σ=100. Find z for x=650", solution: "z=1.5", steps: ["z = (650-500)/100", "= 150/100 = 1.5"] },
                { problem: "68-95-99.7: % between 400 and 600?", solution: "68%", steps: ["μ-σ to μ+σ", "Within 1 SD", "= 68%"] },
                { problem: "Is z=-2 above or below average?", solution: "Below, 2 SD below mean", steps: ["Negative z", "Below mean", "2 standard deviations"] }
            ],
            realWorldApplications: [
                { title: "Testing", example: "SAT, ACT, IQ scores" },
                { title: "Quality Control", example: "μ±3σ captures 99.7%" },
                { title: "Biology", example: "Height, weight distributions" }
            ]
        }
    },

    // UNIT 3: PLANNING A STUDY
    {
        id: 'stats-u3-l1',
        title: "Methods of Data Collection",
        description: "Surveys, studies, experiments",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "22 min",
        sections: 6,
        content: {
            introduction: "How we collect data determines what conclusions we can draw. Only experiments prove causation.",
            keyPoints: [
                "Survey: Ask questions, can have bias",
                "Observational study: Watch without interfering",
                "Experiment: Assign treatments, proves causation",
                "Census: Entire population",
                "Sample: Subset of population",
                "Confounding: Variable affects both x and y"
            ],
            examples: [
                { problem: "Classify: Watch study habits and grades", solution: "Observational study", steps: ["No intervention", "Just observing", "Cannot prove causation"] },
                { problem: "Classify: Randomly assign study methods", solution: "Experiment", steps: ["Random assignment", "Control treatment", "Can prove causation"] },
                { problem: "Why can't observational prove causation?", solution: "Confounding variables", steps: ["Cannot control lurking variables", "Groups may differ in other ways"] }
            ],
            realWorldApplications: [
                { title: "Medical", example: "Clinical trials test drug effectiveness" },
                { title: "Marketing", example: "Surveys gather opinions, experiments test ads" },
                { title: "Social Science", example: "Observational for unethical experiments" }
            ]
        }
    },

    {
        id: 'stats-u3-l2',
        title: "Sampling Methods",
        description: "Random sampling and bias",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "25 min",
        sections: 7,
        content: {
            introduction: "Good sampling ensures representative data. Random sampling reduces bias.",
            keyPoints: [
                "Simple random sample (SRS): Every subset equally likely",
                "Stratified: Divide into groups, sample each",
                "Cluster: Divide into groups, sample some groups",
                "Systematic: Every kth individual",
                "Bias: Favors certain outcomes",
                "Undercoverage: Some groups excluded"
            ],
            examples: [
                { problem: "Describe SRS of 50 from 500 students", solution: "Every group of 50 equally likely", steps: ["Number students 1-500", "Randomly select 50", "Every combo equally likely"] },
                { problem: "Stratified vs SRS?", solution: "Stratified ensures all groups represented", steps: ["Divide by grade level", "Sample from each grade", "Ensures representation"] },
                { problem: "Example of bias?", solution: "Survey only morning students", steps: ["Misses afternoon students", "Not representative", "Undercoverage bias"] }
            ],
            realWorldApplications: [
                { title: "Polling", example: "Political polls use stratified sampling" },
                { title: "Quality Control", example: "Random sampling from production line" },
                { title: "Medical", example: "Clinical trials need representative samples" }
            ]
        }
    },

    {
        id: 'stats-u3-l3',
        title: "Experimental Design",
        description: "Control, randomization, replication",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "28 min",
        sections: 8,
        content: {
            introduction: "Good experiments use control groups, randomization, and replication to establish causation.",
            keyPoints: [
                "Control group: No treatment, for comparison",
                "Treatment group: Receives intervention",
                "Randomization: Random assignment reduces bias",
                "Replication: Repeat with many subjects",
                "Placebo: Fake treatment",
                "Blinding: Subjects don't know treatment"
            ],
            examples: [
                { problem: "Why use control group?", solution: "Comparison baseline", steps: ["Shows what happens without treatment", "Isolates treatment effect"] },
                { problem: "Why randomization?", solution: "Reduces confounding", steps: ["Groups similar on average", "Eliminates systematic differences"] },
                { problem: "Why replication?", solution: "Reduces chance variation", steps: ["More subjects = more reliable", "Can detect real effects"] }
            ],
            realWorldApplications: [
                { title: "Medicine", example: "Drug trials: treatment vs placebo control" },
                { title: "Education", example: "Test teaching methods with random assignment" },
                { title: "Agriculture", example: "Test fertilizers with control plots" }
            ]
        }
    },

    // UNIT 4: PROBABILITY
    {
        id: 'stats-u4-l1',
        title: "Basic Probability",
        description: "Probability rules and concepts",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "25 min",
        sections: 7,
        content: {
            introduction: "Probability quantifies likelihood. Ranges from 0 (impossible) to 1 (certain).",
            keyPoints: [
                "P(Event) = favorable/total",
                "0 ≤ P(Event) ≤ 1",
                "P(not A) = 1 - P(A)",
                "P(A or B) = P(A) + P(B) - P(A and B)",
                "Independent: P(A and B) = P(A)×P(B)",
                "Conditional: P(A|B) = P(A and B)/P(B)"
            ],
            examples: [
                { problem: "Roll die, P(4)?", solution: "1/6", steps: ["Favorable: 1 way", "Total: 6 outcomes", "P = 1/6"] },
                { problem: "P(even on die)?", solution: "1/2", steps: ["Even: 2,4,6 (3 ways)", "Total: 6", "P = 3/6 = 1/2"] },
                { problem: "Flip 3 coins, P(exactly 2 heads)?", solution: "3/8", steps: ["Outcomes: HHT,HTH,THH", "3 out of 8 total", "P = 3/8"] }
            ],
            realWorldApplications: [
                { title: "Insurance", example: "Calculate fair premiums from risk probability" },
                { title: "Games", example: "Casino games use probability for house edge" },
                { title: "Weather", example: "Forecast gives probability of rain" }
            ]
        }
    },

    {
        id: 'stats-u4-l2',
        title: "Random Variables",
        description: "Discrete and continuous variables",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "30 min",
        sections: 9,
        content: {
            introduction: "Random variables assign numbers to outcomes. Expected value is long-run average.",
            keyPoints: [
                "Random variable: Value determined by chance",
                "Discrete: Countable values",
                "Continuous: Infinite values in range",
                "Expected value: E(X) = Σ[x·P(x)]",
                "Variance: Average squared deviation",
                "Standard deviation: √(variance)"
            ],
            examples: [
                { problem: "E(X) for X={1,2,3}, P={0.5,0.3,0.2}", solution: "1.7", steps: ["E(X) = 1(0.5) + 2(0.3) + 3(0.2)", "= 0.5 + 0.6 + 0.6", "= 1.7"] },
                { problem: "Discrete or continuous: height", solution: "Continuous", steps: ["Can take any value", "Not countable", "Continuous"] },
                { problem: "Discrete or continuous: dice roll", solution: "Discrete", steps: ["Only 1,2,3,4,5,6", "Countable values", "Discrete"] }
            ],
            realWorldApplications: [
                { title: "Insurance", example: "Expected payout guides premium pricing" },
                { title: "Games", example: "Expected winnings = house advantage" },
                { title: "Business", example: "Expected profit guides decisions" }
            ]
        }
    },

    {
        id: 'stats-u4-l3',
        title: "Probability Distributions",
        description: "Binomial and normal distributions",
        topic: "statistics",
        difficulty: "intermediate",
        duration: "32 min",
        sections: 9,
        content: {
            introduction: "Probability distributions describe all possible values and their probabilities.",
            keyPoints: [
                "Binomial: n trials, 2 outcomes each",
                "Parameters: n (trials), p (success probability)",
                "Mean: μ = np",
                "SD: σ = √(np(1-p))",
                "Normal: Continuous, bell-shaped",
                "Binomial → Normal when np≥10 and n(1-p)≥10"
            ],
            examples: [
                { problem: "Flip coin 10 times, mean # heads?", solution: "5", steps: ["n=10, p=0.5", "μ = np = 10(0.5) = 5"] },
                { problem: "SD for above", solution: "1.58", steps: ["σ = √(np(1-p))", "= √(10·0.5·0.5)", "= √2.5 ≈ 1.58"] },
                { problem: "Can use normal approximation?", solution: "Yes", steps: ["np = 5, n(1-p) = 5", "Both < 10, borderline", "Better with larger n"] }
            ],
            realWorldApplications: [
                { title: "Quality Control", example: "Binomial models defect rates" },
                { title: "Medicine", example: "Success rate of treatments" },
                { title: "Genetics", example: "Inheritance patterns" }
            ]
        }
    },

    // UNIT 5: INFERENCE
    {
        id: 'stats-u5-l1',
        title: "Sampling Distributions",
        description: "Distribution of sample statistics",
        topic: "statistics",
        difficulty: "advanced",
        duration: "35 min",
        sections: 10,
        content: {
            introduction: "Sampling distribution shows how sample statistics vary. Central Limit Theorem is key.",
            keyPoints: [
                "Sampling distribution: Distribution of statistic",
                "Central Limit Theorem: x̄ approaches normal for large n",
                "Mean of x̄: μₓ̄ = μ",
                "SE of x̄: σ/√n",
                "Larger n → smaller SE",
                "CLT works for n≥30 (rule of thumb)"
            ],
            examples: [
                { problem: "μ=100, σ=20, n=25. Find SE", solution: "4", steps: ["SE = σ/√n", "= 20/√25", "= 20/5 = 4"] },
                { problem: "To halve SE, how change n?", solution: "Quadruple n", steps: ["SE = σ/√n", "To halve: divide √n by 2", "Need 4n"] },
                { problem: "Why does CLT matter?", solution: "Can use normal methods", steps: ["x̄ approximately normal", "Even if population isn't", "Enables inference"] }
            ],
            realWorldApplications: [
                { title: "Polling", example: "1000 voters estimate population proportion" },
                { title: "Quality", example: "Sample products estimate mean quality" },
                { title: "Clinical Trials", example: "Sample patients estimate treatment effect" }
            ]
        }
    },

    {
        id: 'stats-u5-l2',
        title: "Confidence Intervals",
        description: "Estimating parameters with intervals",
        topic: "statistics",
        difficulty: "advanced",
        duration: "35 min",
        sections: 10,
        content: {
            introduction: "Confidence intervals give range of plausible values for population parameter.",
            keyPoints: [
                "CI: Point estimate ± Margin of error",
                "95% CI: 95% of intervals contain parameter",
                "Margin of error: z* × SE",
                "Wider CI: Higher confidence or more variability",
                "Narrower CI: Larger n or less variability",
                "Interpretation: 'We are 95% confident...'"
            ],
            examples: [
                { problem: "Interpret (45, 55) with 95% confidence", solution: "95% confident μ in (45,55)", steps: ["NOT: P(μ in interval) = 0.95", "Correct: Method works 95% of time", "We're 95% confident"] },
                { problem: "n=100, x̄=50, σ=10. Find 95% CI", solution: "(48.04, 51.96)", steps: ["SE = 10/10 = 1", "ME = 1.96(1) = 1.96", "CI = 50±1.96"] },
                { problem: "Get narrower CI how?", solution: "Increase n or decrease confidence", steps: ["Larger n → smaller SE", "Or lower confidence → smaller z*"] }
            ],
            realWorldApplications: [
                { title: "Polling", example: "'45% ±3%' means 95% CI is (42%, 48%)" },
                { title: "Medical", example: "Estimate mean blood pressure reduction" },
                { title: "Business", example: "Estimate customer satisfaction" }
            ]
        }
    },

    {
        id: 'stats-u5-l3',
        title: "Hypothesis Testing",
        description: "Significance tests and p-values",
        topic: "statistics",
        difficulty: "advanced",
        duration: "38 min",
        sections: 11,
        content: {
            introduction: "Hypothesis tests use sample data to decide about population. P-values measure evidence.",
            keyPoints: [
                "H₀: Null hypothesis (no effect)",
                "Hₐ: Alternative hypothesis",
                "P-value: P(data this extreme | H₀ true)",
                "α: Significance level (usually 0.05)",
                "Type I error: Reject true H₀, P=α",
                "Type II error: Fail to reject false H₀"
            ],
            examples: [
                { problem: "H₀:μ=50 vs Hₐ:μ>50, p=0.03, α=0.05. Decide?", solution: "Reject H₀", steps: ["p < α (0.03 < 0.05)", "Reject H₀", "Evidence supports μ>50"] },
                { problem: "Interpret p=0.12 for drug test", solution: "12% chance if no effect", steps: ["If drug has no effect", "12% chance of this result", "Not significant at α=0.05"] },
                { problem: "Type I vs Type II in medical test?", solution: "Depends on disease", steps: ["Type I: False positive (say sick when not)", "Type II: False negative (miss disease)", "Serious disease: Type II worse"] }
            ],
            realWorldApplications: [
                { title: "Medicine", example: "Test if new drug works better than placebo" },
                { title: "Manufacturing", example: "Test if process changed" },
                { title: "Justice", example: "H₀: Innocent. Type I = convict innocent" }
            ]
        }
    },

    // ====================================================================================================
    // GEOMETRY HONORS - COMPLETE 9 UNITS
    // Based on curriculum: Foundations, Parallel Lines, Transformations, Triangles, etc.
    // ====================================================================================================

    {
        id: 'geoh-u1-l1',
        title: "Foundations of Geometry & Formal Reasoning",
        description: "Geometric terms, measurement formulas, logical reasoning",
        topic: "geometry",
        difficulty: "advanced",
        duration: "35 min",
        sections: 10,
        content: {
            introduction: "Geometry Honors begins with rigorous foundations. We distinguish inductive (patterns) from deductive (logical proof) reasoning.",
            keyPoints: [
                "Undefined terms: Point, Line, Plane",
                "Distance Formula: d = √[(x₂-x₁)² + (y₂-y₁)²]",
                "Midpoint Formula: M = ((x₁+x₂)/2, (y₁+y₂)/2)",
                "Inductive reasoning: Patterns (not always reliable)",
                "Deductive reasoning: Logic and facts (proof basis)",
                "Segment/Angle Addition: If B between A and C, then AB+BC=AC"
            ],
            examples: [
                { problem: "Find distance and midpoint: A(2,3) and B(5,7)", solution: "d=5, M=(3.5,5)", steps: ["d = √[(5-2)²+(7-3)²] = √25 = 5", "M = ((2+5)/2,(3+7)/2) = (3.5,5)"] },
                { problem: "Inductive or deductive: Pattern 2,4,6... next is 8", solution: "Inductive", steps: ["Observing pattern", "Predicting based on pattern", "Inductive reasoning"] },
                { problem: "AB=12, BC=7, B between A and C. Find AC", solution: "19", steps: ["Use Segment Addition", "AB+BC=AC", "12+7=19"] }
            ],
            realWorldApplications: [
                { title: "GPS", example: "Distance formula calculates actual distance between coordinates" },
                { title: "Computer Science", example: "Deductive reasoning ensures algorithm correctness" },
                { title: "Legal", example: "Deductive reasoning proves cases logically" }
            ]
        }
    },

    {
        id: 'geoh-u1-l2',
        title: "Introduction to Formal Proofs",
        description: "Writing two-column and paragraph proofs",
        topic: "geometry",
        difficulty: "advanced",
        duration: "40 min",
        sections: 12,
        content: {
            introduction: "Formal proofs use deductive reasoning to show statements are true. Two-column format shows statements and reasons.",
            keyPoints: [
                "Two-column: Statements left, reasons right",
                "Paragraph proof: Written narrative",
                "Given: Information provided",
                "Prove: Conclusion to demonstrate",
                "Valid reasons: Definitions, postulates, theorems, given",
                "Each step must be justified"
            ],
            examples: [
                { problem: "Given: AB=CD. Prove: AB+2=CD+2", solution: "Two-column proof", steps: ["Statement: AB=CD (Given)", "Statement: AB+2=CD+2 (Addition Property)"] },
                { problem: "What's a valid reason?", solution: "Given, Definition, Postulate, Theorem, Property", steps: ["Cannot use assumptions", "Must cite source", "Must be previously proven/accepted"] },
                { problem: "Given vs Prove?", solution: "Given=start, Prove=goal", steps: ["Given: What we know", "Prove: What we must show"] }
            ],
            realWorldApplications: [
                { title: "Law", example: "Legal arguments structured like proofs" },
                { title: "Programming", example: "Algorithm correctness proofs" },
                { title: "Mathematics", example: "Foundation for all advanced math" }
            ]
        }
    },

    {
        id: 'geoh-u1-l3',
        title: "Segment and Angle Measurement",
        description: "Distance, midpoint, angle bisector theorems",
        topic: "geometry",
        difficulty: "advanced",
        duration: "32 min",
        sections: 9,
        content: {
            introduction: "Precise measurement is essential. Postulates govern how we measure and combine segments and angles.",
            keyPoints: [
                "Segment Addition: AB+BC=AC when B between A and C",
                "Midpoint: M divides segment into two equal parts",
                "Angle Addition: ∠ABC+∠CBD=∠ABD when BC between BA and BD",
                "Angle bisector: Divides angle into two equal angles",
                "Congruent: Same measure (≅)",
                "Distance: Always positive"
            ],
            examples: [
                { problem: "AB=12, M is midpoint. Find AM", solution: "6", steps: ["Midpoint divides equally", "AM=MB", "AM=12/2=6"] },
                { problem: "∠ABC=50°, ∠CBD=30°, C between. Find ∠ABD", solution: "80°", steps: ["Use Angle Addition", "50°+30°=80°"] },
                { problem: "Ray BD bisects ∠ABC. If ∠ABD=35°, find ∠ABC", solution: "70°", steps: ["Bisector creates equal angles", "∠ABC = 2(35°) = 70°"] }
            ],
            realWorldApplications: [
                { title: "Construction", example: "Measuring segments ensures correct beam lengths" },
                { title: "Engineering", example: "Angle measurements critical for structural integrity" },
                { title: "Navigation", example: "Angle bisectors find equidistant paths" }
            ]
        }
    },

];

export default lessonsData;