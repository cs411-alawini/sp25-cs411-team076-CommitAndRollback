# Stage3: Database Implementation and Indexing 

## Data Definition Language (DDL) commands

```sql
CREATE DATABASE synapo;
USE synapo;

CREATE TABLE User (
    user_id INTEGER PRIMARY KEY,
    password VARCHAR(256),
    full_name VARCHAR(256),
    gender VARCHAR(8),
    age INTEGER,
    location VARCHAR(256),
    bio VARCHAR(256),
    created_at TIMESTAMP
);

CREATE TABLE Interests (
    interest_id INTEGER PRIMARY KEY,
    interest_name VARCHAR(256)
);

CREATE TABLE User_Interests (
    user_id INTEGER,
    interest_id INTEGER,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (interest_id) REFERENCES Interests(interest_id)
);

CREATE TABLE FriendRequests (
    sender_id INTEGER,
    receiver_id INTEGER,
    status VARCHAR(8),
    sent_at TIMESTAMP,
    PRIMARY KEY (sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES User(user_id),
    FOREIGN KEY (receiver_id) REFERENCES User(user_id)
);

CREATE TABLE Friendships (
    user1_id INTEGER,
    user2_id INTEGER,
    chat_id INTEGER,
    PRIMARY KEY (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES User(user_id),
    FOREIGN KEY (user2_id) REFERENCES User(user_id),
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id)
);

CREATE TABLE Messages (
    message_id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    chat_id INTEGER,
    message_text VARCHAR(512),
    sent_at TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES User(user_id),
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id)
);

CREATE TABLE Group_Members (
    group_id INTEGER,
    user_id INTEGER,
    joined_at TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (group_id) REFERENCES `Group`(group_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE `Group` (
    group_id INTEGER PRIMARY KEY,
    group_name VARCHAR(256),
    created_by INTEGER,
    chat_id INTEGER,
    created_at TIMESTAMP,
    interest_id INTEGER,
    FOREIGN KEY (created_by) REFERENCES User(user_id),
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id),
    FOREIGN KEY (interest_id) REFERENCES Interests(interest_id)
);

CREATE TABLE Chat (
    chat_id INTEGER PRIMARY KEY,
    chat_name VARCHAR(256)
);

CREATE TABLE Event (
    event_id INTEGER PRIMARY KEY,
    event_name VARCHAR(256),
    group_id INTEGER,
    created_by INTEGER,
    FOREIGN KEY (group_id) REFERENCES `Group`(group_id),
    FOREIGN KEY (created_by) REFERENCES User(user_id)
);
```


## Data in the tables 
<img width="433" alt="Screenshot 2025-03-19 at 9 09 10 PM" src="https://github.com/user-attachments/assets/86df5e2c-a0b6-4d6d-9455-a60189ca7efe" />


## Advanced Queries 


### Query 1
```sql
```
[Screenshot of the top 15 rows of the query]
[Explain the relevant functionalities included like JOIN, SET, GROUPBY, SUBQUERY]

### Query 2
```sql
```
[Screenshot of the top 15 rows of the query]
[Explain the relevant functionalities included like JOIN, SET, GROUPBY, SUBQUERY]

### Query 3
```sql
```
[Screenshot of the top 15 rows of the query]
[Explain the relevant functionalities included like JOIN, SET, GROUPBY, SUBQUERY]

### Query 4
```sql
```
[Screenshot of the top 15 rows of the query]
[Explain the relevant functionalities included like JOIN, SET, GROUPBY, SUBQUERY]


## Indexing 

### Index 1
```sql
```
[Before & After Screenshots]
[Explain tradeoffs]

### Index 2
```sql
```
[Before & After Screenshots]
[Explain tradeoffs]

### Index 3
```sql
```
[Before & After Screenshots]
[Explain tradeoffs]

### Final Index Chosen
```sql
```
[Screenshots]
[Explain why?]
[Reference Anlysis]
