# Project Proposal

## Project Topic - Synapo 
_Synapo: A Smart Social Networking and Chat Platform_

## Project Summary
Synapo is a social networking and chat platform designed to make finding friends and building communities easier. By connecting users based on shared interests, the platform ensures that people interact with others who have similar preferences, reducing the uncertainty that comes with meeting new people.

Users can engage in one-on-one conversations or join interest-based groups for socializing, networking, and collaboration. This structured approach provides some level of assurance that new connections will be relevant, making it easier to integrate into a new environment. Beyond casual conversations, the platform can also be used to form teams for hackathons, projects, or sports events by leveraging its backend for group coordination and event planning.

## Project Description
Meeting new people and forming communities can be a challenge, especially in unfamiliar environments. Synapo simplifies this by recommending individuals and groups based on shared interests, allowing users to connect with like-minded people for various activities.

The platform supports both social and professional use cases. Users can join groups for common interests like music, gaming, or fitness, while also leveraging the platform for structured collaboration. Teams for hackathons, group projects, or sports events can be formed through the platform, ensuring that participants are aligned in their goals and interests.

Built on a real-time database, Synapo enables instant messaging and supports features like text summarization for unread messages, making communication more efficient. The platform statistically analyzes interests, helping users find relevant groups and connections without extensive searching.

By providing a structured way to meet people and form communities, Synapo reduces the randomness in networking and helps users quickly find groups and individuals suited to their interests.

## Creative Component
We plan to use the following creative components in our application:

### TL;DR of Unread Messages:
To enhance user experience, when a person is in a group with many unread messages, we will provide an interactive "TL;DR" feature. Using our backend database and external LLM APIs (for text summarization), users can request a summary of unread messages. This not only helps them catch up quickly but also makes the process interactive, where users can ask for a summary whenever needed, improving efficiency. This addresses the challenge of navigating large volumes of messages in chat groups, improving user experience through data summarization. It's technically challenging because it requires data processing, summarization using LLMs, and interactive UI components.

### Trending Groups Based on Social Connections:
We will show trending groups in the user's region, prioritized by the number of mutual friends in those groups. This will be powered entirely by our backend User database, which will analyze user data to recommend the most relevant groups. This feature ensures that users are suggested groups where they have existing connections, enhancing engagement.

## Usefulness
Our application is useful because it provides a structured and efficient way for individuals to connect with like-minded people in a safe and user-friendly environment. Unlike traditional social media platforms that focus on maintaining existing relationships, our application is designed specifically for building new connections based on shared interests, location, and activities. Users can also benefit from our application as it facilitates meaningful friendships, efficient and personalized friend discovery, and seamless and real-time interaction.

## Key Functionalities
- **User Registration and Profiles**: Users can sign up using an email address or social media login. Profiles include personal details such as name, age, interests, hobbies, bio, and the like. Users can update, edit, or delete their profiles anytime.
- **Friend & Group Recommendations**: Based on the interests added by the user during the profile creation step, the user will be recommended a set of friends and groups.
- **Friend Requests and Connections**: Users can send, accept, or decline friend requests. A dedicated friend list allows users to manage their connections efficiently.
- **Discovery & Search**: Users can search for friends based on location, shared interests, or specific keywords. A recommendation engine suggests potential friends based on user preferences and mutual interests. Filters allow users to refine searches by age, gender, activity type, and availability.
- **Real-Time Messaging**: Users can send and receive direct messages within the app. Chat supports text, images, and links for better communication.

## User Interaction Flow
1. A new user registers and sets up their profile with personal details, preferences, and interests.
2. The user searches for potential friends using filters or explores recommendations.
3. Users can send friend requests to others they find interesting.
4. Once connected, they can engage in direct messaging or plan meetups/events.
5. The platform continuously refines recommendations based on location, user activity, and changing interests.

## Similar Websites/Applications and How We Are Different
- **Facebook & Instagram**: These social media apps provide friend suggestions based on mutual connections. However, we provide friend recommendations based on common interests, hobbies, and thoughts. Facebook Groups facilitate large community discussions, while our application provides a more personalized and structured way to find individual friends and plan activities.
- **Swipe-based Apps like Bumble**: Instead of requiring users to swipe through numerous profiles like traditional dating apps, our application offers smart recommendations based on mutual interests. This allows users to effortlessly discover like-minded individuals without investing excessive time, making the friend-finding process more efficient and enjoyable.

## Realness
We are planning to use data from the following 3 datasets in our application:

1. **Social Media Users Dataset** ([Kaggle](https://www.kaggle.com/datasets/arindamsahoo/social-media-users))
   - Source: This dataset is sourced from Kaggle, a well-known repository for structured datasets.
   - Format: The dataset is available in CSV format.
   - Data Size: The dataset consists of 100,000 rows and contains 7 attributes that describe user demographics, location, and interests. With such a large number of entries, the dataset provides a diverse set of users, ensuring a broad scope of analysis when recommending chat groups.
   - Information Captured: The dataset includes user specific details such as a User ID, Name, DOB, and Gender. The Location field records the city or region of each user, making it possible to recommend geographically relevant chat groups. Additionally, the Interests attribute lists hobbies and preferences, enabling interest-based group recommendations.

2. **Student Extracurriculars Information** ([Kaggle](https://www.kaggle.com/datasets/kamakshilahoti/student-extracurriculars-info))
   - Source: This dataset is retrieved from Kaggle, where it is used to study student behavior, academic interests, and extracurricular activities.
   - Format: The dataset is structured in CSV format.
   - Data Size: The dataset contains 1,000 rows, each representing an individual student with a total of 12 attributes describing user details, location academic, extracurricular and research interests.
   - Information Captured: The dataset includes Student ID as a unique identifier, which maps to Academic Interests and Extracurricular Activities of students. It also captures attributes like Skills, Location, Year of Study, Major, GPA, and Languages of the students.

3. **UI/UX User Interaction Dataset** ([Mendeley](https://data.mendeley.com/datasets/dxthxmnkhx/6))
   - Source: This dataset is obtained from Mendeley Data, an online data-sharing platform used for academic and research purposes.
   - Format: The dataset is available in CSV format.
   - Data Size: This dataset includes 2,271 rows, representing unique user interactions across different digital platforms and 22 attributes. Each row contains multiple attributes that describe user engagement, platform preferences, and UI/UX design choices.
   - Information Captured: The dataset contains User Demographics, including name, age, and gender, which help in creating new users for our application and subsequent chat group recommendations. The dataset also records some UI/UX Elements, which describe preferences in digital design, including color schemes, typography, layout choices, and multimedia usage which will not be used for building our application.

## Key Functionalities
- **User Registration and Profiles**: Users can sign up using an email address or social media login. Profiles include personal details such as name, age, interests, hobbies, bio, and the like. Users can update, edit, or delete their profiles anytime.
- **Friend & Group Recommendations**: Based on the interests added by the user during the profile creation step, the user will be recommended a set of friends and groups.
- **Friend Requests and Connections**: Users can send, accept, or decline friend requests. A dedicated friend list allows users to manage their connections efficiently.
- **Discovery & Search**: Users can search for friends based on location, shared interests, or specific keywords. A recommendation engine suggests potential friends based on user preferences and mutual interests. Filters allow users to refine searches by age, gender, activity type, and availability.
- **Real-Time Messaging**: Users can send and receive direct messages within the app. Chat supports text, images, and links for better communication.

## User Interaction Flow
1. A new user registers and sets up their profile with personal details, preferences, and interests.
2. The user searches for potential friends using filters or explores recommendations.
3. Users can send friend requests to others they find interesting.
4. Once connected, they can engage in direct messaging or plan meetups/events.
5. The platform continuously refines recommendations based on location, user activity, and changing interests.


## Low Fidelity UI Mockup  
This application provides a seamless user experience with the following key features:

([Synapo - Figma Screens](https://www.kaggle.com/datasets/arindamsahoo/social-media-users))

#### Login/Signup:
- **Account Creation**: Users can create new accounts by providing essential information such as name, username, password, email, and location.  
- **Login**: Existing users can easily log in to their accounts using their credentials.  
- **Password Reset**: Users can conveniently reset their passwords if they forget them.  

#### Onboarding:
- **Interest Selection**: First-time users are guided through an onboarding process where they select their interests. This information is crucial for personalized recommendations and a tailored user experience.  

#### Key Screens:
##### Home Screen:
- Displays a list of groups relevant to the user's interests and mutual connections.  
- Includes a trending tag for each group based on user’s interactions and interests.  
- Includes a side menu bar with the following key functionalities:  
  - **Chat List**: Shows a list of chats, with unread chats clearly indicated.  
  - **AI Summarization**: For unread chats, an icon allows users to quickly summarize the conversation using AI, saving time and effort.  

##### Add Friends Screen:
- Users can easily search for and add new friends to their network.  

##### Profile Screen:
- Allows users to edit their profile information, including name, bio, and profile picture.  
- Allows users to update their interests and location for more accurate recommendations and connections.




## Project Work Distribution
- **Backend**: 25% each by Saurav, Anil, Abhirup, Sanjana
- **Frontend**: 25% each by Saurav, Anil, Abhirup, Sanjana
- **Database Design & Setup**: 25% each by Saurav, Anil, Abhirup, Sanjana