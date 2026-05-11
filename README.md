 💰 FinTrack — Money Manager
											
Take control of your finances with a sleek, intuitive personal finance tracker built from scratch with pure HTML, CSS & JavaScript.

Features · Screenshots · Tech Stack · Getting Started · Project Structure

📖 Overview
FinTrack is a client-side personal finance management application that helps you track income, expenses, savings goals, and spending patterns — all in one place. No frameworks, no build tools, just clean vanilla code with a polished dark-themed UI.

⚡ Fully client-side · No backend required · Works offline-ready

✨ Features


FinTrack Dashboard

Core financial metrics — income, expenses, net balance, and savings rate with monthly comparison.


📊 Dashboard

At-a-glance financial summary: Total Income, Total Expenses, Net Balance, Savings Rate
Month-over-month percentage change indicators
Monthly Overview visual chart
By Category expense breakdown

<img width="1366" height="639" alt="Fintrack main" src="https://github.com/user-attachments/assets/45686222-dd3f-4cb5-8083-2544f0368627" />














FinTrack Analytics

Spending trends over time and category-wise expense distribution with interactive charts.

📈 Analytics

Total transaction count & daily average spending
Top spending category & highest single expense highlighted
Daily Spending Trend — interactive line chart
Category Split — donut/pie chart for expense distribution

<img width="1364" height="634" alt="Fintrack analytics" src="https://github.com/user-attachments/assets/24cb7677-91cd-411c-b812-5b35f8a7f44b" />



FinTrack Categories

Manage all expense categories — view amounts, transaction counts, and add new ones.


🏷️ Expense Categories


Pre-defined categories: Food & Dining, Transportation, Shopping, Entertainment, Utilities, Healthcare, Education, Subscriptions

Per-category amount & transaction count at a glance
Add custom categories with the "+ Add Category" button

<img width="1360" height="634" alt="Fintrack categories" src="https://github.com/user-attachments/assets/2ecf2da4-f15d-407c-9c92-3563fffa272b" />



FinTrack Goals

Track progress on multiple savings goals with visual progress bars and quick fund actions.


🎯 Savings Goals


Create and track multiple savings goals (Vacation Fund, Emergency Fund, New Laptop, etc.)

Visual progress bars with percentage completion

Add Funds to any goal on the fly

Delete goals when no longer needed

<img width="1365" height="634" alt="Fintrack goals" src="https://github.com/user-attachments/assets/6b30830e-9daa-4327-baeb-bcb56426a55a" />



🔐 Auth System


Login & Register UI (client-side demo)

Demo dashboard available for unauthenticated users

Persistent purple banner prompting sign-in for full access


🛠️ Tech Stack


Layer	Technology

Markup	HTML5 (Semantic)

Styling	CSS3 (Custom Properties, Flexbox, Grid)

Logic	Vanilla JavaScript (ES6+)

Charts	Chart.js

Icons	Font Awesome / Lucide

Fonts	Google Fonts

🚫 Zero frameworks. No React, no Vue, no Tailwind — everything handcrafted.

🚀 Getting Started

Prerequisites

A modern web browser (Chrome, Firefox, Edge, Safari).

Installation

# 1. Clone the repositorygit clone https:/AnkitaSanjayJadhaw/github.com//FinTrack.git


# 2. Navigate into the project directorycd FinTrack


# 3. Open index.html in your browser

#    Option A — Double-click index.html

#    Option B — Use a local server (recommended)npx serve.#    orpython -m http.server 8000

That's it. No npm install, no build step.

📁 Project Structure
text

FinTrack/

├── index.html              # Main entry point

├── css/

│   ├── style.css           # Global styles & variables

│   ├── dashboard.css       # Dashboard-specific styles

│   ├── analytics.css       # Analytics page styles

│   ├── categories.css      # Categories page styles

│   └── goals.css

# Goals page styles

├── js/
│   ├── app.js              # App initialization & routing

│   ├── dashboard.js        # Dashboard logic & data

│   ├── analytics.js        # Analytics charts & calculations

│   ├── categories.js       # Category CRUD operations

│   ├── goals.js            # Savings goals management

│   └── auth.js             # Login/Register logic

├── assets/

│   └── images/             # Icons & static assets

└── README.md

🎨 Design Highlights

Dark theme with deep navy sidebar and soft card surfaces

Purple accent (#7C3AED family) for CTAs, progress bars, and notification banners

Metric cards with green/red trend indicators for instant readability

Responsive sidebar navigation with grouped sections (Main, Manage, Account)

Consistent spacing, border-radius, and shadow system via CSS custom properties


📊 Key Metrics Showcased

Metric

Demo Value

Trend

Total Income	$6,120	📈 +12.5%

Total Expenses	$494	📉 -3.2%

Net Balance	$5,626	📈 +8.1%

Savings Rate	91.9%	📈 +2.4%




🔮 Future Scope

 LocalStorage / IndexedDB persistence
 
 Export to CSV / PDF reports
 
 Recurring transaction support
 
 Multi-currency support
 
 Budget limits with overspend alerts
 
 PWA support for offline access

 
Built with ❤️ using nothing but HTML, CSS & JavaScript
