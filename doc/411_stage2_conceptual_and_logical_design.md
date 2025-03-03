## UML Diagram

Insert here

## A. Assumptions for each entity and relationship in our model along with the cardinality of relationships.

### Entities

### 1. `Users`

**Purpose:** Stores core information about application users including authentication and profile data.

**Cardinality & Relationships:**
- One user can have multiple interests (1-M via `user_interests`)
- One user can have multiple friendships (1-M via `friendships`)
- One user can be a member of multiple groups (M-N via `Group_Members`)
- One user can send many messages (1-M)
- One user can create many groups and events (1-M)

**Assumptions:**
- Users are the primary actors in the system with relationships to almost all other entities.
- User profiles contain both required information (`username`, `email`) and optional details (`bio`, `location`).
- A user can exist in the system without any associated relationships to other entities.
- Privacy and security considerations require password hashing and controlled access to user data.

### 2. `Interests`

**Purpose:** Represents categories or topics that users can select and groups can be organized around.

**Cardinality & Relationships:**
- One interest can be selected by multiple users (1-M via `user_interests`)
- One interest can be associated with many groups (1-M via `Group_Interest`)

**Assumptions:**
- Interests are maintained as a controlled vocabulary to ensure consistency.
- The system uses interests for content discovery, group recommendations, and personalization.
- Interest categories are broad enough to encompass various user preferences but specific enough to be meaningful.

### 3. `Messages`

**Purpose:** Stores all communication content exchanged between users or within groups.

**Cardinality & Relationships:**
- Each message has exactly one sender (M-1)
- Each message belongs to exactly one chat (M-1)

**Assumptions:**
- Messages represent the core communication data with rich metadata.
- The `timestamp` and `read_status` enable features like message history and read receipts.
- Message content may need to support rich text, emoticons, or formatting.
- Message volume requires efficient storage and retrieval mechanisms.
- Messages must maintain context of sender and conversation even if users are deleted.

### 4. `Groups`

**Purpose:** Represents collections of users for multi-user conversations and activities.

**Cardinality & Relationships:**
- One group can have multiple members (M-N via `Group_Members`)
- Each group is associated with one primary interest (M-1 via `Group_Interest`)
- One group has exactly one chat (1-1)
- One group can have multiple events (1-M)
- Each group is created by exactly one user (M-1)

**Assumptions:**
- Groups serve as organizational units for bringing users together.
- Group creation requires tracking both creator and creation time for accountability.
- The associated interest helps define the group's purpose and aids discovery.
- Groups need their own communication channel (`chat`) for member interactions.

### 5. `Chat`

**Purpose:** Represents conversation containers that organize messages.

**Cardinality & Relationships:**
- One chat can contain many messages (1-M)
- Each chat can be associated with either one group or one friendship (1-1)

**Assumptions:**
- Chat serves as a consistent structure for organizing messages regardless of context.
- The same chat structure works for both direct messaging and group conversations.
- Chat history must be preserved even if participants change or leave.

### 6. `Event`

**Purpose:** Represents activities or gatherings organized within groups.

**Cardinality & Relationships:**
- Each event belongs to exactly one group (M-1)
- Each event is created by exactly one user (M-1)

**Assumptions:**
- Events enable group members to organize and participate in activities.
- Events require tracking of creator for permission management.
- Events belong to exactly one group and inherit membership access from that group.
- Additional event details (`time`, `location`, `description`) would likely be needed in a real implementation.

### Relationships

### 1. `user_interests`

**Purpose:** Connects users to their selected interests.

**Cardinality:** M:N relationship between `Users` and `Interests`.

**Foreign Keys:**
- `user_id` (FK to `Users.user_id`)
- `interest_id` (FK to `Interests.interest_id`)

**Assumptions:**
- The combination of `user_id` and `interest_id` uniquely identifies each relationship instance.
- This relationship allows for personalized content and group recommendations based on user preferences.

### 2. `friendships`

**Purpose:** Tracks connections between users.

**Cardinality:** M:N self-referencing relationship on `Users`.

**Foreign Keys:**
- `user1_id` (FK to `Users.user_id`)
- `user2_id` (FK to `Users.user_id`)
- `chat_id` (FK to `Chat.chat_id`)

**Assumptions:**
- Friendship status tracks relationship states (`pending`, `accepted`, `blocked`).
- Each friendship is associated with a dedicated chat for private messaging.
- The application must ensure that no duplicate friendships exist (`user1-user2` and `user2-user1`).

### 3. `Group_Members`

**Purpose:** Tracks which users belong to which groups.

**Cardinality:** M:N relationship between `Users` and `Groups`.

**Foreign Keys:**
- `user_id` (FK to `Users.user_id`)
- `group_id` (FK to `Groups.group_id`)

**Assumptions:**
- The relationship tracks when a user joined a group via `joined_at` timestamp.
- Members can have different roles within groups (`regular member`, `admin`, etc.).
- This relationship is crucial for access control to group content and activities.

### 4. `Group_Interest`

**Purpose:** Associates groups with specific interest categories.

**Cardinality:** M:1 relationship from `Groups` to `Interests`.

**Foreign Keys:**
- `interest_id` (FK to `Interests.interest_id` in the `Groups` table)

**Assumptions:**
- Each group is organized around a primary interest theme.
- This relationship enables interest-based group discovery and recommendations.
- The associated interest helps define the group's purpose and content focus.

### 5. Other Basic Relationships

**Message Sender:**
- Each message is sent by exactly one user (M:1).
- Implemented with `sender_id` FK in `Messages` table.

**Message Chat:**
- Each message belongs to exactly one chat (M:1).
- Implemented with `chat_id` FK in `Messages` table.

**Group Chat:**
- Each group has one associated chat (1:1).
- Implemented with `chat_id` FK in `Groups` table.

**Event Group:**
- Each event is organized by exactly one group (M:1).
- Implemented with `group_id` FK in `Events` table.

**Creator Relationships:**
- Users can create groups and events (1:M).
- Implemented with `created_by` FK in both `Groups` and `Events` tables.

### Keys:

- `Users(user_id)` is the PK
- `Interests(interest_id)` is the PK
- `Messages(message_id)` is the PK
- `Chat(chat_id)` is the PK
- `Groups(group_id)` is the PK
- `Events(event_id)` is the PK
- `User_interests` has a composite PK (`user_id`, `interest_id`)
- `Friendships` has a composite PK (`user1_id`, `user2_id`)
- `Group_Members` has a composite PK (`user_id`, `group_id`)


## B. Process of Normalization

### **BCNF Compliance Rules**
A database schema is in **Boyce-Codd Normal Form (BCNF)** if:
1. It is already in **Third Normal Form (3NF)**.

    a. It is in **Second Normal Form (2NF)**: No partial dependencies (i.e., every non-key attribute must depend on the whole primary key, not just part of it).
    
    b. It has no **transitive dependencies** (no non-key attribute depends on another non-key attribute, instead of the primary key).
    
4. For every functional dependency (**X → Y**), **X** must be a **superkey** (i.e., no non-trivial dependency can exist where a non-superkey determines another attribute).

### **BCNF Check for Each Table**

#### 1. **Users Table** (BCNF Compliant)
- **Functional Dependencies:**
  - `user_id → full_name, password, gender, age, location, bio, created_at`
- **user_id** is a **superkey** (it uniquely determines all attributes).
- No partial or transitive dependencies exist.

#### 2. **Interests Table** (BCNF Compliant)
- **Functional Dependency:**
  - `interest_id → interest_name`
- **interest_id** is a **superkey** since it uniquely determines the interest.

#### 3. **Messages Table** (BCNF Compliant)
- **Functional Dependencies:**
  - `message_id → sender_id, chat_id, message_text, sent_at`
- **message_id** is the **superkey**, meaning every message has a unique ID.
- No unnecessary dependencies exist.

#### 4. **Chat Table** (BCNF Compliant)
- **Functional Dependency:**
  - `chat_id → chat_name`
- **chat_id** is a **superkey**, ensuring BCNF compliance.

#### 5. **Group Table** (BCNF Compliant)
- **Functional Dependencies:**
  - `group_id → group_name, created_by, chat_id, created_at, interest_id`
- **group_id** is a **superkey** that determines all other attributes.
- No non-key attributes determine another attribute independently.

#### 6. **Event Table** (BCNF Compliant)
- **Functional Dependencies:**
  - `event_id → event_name, group_id, created_by`
- **event_id** is a **superkey**, meaning each event is uniquely identified.
- No transitive dependencies exist.

#### 7. **Relationship Tables** (BCNF by Design)
- **Junction tables** like `User_Interests`, `Friendships`, `Friendship Requests` and `Group_Members` use composite primary keys and are purely relational.
- Since their **primary key** uniquely determines all attributes, they are inherently in **BCNF**.
- No violation exists in relationship tables.

### **Conclusion**
Therefore, this schema is in **BCNF**:
- Every table has a **primary key**.
- No **non-superkey** determines another attribute.
- All functional dependencies are accounted for.

## C. Conceptual database design (ER/UML) to the logical design (relational schema)

![image](https://github.com/user-attachments/assets/1f4e7353-9be6-4b5c-9732-d61f9f5e8d08)
