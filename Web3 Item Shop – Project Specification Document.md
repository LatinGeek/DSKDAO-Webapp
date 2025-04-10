# **DSKDAO Item Shop – Project Specification Document**

## **Overview**

A Web3-oriented item shop where users log in via **Discord**, purchase items using tickets stored in a **Firestore database**, and participate in various reward-based activities. The application will be built using **React \+ Material UI**, with **Ethereum Layer 2** support for blockchain interactions.

---

## **Core Features**

### **1\. Authentication & User Roles**

* **Login via Discord** (wallet connection is separate).  
* **Roles:**  
  * **Admin** – Full access to manage items, users, and settings.  
  * **Moderator** – Limited access to user management and support tools.  
  * **User** – Standard user with access to purchases and games.

### **2\. Ticket-Based Economy**

* **Ticket Source:** Earned through **interactions on the DSKDAO Discord server**.  
* **Database Sync:** Firestore is the **source of truth** for ticket balances.  
* **Point System:**  
  * **Redeemable Points (Tickets & Prizes)** – Used for purchases, games, and raffles.  
  * **Soul-Bound Points (Voting Power)** – Cannot be spent and accumulate over time for governance.

### **3\. Item Shop**

* Users can **buy items using tickets**.  
* Items can be **digital (NFTs, tokens) or physical goods**.  
* Admin can manage inventory via the **Admin Dashboard**.

### **4\. Loot Box System (CS2 Style)**

* Users buy **loot boxes** with tickets.  
* Each loot box contains multiple potential prizes, but only one is awarded per opening.  
* Randomization logic **does not require Chainlink VRF**.

### **5\. Mini-Game: Ticket Burning (Plinko)**

* Users can spend tickets on a **Plinko-style** mini-game for a chance to win bigger prizes.  
* Possible prizes include **tickets, NFTs, or exclusive items**.

### **6\. Raffle System**

* Users can buy **raffle entries using tickets**.  
* Prizes may include **physical items, NFTs, or tokens**.  
* Smart contract handles **fair winner selection**.

### **7\. Admin Dashboard**

* **Manage Users:** View user balances & interactions.  
* **Manage Items:** Add, edit, or remove shop items.  
* **Ticket Distribution:** Monitor ticket economy.  
* **Game & Raffle Control:** Configure loot boxes, mini-games, and raffles.

---

## **Technical Stack**

### **Frontend**

* **React \+ Material UI** (based on provided UI Kit template).  
* **Discord OAuth2** for login authentication.  
* **Web3.js / Ethers.js** for Ethereum Layer 2 integration.  
* **Firebase** for authentication & ticket storage.

### **Backend & Database**

* **Firestore Database** (Source of truth for ticket balances).  
* **Cloud Functions** for handling purchases, loot box logic, and raffles.  
* **Admin Dashboard** built using React \+ Material UI.

### **Blockchain Integration**

* **Ethereum Layer 2** for transactions.  
* Smart contracts for:  
  * Loot box randomization.  
  * Raffle winner selection.  
  * Ticket management.

