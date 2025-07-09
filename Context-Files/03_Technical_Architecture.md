# File 03: Technical Architecture

## 1. High-Level Diagram (Text Description)
The system is composed of four main layers running on AWS.
1.  **Data Layer**: A PostgreSQL database (AWS RDS) stores all market data, user information, and generated memos. An S3 bucket serves as a data lake for raw, unstructured data in the future. Data ingestion is managed by scheduled scripts (initially cron, later Airflow).
2.  **Inference (Agent) Layer**: A containerized Python service (using Docker) managed by AWS ECS. This layer runs the LangGraph agent orchestration. It exposes an API endpoint (built with FastAPI) to trigger analysis on a specific stock. This is where the LLM API calls (OpenAI) are made.
3.  **Application Layer**: A core back-end service (FastAPI on AWS ECS) that handles user authentication, watchlist management, and communication between the front-end and the Inference Layer. It serves the REST API for the front-end.
4.  **Presentation (Client) Layer**: A web-based front-end built with React or Vue.js, hosted on AWS Amplify or S3/CloudFront. It communicates with the Application Layer's API.

## 2. MVP Technology Stack
- **Cloud Provider**: AWS
- **Containerization**: Docker
- **Orchestration**: LangGraph
- **LLM**: OpenAI (GPT-4o-mini)
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL (AWS RDS)
- **Frontend**: React.js
- **Data Ingestion**: Python scripts (scheduled)
- **CI/CD**: GitHub Actions

## 3. Key Technical Considerations
- **Latency**: Analysis for a single stock should take less than 2 minutes. The system is designed for near-real-time analysis, not high-frequency trading (HFT).
- **Scalability**: The architecture is designed to scale horizontally. We can add more containers to the Inference and Application layers on AWS ECS to handle more clients or more frequent analyses. The database can be scaled up with AWS RDS.
- **Security**: All communication is over HTTPS. Sensitive data (like API keys) is stored in AWS Secrets Manager. User data is encrypted at rest.
- **Modularity**: The separation between layers allows for independent development and scaling. The agent-based architecture itself is modular, allowing us to easily add new agents (e.g., Macroeconomic Analyst) in the future without re-architecting the system.