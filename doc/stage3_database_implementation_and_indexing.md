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

## Overview
Here we have analyzed the performance impact of various indexing strategies across four complex database queries. Each query was tested with different indexes to determine optimal configurations for enhancing query performance.

---

## Query 1: Group Recommendations Based on User Interests

### Base Query
sql
EXPLAIN ANALYZE
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


![Query 1 Before Index](https://github.com/user-attachments/assets/5d68cbdc-da62-404f-8a69-d304d6e5cf33)


### Indexes Tested

#### 1. Index on Group_Members(group_id, user_id)
*SQL:*
sql
CREATE INDEX idx_group_members_group_user ON Group_Members(group_id, user_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *52.7*
- *After Indexing:* Cost = *72.3* (Increase)

*Reason for Performance Degradation:*
- The query planner opted for a less efficient execution plan with the new index
- The composite index didn't speed up the filtering process from the NOT IN clause
- The overhead from maintaining and scanning the new index outweighed the performance benefits

![Query 1 After Group](https://github.com/user-attachments/assets/6152a4f3-cf5d-4f12-90e7-d224da86e947)

#### 2. Index on Group(group_id)
*SQL:*
sql
CREATE INDEX idx_group_group_id ON Group(group_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *52.7*
- *After Indexing:* Cost = *52.7* (No change)

*Reason for No Impact:*
- The query wasn't bottlenecked by the join on group_id
- The Group table is likely small and already scanned efficiently
- The query plan didn't involve significant operations that could be improved by this index

![Query 1 After Group id](https://github.com/user-attachments/assets/0e5bf61f-4dd1-47fe-bfc8-2de2d096f0d7)


#### 3. Index on User_Interests(user_id, interest_id)
*SQL:*
sql
CREATE INDEX idx_user_interests_user_interest ON User_Interests(user_id, interest_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *52.7*
- *After Indexing:* Cost = *44.9* (Decrease)

*Reason for Performance Improvement:*
- The index directly addressed the bottleneck in join and filtering conditions
- The database could quickly locate rows for the user_id = 1 condition
- The intermediate result set size was reduced, improving execution time
- The query planner used the index for both filtering and join operations

![Query 1 After UserInterest](https://github.com/user-attachments/assets/6b5dfc47-42d9-4a35-ae87-b1985e129a3d)

### Query 1 Conclusion
The index on User_Interests(user_id, interest_id) provided the best performance improvement, reducing query cost by approximately 15%. The index on Group_Members degraded performance, while the index on Group had no impact.

---

## Query 2: Friend Recommendations Based on Common Interests

### Base Query
sql
EXPLAIN ANALYZE
SELECT
  ui2.user_id AS recommended_user_id,
  u2.full_name AS recommended_user_name,
  COUNT(ui1.interest_id) AS common_interests,
  ABS(u1.age - u2.age) AS age_difference
FROM
  User_Interests ui1
  JOIN User_Interests ui2 ON ui1.interest_id = ui2.interest_id
  AND ui1.user_id <> ui2.user_id
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
  ui1.user_id = 1
  AND f.user1_id IS NULL
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

![Query 2](https://github.com/user-attachments/assets/50168e2f-3e55-4ae6-875a-497cf271b477)


### Indexes Tested

#### 1. Index on User_Interests(user_id, interest_id)
*SQL:*
sql
CREATE INDEX idx_user_interests_userid_interestid ON User_Interests(user_id, interest_id);

*Performance Metrics:*
- *Before Indexing:* Nested loop inner join (cost=49567, rows=75714) (actual time=16.2..1214, rows=92720, loops=1)
- *After Indexing:* Nested loop inner join (cost=54546, rows=75714) (actual time=36.1..1823, rows=92720, loops=1)

*Reason for Performance Degradation:*
- The optimizer selected a different execution plan, increasing total execution cost
- The nested loop join did not benefit as expected due to data distribution
- Index maintenance overhead increased without significantly reducing scanned rows

![Query 2 After User_interests](https://github.com/user-attachments/assets/96b003f3-52b8-44ca-b5d9-076642f059c0)


#### 2. Index on Friendships(user1_id, user2_id)
*SQL:*
sql
CREATE INDEX idx_friendships_user1_user2 ON Friendships(user1_id, user2_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *337498*
- *After Indexing:* Cost = *170689* (Significant improvement)

*Reason for Performance Improvement:*
- The hash antijoin operation on f.user1_id IS NULL became more efficient
- The index helped in faster deduplication of existing friendships
- The optimizer leveraged the hash join strategy, reducing expensive full table scans

![Query 2 After Friendship+Userid](https://github.com/user-attachments/assets/a584a477-a482-4d9f-a174-d9e6afdb3f2a)


#### 3. Index on User(age)
*SQL:*
sql
CREATE INDEX idx_user_age ON User(age);

*Performance Metrics:*
- *Before Indexing:*
  - Nested Loop Inner Join: *54546*
  - Single-Row Index Lookup (u2): *0.507*
- *After Indexing:*
  - Nested Loop Inner Join: *35261* (Significant improvement)
  - Single-Row Index Lookup (u2): *0.252*

*Reason for Performance Improvement:*
- The index optimized age-based filtering, reducing scanned rows in joins
- The query planner leveraged index scans instead of full table scans
- The join between User_Interests and User became more efficient

![Query 2 After Userid](https://github.com/user-attachments/assets/5ae98484-f80e-4732-824c-0abff5bc886c)


### Query 2 Conclusion
The combination of Friendships(user1_id, user2_id) and User(age) indexes provides the best performance improvements. The index on User_Interests(user_id, interest_id) was not beneficial and should be omitted to avoid unnecessary overhead.

---

## Query 3: Active Group Analysis

### Base Query
sql
EXPLAIN ANALYZE
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

![Query 3 Before Indexing](https://github.com/user-attachments/assets/f0df7f17-73e7-49fd-9f7d-95a1b4b8218d)


### Indexes Tested

#### 1. Index on Messages(sent_at)
*SQL:*
sql
CREATE INDEX idx_messages_sent_at ON Messages(sent_at);

*Performance Metrics:*
- *Before Indexing:* Cost = *72.5*
- *After Indexing:* Cost = *72.5* (No change)

*Reason for No Impact:*
- The filtering on sent_at may not be selective enough for performance gain
- The query planner might still choose a full table scan or alternative execution plan
- The time-based filter alone wasn't sufficient to improve performance

[Screenshot: After idx_messages_sent_at]

#### 2. Composite Index on Messages(chat_id, sent_at)
*SQL:*
sql
CREATE INDEX idx_messages_chat_sent ON Messages(chat_id, sent_at);

*Performance Metrics:*
- *Before Indexing:* Cost = *72.5*
- *After Indexing:* Cost = *65* (Improvement)

*Reason for Performance Improvement:*
- The composite index handled both the join on chat_id and the filtering on sent_at in a single lookup
- The combined filter and join reduced the number of rows processed
- The query planner leveraged this index for both operations effectively
 
![Query 3 After JOIN ](https://github.com/user-attachments/assets/7947821e-0e16-474e-aa6b-0fafa985c08f)

#### 3. Index on Group_Members(group_id)
*SQL:*
sql
CREATE INDEX idx_group_members_group ON Group_Members(group_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *72.5*
- *After Indexing:* Cost = *100* (Degradation)

*Reason for Performance Degradation:*
- The query planner chose a suboptimal plan after the index was added
- Additional index overhead in maintenance during the join negated performance gains
- The join involving Group_Members was not the primary bottleneck

![Query 3 After Group_Members lookup ](https://github.com/user-attachments/assets/38986553-b9f9-461a-99cb-9258cd68c822)


#### 4. Index on Event(group_id)
*SQL:*
sql
CREATE INDEX idx_event_group ON Event(group_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *72.5*
- *After Indexing:* No significant change

*Reason for No Impact:*
- The query was not bottlenecked by the join or event counting
- The query planner chose an approach that did not require this index
- The join on group_id in the Event table was not critical for performance

![Query 3 After Events](https://github.com/user-attachments/assets/38d174e4-662f-462a-896b-e26128d05f5c)


### Query 3 Conclusion
The composite index on Messages(chat_id, sent_at) provided the most significant performance improvement, reducing query cost from 72.5 to 65. The other indexes did not yield improvements and in some cases degraded performance.

---

## Query 4: Interest Popularity Analysis

### Base Query
sql
EXPLAIN ANALYZE
SELECT
    i.interest_id, i.interest_name,
    COUNT(DISTINCT g.group_id) AS group_count,
    COUNT(DISTINCT gm.user_id) AS group_user_count,
    COUNT(DISTINCT ui.user_id) AS individual_user_count,
    (COUNT(DISTINCT g.group_id) * 10 + COUNT(DISTINCT gm.user_id) * 5 + COUNT(DISTINCT ui.user_id) * 3) AS interest_weight
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
    i.interest_id, i.interest_name
ORDER BY
    interest_weight DESC
LIMIT 15;

![Query 4](https://github.com/user-attachments/assets/6edd668e-0d47-45d3-a6b2-709ee1841576)

### Indexes Tested

#### 1. Index on Group(interest_id, group_id)
*SQL:*
sql
CREATE INDEX idx_group_interest_group ON `Group`(interest_id, group_id);

*Performance Metrics:*
- *Before Indexing:*
  - Total Query Cost: *383381*
  - Nested Loop Join Cost: *193629*
  - Table Scan on Interests (i): *12.6*
  - Covering Index Lookup on g: *1 rows=1.39*
- *After Indexing:*
  - Total Query Cost: *380547* (Slight reduction ~0.7%)
  - Nested Loop Join Cost: *190796* (Slight reduction ~1.5%)
  - Table Scan on Interests (i): *11.9* (Minimal improvement ~5.5%)
  - Covering Index Lookup on g: *0.251 rows=1.39* (~75% faster lookup)

*Reason for Performance Improvement:*
- The index provided a modest overall cost reduction
- Notable improvement in lookup speed for the Group table (75% faster)
- The covering index significantly improved the lookup operation
  
![Query 4 After interest_group](https://github.com/user-attachments/assets/e4d0d8a4-7e34-49ae-9a59-d5b57f87ec9f)

#### 2. Index on User_Interests(interest_id, user_id)
*SQL:*
sql
CREATE INDEX idx_user_interests_interest_user ON User_Interests(interest_id, user_id);

*Performance Metrics:*
- *Before Indexing:* Cost = *380547*
- *After Indexing:* Cost = *418448* (Degradation)

*Reason for Performance Degradation:*
- The query planner opted for a less efficient execution plan after the index was introduced
- The specific query patterns didn't benefit from this index
- Added overhead without corresponding performance benefits

![Query 4 After interest_group](https://github.com/user-attachments/assets/6690bdfa-9837-4e30-9e13-ac8e31e7d112)

#### 3. Index on Interests(interest_id, interest_name)
*SQL:*
sql
CREATE INDEX idx_interests_id_name ON Interests(interest_id, interest_name);

*Performance Metrics:*
- *Before Indexing:* Cost = *418448*
- *After Indexing:* Cost = *370747* (Improvement ~12%)

*Reason for Performance Improvement:*
- The index effectively optimized queries involving interest_id and interest_name
- Reduced the need for full table scans on the Interests table
- Provided significant performance improvement for the grouping operation

![Query 4 After User_Interests](https://github.com/user-attachments/assets/af7839f5-e2ea-46cd-a276-629ee181f44a)

### Query 4 Conclusion
The index on Interests(interest_id, interest_name) provided the most significant performance improvement with a 12% reduction in query cost. The index on Group(interest_id, group_id) showed minor overall improvements but a substantial boost to lookup speed. The index on User_Interests(interest_id, user_id) was detrimental to performance.


### FINAL INDEXING WITH THE BEST SELECTIONS

![Query 4 After Best](https://github.com/user-attachments/assets/a532b788-75d0-4bc7-b606-d9e5ec23c338)
