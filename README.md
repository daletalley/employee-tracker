# Employee-Tracker

## Description
This project showcases the creation of an application backed by a MySQL database, capable of managing employee information within an organization. It emphasizes the practical implementation of SQL queries to facilitate CRUD operations in response to user inputs.

## Installation
This application is not hosted online, hence it doesn't have a live deployment. Detailed instructions for installation and operation are available in the walkthrough video linked at the bottom of this document.

The technology stack includes Node.js, MySQL2, and the Inquirer package for command-line interactions.

## Usage
The Dale-Employee-Tracker serves as a simulated backend system for organizational employee management. The system captures details about employees, the departments they belong to, and their respective roles. This example also delineates the development lifecycle of such a system, including data seeding and manipulation based on user commands.

## How to Seed the Database
To seed the database with initial data, navigate to the project directory in your command line and run the following command:

```bash
mysql -u root -p <path_to_your_seeds.sql>
```

## How to Run the Application
To run the application, navigate to the project directory in your command line and run the following command:

```bash
node server.js
``` 
