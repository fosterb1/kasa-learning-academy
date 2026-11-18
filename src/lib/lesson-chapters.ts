/** Editorial teaching chapters: readable offline and independent of CMS migrations. */
export type LessonChapter = { context: string; concepts: [string,string][]; terms: [string,string][]; checks: string[] }
export const lessonChapters: Record<string,LessonChapter> = {
  "hello": {
    "context": "A new learner in Cape Coast wants a computer to greet visitors.",
    "concepts": [
      [
        "What does a program do?",
        "A source file is a sequence of instructions. The Kasa interpreter reads each statement and carries out the operation. A print statement does not store a value: it makes the value visible in the output panel."
      ],
      [
        "Text and expressions",
        "Text inside double quotation marks is a string. Arithmetic without quotation marks is evaluated as an expression. The difference matters when checking output."
      ],
      [
        "How to study code",
        "Read the example line by line. For every ka instruction, write down what the computer will display. Only then run the program and check your prediction."
      ]
    ],
    "terms": [
      [
        "ka",
        "Display the value of an expression"
      ],
      [
        "string",
        "Text enclosed in quotation marks"
      ],
      [
        "comment",
        "Explanation for the human reader, beginning with #"
      ]
    ],
    "checks": [
      "Why does ka 2 + 3 differ from ka \"2 + 3\"?",
      "Which instruction displays the greeting?"
    ]
  },
  "variables": {
    "context": "A small shop in Kumasi stores a customer name, item count and price.",
    "concepts": [
      [
        "Giving a value a name",
        "A variable connects a name to a value. In Kasa, ma din = \"Ama\" assigns a string. A later ma din = \"Kojo\" replaces the value associated with that name."
      ],
      [
        "Trace before execution",
        "Make a two-column table for each assignment: variable name and current value. When the same name is assigned twice, cross out the earlier value."
      ],
      [
        "Why types matter",
        "A numeric value and a text value are different. When joining words with a number, explicitly convert with nsɛm(). This prevents a program from silently guessing what you meant."
      ]
    ],
    "terms": [
      [
        "ma",
        "Assign a value to a variable"
      ],
      [
        "nsɛm()",
        "Convert a supported value into text"
      ],
      [
        "variable",
        "A named value that can change"
      ]
    ],
    "checks": [
      "Does reassignment create a new name or change its current value?",
      "Why must a number be converted before joining it to a label?"
    ]
  },
  "types": {
    "context": "A student enters a number into an application form, but the keyboard sends text.",
    "concepts": [
      [
        "Types protect meaning",
        "A string is not automatically a numeric value even when it contains digits. Booleans represent logical truth and are not numbers."
      ],
      [
        "Explicit conversion",
        "Use nɔma() when numeric text must participate in arithmetic. Use nsɛm() when numbers need to be displayed as part of longer text."
      ],
      [
        "Failure is useful feedback",
        "When a conversion fails, inspect the input. A real application should ask users to correct invalid values instead of pretending the data is valid."
      ]
    ],
    "terms": [
      [
        "nokware",
        "Boolean true"
      ],
      [
        "atoro",
        "Boolean false"
      ],
      [
        "nɔma()",
        "Convert numeric text to a number"
      ]
    ],
    "checks": [
      "Why might adding \"10\" and 5 be invalid?",
      "How is nokware different from 1?"
    ]
  },
  "arithmetic": {
    "context": "A Ghanaian school calculates the cost of three exercise books and transport.",
    "concepts": [
      [
        "Operators and precedence",
        "Multiplication and division are performed before addition and subtraction under ordinary arithmetic rules. Parentheses override the default order."
      ],
      [
        "Unit awareness",
        "A number alone does not say whether it represents Ghana cedis, units sold or a percentage. Record units in the problem description and labels."
      ],
      [
        "Check the result independently",
        "Calculate the expression with a pencil first. Then change one operand and verify the output changes in the expected direction."
      ]
    ],
    "terms": [
      [
        "expression",
        "Code that produces a value"
      ],
      [
        "precedence",
        "Rules that determine which operation runs first"
      ],
      [
        "parentheses",
        "Grouping to control evaluation order"
      ]
    ],
    "checks": [
      "Compute 2 + 3 * 4.",
      "How do parentheses change the answer?"
    ]
  },
  "logic": {
    "context": "A scholarship application may require both a minimum score and another eligibility condition.",
    "concepts": [
      [
        "Comparison versus assignment",
        "The single = is part of assigning with ma, whereas == compares values. A comparison produces a Boolean."
      ],
      [
        "Compound requirements",
        "ne corresponds to logical AND: both conditions must hold. anaa corresponds to logical OR: either can hold. ɛnyɛ negates a Boolean condition."
      ],
      [
        "Short-circuiting",
        "With ne, the right expression need not execute when the left is already false. With anaa, a true left condition can determine the result immediately."
      ]
    ],
    "terms": [
      [
        "==",
        "Equality comparison"
      ],
      [
        "ne",
        "Logical AND"
      ],
      [
        "anaa",
        "Logical OR"
      ]
    ],
    "checks": [
      "When is A ne B true?",
      "Why is = not interchangeable with ==?"
    ]
  },
  "conditions": {
    "context": "A teacher wants different feedback for passing and non-passing marks.",
    "concepts": [
      [
        "Decisions change control flow",
        "Kasa uses sɛ condition a to begin an if branch. The condition must evaluate to a Boolean. anyɛ_saa_a provides an alternative, and awiei closes the block."
      ],
      [
        "Test boundaries",
        "If the passing mark is 50, test 49, 50 and 51. Boundary values reveal mistakes that ordinary examples can miss."
      ],
      [
        "Nested rules",
        "A decision can contain another decision, but every opened block must have its own awiei. Indentation improves readability even though the language uses explicit block endings."
      ]
    ],
    "terms": [
      [
        "sɛ",
        "Begin a conditional decision"
      ],
      [
        "anyɛ_saa_a",
        "Otherwise branch"
      ],
      [
        "awiei",
        "Close a block"
      ]
    ],
    "checks": [
      "Does 50 pass when the condition uses >= 50?",
      "What happens if awiei is missing?"
    ]
  },
  "repeat": {
    "context": "A savings club member contributes the same amount each month.",
    "concepts": [
      [
        "Why count repetitions?",
        "A counted loop repeats the same block a known number of times. mpɛn 6 runs its body six times; it does not magically produce the sum."
      ],
      [
        "Accumulators",
        "An accumulator begins at a starting value, often zero, and is updated each repetition. To reason about a loop, record the accumulator after every iteration."
      ],
      [
        "Compare loop structures",
        "A counted loop is well suited to a fixed number of payments. A while loop is better when the number of repetitions depends on a changing condition."
      ]
    ],
    "terms": [
      [
        "mpɛn",
        "Repeat a fixed number of times"
      ],
      [
        "accumulator",
        "A variable updated by repeated contributions"
      ],
      [
        "iteration",
        "One execution of a loop body"
      ]
    ],
    "checks": [
      "How many times does mpɛn 4 run?",
      "What happens if you forget to update the running total?"
    ]
  },
  "while": {
    "context": "A transport company checks the remaining fuel estimate after each journey.",
    "concepts": [
      [
        "A condition controls repetition",
        "bere_a repeats instructions while its Boolean condition remains true. It can run zero times when the condition starts false."
      ],
      [
        "Make progress toward stopping",
        "A counter or other state normally changes inside the loop. Without that change, the loop might never finish. Kasa has execution limits to avoid locking up the browser."
      ],
      [
        "Trace termination",
        "Write down the condition before each repetition. Identify the first moment it becomes false, then verify that the program exits."
      ]
    ],
    "terms": [
      [
        "bere_a",
        "Repeat while a condition is true"
      ],
      [
        "gyae",
        "Exit the nearest loop"
      ],
      [
        "toa_so",
        "Continue to the next loop iteration"
      ]
    ],
    "checks": [
      "Why can a while loop execute zero times?",
      "Where should the counter be updated?"
    ]
  },
  "functions": {
    "context": "A shopkeeper needs the same gross-profit calculation for several product categories.",
    "concepts": [
      [
        "Write once, call repeatedly",
        "A function captures a reusable sequence of instructions. dwumadie begins its definition, parameters receive values and awiei closes it."
      ],
      [
        "Return is not print",
        "sanma hands a value back to the caller. ka displays a value. A reusable calculation normally returns its result so that a caller can use it elsewhere."
      ],
      [
        "Keep local reasoning clear",
        "Trace the input parameters, intermediate calculation and returned result for each call. Different calls can produce different results without duplicating the function definition."
      ]
    ],
    "terms": [
      [
        "dwumadie",
        "Define a function"
      ],
      [
        "sanma",
        "Return a value to the caller"
      ],
      [
        "parameter",
        "Named input to a function"
      ]
    ],
    "checks": [
      "What is the difference between return and print?",
      "Why is a function better than repeating a formula three times?"
    ]
  },
  "lists": {
    "context": "A cooperative keeps several item prices together rather than defining a variable for each price.",
    "concepts": [
      [
        "Collections represent related data",
        "A list stores a sequence of elements. Indices start at zero, so the first item uses index 0 and the second uses index 1."
      ],
      [
        "Do not confuse size and final index",
        "A three-item list has length 3, but its valid indices are 0, 1 and 2. Attempting index 3 is outside the list."
      ],
      [
        "Choose meaningful examples",
        "A list of market prices can be traversed to compute a total or average. Before using such code for actual accounting, consider missing entries and verification."
      ]
    ],
    "terms": [
      [
        "list",
        "Ordered collection of values"
      ],
      [
        "index",
        "Position used to access a list element"
      ],
      [
        "tentɛn()",
        "Get the length of a list"
      ]
    ],
    "checks": [
      "What index refers to the third item?",
      "Why is the final valid index one less than the length?"
    ]
  },
  "errors": {
    "context": "An apprentice sees an unfamiliar error while preparing a school report.",
    "concepts": [
      [
        "Mistakes are data",
        "A syntax error means the source does not follow Kasa's grammar. A runtime error occurs when a valid program encounters an invalid operation during execution."
      ],
      [
        "A repeatable debugging method",
        "Read the error, locate the line, form a hypothesis, change one thing and rerun. Keep the failing input so that you can verify the fix."
      ],
      [
        "Check edge cases",
        "After correcting the original failure, try empty, zero and boundary inputs when appropriate. A solution that passes one example is not automatically robust."
      ]
    ],
    "terms": [
      [
        "syntax error",
        "Source code cannot be parsed"
      ],
      [
        "runtime error",
        "An operation fails during execution"
      ],
      [
        "edge case",
        "Input near a boundary or unusual condition"
      ]
    ],
    "checks": [
      "How is a syntax error different from division by zero?",
      "Why should you retry the input that originally failed?"
    ]
  },
  "sorting": {
    "context": "A community program needs an ordered list of scores to review results.",
    "concepts": [
      [
        "Sorting as a repeatable process",
        "Bubble sort examines neighboring elements and swaps them when they are in the wrong order. After sufficient passes, elements settle into ascending order."
      ],
      [
        "Why nested loops appear",
        "An outer loop handles repeated passes, while the inner loop compares pairs. Sorting only the first pair once cannot guarantee the entire list is ordered."
      ],
      [
        "Reason about efficiency",
        "Bubble sort often takes time proportional to the square of the list length. Learn it to understand comparisons and invariants, not as the default choice for large production datasets."
      ]
    ],
    "terms": [
      [
        "swap",
        "Exchange two values"
      ],
      [
        "nested loop",
        "A loop inside another loop"
      ],
      [
        "quadratic time",
        "Work that grows roughly with the square of the input size"
      ]
    ],
    "checks": [
      "Why does one swap not guarantee a sorted list?",
      "How can you verify the output is in nondecreasing order?"
    ]
  },
  "inventory": {
    "context": "A local auto-parts shop needs to understand the gross profit on items sold.",
    "concepts": [
      [
        "Three different quantities",
        "Revenue measures sales. Cost of goods sold is the expense of the items sold. Gross profit is the difference between those two figures."
      ],
      [
        "Data quality is essential",
        "If quantity, selling price or cost is wrong, even perfectly functioning code produces a misleading report. Document assumptions and reconcile totals."
      ],
      [
        "Separate demonstration from accounting systems",
        "The learning example keeps data only in memory. It is not a substitute for transaction records, access control, backups and full accounting reconciliation."
      ]
    ],
    "terms": [
      [
        "revenue",
        "Amount generated by sales"
      ],
      [
        "COGS",
        "Cost of goods sold"
      ],
      [
        "gross profit",
        "Revenue less cost of goods sold"
      ]
    ],
    "checks": [
      "Why is gross profit not the same as net profit?",
      "What happens if recorded sales quantities are inaccurate?"
    ]
  },
  "market-profit": {
    "context": "A market trader wants to understand how much is left after buying the sold goods.",
    "concepts": [
      [
        "Start with a model",
        "Revenue less purchase cost gives a simplified profit measure. The example does not include every cost of operating a business."
      ],
      [
        "Percentages require a base",
        "Margin is profit divided by revenue, multiplied by 100. A zero-revenue case must be handled separately to avoid division by zero."
      ],
      [
        "Sensitivity matters",
        "Change prices and costs independently. Track which decisions increase or decrease the margin, and write down the reason."
      ]
    ],
    "terms": [
      [
        "margin",
        "Profit expressed as a share of revenue"
      ],
      [
        "denominator",
        "Value below the division line"
      ],
      [
        "scenario",
        "A set of assumptions tested together"
      ]
    ],
    "checks": [
      "What does a 30% margin mean?",
      "What must happen when revenue is zero?"
    ]
  },
  "grades": {
    "context": "A school wants to report the average class score without hiding weaker results.",
    "concepts": [
      [
        "Aggregation is not evaluation",
        "Averages summarize a collection, but individual student performance may differ significantly. State the threshold used to call a result a pass."
      ],
      [
        "Trace the running total",
        "Start the sum at zero and add each mark exactly once. Divide by the number of marks, not by a fixed number unrelated to the list."
      ],
      [
        "Test realistic data quality",
        "Real reporting requires checking whether marks are missing, duplicated or outside the allowed range before calculating a class summary."
      ]
    ],
    "terms": [
      [
        "average",
        "Sum divided by count"
      ],
      [
        "threshold",
        "Boundary used for a decision"
      ],
      [
        "aggregation",
        "Combining multiple values into a summary"
      ]
    ],
    "checks": [
      "Why do we divide by list length?",
      "How can a missing mark distort the average?"
    ]
  },
  "savings": {
    "context": "A youth savings group sets a contribution goal over several months.",
    "concepts": [
      [
        "Make the assumptions visible",
        "A monthly saving model assumes a fixed contribution every month and does not automatically account for withdrawals, interest or fees."
      ],
      [
        "Reason about the goal",
        "With each contribution the saved balance grows. The stopping rule checks whether the balance meets or exceeds the target."
      ],
      [
        "Observe changes",
        "Increase the goal without increasing monthly contributions. Does reaching the target take more or fewer months? Check the result against hand calculations."
      ]
    ],
    "terms": [
      [
        "goal",
        "Target value to reach"
      ],
      [
        "balance",
        "Current accumulated amount"
      ],
      [
        "projection",
        "Estimated outcome under assumptions"
      ]
    ],
    "checks": [
      "Why might actual savings differ from the projection?",
      "What condition indicates that the goal was reached?"
    ]
  },
  "welcome": {
    "context": "A senior high school learner opens Kasa for the first time on a shared computer.",
    "concepts": [
      [
        "Computing starts with a problem",
        "A program is a precise set of instructions that transforms an input into an outcome. Before typing code, decide what the computer should accomplish and how success can be checked."
      ],
      [
        "Read first, type second",
        "The Kasa browser editor lets you experiment without a paid account or installation. The skill you are developing is the ability to describe and reason about a solution."
      ],
      [
        "Build confidence through small changes",
        "Change one printed greeting, predict the result, and run it. A successful prediction proves more understanding than copying a long program."
      ]
    ],
    "terms": [
      [
        "program",
        "Set of executable instructions"
      ],
      [
        "output",
        "Information produced by a program"
      ],
      [
        "interpreter",
        "Software that executes source code"
      ]
    ],
    "checks": [
      "Name an input and output from a familiar school or market task.",
      "What did changing one line teach you about program execution?"
    ]
  },
  "install": {
    "context": "A young programmer has occasional internet access and wants to code from a home laptop.",
    "concepts": [
      [
        "Two ways to learn",
        "Browser exercises require no installation. A local command-line interpreter lets you run saved .kasa files and experiment without opening the Academy website."
      ],
      [
        "Working with files",
        "A source file contains text in Kasa syntax. Use the .kasa extension and UTF-8 encoding, especially for letters such as ɛ and ɔ."
      ],
      [
        "Develop good habits",
        "Keep your examples in a separate folder, use descriptive filenames, and check the interpreter version when instructions differ from your installation."
      ]
    ],
    "terms": [
      [
        "CLI",
        "Command-line interface"
      ],
      [
        "UTF-8",
        "Encoding that supports Kasa's accented characters"
      ],
      [
        ".kasa",
        "Kasa source file extension"
      ]
    ],
    "checks": [
      "When is the browser editor sufficient?",
      "Why does UTF-8 matter for Kasa keywords?"
    ]
  },
  "recursion": {
    "context": "A school coding club studies how a big mathematical problem can be reduced to smaller ones.",
    "concepts": [
      [
        "A function can call itself",
        "Recursion solves a problem by referring to a smaller instance of the same problem. For example, factorial of n uses n times factorial of n - 1."
      ],
      [
        "The base case must stop",
        "Every recursive process needs a base case that returns without another recursive call. Otherwise the computation can grow without end and exceed safety limits."
      ],
      [
        "Trace the stack mentally",
        "For factorial of 4, record the calls factorial(4), factorial(3), factorial(2), factorial(1), then work backwards to compute the result."
      ]
    ],
    "terms": [
      [
        "recursion",
        "Function calling itself on a smaller problem"
      ],
      [
        "base case",
        "Condition that stops recursive calls"
      ],
      [
        "call stack",
        "Record of active function calls"
      ]
    ],
    "checks": [
      "What base case does factorial need?",
      "Which smaller calls occur before factorial(4) returns?"
    ]
  },
  "list-update": {
    "context": "A store manager updates a list of product costs after receiving a new supplier quote.",
    "concepts": [
      [
        "Mutation changes existing data",
        "Updating a list element replaces the value at an index. If the original price was 50 and a new price is 55, only that position should change."
      ],
      [
        "Traversing is systematic",
        "Use a counter starting from zero and continue while it is smaller than the list length. Print or add each item once, then increase the counter."
      ],
      [
        "Check data before changing it",
        "A real app should validate that an index exists and keep the original records when auditability matters. A classroom list illustrates mechanics, not a full inventory database."
      ]
    ],
    "terms": [
      [
        "mutation",
        "Change to an existing data structure"
      ],
      [
        "traversal",
        "Visit items in a collection"
      ],
      [
        "index bounds",
        "Valid positions of a list"
      ]
    ],
    "checks": [
      "What happens when you try to update an index past the final item?",
      "How can you prove your loop visits every element once?"
    ]
  },
  "input": {
    "context": "A farmer cooperative enters quantities at the end of each market day.",
    "concepts": [
      [
        "Input is text at first",
        "The bisa() function reads a line of program input. The learner can supply lines in the Academy editor without a command-line application."
      ],
      [
        "Convert for arithmetic",
        "If an input line contains digits but needs to be multiplied, use nɔma() to convert it to a number first. A meaningful prompt and clear labels make the program easier to use."
      ],
      [
        "Be skeptical of input",
        "A real production system should reject negative quantities, invalid text and missing answers instead of treating all typed values as trustworthy."
      ]
    ],
    "terms": [
      [
        "bisa()",
        "Read a line of supplied input"
      ],
      [
        "validation",
        "Check that entered values satisfy requirements"
      ],
      [
        "conversion",
        "Change a value between representations"
      ]
    ],
    "checks": [
      "Why can you not always multiply raw user text?",
      "What invalid inputs should a farm quantity form reject?"
    ]
  },
  "student-average": {
    "context": "A teacher prepares a simple report for three subjects taught in a Ghanaian school.",
    "concepts": [
      [
        "Start with a transparent formula",
        "An average of three marks is their sum divided by three. State that each mark uses the same scale, and write down the threshold used in the learning exercise."
      ],
      [
        "Decisions need a published rule",
        "A pass condition of average >= 50 is an example, not a universal school policy. Learners should be able to alter the condition and see how the classification changes."
      ],
      [
        "Reliable systems go further",
        "If marks are missing or out of range, the program should flag them. Recording the date and source of marks matters when decisions affect real students."
      ]
    ],
    "terms": [
      [
        "mean",
        "Arithmetic average"
      ],
      [
        "pass rule",
        "Condition used to classify a result"
      ],
      [
        "data range",
        "Allowed interval for an input"
      ]
    ],
    "checks": [
      "What is the average of 45, 50 and 55?",
      "How would an invalid mark of 150 affect the calculation?"
    ]
  },
  "stock-reorder": {
    "context": "A pharmacy or small shop needs an early warning when an item is running out.",
    "concepts": [
      [
        "Stock movement is arithmetic",
        "Remaining units equal opening inventory minus units sold in a simplified example. Real movement also includes receipts, returns, damage and adjustments."
      ],
      [
        "Thresholds drive actions",
        "A reorder threshold does not predict demand automatically. It is a chosen policy: if the closing quantity is at or below the threshold, display a warning."
      ],
      [
        "Defend against impossible figures",
        "If sales exceed opening stock, negative balances should be investigated rather than presented as healthy inventory. Use a conditional to detect this edge case."
      ]
    ],
    "terms": [
      [
        "closing stock",
        "Units remaining at the end of a period"
      ],
      [
        "reorder point",
        "Quantity that triggers a restocking decision"
      ],
      [
        "negative balance",
        "A signal requiring investigation"
      ]
    ],
    "checks": [
      "What is closing stock after selling 32 from 40?",
      "Why is a negative inventory quantity suspicious?"
    ]
  },
  "saving-target": {
    "context": "Members of a youth club in Accra plan a predictable contribution schedule.",
    "concepts": [
      [
        "A repeatable savings model",
        "A fixed monthly contribution adds to an accumulated total. The model has a starting balance, contribution amount and number of months."
      ],
      [
        "Explain assumptions to users",
        "Saving 150 each month for six months produces 900 if all contributions happen. Actual balances can differ due to withdrawals or missed payments."
      ],
      [
        "Build comparisons",
        "Try different months and contribution sizes, then explain which scenario reaches a goal sooner. Record each month in a small table to verify the loop."
      ]
    ],
    "terms": [
      [
        "contribution",
        "Amount added to savings"
      ],
      [
        "accumulation",
        "Repeated addition to a total"
      ],
      [
        "assumption",
        "Condition held fixed in a model"
      ]
    ],
    "checks": [
      "Calculate the balance for 12 deposits of 200.",
      "Which real-world event could break the simple projection?"
    ]
  }
}
