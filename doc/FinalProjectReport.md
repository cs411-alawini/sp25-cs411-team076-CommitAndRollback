**CS411 Final Project Report: CommitAndRollback**

---

### 1. 🔄 Changes from Original Proposal
In our Stage 1 proposal, the project was envisioned as an interest-based networking application with basic friend request features, interest-based group chats, and user profiles. While the core vision remained consistent, we extended the project scope by implementing additional features to better reflect realistic social platform use-cases:

- We introduced **interest-based group recommendations**, not just for users but also for group discovery, enabling users to find relevant communities more intuitively.

- We enforced real-world constraints such as:
  - **Automatically deleting groups** when the last member exits.
  - Implementing a **regex pattern check for usernames** to maintain formatting consistency and prevent misuse.

These enhancements aimed to simulate practical and scalable design decisions found in real applications. Ultimately, the direction remained aligned with our proposal, but the project matured into a more robust, feature-rich application that supports safe and meaningful interaction.


---


### 2. 🧩 Usefulness Evaluation

We believe our application successfully achieved a strong foundation of usefulness in several key areas:

- **Interest-Based Community Formation**: The ability for users to join and discover groups based on shared interests promotes meaningful interaction. By linking user interests to group recommendations, the platform encourages users to participate in communities that align with their preferences, making social engagement more relevant and purposeful.

- **Secure and Moderated Communication**: Through a structured friend request system and interest-specific group chats, we ensured that users have control over their interactions. Only accepted friends can communicate directly, and group membership is based on shared interests, reducing the potential for spam or unsolicited messages.

- **Controlled User Behavior**: We incorporated database-level enforcement mechanisms to maintain realistic and consistent user activity. These include:
  - **Automatic deletion of groups** when the last member leaves, ensuring inactive or abandoned groups do not persist in the system unnecessarily.
  - A **regex-based username validation** check, which enforces a consistent format during user creation and helps prevent invalid or malicious input.

These constraints reflect practical decisions that improve data hygiene, maintain application integrity, and simulate behaviors common to real-world social platforms.

- **Frontend Usability and Accessibility**: While all core functionalities—such as user registration, group creation, messaging, friend management, and interest-based recommendations—have been successfully implemented and are accessible through the application, the overall user experience did not meet the level of polish we had originally intended. Due to time constraints, the frontend lacks design refinements, intuitive navigation, and error handling that are essential for a smooth user journey. As a result, although the platform is fully functional from a technical standpoint, its accessibility and usability from a general user's perspective are limited.

In summary, the application is functionally complete and meets its intended goals in terms of backend capabilities and database integrity. However, improving the user interface and experience would be a critical next step in increasing its practical usefulness and adoption.


---


### 3. 🗂️ Changes to Schema or Data Source

While no major structural changes were made to the overall schema design proposed in Stage 1, we introduced several enhancements and refinements to improve data integrity and enforce stricter application logic. These changes include:

- **Attribute-level constraints**:
  - **Username validation** using a regex pattern to ensure a consistent format and disallow special characters or invalid input.
  - **Gender column constraint** to restrict values to a predefined set (e.g., 'Male', 'Female', 'Other'), preventing arbitrary free-text entries.
  - **Age validation constraint** to ensure that only values within a reasonable range (e.g., 13 to 120) are accepted in the `User` table.

- **Additional database logic**:
  - We added **stored procedures**, **triggers**, and **transactions** that were not present in the Stage 1 schema. These helped us enforce business rules like automatically deleting a group when the last member exits, and checking constraints before user creation or group addition.

Regarding data sources, we retained all the datasets we initially planned to use. However, to fully populate and test the expanded schema, we also developed a **synthetic data generation script** in Python. This script produced CSV files for key tables such as `FriendRequests`, `Friendships`, and `Messages`, allowing us to simulate realistic user activity and validate application logic under populated conditions.

These enhancements ensured that the database not only supported our intended application features but also maintained high data quality and robustness during development and testing.


---


### 4. 🧱 Changes to ER Diagram and Table Implementations

While the core structure of our ER diagram remained aligned with the initial proposal, several refinements were made to the table implementations in order to better enforce data consistency and reflect real-world application logic.

#### Key Differences from the Original Design:
- **Constraints and Validations Added**:
  - The original ER diagram did not specify column-level constraints. In the final implementation, we introduced several validations such as:
    - **Regex-based username validation** to ensure naming consistency.
    - **Enumerated gender values** to avoid inconsistent or free-text entries.
    - **Age range constraint** to prevent illogical data entries in the `User` table.

- **Enhanced Schema Logic**:
  - The final implementation introduced **triggers and stored procedures** that were not accounted for in the ER diagram. These include:
    - A trigger to **automatically delete a group** when the last member exits.
    - Stored procedures and signal-based enforcement to simulate assertion logic (e.g., group capacity enforcement).
  - These enhancements introduced implicit relationships and behaviors not captured visually in the original diagram.

- **Synthetic Data Preparation**:
  - Our ER diagram did not initially reflect the need for bulk data population. To support realistic testing, we created synthetic datasets and scripts to populate tables like `FriendRequests`, `Friendships`, and `Messages`, which allowed us to simulate actual usage patterns.

#### Reflection on Design Suitability:
The changes made to the table implementations significantly improved the overall robustness and usability of the application. If we were to revise the ER diagram today, we would:
- Explicitly annotate attribute-level constraints (e.g., CHECK constraints).
- Represent procedural logic and side-effects (like group deletion triggers) in documentation or using UML-style annotations.
- Emphasize the **interplay between entities and application logic**—especially for areas governed by database logic (e.g., rate limits, cascading deletions).

Overall, while the original design provided a solid foundation, the final implementation evolved to be more aligned with real-world needs, and the schema changes reflect a more mature and maintainable system architecture.


---


### 5. ➕➖ Functionalities Added or Removed

All core functionalities proposed in our Stage 1 submission were successfully implemented in the final project. These included user registration, friend request handling, group creation, and messaging features. However, as the project progressed, we identified several opportunities to enhance the application's realism, usability, and robustness. As a result, the following **additional functionalities** were incorporated:

- **Group-Based Recommendations**: Beyond recommending friends based on shared interests, we added functionality to recommend **interest-aligned groups** that a user might want to join. This allows users to more easily discover relevant communities.

- **Friend Request Visibility Enhancements**: The original design only included the ability to view incoming friend requests. In the final implementation, we extended this to show both:
  - **Friend requests received**
  - **Friend requests sent**  
  along with their current **status** (e.g., Pending, Accepted, Rejected) under a unified friends tab, improving transparency and user control.

- **Chat Access Restrictions**: To simulate real-world behavior and privacy, the chat system was restricted so that **users can only initiate or participate in chats if the friend request has been accepted**. This enforces mutual consent and creates a more secure interaction model.

- **Database-Level Enhancements**:
  - Introduced several **constraints**, such as regex-based username validation, restricted gender values, and age bounds to ensure clean data.
  - Implemented **triggers** to enforce business logic, such as automatically deleting a group when its last member exits.
  - Developed **stored procedures** to validate conditions like friend limits or message rate constraints before allowing certain operations.
  - Used **transactions** to maintain consistency during multi-step operations (e.g., user creation and group addition).


--- 


### 6. 🧠 Advanced Database Programs

Our application integrates a range of advanced database programming features—including stored procedures, transactions, constraints, and triggers—that directly complement and strengthen the application's functionality, integrity, and real-world usability. These elements are not just backend mechanisms; they are seamlessly tied to frontend actions, ensuring that user interactions are validated and enforced at the database level.

#### ✅ Stored Procedures
[Insert Abhirup's Procedure here]

#### ✅ Transactions
[Insert Abhirup's Transaction here]

#### ✅ Constraints
We enforced several column-level constraints that are validated in real time:
- **Regex checks for usernames** prevent invalid entries from reaching the database.
```
ALTER TABLE User
ADD CONSTRAINT check_full_name_format 
CHECK (full_name REGEXP '^[A-Za-z0-9_. ]{2,30}$');
```

- **Gender value constraints** and **age range validation** ensure data consistency.
- These constraints are triggered during frontend form submissions and provide immediate feedback when inputs are invalid.
```
ALTER TABLE User
ADD CONSTRAINT check_age 
CHECK (age IS NULL OR (age >= 13 AND age <= 120));

ALTER TABLE User
ADD CONSTRAINT check_gender_values 
CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other', 'Prefer not to say'));
```

- **Text message validation** prevent empty strings to be sent as messagaes. 
```
ALTER TABLE Messages
ADD CONSTRAINT check_message_not_empty 
CHECK (TRIM(message_text) != '');
```

#### ✅ Triggers
Triggers help maintain automated behaviors and enforce complex business rules. For instance:
- A **trigger deletes a group automatically** when the last member exits.
```
CREATE TRIGGER delete_empty_group
AFTER DELETE ON Group_Members
FOR EACH ROW
BEGIN
  -- Check if the group has any remaining members
  DECLARE member_count INT;
  
  SELECT COUNT(*) INTO member_count 
  FROM Group_Members 
  WHERE group_id = OLD.group_id;
  
  -- If no members left, delete the group
  IF member_count = 0 THEN
    DELETE FROM Group WHERE group_id = OLD.group_id;
  END IF;
END
```

These triggers are activated transparently when frontend users perform actions like leaving a group, maintaining seamless UX while preserving data integrity.

By embedding these advanced database programs into the core of our application and exposing their effects through the frontend, we were able to build a system that is secure, scalable, and user-aware—without requiring redundant checks in the application layer. This approach also simplifies maintenance and ensures consistent rule enforcement across all user interactions.


---


### 7. 🛠️ Technical Challenges

Each team member encountered unique technical challenges during the course of this project. These experiences not only contributed to the final product but also offered valuable lessons that future teams can benefit from.


**Saurav**  
*Challenge: Designing assertion-like constraints in MySQL*

One major challenge was implementing application-level assertions (e.g., max group size or message rate limits) in a database system like MySQL that does not support `CREATE ASSERTION`. The workaround involved writing stored procedures and `BEFORE INSERT` triggers to enforce these conditions manually using `SIGNAL SQLSTATE` to raise custom errors. This required a deep understanding of MySQL's limitations around triggers (e.g., the inability to use `SELECT COUNT(*)` directly across multiple rows in complex ways) and careful transaction management to ensure no unintended data corruption occurred.  
**Advice:** Write the logic as a procedure first, test it independently, and only then convert it into a trigger. Keep error messages informative so they’re easy to debug from the frontend.

---

**Abhirup**  
*Challenge: Handling data consistency during friend request and messaging operations*

Abhirup faced the challenge of ensuring that chats could only be initiated between users who were confirmed friends. This required integrating database-level logic with frontend API responses to conditionally allow or deny messaging. Designing the logic to verify friendship status across the `FriendRequests` and `Friendships` tables while maintaining real-time interactivity in the UI was a significant hurdle.  
**Advice:** Clearly define acceptable relationship states and enforce them early in both the frontend and backend. Build centralized helper functions to avoid redundant checks.

---

**Anil**  
*Challenge: Developing reusable synthetic data generation tools*

To simulate a populated application environment, Anil built a Python-based script for generating synthetic CSVs for tables like `Users`, `FriendRequests`, and `Messages`. Ensuring that the data was realistic, relationally consistent, and free of foreign key violations took several iterations.  
**Advice:** Always validate foreign key constraints before loading synthetic data into the database. Use pandas or similar libraries to automate integrity checks before exporting to CSV.

---

**Yegu**  
*Challenge: Frontend integration with backend validation and error handling*

Yegu worked on connecting the frontend with stored procedures and trigger-based logic. A key challenge was providing meaningful, user-friendly error messages when database-level constraints (e.g., group full, invalid username format) were violated. Capturing raw SQL errors and mapping them to understandable frontend prompts without leaking internal logic required careful exception handling and API design.  
**Advice:** Build a clear error-handling strategy from the start. Map each backend error to a frontend-friendly code/message, and test these scenarios thoroughly during frontend development.

These challenges helped us gain a deeper understanding of building robust, scalable full-stack applications and offered important insights for designing production-ready systems.


---


### 8. 🧾 Other Deviations from Proposal

While there was no major deviation from the original proposal, one notable addition was the generation of **synthetic datasets** using a custom Python script. This script was developed to populate all key tables—such as `Users`, `FriendRequests`, `Friendships`, `Messages`, and `Group_Members`—with realistic sample data.

This addition was not mentioned in the original proposal but became essential for testing the application at scale and validating the behavior of constraints, triggers, and stored procedures under realistic load conditions.


--- 


### 9. 🚀 Future Work (Beyond the Interface)

Beyond improving the frontend interface, there are several key areas where the application could be enhanced in future iterations:

- **Notification System**: Implementing real-time or asynchronous notifications for friend requests, group messages, and event updates would greatly enhance user engagement and reduce the need to manually check statuses.

- **Content Moderation Features**: Introducing reporting mechanisms for inappropriate behavior or content, along with admin tools for managing flagged users or groups, would help create a safer and more responsible community environment.

- **Recommendation Engine Improvements**: While basic group recommendations based on interests have been implemented, more advanced recommendations—such as suggesting friends based on mutual connections or user activity—could significantly improve personalization.

- **Search and Discovery Enhancements**: Adding search functionality for users, groups, and events would make it easier to explore the platform. Filters by interest, location, or activity level could further improve usability.

- **Analytics and Usage Tracking**: Including features for tracking group engagement, message volume, or user activity could provide valuable insights for both users and developers. These insights could also be used to improve recommendations.

- **Access Control and Privacy Settings**: Giving users more control over their profile visibility, message permissions, and group participation could improve user trust and platform flexibility.

- **Scalability Optimization**: As data grows, performance tuning (e.g., indexing strategies, caching mechanisms) and migration toward a distributed database or cloud environment may be necessary to maintain responsiveness.

Each of these areas offers opportunities to further align the application with real-world expectations for social platforms and extend its overall utility and appeal.


---


### 10. 🤝 Final Division of Labor and Teamwork

The final division of labor was equally distributed among all four team members, with each contributing approximately **25%** of the overall effort across all major aspects of the project—including frontend development, backend implementation, database design, and testing.

- **Saurav, Abhirup, Anil, and Yegu** all collaborated on full-stack tasks and shared responsibilities in areas such as:
  - Designing and implementing the database schema
  - Writing and integrating stored procedures, triggers, and constraints
  - Developing backend APIs and server logic
  - Contributing to frontend features and UI flow
  - Creating test data and validating use-cases through synthetic datasets

Team collaboration was smooth and well-coordinated. We used GitHub for version control and issue tracking, and held regular meetings to sync on progress and delegate tasks. This balanced and communicative approach allowed us to stay aligned, resolve blockers quickly, and deliver a robust final product on time.








