# Stage 3 Revisions: Database Implementation and Indexing

This document summarizes the changes made to `stage3_database_implementation_and_indexing.md` in response to instructor feedback regarding invalid indexes on primary keys.

## Instructor Comments Addressed

- **-1.5:** Query 1 indexes 1, 2, 3 are invalid because PKs are already indexed by default
- **-1:** Query 2 indexes 1, 2 are invalid because PKs are already indexed by default
- **-0.5:** Query 4 index 2 is invalid because PKs are already indexed by default

## Summary of Changes

### Query 1: Group Recommendations Based on User Interests
- **Original Issue:** The original submission included indexes on `Group_Members(group_id, user_id)`, `Group(group_id)`, and `User_Interests(user_id, interest_id)`. All of these columns or combinations are already primary keys and thus automatically indexed by the database.
- **Revision:** All discussion and creation of these redundant indexes were removed. The document now states that no scope for improvement was found, as primary key indexing is already optimal for this query.
- **Comment Addressed:** "-1.5: Query 1 indexes 1,2,3 are invalid because PKs are already indexed by default"

### Query 2: Friend Recommendations Based on Common Interests
- **Original Issue:** The original submission included indexes on `User_Interests(user_id, interest_id)` and `Friendships(user1_id, user2_id)`, both of which are primary keys and thus already indexed.
- **Revision:** All mention of these redundant indexes was removed. Only the index on `User(age)` (which is not a primary key) is discussed as a valid optimization.
- **Comment Addressed:** "-1: Query 2 indexes 1,2 are invalid because PKs are already indexed by default"

### Query 4: Interest Popularity Analysis
- **Original Issue:** The original submission included an index on `User_Interests(interest_id, user_id)`, which is a permutation of the composite primary key and thus already indexed.
- **Revision:** All mention of this redundant index was removed. Only indexes on non-primary key columns or useful composite indexes are discussed.
- **Comment Addressed:** "-0.5: Query 4 indexes 2 are invalid because PKs are already indexed by default"

---
 