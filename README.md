# Invoice Generator

A modern, fast, and beautiful web application that transforms your Clockify time reports into professional Excel invoices in seconds. Built with React and Vite, it features a stunning glassmorphic user interface layered over nature-inspired backgrounds.

## Features

- **Upload Clockify Reports:** Easily drag-and-drop or browse to upload your Clockify CSV time reports.
- **Customizable Details:** Specify the invoice number, issue date, and your hourly billing rate.
- **Excel Generation:** Automatically parses your time data and injects it directly into a professionally formatted Excel template (`.xlsx`).
- **Modern UI:** A sleek combination of a clean, structured layout with dynamic glassmorphism aesthetics.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- `npm` (Node Package Manager)

## Getting Started

1. **Install Dependencies**
   Navigate to the project directory and install the necessary dependencies using npm:
   ```bash
   npm install
   ```

2. **Run the Development Server**
   Start the application locally by running:
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Once the server starts, it will provide a local URL (typically `http://localhost:5173`). Open this URL in your browser to view and interact with the application.

## How to Use

1. Prepare your time tracking data by exporting it from Clockify as a **CSV** file.
2. Drag and drop the CSV file into the "Time Report Data" area on the dashboard.
3. Update the **Invoice Number**, **Invoice Date**, and **Hourly Rate** fields in the "Basic Info" card.
4. Click the vibrant green **Send Invoice** button to instantly generate and download your formatted Excel invoice.

## Technologies Used

- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v4) with custom glassmorphism utilities
- **File Parsing:** PapaParse (for CSV reading)
- **Excel Generation:** ExcelJS (for `.xlsx` creation and manipulation)
- **Icons:** Lucide React
