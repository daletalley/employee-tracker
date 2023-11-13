-- Use your Employee Tracker Database
USE employee_tracker;

-- Insert Sample Departments
INSERT INTO department (name)
VALUES 
    ('Engineering'),
    ('Human Resources'),
    ('Marketing'),
    ('Sales');

-- Insert Sample Roles
-- Note: The department_ids should correspond to the ids of the departments you created above
INSERT INTO role (title, salary, department_id)
VALUES 
    ('Software Engineer', 80000, 1),
    ('Quality Assurance Engineer', 65000, 1),
    ('HR Manager', 70000, 2),
    ('Marketing Coordinator', 60000, 3),
    ('Sales Representative', 55000, 4);

-- Insert Sample Employees
-- Note: The role_ids should correspond to the ids of the roles you created above
-- The manager_id is set to NULL for top-level employees (i.e., they don't have a manager)
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Emily', 'Jones', 3, NULL),
    ('Michael', 'Brown', 4, 3),
    ('Jennifer', 'Davis', 5, 4);

-- Add more records as necessary for your testing
