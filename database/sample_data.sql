USE atelier_library;

INSERT INTO books (title, author, genre, isbn, quantity) VALUES
('The Alchemist', 'Paulo Coelho', 'Fiction', '9780061122415', 5),
('Things Fall Apart', 'Chinua Achebe', 'African Literature', '9780385474542', 1),
('Half of a Yellow Sun', 'Chimamanda Ngozi Adichie', 'Historical Fiction', '9781400095209', 3),
('Atomic Habits', 'James Clear', 'Personal Development', '9780735211292', 0),
('The Old Man and the Sea', 'Ernest Hemingway', 'Classic', '9780684801223', 4),
('Born a Crime', 'Trevor Noah', 'Memoir', '9780399588174', 2),
('Purple Hibiscus', 'Chimamanda Ngozi Adichie', 'African Literature', '9781616202415', 1),
('The Design of Everyday Things', 'Don Norman', 'Design', '9780465050659', 6)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO library_users (name, membership_id, role) VALUES
('Admin User', 'MEM001', 'admin'),
('John Smith', 'MEM002', 'member'),
('Mary Johnson', 'MEM003', 'member');