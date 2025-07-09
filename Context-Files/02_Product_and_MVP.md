# File 02: Product and MVP Specification

## 1. Core Product
We are building a **Software-as-a-Service (SaaS) platform**. It will be a white-label ready, multi-agent framework that clients (hedge funds) can configure and deploy to augment their investment decision-making process.

## 2. Minimal Viable Product (MVP) Specification

The MVP, "Chimera Alpha," is a web-based dashboard that allows a Portfolio Manager to receive and evaluate AI-generated investment theses for a specific universe of US equities.

### 2.1. Key User Stories
- "As a PM, I want to define a watchlist of 20 US stocks so I can focus the AI's analysis on my area of expertise."
- "As a PM, I want to receive a daily 'Investment Memo' for any stock on my watchlist that has a significant change in outlook."
- "As a PM, I want to review the complete reasoning for a trade recommendation, including the analyses from the Fundamental, Technical, and Sentiment agents."
- "As a PM, I want to see the key risk factors and the proposed position size for a new trade, as determined by the Risk Management agent."
- "As a PM, I want to click 'approve' or 'reject' on a trade proposal and have my decision logged for compliance."

### 2.2. Must-Have MVP Features
- **User Authentication & Management**: Secure login for fund clients.
- **Watchlist Management**: Simple UI to add/remove tickers (MVP limited to 20 tickers from the S&P 500).
- **Memo Dashboard**: A view that lists all generated investment memos, sortable by date, ticker, and recommendation (Buy/Sell/Hold).
- **Memo Detail View**: A full-page view of a single memo, clearly showing the structured output from each contributing agent (e.g., "Fundamental Analyst finds P/E ratio is 30% below sector average," "Sentiment Analyst reports a 25% spike in positive social media mentions").
- **Decision Logging**: 'Approve'/'Reject' buttons that log the PM's action with a timestamp. (Note: MVP does not include execution).
- **Email Notifications**: Daily summary email of new memos.

### 2.3. Data Sources & Ingestion Pipeline (MVP)
- **Pricing Data**: Finnhub (free tier) for daily EOD prices.
- **Fundamentals Data**: Finnhub (free tier) for core financials (revenue, net income, EPS, P/E).
- **News & Sentiment Data**: Finnhub (free tier) for basic company news.
- **Pipeline**: A simple, scheduled daily data ingestion script (e.g., Python script managed by a cron job) that pulls data from Finnhub API and stores it in our PostgreSQL database.

### 2.4. LLM/Agent Orchestration (MVP)
- **Framework**: LangGraph.
- **LLM Model**: GPT-4o-mini for cost-effective reasoning.
- **Agent Roles**:
    1.  **Coordinator Agent**: Triggers the workflow daily for each stock in the watchlist.
    2.  **Data Retrieval Agent**: Fetches the latest price, fundamental, and news data for a given stock from the database.
    3.  **Fundamental Analyst Agent**: Analyzes financial data.
    4.  **Technical Analyst Agent**: Analyzes price/volume data (e.g., RSI, moving averages).
    5.  **News/Sentiment Analyst Agent**: Summarizes recent news.
    6.  **Chief Strategist Agent**: Synthesizes the findings from the analysts into a coherent investment thesis and recommendation (Buy/Sell/Hold).
    7.  **Risk Manager Agent**: Evaluates the thesis and suggests a position size or flags key risks.
- **Orchestration Flow**: A directed graph in LangGraph where the Coordinator passes the ticker to the three analyst agents, who work in parallel. Their outputs are then passed to the Chief Strategist, whose report is then passed to the Risk Manager for final assessment.
- **Evaluation Loop**: For the MVP, this is manual. The PM's 'Approve'/'Reject' decisions are the primary feedback mechanism, logged for later analysis.