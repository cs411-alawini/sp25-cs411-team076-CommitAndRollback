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
SELECT
  g.group_id,
  g.group_name,
  COUNT(gm.user_id) AS member_count
FROM
  `Group` g
  JOIN User_Interests ui ON g.interest_id = ui.interest_id
  LEFT JOIN Group_Members gm ON g.group_id = gm.group_id
WHERE
  ui.user_id = 1
  AND g.group_id NOT IN (
    SELECT
      group_id
    FROM
      Group_Members
    WHERE
      user_id = 1
  )
GROUP BY
  g.group_id,
  g.group_name
ORDER BY
  member_count DESC
LIMIT
  15;
```
<img width="696" alt="Screenshot 2025-03-19 at 9 24 22 PM" src="https://github.com/user-attachments/assets/3c0a6bda-e451-4ddf-b3ca-b36c9a254589" />

### Key Functionalities in the Query

#### JOINs
- `JOIN User_Interests ui ON g.interest_id = ui.interest_id`  
  - Matches groups with the user’s interests.
- `LEFT JOIN Group_Members gm ON g.group_id = gm.group_id`  
  - Allows counting members while keeping groups with zero members.

#### WHERE Clause
- `ui.user_id = 1` → Selects groups matching the user's interests.
- `g.group_id NOT IN (SELECT group_id FROM Group_Members WHERE user_id = 1)`  
  - **Subquery:** Excludes groups where the user is already a member.

#### COUNT & GROUP BY
- `COUNT(gm.user_id)`: Counts members in each group.
- `GROUP BY g.group_id, g.group_name`: Ensures unique groups in results.

#### ORDER BY
- `ORDER BY member_count DESC`: Prioritizes more popular groups.

#### LIMIT
- `LIMIT 15`: Returns only the top **15 most popular** recommended groups.

#### Purpose
Recommends **groups based on user interests** while **excluding groups the user already joined**, ranking them by popularity.


### Query 2
```sql
SELECT
  ui2.user_id AS recommended_user_id,
  u2.full_name AS recommended_user_name,
  COUNT(ui1.interest_id) AS common_interests,
  ABS(u1.age - u2.age) AS age_difference
FROM
  User_Interests ui1
  JOIN User_Interests ui2 ON ui1.interest_id = ui2.interest_id
  AND ui1.user_id <> ui2.user_id -- Ensure they are different users
  JOIN User u1 ON ui1.user_id = u1.user_id
  JOIN User u2 ON ui2.user_id = u2.user_id
  LEFT JOIN Friendships f ON (
    f.user1_id = ui1.user_id
    AND f.user2_id = ui2.user_id
  )
  OR (
    f.user2_id = ui1.user_id
    AND f.user1_id = ui2.user_id
  )
WHERE
  ui1.user_id = 1 -- Replace '?' with the current user ID
  AND f.user1_id IS NULL -- Ensure they are NOT already friends
GROUP BY
  ui2.user_id,
  u2.full_name,
  u1.age,
  u2.age
ORDER BY
  common_interests DESC,
  age_difference ASC
LIMIT
  15;
```
<img width="696" alt="Screenshot 2025-03-19 at 9 26 50 PM" src="https://github.com/user-attachments/assets/6ca29d12-f340-4cb8-97ce-1ee2f1acafbd" />
<img width="696" alt="Screenshot 2025-03-19 at 9 27 10 PM" src="https://github.com/user-attachments/assets/0a5353a2-9494-4c2c-ae7f-71da8343c976" />

[Explain the relevant functionalities included like JOIN, SET, GROUPBY, SUBQUERY]


### Query 3
```sql
SELECT
  g.group_id,
  g.group_name,
  COUNT(DISTINCT m.message_id) AS message_count,
  COUNT(DISTINCT gm.user_id) AS member_count,
  COUNT(DISTINCT e.event_id) AS event_count
FROM
  `Group` g
  JOIN Group_Members gm ON g.group_id = gm.group_id
  JOIN Messages m ON g.chat_id = m.chat_id
  LEFT JOIN Event e ON g.group_id = e.group_id
WHERE
  m.sent_at >= NOW() - INTERVAL 7 DAY
GROUP BY
  g.group_id,
  g.group_name
ORDER BY
  message_count DESC,
  event_count DESC,
  member_count DESC
LIMIT
  15;
```
<img width="692" alt="Screenshot 2025-03-19 at 9 54 21 PM" src="https://github.com/user-attachments/assets/3e1d19d2-283f-469a-bfb5-c3bd71035890" />


### Key Functionalities in the Query

#### JOINs
- Combines `Group`, `Group_Members`, `Messages`, and `Event` tables.
- `LEFT JOIN` ensures groups without events are included.

#### WHERE Clause
- Filters messages sent in the **last 7 days**.

#### COUNT & DISTINCT
- Counts unique **messages, members, and events** per group.

#### GROUP BY
- Groups results by `group_id` to aggregate data.

#### ORDER BY
- Sorts by **message count (desc) → event count (desc) → member count (desc)**.

#### LIMIT 15
- Selects **top 15 trending groups** based on activity.

#### Purpose
Finds active groups based on recent messages, events, and members.

### Query 4
```sql
SELECT
    i.interest_id,   i.interest_name,
    COUNT(DISTINCT g.group_id) AS group_count,
    COUNT(DISTINCT gm.user_id) AS group_user_count,
    COUNT(DISTINCT ui.user_id) AS individual_user_count,
    (     COUNT(DISTINCT g.group_id) * 10 + COUNT(DISTINCT gm.user_id) * 5 + COUNT(DISTINCT ui.user_id) * 3   ) AS interest_weight
FROM
    Interests i
LEFT JOIN
    `Group` g
ON
    i.interest_id = g.interest_id
LEFT JOIN
    Group_Members gm
ON
    g.group_id = gm.group_id
LEFT JOIN
    User_Interests ui
ON
    i.interest_id = ui.interest_id
GROUP BY
    i.interest_id,   i.interest_name
ORDER BY
    interest_weight DESC
LIMIT  15;
```
<img width="1469" alt="Screenshot 2025-03-19 at 9 33 09 PM" src="https://github.com/user-attachments/assets/7d719fe3-00a7-4c76-af9c-ce1f62eb7936" />
<img width="1469" alt="Screenshot 2025-03-19 at 9 33 48 PM" src="https://github.com/user-attachments/assets/e4ea32e2-b5aa-4314-ad2a-fc53b228f83e" />
<img width="1469" alt="Screenshot 2025-03-19 at 9 34 00 PM" src="https://github.com/user-attachments/assets/fd953fba-c521-4d5b-bbfe-668d2539b8ef" />


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
