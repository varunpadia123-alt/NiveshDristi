# 📊 NiveshDristi - AI-Powered Intelligent Portfolio Optimization & Analytics Engine

> **NiveshDristi** (निवेश दृष्टि) - "Investment Vision" - A sophisticated, data-driven portfolio intelligence platform that leverages AI, machine learning, and advanced technical analysis to provide retail investors with institutional-grade analytics and actionable insights.

[![TypeScript](https://img.shields.io/badge/TypeScript-59.9%25-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-39.3%25-green)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)]()

---

## 🎯 About NiveshDristi

NiveshDristi is an end-to-end portfolio optimization platform designed for retail investors in the Indian stock market. It combines:

- **AI-Powered Analytics**: Machine learning models for sentiment analysis, technical indicators, and predictive metrics
- **Risk Management Tools**: Stress testing, correlation analysis, and portfolio rebalancing recommendations
- **Intelligent Screening**: Real-time stock discovery with technical and fundamental analysis badges
- **Backtesting Sandbox**: Historical strategy validation with 3+ years of data
- **Broker Integration**: Direct portfolio sync with Zerodha Kite API
- **Beautiful Dashboard**: Modern, responsive Next.js frontend with interactive charts

### Key Features

✨ **Real-Time Portfolio Monitoring**
- Concentration risk alerts
- Live P&L tracking
- Health score visualization

🤖 **AI-Driven Intelligence**
- Multi-indicator technical analysis engine
- FinBERT sentiment analysis
- Composite scoring system with badge recommendations

💡 **Advanced Analytics**
- Stress testing with multiple scenarios
- Tax-loss harvesting recommendations
- Correlation matrix analysis
- Options screening

📈 **Backtesting & Strategy Validation**
- Historical performance simulation
- CAGR and Sharpe ratio calculations
- Technical indicator strategy testing

🔗 **Broker Integration**
- Zerodha Kite API sync
- Real-time market data
- Automated portfolio updates

---

## 🏗️ Architecture Overview

```
NiveshDristi/
├── backend/                 # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py         # FastAPI application entry
│   │   ├── models.py       # SQLAlchemy database models
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database connection & session
│   │   ├── routers/        # API endpoints
│   │   │   ├── portfolio.py
│   │   │   ├── analysis.py
│   │   │   ├── backtest.py
│   │   │   ├── risk.py
│   │   │   ├── markets.py
│   │   │   ├── discovery.py
│   │   │   └── intelligence.py
│   │   └── engine/         # Core computation engines
│   │       ├── indicators.py      # Technical analysis
│   │       ├── market_data.py     # YFinance data fetching
│   │       ├── sentiment.py       # FinBERT sentiment
│   │       ├── broker_sync.py     # Zerodha integration
│   │       └── backtest.py        # Backtesting engine
│   ├── requirements.txt    # Python dependencies
│   └── test_backend.py    # Integration tests
│
├── frontend/                # Next.js React Frontend
│   ├── src/
│   │   ├── app/            # Next.js pages & layouts
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities & helpers
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── tailwind.config.ts  # Tailwind CSS configuration
│
├── niveshdristi.db        # SQLite database (included for demo)
└── README.md              # This file
```

### Tech Stack

**Backend:**
- FastAPI (Modern Python web framework)
- SQLAlchemy (ORM for database operations)
- Pandas & NumPy (Data processing & analysis)
- YFinance (Market data provider)
- Pandas-TA (Technical indicators)
- Pydantic (Data validation)

**Frontend:**
- Next.js 16+ (React framework)
- React 19+ (UI library)
- TypeScript (Type-safe JavaScript)
- Tailwind CSS (Styling)
- Chart.js (Data visualization)
- Lucide React (Icons)

**Database:**
- SQLite (Local development)
- Extensible to PostgreSQL for production

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** & npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Clone the Repository

```bash
git clone https://github.com/varunpadia2005/NiveshDristi.git
cd NiveshDristi
```

---

## 📦 Backend Setup & Running

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Python Virtual Environment

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies Installed:**
- `fastapi>=0.104.0` - Web framework
- `uvicorn>=0.24.0` - ASGI server
- `pydantic>=2.5.0` - Data validation
- `pandas>=2.1.0` - Data analysis
- `numpy>=1.26.0` - Numerical computing
- `pandas-ta>=0.3.14b0` - Technical indicators
- `sqlalchemy>=2.0.23` - ORM
- `yfinance>=0.2.33` - Stock data
- `python-dotenv>=1.0.0` - Environment variables
- `httpx>=0.25.1` - HTTP client

### Step 4: Configure Environment Variables (Optional)

Create a `.env` file in the `backend/` directory:

```bash
# Backend Configuration
PROJECT_NAME=NiveshDristi
VERSION=0.1.0
API_V1_STR=/api

# Database Configuration
DATABASE_URL=sqlite:///./niveshdristi.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/niveshdristi

# Broker Integration (Optional)
ZERODHA_API_KEY=your_zerodha_api_key
ZERODHA_ACCESS_TOKEN=your_zerodha_access_token

# External APIs (Optional)
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```

### Step 5: Initialize Database

```bash
# Database tables are auto-created on first run via SQLAlchemy
# A sample user profile is seeded automatically
```

### Step 6: Start the Backend Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Backend will be available at:** `http://localhost:8000`

- **API Documentation (Swagger UI):** `http://localhost:8000/docs`
- **Alternative Documentation (ReDoc):** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/`

### Step 7: Run Backend Tests

```bash
# Test all endpoints
python test_backend.py
```

Expected output:
```
--- 1. Testing Root Endpoint ---
Project: NiveshDristi | Version: 0.1.0

--- 2. Testing Portfolio Summary & Concentration Risk ---
Portfolio Total Value: Rs 250,000.00
Portfolio Health Score: 78/100
Concentration Alerts: []

--- 3. Testing User Holdings with Badges & Composite Scores ---
Found 3 active holdings.
...
```

---

## 🎨 Frontend Setup & Running

### Step 1: Open New Terminal & Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Key Dependencies:**
- `next@16.3.3` - React framework
- `react@19.2.8` - UI library
- `chart.js@4.5.1` - Charting library
- `tailwindcss@4` - CSS framework
- `typescript@5` - Type safety
- `lucide-react@1.34.0` - Icons

### Step 3: Configure Environment Variables (Optional)

Create a `.env.local` file in the `frontend/` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=NiveshDristi

# Optional: For production
# NEXT_PUBLIC_API_URL=https://api.niveshdristi.com/api
```

### Step 4: Start Development Server

```bash
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

The page will auto-refresh as you edit files.

### Step 5: Build for Production

```bash
npm run build
npm start
```

### Step 6: Run Linting

```bash
npm run lint
```

---

## 🔗 Connecting Frontend & Backend

The frontend communicates with the backend via REST API calls. By default:

- **Frontend URL:** `http://localhost:3000`
- **Backend URL:** `http://localhost:8000`

The CORS (Cross-Origin Resource Sharing) is enabled on the backend to allow requests from the frontend.

### API Endpoints

#### Portfolio Management
- `GET /api/portfolio/summary` - Portfolio overview & health
- `GET /api/portfolio/holdings` - User holdings with metrics
- `POST /api/portfolio/add` - Add new holding
- `PUT /api/portfolio/update/{id}` - Update holding
- `DELETE /api/portfolio/delete/{id}` - Remove holding

#### Analysis & Metrics
- `GET /api/analysis/metrics/{ticker}` - Technical indicators & scoring
- `GET /api/analysis/alternatives` - AI swap recommendations
- `GET /api/analysis/sentiment/{ticker}` - FinBERT sentiment

#### Backtesting
- `GET /api/backtest/run` - Run strategy backtest
- `GET /api/backtest/performance` - Historical performance

#### Risk & Intelligence
- `GET /api/intelligence/stress-test` - Stress testing scenarios
- `GET /api/intelligence/rebalancing` - Rebalancing recommendations
- `GET /api/intelligence/tax-harvesting` - Tax-loss harvesting opportunities
- `GET /api/intelligence/correlation` - Correlation matrix

#### Market Data
- `GET /api/markets/search` - Stock search
- `GET /api/markets/live/{ticker}` - Live price data

---

## 🧪 Testing & Validation

### Backend Testing

```bash
cd backend

# Run full test suite
python test_backend.py

# Test specific endpoint
python -c "
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
print(client.get('/').json())
"
```

### Frontend Testing

```bash
cd frontend

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📊 Sample API Responses

### Portfolio Summary
```json
{
  "total_current_value": 250000.50,
  "total_invested_value": 230000.00,
  "total_gain_loss": 20000.50,
  "total_gain_loss_percentage": 8.7,
  "portfolio_health_score": 78,
  "concentration_alerts": [
    {
      "ticker": "RELIANCE.NS",
      "weight": 35,
      "alert": "High concentration (>30%)"
    }
  ]
}
```

### Holdings
```json
[
  {
    "id": 1,
    "ticker": "RELIANCE.NS",
    "symbol_name": "Reliance Industries",
    "quantity": 10,
    "buy_price": 2500.00,
    "current_price": 2650.50,
    "pnl_percentage": 6.02,
    "badge": "BUY",
    "composite_score": 82
  }
]
```

### Technical Metrics
```json
{
  "ticker": "RELIANCE.NS",
  "current_price": 2650.50,
  "composite_score": 82,
  "badge": "STRONG_BUY",
  "momentum_score": 78,
  "trend_score": 85,
  "volatility": 1.8,
  "sentiment_label": "POSITIVE",
  "rsi": 65,
  "macd": "BULLISH"
}
```

---

## 🔐 Security Considerations

⚠️ **Disclaimer:** NiveshDristi provides data-driven algorithmic metrics and technical indicator translation, **NOT fiduciary investment or financial advice**.

### Security Best Practices

1. **Environment Variables**: Never commit `.env` or `.env.local` files
2. **API Keys**: Rotate Zerodha and external API keys regularly
3. **Database**: Use PostgreSQL with encryption for production
4. **Authentication**: Implement JWT or OAuth2 for multi-user scenarios
5. **HTTPS**: Enable SSL/TLS in production
6. **Rate Limiting**: Implement API rate limiting
7. **Data Validation**: Pydantic ensures all inputs are validated

---

## 🚀 Deployment

### Backend Deployment (Heroku Example)

```bash
# 1. Create Procfile
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# 2. Add to requirements.txt if not present
echo "gunicorn>=21.0.0" >> backend/requirements.txt

# 3. Deploy
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect to Vercel
# Visit https://vercel.com/new and select your GitHub repo

# 3. Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend-url/api

# 4. Deploy
# Automatic on every push to main
```

### Docker Deployment

**Backend Dockerfile (in backend/):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile (in frontend/):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next .
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/public public
CMD ["npm", "start"]
```

**Docker Compose (in root directory):**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./niveshdristi.db
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
    depends_on:
      - backend
```

**Run with Docker Compose:**
```bash
docker-compose up -d
```

---

## 📚 API Documentation

Once the backend is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These provide interactive API documentation with try-it-out functionality.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📋 Project Roadmap

- [x] Portfolio tracking & P&L analysis
- [x] Technical indicator engine
- [x] Backtesting sandbox
- [x] Risk management tools
- [x] Broker integration (Zerodha)
- [ ] Multi-broker support (Angel One, Shoonya)
- [ ] Advanced ML models (LSTM, Prophet)
- [ ] Mobile app (React Native)
- [ ] Community features & social trading
- [ ] Advanced options analytics
- [ ] Real-time news sentiment integration

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚖️ Disclaimer

**IMPORTANT:** NiveshDristi is an **analytical tool for educational purposes only**. It does NOT provide financial advice or investment recommendations. Users must:

- Conduct their own due diligence
- Consult with certified financial advisors
- Understand market risks before investing
- Never invest money they cannot afford to lose

The authors assume no liability for losses incurred using this platform.

---

## 📧 Support & Contact

- **Author**: Varun Padia
- **GitHub**: [@varunpadia2005](https://github.com/varunpadia2005)
- **Email**: [varunpadia1@gmail.com](mailto:varunpadia1@gmail.com)
- **Issues**: [GitHub Issues](https://github.com/varunpadia2005/NiveshDristi/issues)

---

## 🙏 Acknowledgments

- YFinance for stock data
- Zerodha Kite for broker integration
- Pandas-TA for technical indicators
- FastAPI & Next.js communities
- All contributors and users

---

<div align="center">

**Made with ❤️ by the NiveshDristi Team**

⭐ If you find this project useful, please consider giving it a star! ⭐

</div>
