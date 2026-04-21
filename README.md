# SA Home Loan Assistant 🏠🇿🇦

A high-precision mortgage modeling tool specifically designed for the South African property market. This assistant helps homeowners and prospective buyers visualize the long-term impact of extra payments, interest rate fluctuations, and bank-specific fees.

## 🚀 Key Features

- **Multi-Scenario Comparison:** Compare up to 5 different repayment strategies (Baseline, Monthly Boosts, Lump Sums, etc.) side-by-side with interactive charts.
- **South African Bank Realism:**
    - **Access Bond Simulation:** Model unspent salary and savings as an interest offset.
    - **Bank Fees & Insurance:** Includes built-in support for the Monthly Service Fee (capped at R69), Life Assurance (decreasing term), and Building Insurance (HOC).
    - **SARS Transfer Duty:** Automatically calculates upfront costs using the latest **2024/2025 SARS Transfer Duty brackets** (including the R1.1m exemption).
- **Professional Solver:** Set a "Target Payoff Date" (e.g., "I want to finish in 10 years") and the tool will automatically solve for the required extra monthly payment or annual percentage increase.
- **Rate Stress Testing:** See exactly how a 1% or 2% Repo Rate hike would affect your monthly installment and total interest paid.
- **Export & Print:**
    - **Professional PDF Reports:** Generates a clean, A4-optimized report for bank meetings or financial planning.
    - **CSV Export:** Download full amortization schedules with granular breakdowns of every cent paid.

## 🧮 Mathematical Integrity

The core calculation engine is verified against South African banking standards:
- **Daily Interest Accrual:** Uses the 365-day banker's divisor standard.
- **Gross-to-Net logic:** Fixed installment scenarios correctly prioritize fees and insurance before applying payments to the loan account.
- **The Savings Paradox:** Correcty models why extra payments are mathematically more effective as interest rates rise.

## 🛠️ Tech Stack

- **Framework:** React 19 (TypeScript)
- **Styling:** Tailwind CSS (Modern v4 engine)
- **Charts:** Recharts (High-performance SVG)
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 🛠️ Getting Started

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### Running Tests
To verify the mathematical models:
```bash
npm test
```

## 📄 Disclaimer
This tool is for illustrative purposes only. Calculations are estimates and may vary slightly from your specific bank's internal systems due to rounding differences or specific contract terms. Always consult with your financial institution for exact figures.
