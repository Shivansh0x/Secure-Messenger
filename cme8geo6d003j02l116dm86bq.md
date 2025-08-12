---
title: "Secure Messenger Frontend - Designing the Face of Security"
datePublished: Tue Aug 12 2025 11:24:10 GMT+0000 (Coordinated Universal Time)
cuid: cme8geo6d003j02l116dm86bq
slug: secure-messenger-frontend-designing-the-face-of-security

---

This article is a follow up to the previous one, which went through the backend of the secure messenger project, and will cover the other half, being the frontend, of the project. To be honest, the frontend was much easier for me to build than the backend since most of the tools used were ones I were already familiar and experienced with, due to [the course for React I had taken in Udemy](https://www.udemy.com/course/react-the-complete-guide-incl-redux/), as I also mentioned earlier. Thus, this article will be slightly more to the point as there won’t be much need to explain my learning phase for the same. However, I will of course include my journey and the various iterations and challenges I went through, since the month of building this project mostly did include debugging bugs in the UI which frequently arose due to styling. The frontend was no less of a step than the backend in stepping towards my goal of preparing for a quantum led future and also showcasing my passion while learning at the same time. Lastly, the frontend is deployed using Vercel which also made my life much easier, since any commit on GitHub automatically redeploys my frontend extremely quickly and its highly convenient for being a free to use service.

## Introduction

The frontend of this project is equally as important as the backend, as it is eventually what the user interacts with. The React frontend is built on top of my Flask, MySQL and Socket.IO backend. It initially started off as an extremely plain, basic UI to test out the main encryption logic I had built in the backend, but eventually turned into a sleek, finished, dark focused interface including features like a sidebar with online presence, optimistic sends, notifications and accurate timestamps considering time zones. I will say, the UI is somewhat inspired by Discord, which is the chatting app I spent my most time on due to the variety of communities present there. Thus, the online feature, the sidebar and the timestamps all may take some inspiration from it.  
This post will breakdown every component, iteration and challenge I faced, and also how I fixed them.

## Architecture and Structure

* **Framework:** React (functional components + hooks)
    
* **Styling:** Tailwind CSS (dark theme), a pinch of inline styles for layout guarantees
    
* **Transport:** Axios (REST) + [Socket.IO](http://Socket.IO) (realtime)
    
* **Crypto (UI):** `crypto-js` (AES decrypt on client)
    
* **State:** Local component state + lifted state in `App.js`
    
* **Persistence:** `localStorage` for per-user contact list
    
* **Notifications:** Web Notifications API
    

## Components

### 1) `App.js`

**Role:** Owns top-level state and wiring:

* `username` (persisted via `localStorage`)
    
* `selectedUser` (current conversation)
    
* `onlineUsers` (via socket)
    
* `contacts` (lifted from sidebar to keep a single source of truth and persist it per user in `localStorage`)
    

**Socket wiring:**

* On connect, emit `user_connected`
    
* Listen for `update_online_users` and `receive_message`
    
* Show **browser notifications with decrypted body**, not just “New message”
    
* **Auto-add new senders to contacts** (when you receive a first-time message)
    

**Rendering logic:**

* When not logged in → `<LoginForm />`
    
* When logged in → sidebar left, chat window right
    
* Default center panel shows “Select a user…” until a chat is picked
    

**Notable fixes & choices:**

* **Optimistic UI + socket re-sync**: let the UI show the message instantly, then refresh after backend confirmation
    
* **LocalStorage contacts**: restore contact list on login and **stop auto-fetching** in the sidebar to avoid overwriting user-curated list
    
* **Notifications content**: decrypt with `CryptoJS.AES.decrypt` so the notification shows the actual message text
    

---

### 2) `LoginForm.js`

**Role:** Toggle between login/register, collect credentials, call `/login` or `/register`. On success:

* Set `localStorage.username`
    
* Emit `login` event to socket (early version) or rely on `user_connected` on socket connect
    
* Call `onLogin(username)` to lift auth up to `App.js`
    

**Iterations:**

* v1: Bare form, minimal validation
    
* v2: Polished styling (dark theme, subtle focus rings)
    
* v3: Clean error states and a clearer toggle between login/register
    

**Challenge fixed:**  
Routes and socket timing occasionally raced. Final version emits presence on socket connect if `username` exists, and the backend updates the online list.

---

### 3) `ChatSidebar.js` — Contacts, Presence, and Control

**Role:**

* Show contacts (from `App.js` state)
    
* Add new chat via `+`
    
* Remove contact via hover-only “×”
    
* Show online dot **right next to the name**, “×” at the far right
    

**Key behaviors:**

* **Case-insensitive self-check**: you can’t start a chat with yourself, no matter the casing
    
* **Case-insensitive dedupe**: if you type `alice` and `Alice` is already in the list, it **opens Alice** rather than adding a duplicate
    
* **Canonical username casing**: calls `/users/:username` to fetch the exact casing from the database and displays that in the sidebar
    
* **Remove (‘×’)**: doesn’t delete history—just removes from the UI; if the removed user is currently selected, it resets to the default “pick someone” screen
    
* **Hover behavior**: “×” is visible only on hover; prevents accidental mis-click
    
* **Persistent list**: stored as `contacts-${username}` in `localStorage`
    

**Notable layout choices:**

* 100vh fixed height, flex column, header/footer with `flex-1` scroll list in between
    
* Logout section shaded to match the theme (“light black” background) and **always visible** at the bottom
    

---

### 4) `ChatWindow.js`

**Role:**

* Fetch conversation (`/chat/:me/:them`)
    
* Show messages in bubbles (yours right-aligned, theirs left)
    
* Smooth auto-scroll using a `ref` anchor
    
* **Optimistic send** (append locally before server ACK)
    
* **AES decryption** per message in UI
    
* **Discord-style time**: “Today at 3:21 PM”, “Yesterday at 11:08 AM”, else “Jul 29 at 9:04 PM”
    

**Important functions:**

* `formatTimestamp(iso)`: Today/Yesterday/date formatting with local time
    
* `decrypt(text)`: AES decrypt using `crypto-js`
    
* `sendMessage()`:
    
    * if empty → ignore
        
    * **optimistically** push a local message with ISO timestamp
        
    * POST to `/send`
        
    * re-sync via `fetchMessages()` (or wait for socket receive)
        
* `fetchMessages`: wrapped in `useCallback` to satisfy `react-hooks/exhaustive-deps` and eliminate ESLint warnings
    

**Notable fixes:**

* **The “slow send” bug** → fixed via optimistic update
    
* **Timezone bug (UTC showing)** → added `"Z"` on backend timestamps and forced local display
    
* **Exhaustive-deps warning** → `useCallback(fetchMessages)`
    
* **Auto-scroll** → `ref.scrollIntoView` on new messages
    

---

### 5) `LogoutButton.js`

**Role:**

* Clear `localStorage.username` and trigger `onLogout()`
    
* Sidebar styles ensure it’s **always visible** at the bottom
    

---

### 6) `index.css`

**Role:**

* Guarantee `html, body, #root` fill the viewport (`height: 100%`)
    
* Disable outer scroll; each panel manages its own overflow (prevents double scrollbars)
    

---

## Evolution of the app

I was initially inclined towards not building much of a frontend at all - in fact, this project was meant to be just a simple way to learn encryption, and go ahead with quantum encryption. However, my ambition for the project slowly increased as I poured in hours writing code and eventually I wanted this project to be absolutely perfect, bug-free, with good styling.

Initially, there was barely any frontend, just the bare minimum - a few buttons, a login form and a message form. Soon, I added an inbox to view messages so that I wouldn’t every time have to check the JSON file. However, I wanted to make this a sleek and clean, safe messaging app. I soon changed the favicon, gave it a fresh title “Secure Messenger”, and discovered Tailwind CSS and started styling the app to preference. I realized I loved the UI of messaging apps like Discord, and somewhat WhatsApp and thus I started off making a chat window since that was commonplace in most apps. I struggled with getting the message box to stay pinned to the bottom of the screen and not leaking out especially when the page was filled with messages and scrolling would be enabled. However, I eventually fixed the issue to make the window fit perfectly on the screen without needing to scroll to view the whole thing. The chat window included the classic chat bubbles color coded depending on who sent them, with an accurate timestamp (similar to Discord), for example “Today at 3:00 pm”. I also used polling to add live updates of messages sent so that you wouldn’t have to reload every single time to view new messages.

Next, when I showed the app to my Dad he suggested adding a way to see if your contacts were online, and thus it led me to Socket.IO tinkering which I mentioned in my previous post, but also the birth to the sidebar. Eventually, I needed a way to add people to talk to and I made a start chat “+” button that also later down the line became case insensitive to avoid duplication, and prevented you from opening a chat with yourself. Naturally, I added a “X” button to remove someone from your sidebar as well. Lastly, I also made it so that every time you logged out your sidebar order and contacts would be stored and shown the same way when you login.

Other UI elements such as the logout button were present from the start and also evolved along with the other components, much less so by themselves, just some styling tweaks and positioning adjustments. Initially I used the logout button component in App.js separately but later incorporated it in the sidebar component itself to avoid weird behavior and positioning issues. Lastly, I added notifications, which again my Dad recommended, which also include decrypted messages.

## Flowcharts, logic and working

### Start chat button

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754997760435/456e3a2c-5e3f-49b3-9ad5-c627e134666f.png align="center")

### Close chat button

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754997782115/cf8412ca-ac99-4c8c-b24e-5bbd67c1f29c.png align="center")

### Online Indicator

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1754997797591/bee71d52-6399-4a67-ad33-a306bc1dd7b6.png align="center")

## Try it live

You can try the full app [here](https://secure-messenger-one.vercel.app/).

## Conclusion - What’s to come next?

Honestly there are plethora of other features I would love to implement in this app such as deleting messages, forwarding, sending images and other media, maybe even calling. However, I have realized I shouldn’t sidetrack from my initial goal. This project was about learning about quantum-proof encryption, not about developing a full fledged market ready software, although I would love to. Yet, there is no sign of quantum proofing yet - which brings me to my next step. I will be releasing another version of this app which I’m currently working on, which shall include quantum-proof encryption, which was the real goal of this project. So far, although I have learnt a lot about cryptography, about building backends and so much more, it was all just a buildup to finally dive into a quantum related project, a subject which I’m truly interested in pursuing which will also hopefully show my burning passion to the universities I apply to as well. So, stay updated for what’s to come, as this was only a start for the actual project, and version 2 is soon to come!