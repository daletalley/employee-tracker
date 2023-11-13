//server.js
// Dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");

// Creates a connection to the SQL database
const connection = mysql.createConnection({
    host: 'localhost', // or the appropriate hostname of your MySQL server
    port: 3306,       // make sure this is your MySQL server's port
    user: 'root',     // your MySQL username
    password: '3063091Dt!', // your MySQL password
    database: 'employee_db', // your database name
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
  inquirer
    .prompt(mainPrompt)
    .then(function (answer) {
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

// View all employees in employee_db
function viewAll() {
  let query = "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name AS department, employees.manager_id " +
              "FROM employees " +
              "JOIN roles ON roles.id = employees.role_id " +
              "JOIN department ON roles.department_id = department.id " +
              "ORDER BY employees.id;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      if (res[i].manager_id == 0) {
        res[i].manager = "None";
      } else {
        res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;
      }
      delete res[i].manager_id;
    }
    console.table(res);
    cli_prompt();
  });
}

// View all departments in employee_db
function viewDept() {
  let query = "SELECT department.dept_name AS departments FROM department;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    cli_prompt();
  });
}

// View all roles in employee_db
function viewRoles() {
  let query = "SELECT roles.title, roles.salary, department.dept_name AS department FROM roles INNER JOIN department ON department.id = roles.department_id;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    cli_prompt();
  });
}

// Add a new employee to employee_db
function addEmployee() {
    // First, fetch roles and employees to use in inquirer choices
    let roleQuery = "SELECT id, title FROM roles";
    let employeeQuery = "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees";
  
    connection.query(roleQuery, function (err, roles) {
      if (err) throw err;
      connection.query(employeeQuery, function (err, employees) {
        if (err) throw err;
  
        // Prompt user to add new employee details
        inquirer.prompt([
          {
            name: "firstName",
            type: "input",
            message: "Enter the employee's first name:"
          },
          {
            name: "lastName",
            type: "input",
            message: "Enter the employee's last name:"
          },
          {
            name: "role",
            type: "list",
            message: "Select the employee's role:",
            choices: roles.map(role => ({ name: role.title, value: role.id }))
          },
          {
            name: "manager",
            type: "list",
            message: "Select the employee's manager:",
            choices: employees.map(employee => ({ name: employee.name, value: employee.id })).concat([{ name: "None", value: null }])
          }
        ]).then(answers => {
          let insertQuery = "INSERT INTO employees SET ?";
          connection.query(insertQuery, {
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: answers.role,
            manager_id: answers.manager || null
          }, function (err) {
            if (err) throw err;
            console.log("Employee added successfully!");
            cli_prompt();
          });
        });
      });
    });
  }
  
  // Add a new department to employee_db
  function addDept() {
    inquirer.prompt([
      {
        name: "deptName",
        type: "input",
        message: "Enter the name of the new department:"
      }
    ]).then(answer => {
      let insertQuery = "INSERT INTO department SET ?";
      connection.query(insertQuery, {
        dept_name: answer.deptName
      }, function (err) {
        if (err) throw err;
        console.log("Department added successfully!");
        cli_prompt();
      });
    });
  }
  
  // Add a new role to employee_db
  function addRole() {
    // Fetch departments for role assignment
    let deptQuery = "SELECT id, dept_name FROM department";
    connection.query(deptQuery, function (err, departments) {
      if (err) throw err;
  
      inquirer.prompt([
        {
          name: "roleTitle",
          type: "input",
          message: "Enter the title of the new role:"
        },
        {
          name: "salary",
          type: "input",
          message: "Enter the salary for this role:"
        },
        {
          name: "department",
          type: "list",
          message: "Select the department for this role:",
          choices: departments.map(dept => ({ name: dept.dept_name, value: dept.id }))
        }
      ]).then(answers => {
        let insertQuery = "INSERT INTO roles SET ?";
        connection.query(insertQuery, {
          title: answers.roleTitle,
          salary: answers.salary,
          department_id: answers.department
        }, function (err) {
          if (err) throw err;
          console.log("Role added successfully!");
          cli_prompt();
        });
      });
    });
  }
  
  // Edit an existing employee in employee_db
  function updateEmployee() {
    // Fetch existing employees
    let employeeQuery = "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees";
    connection.query(employeeQuery, function (err, employees) {
      if (err) throw err;
      // Prompt user to select an employee to edit
      inquirer.prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Select an employee to edit:",
          choices: employees.map(employee => ({ name: employee.name, value: employee.id }))
        }
      ]).then(answer => {
        let employeeId = answer.selectedEmployee;
        // Fetch roles for role update
        let roleQuery = "SELECT id, title FROM roles";
        connection.query(roleQuery, function (err, roles) {
          if (err) throw err;
          inquirer.prompt([
            {
              name: "newRole",
              type: "list",
              message: "Select the new role for the employee:",
              choices: roles.map(role => ({ name: role.title, value: role.id }))
            }
          ]).then(answer => {
            let updateQuery = "UPDATE employees SET role_id = ? WHERE id = ?";
            connection.query(updateQuery, [answer.newRole, employeeId], function (err) {
              if (err) throw err;
              console.log("Employee role updated successfully!");
              cli_prompt();
            });
          });
        });
      });
    });
  }
  
  // Delete an existing employee in employee_db
  function deleteEmployee() {
    let employeeQuery = "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees";
    connection.query(employeeQuery, function (err, employees) {
      if (err) throw err;
      inquirer.prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Select an employee to remove:",
          choices: employees.map(employee => ({ name: employee.name, value: employee.id }))
        }
      ]).then(answer => {
        let deleteQuery = "DELETE FROM employees WHERE id = ?";
        connection.query(deleteQuery, [answer.selectedEmployee], function (err) {
          if (err) throw err;
          console.log("Employee removed successfully!");
          cli_prompt();
        });
      });
    });
  }
  
  // Exit employee-tracker
  function exit() {
    connection.end();
    console.log("Have a good one!");
  }
  