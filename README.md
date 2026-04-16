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

<img width="1361" height="651" alt="fintrack 1" src="https://github.com/user-attachments/assets/9422bb78-6ced-4554-bd99-6178e99095e9" />







FinTrack Analytics

Spending trends over time and category-wise expense distribution with interactive charts.

📈 Analytics

Total transaction count & daily average spending
Top spending category & highest single expense highlighted
Daily Spending Trend — interactive line chart
Category Split — donut/pie chart for expense distribution

<img width="1362" height="639" alt="fintrack 2 analytics " src="https://github.com/user-attachments/assets/ea65f369-723f-42f5-ad00-1a290cee6bbf" />


FinTrack Categories

Manage all expense categories — view amounts, transaction counts, and add new ones.


🏷️ Expense Categories


Pre-defined categories: Food & Dining, Transportation, Shopping, Entertainment, Utilities, Healthcare, Education, Subscriptions

Per-category amount & transaction count at a glance
Add custom categories with the "+ Add Category" button

<img width="1361" height="632" alt="fintrack category" src="https://github.com/user-attachments/assets/8ed7b05b-314b-4b51-8849-42150043352a" />


FinTrack Goals

Track progress on multiple savings goals with visual progress bars and quick fund actions.


🎯 Savings Goals


Create and track multiple savings goals (Vacation Fund, Emergency Fund, New Laptop, etc.)

Visual progress bars with percentage completion

Add Funds to any goal on the fly

Delete goals when no longer needed

<img width="1363" height="638" alt="fintrack goals" src="https://github.com/user-attachments/assets/358968aa-ed08-40cf-b614-3ca4c9b56112" />


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
 
 Dark / Light theme toggle
 
 PWA support for offline access

 
Built with ❤️ using nothing but HTML, CSS & JavaScript
