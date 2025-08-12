---
title: "Secure Messenger Backend - Scratch to Deployment"
datePublished: Thu Aug 07 2025 15:00:01 GMT+0000 (Coordinated Universal Time)
cuid: cme1ix02y001v02jy7d657afh
slug: secure-messenger-backend-scratch-to-deployment

---

I have been working relentlessly and learning from the past month new concepts and writing lines after lines of code all for this final moment, and its finally here. This was my first full-stack project that really helped me understand what it was like making real world software, and how much code builds up to a simple, functioning, bug-free app. Honestly, I learnt a lot of new concepts and this is a really big milestone for me. I got to learn encryption, backend development, relational database management as well as deployment of the app and also experience and exposure to various services like GitHub, Render, Railway and Vercel, all of which I used for deployment. I went through several iterations during this month period which of course came with a load of challenges and hurdles that I had to pass through. This article focuses on my journey of my various backend iterations and also explains the final version, which can be found on my [GitHub repository](https://github.com/Shivansh0x/Secure-Messenger).

## The Learning Stage

Before diving into Flask or APIs, I first started learning encryption and built a local python script which simulated hybrid encryption. Next, I moved to implementing flask and made a program with no backend, and a local server with basic routes like /send, /register and /login. I also wrote logic to read/write to JSON with file locks. You can read more about how that went in my last article.

After making basic flask backend and receiving messages in JSON files, to make the process easier I started working with my React frontend alongside the backend, which helped me see the changes easily through my basic app. I will be sharing my React frontend journey separately in another article as well.

After making a login form and a message form in my app, I decided to make an inbox and thus I also made a /inbox/&lt;username&gt; route which would fetch all the decrypted messages received by the user. This was also my first GET route.

## Further progress and Moving to Databases

At this point, it was the first time I showed my progress to my Dad, and he suggested additional features I could add, still with the very basic UI I had. He suggested me to make a contacts list where anyone who had messaged you, or anyone you had messaged, would be on the list with a small circle which would turn green if they were online and grey if offline. This seemed very simple to me at the time but this feature is probably the one I spent the most time trying to perfect. I could not for the life of me get the online dot feature working. I had to use Socket.IO events for real time tracking of when a user was online or logged on, and when they logged out.

At last, I implemented 3 socket.io events all to make the online dot functional perfectly, namely user\_connected, disconnect and update\_online\_users. Socket.IO does seem to have much utility and was definitely an interesting one to learn to hand web socket events. Managing real-time events was extremely new to me, and I usually did that using polling on React, however that did not give me as accurate results as I wanted, and after much surfing Socket.IO was indeed perfect for managing real time events. I remember spending hours debugging this feature by opening multiple tabs in incognito with multiple accounts and switching to each other to see if the feature did work. However, this did get a bit tricky along databases, which was what I implemented next.

The main reason I even thought of implementing databases was after every commit to GitHub of a new iteration, which was followed by a new deployment on Render, all my data would be wiped since all the files got renewed. However, that was not very realistic especially if I had to fix bugs when multiple people were already using my app. Thus, databases seemed the perfect answer, since I was also learning about relational databases and MySQL in school at the same time. Even though other databases seemed better, I decided to stick with MySQL since that was the one I was comfortable with even in school and used SQLAlchemy. I configured MySQL using Railway’s free tier and integrated SQLAlchemy and pymysql into my backend, also connecting it with Render’s environment variables. This was a major overhaul of the project and meant I had to change almost every block of code.

The MySQL structure includes 2 tables, the User table which stores credentials and ensures unique usernames, and the Message table which stores all messages, their sender and recipient, and their UTC timestamp.

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(64), nullable=False)
    recipient = db.Column(db.String(64), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
```

After making changes to the code, I kept encountering an issue where Render would fail the deployment and return with an error, something related to pymysql not being recognized. After hours of debugging and feeling the need to give up making changes to my files multiple times, it finally happened to be a typo in my environment variable where I spelt ‘pymysql’ as ‘pymsql’. I only realized this after carefully reading the error which also had the aforementioned misspell. This mistake was the dumbest one throughout this project and yet the one that probably took the most time, almost a day, to fix.

After implementing databases and pretty much all features I wanted, I had gone through a massive UI overhaul and thus ended up making more routes as well. I wanted to make a chat window feature, similar to the one we see in modern messaging apps such as WhatsApp and Discord and thus to assist the frontend I also used a /chat/&lt;user1&gt;/&lt;user2&gt; route which fetches full chat history between the users and handles bi-directional filtering using SQL. Also, to assist the previously mentioned online dot feature, I made a /contacts/&lt;username&gt; route to fetch user’s contact list and caches to preserve last viewed stage. Making this persistent was also a challenge, but I eventually fixed it by storing contact order in localStorage.

I later implemented a feature where chat bubbles would also show timestamp of the message sent. To make this possible and show time in the user’s local timezone, after much messing around it boiled down to sending perfect UTC time to the frontend which was earlier sending time in the Render server’s time zone.

## Backend API Routes used

### `/register` (POST)

Registers a new user.

* Validates input
    
* Checks if username already exists
    
* Stores user in MySQL
    

### `/login` (POST)

Authenticates a user.

* Checks username and password
    
* Returns 401 if invalid
    

### `/send` (POST)

Sends a message from sender to recipient.

* Validates if recipient exists
    
* Saves message to the database
    

### `/chat/<user1>/<user2>` (GET)

Fetches full chat history between two users, ordered by timestamp.

* Handles bi-directional filtering using SQL
    

### `/inbox/<username>` (GET) (Later removed)

Fetches all messages received by a user.

### `/contacts/<username>` (GET)

Generates the user's contact list.

* Extracts usernames from previous chats
    
* Caches to preserve last viewed state
    

### `/users/<username>` (GET)

Checks whether a user exists and returns their correct case-accurate username.

* Useful for fixing case inconsistencies
    

### `Socket.IO` Events

* `user_connected` → Tracks online users
    
* `disconnect` → Updates user list on logout
    
* `update_online_users` → Broadcasts who is currently online
    

## Logic and flow of program

### Contact Management

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754578267399/6f6e5640-3525-42b8-a6cd-75c6caf3d509.png align="center")

### Message Sending

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754578303379/2e5fab02-ab21-4695-b4ce-d36f9bd9192e.png align="center")

### Login and Register

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754578347575/653043d1-4a73-469e-a134-4dfad101cfae.png align="center")

## Final Thoughts

Building this secure messenger backend was one of the most intense and rewarding learning experiences of my life. I started knowing just the basics of Python and React, and ended up building:

* A production-grade backend
    
* A structured MySQL-based system
    
* A real-time messaging engine with encryption logic
    

More importantly, it taught me how to debug, iterate, document, and think like a systems engineer. I plan to take this foundation further into cryptographic systems, quantum-resistant protocols, and more.

## Try the App

You can try the full app [here](https://secure-messenger-one.vercel.app/).

Also I will update you with the frontend blog soon as well, so stay tuned!