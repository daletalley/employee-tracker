// server.js
// Dependencies
require("dotenv").config();
const mysql = require("mysql2");
const inquirer = require("inquirer");

// Creates a connection to the SQL database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Checking the connection to the SQL server
connection.connect(function (err) {
  if (err) throw err;
  console.log(`Connected to MySQL server on port ${connection.config.port}`);
});


// Connects to the SQL server and the SQL database
connection.connect(function (err) {
  if (err) throw err;
  cli_prompt();
});

// Array of actions to prompt the user
const mainPrompt = [
  {
    name: "action",
    type: "list",
    message: "Select an action",
    choices: [
      "View employees",
      "View roles",
      "View departments",
      "Add department",
      "Add role",
      "Add employee",
      "Edit employee",
      "Remove employee",
      "EXIT",
    ],
  },
];

// Prompt user with inquirer and execute the function corresponding to the user selection
function cli_prompt() {
  inquirer.prompt(mainPrompt).then(function (answer) {
    switch (answer.action) {
      case "View employees":
        viewAll();
        break;
      case "View departments":
        viewDept();
        break;
      case "View roles":
        viewRoles();
        break;
      case "Add employee":
        addEmployee();
        break;
      case "Add department":
        addDept();
        break;
      case "Add role":
        addRole();
        break;
      case "Edit employee":
        updateEmployee();
        break;
      case "Remove employee":
        deleteEmployee();
        break;
      case "EXIT":
        exit();
        break;
    }
  });
}

// View all employees
function viewAll() {
  let query = `
      SELECT 
        employee.first_name, 
        employee.last_name, 
        role.title, 
        role.salary, 
        department.name AS department, 
        IFNULL(CONCAT(manager.first_name, ' ', manager.last_name), 'None') AS manager
      FROM 
        employee 
      LEFT JOIN 
        employee AS manager ON manager.id = employee.manager_id
      JOIN 
        role ON role.id = employee.role_id 
      JOIN 
        department ON department.id = role.department_id 
      ORDER BY 
        employee.id;
    `;

  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    cli_prompt();
  });
}

// View all departments
function viewDept() {
  let query = "SELECT name AS department FROM department;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    cli_prompt();
  });
}

// View all roles
function viewRoles() {
  let query = `
      SELECT 
        role.title, 
        role.salary, 
        department.name AS department 
      FROM 
        role 
      JOIN 
        department ON department.id = role.department_id;
    `;

  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    cli_prompt();
  });
}

// Function to add a new employee
function addEmployee() {
  // Queries to get roles and managers for selection
  let roleQuery = "SELECT id, title FROM role";
  let managerQuery =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"; 

  connection.query(roleQuery, function (err, roles) {
    if (err) throw err;
    connection.query(managerQuery, function (err, managers) {
      if (err) throw err;

      // Prompt user to add new employee details
      inquirer
        .prompt([
          // Questions to collect employee information
          {
            name: "firstName",
            type: "input",
            message: "Enter the employee's first name:",
          },
          {
            name: "lastName",
            type: "input",
            message: "Enter the employee's last name:",
          },
          {
            name: "role",
            type: "list",
            message: "Select the employee's role:",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            name: "manager",
            type: "list",
            message: "Select the employee's manager:",
            choices: managers
              .map((manager) => ({
                name: manager.name,
                value: manager.id,
              }))
              .concat([{ name: "None", value: null }]),
          },
        ])
        .then((answers) => {
        // Insert the new employee into the database
          let insertQuery =
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
          connection.query(
            insertQuery,
            [
              answers.firstName,
              answers.lastName,
              answers.role,
              answers.manager || null,
            ],
            function (err) {
              if (err) throw err;
              console.log("Employee added successfully!");
              cli_prompt();
            }
          );
        });
    });
  });
}

// Function to add a new department
function addDept() {
  // Prompt to collect new department name
  inquirer
    .prompt([
      {
        name: "deptName",
        type: "input",
        message: "Enter the name of the new department:",
      },
    ])
    .then((answer) => {
      let insertQuery = "INSERT INTO department (name) VALUES (?);";
      connection.query(insertQuery, [answer.deptName], function (err) {
        if (err) throw err;
        console.log("Department added successfully!");
        cli_prompt();
      });
    });
}

// Function to add a new role
function addRole() {
  // Prompt to collect new role details
  let deptQuery = "SELECT id, name FROM department";
  connection.query(deptQuery, function (err, departments) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "roleTitle",
          type: "input",
          message: "Enter the title of the new role:",
        },
        {
          name: "salary",
          type: "input",
          message: "Enter the salary for this role:",
        },
        {
          name: "department",
          type: "list",
          message: "Select the department for this role:",
          choices: departments.map((dept) => ({
            name: dept.name,
            value: dept.id,
          })),
        },
      ])
      .then((answers) => {
        let insertQuery =
          "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        connection.query(
          insertQuery,
          [answers.roleTitle, answers.salary, answers.department],
          function (err) {
            if (err) throw err;
            console.log("Role added successfully!");
            cli_prompt();
          }
        );
      });
  });
}

// Function to edit an existing employee
function updateEmployee() {
  // Prompt to select and edit employee details
  let employeeQuery =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"; 

  connection.query(employeeQuery, function (err, employees) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Select an employee to edit:",
          choices: employees.map((employee) => ({
            name: employee.name,
            value: employee.id,
          })),
        },
      ])
      .then((answer) => {
        let employeeId = answer.selectedEmployee;
        let roleQuery = "SELECT id, title FROM role";
        connection.query(roleQuery, function (err, roles) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "newRole",
                type: "list",
                message: "Select the new role for the employee:",
                choices: roles.map((role) => ({
                  name: role.title,
                  value: role.id,
                })),
              },
            ])
            .then((answer) => {
              let updateQuery = "UPDATE employee SET role_id = ? WHERE id = ?"; 
              connection.query(
                updateQuery,
                [answer.newRole, employeeId],
                function (err) {
                  if (err) throw err;
                  console.log("Employee role updated successfully!");
                  cli_prompt();
                }
              );
            });
        });
      });
  });
}

// Delete an existing employee
function deleteEmployee() {
  // Prompt to select and delete an employee
    let employeeQuery =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"; 

  connection.query(employeeQuery, function (err, employees) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Select an employee to remove:",
          choices: employees.map((employee) => ({
            name: employee.name,
            value: employee.id,
          })),
        },
      ])
      .then((answer) => {
        let deleteQuery = "DELETE FROM employee WHERE id = ?"; 
        connection.query(
          deleteQuery,
          [answer.selectedEmployee],
          function (err) {
            if (err) throw err;
            console.log("Employee removed successfully!");
            cli_prompt();
          }
        );
      });
  });
}

// Function to exit the application
function exit() {
  connection.end();
  console.log("Goodbye!");
}

// Export the functions for testing or later use
module.exports = {
  viewAll,
  viewDept,
  viewRoles,
  addEmployee,
  addDept,
  addRole,
  updateEmployee,
  deleteEmployee,
  exit,
};