-- Activate the 'employee_tracker' database for use in the following operations.
USE employee_tracker;

-- Add predefined list of departments to the 'department' table.
INSERT INTO department (name)
VALUES 
    ('Engineering'),
    ('Human Resources'),
    ('Marketing'),
    ('Sales');

-- Add predefined list of roles, making sure each role is linked to an existing department.
-- The department ID should match the ID of the department previously inserted.
INSERT INTO role (title, salary, department_id)
VALUES 
    ('Software Engineer', 80000, 1),         -- Engineering department
    ('Quality Assurance Engineer', 65000, 1), -- Engineering department
    ('HR Manager', 70000, 2),                -- Human Resources department
    ('Marketing Coordinator', 60000, 3),     -- Marketing department
    ('Sales Representative', 55000, 4);      -- Sales department

-- Add predefined list of employees. Each employee is assigned a role and, optionally, a manager.
-- The manager_id is left as NULL when the employee does not report to anyone (e.g., they might be a department head).
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Doe', 1, NULL),   -- John Doe is a Software Engineer with no manager.
    ('Jane', 'Smith', 2, 1),    -- Jane Smith is a Quality Assurance Engineer reporting to John Doe.
    ('Emily', 'Jones', 3, NULL), -- Emily Jones is the HR Manager with no manager.
    ('Michael', 'Brown', 4, 3),  -- Michael Brown is a Marketing Coordinator reporting to Emily Jones.
    ('Jennifer', 'Davis', 5, 4); -- Jennifer Davis is a Sales Representative reporting to Michael Brown.

