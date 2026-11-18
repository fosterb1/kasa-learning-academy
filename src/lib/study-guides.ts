/** Instructor-authored companion activities. These do not change or overwrite CMS lesson records. */
export type StudyGuide = { objectives: [string,string]; misconception: string; guidedPractice: string; extension: string }
export const studyGuides: Record<string, StudyGuide> = {
  "welcome": {
    "objectives": [
      "Explain what a computer program does",
      "Identify which line produces each output"
    ],
    "misconception": "Confusing a program with a natural-language conversation",
    "guidedPractice": "Write down the expected output before pressing Run.",
    "extension": "Explain in your own words why changing one printed message changes only that line."
  },
  "install": {
    "objectives": [
      "Identify the difference between the browser editor and the local CLI",
      "Recognize the .kasa file extension and UTF-8 requirement"
    ],
    "misconception": "Thinking installation is required to learn Kasa",
    "guidedPractice": "Complete a browser exercise before attempting local setup.",
    "extension": "Compare what you need to run one example in the browser versus in a terminal."
  },
  "hello": {
    "objectives": [
      "Distinguish text literals from arithmetic expressions",
      "Add a comment and alter printed output"
    ],
    "misconception": "Expecting a quoted number to behave like a number",
    "guidedPractice": "Predict the results of ka 2 + 3 and ka \"2 + 3\" before running.",
    "extension": "Create a three-line greeting and calculation for a Ghanaian classroom."
  },
  "variables": {
    "objectives": [
      "Declare and update values with ma",
      "Convert a number to text when combining values"
    ],
    "misconception": "Joining text and numbers without nsɛm()",
    "guidedPractice": "Trace the value of each variable after every assignment.",
    "extension": "Create a short sales receipt with a shop name and numerical total."
  },
  "types": {
    "objectives": [
      "Identify strings, numbers and Boolean values",
      "Convert numeric text intentionally"
    ],
    "misconception": "Assuming Kasa silently changes the type of a value",
    "guidedPractice": "Test a type mismatch and record the error message.",
    "extension": "Explain when converting user input is necessary."
  },
  "arithmetic": {
    "objectives": [
      "Apply arithmetic precedence correctly",
      "Use parentheses to make calculations unambiguous"
    ],
    "misconception": "Assuming calculations always run left to right",
    "guidedPractice": "Predict the difference between 3 + 4 * 2 and (3 + 4) * 2.",
    "extension": "Design a two-item shopping total with a discount amount."
  },
  "logic": {
    "objectives": [
      "Distinguish assignment from equality",
      "Combine Boolean checks with ne, anaa and ɛnyɛ"
    ],
    "misconception": "Using = when testing whether two values are equal",
    "guidedPractice": "Make a truth table for two Boolean variables.",
    "extension": "Build an eligibility check using age and a separate requirement."
  },
  "conditions": {
    "objectives": [
      "Write a valid sɛ ... a conditional and close it with awiei",
      "Test the boundary between the two branches"
    ],
    "misconception": "Forgetting the a in a condition header or awiei at the end",
    "guidedPractice": "Predict the result for marks just below and above the pass threshold.",
    "extension": "Extend the grading decision to identify an excellent score."
  },
  "repeat": {
    "objectives": [
      "Use mpɛn for fixed-count repetition",
      "Accumulate a total over several iterations"
    ],
    "misconception": "Confusing the loop count with the final total",
    "guidedPractice": "Trace total after each of five repetitions.",
    "extension": "Calculate the value of seven equal contributions."
  },
  "while": {
    "objectives": [
      "Write a loop with a changing condition",
      "Explain how gyae and toa_so affect iteration"
    ],
    "misconception": "Failing to advance the counter and causing a non-terminating loop",
    "guidedPractice": "List counter values before executing a while loop.",
    "extension": "Print a multiplication table for the first five multiples."
  },
  "functions": {
    "objectives": [
      "Define and call a function using dwumadie",
      "Return a result with sanma"
    ],
    "misconception": "Confusing printing a value with returning it",
    "guidedPractice": "Trace parameters and the return value for two calls.",
    "extension": "Create a reusable function that calculates a simple discount."
  },
  "recursion": {
    "objectives": [
      "Identify a base case in recursive code",
      "Trace the smaller problem at each call"
    ],
    "misconception": "Omitting the base case, so calls never terminate",
    "guidedPractice": "Write the factorial call chain for n = 4 on paper.",
    "extension": "Compare recursive factorial with a loop-based calculation."
  },
  "lists": {
    "objectives": [
      "Read items using zero-based indexing",
      "Count items and distinguish valid from invalid indexes"
    ],
    "misconception": "Treating the first item as index 1",
    "guidedPractice": "Draw a numbered index under each element of a three-item list.",
    "extension": "Store three market prices and print the second price."
  },
  "list-update": {
    "objectives": [
      "Modify a list element using ma list[index]",
      "Traverse and total every list entry"
    ],
    "misconception": "Using an index greater than or equal to list length",
    "guidedPractice": "Track how a list changes after each update.",
    "extension": "Calculate a running sum of a set of shop expenses."
  },
  "input": {
    "objectives": [
      "Read browser-provided responses with bisa()",
      "Convert numeric responses with nɔma()"
    ],
    "misconception": "Assuming all user input is already numeric",
    "guidedPractice": "Provide two input lines and predict which call receives each line.",
    "extension": "Ask for a name and a quantity and print a receipt line."
  },
  "errors": {
    "objectives": [
      "Distinguish syntax errors from runtime errors",
      "Use reported line information to find a fault"
    ],
    "misconception": "Fixing only the displayed symptom without examining the cause",
    "guidedPractice": "Write down the error category, location and corrected line.",
    "extension": "Introduce, identify and fix one deliberate type mismatch."
  },
  "savings": {
    "objectives": [
      "Use iteration to accumulate savings",
      "Stop once the goal has been reached"
    ],
    "misconception": "Assuming projected savings include interest and unexpected expenses",
    "guidedPractice": "Trace the saved amount for the first four months.",
    "extension": "Compare two monthly contribution plans for the same goal."
  },
  "grades": {
    "objectives": [
      "Compute a total and mean from a list",
      "Apply an explicit pass threshold"
    ],
    "misconception": "Confusing an individual pass mark with the overall average",
    "guidedPractice": "Calculate a sample average by hand before running.",
    "extension": "Add another mark and explain why the average changes."
  },
  "inventory": {
    "objectives": [
      "Distinguish sales revenue, cost of goods sold and gross profit",
      "Calculate per-product and overall amounts"
    ],
    "misconception": "Treating gross profit as net profit after all expenses",
    "guidedPractice": "Create a hand-calculated check for one item.",
    "extension": "Add another product and verify quantities and totals."
  },
  "sorting": {
    "objectives": [
      "Explain why neighboring elements are compared",
      "Trace swapping across nested loop passes"
    ],
    "misconception": "Assuming one pass always finishes sorting the whole list",
    "guidedPractice": "Sort a short list by hand, recording each swap.",
    "extension": "Try an already sorted list and a reverse-sorted list."
  },
  "market-profit": {
    "objectives": [
      "Calculate simplified profit and profit margin",
      "Explain which operating expenses are excluded"
    ],
    "misconception": "Dividing by zero revenue when calculating margin",
    "guidedPractice": "Verify the profit of 500 revenue minus 350 cost.",
    "extension": "Add a condition for zero revenue before calculating the percentage."
  },
  "student-average": {
    "objectives": [
      "Calculate a mean from three marks",
      "Apply a stated classroom threshold"
    ],
    "misconception": "Assuming every school uses the same pass requirement",
    "guidedPractice": "Calculate the average for 45, 50 and 55 without code.",
    "extension": "Explain how a missing subject mark should be handled in a real system."
  },
  "stock-reorder": {
    "objectives": [
      "Calculate closing inventory units",
      "Trigger a reorder message at a threshold"
    ],
    "misconception": "Allowing units sold to exceed available units",
    "guidedPractice": "Test the threshold at 9, 10 and 11 units.",
    "extension": "Add validation to flag unrealistic negative balances."
  },
  "saving-target": {
    "objectives": [
      "Use counted repetition for contributions",
      "Predict accumulation over months"
    ],
    "misconception": "Treating a projection as guaranteed savings",
    "guidedPractice": "Draw a month-by-month ledger of six contributions.",
    "extension": "Compare six months and twelve months with the same payment."
  }
}
