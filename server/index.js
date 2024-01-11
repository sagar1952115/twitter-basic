const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// In-memory storage for users and messages
let users = [
  {
    username: "sagar@gmail.com",
    password: "sagar",
    name: "sagar",
    followers: ["sagar1@gmail.com", "sagar3@gmail.com"],
    following: [
      "sagar1@gmail.com",
      "sagar2@gmail.com",
      "sagar3@gmail.com",
      "sagar4@gmail.com",
    ],
    messages: [
      {
        username: "sagar@gmail.com",
        text: "hello world",
        timestamp: "2024-01-11T10:54:44.528Z",
      },
      {
        username: "sagar@gmail.com",
        text: "hello world Message posted successfully",
        timestamp: "2024-01-11T10:55:03.723Z",
      },
      {
        username: "sagar@gmail.com",
        text: "hello world Message posted successfully hello world Message posted successfully",
        timestamp: "2024-01-11T10:55:25.189Z",
      },
    ],
  },
  {
    username: "sagar1@gmail.com",
    password: "sagar",
    name: "sagar1",
    followers: ["sagar@gmail.com"],
    following: ["sagar@gmail.com", "sagar2@gmail.com", "sagar4@gmail.com"],
    messages: [
      {
        username: "sagar1@gmail.com",
        text: "hello world Message posted successfully hello world Message posted successfully",
        timestamp: "2024-01-11T10:55:31.772Z",
      },
    ],
  },
  {
    username: "sagar2@gmail.com",
    name: "sagar2",
    password: "sagar",
    followers: ["sagar@gmail.com", "sagar1@gmail.com", "sagar3@gmail.com"],
    following: [],
    messages: [
      {
        username: "sagar2@gmail.com",
        text: "hello world Message posted successfully hello world Message posted successfully",
        timestamp: "2024-01-11T10:55:36.768Z",
      },
    ],
  },
  {
    username: "sagar3@gmail.com",
    name: "sagar3",
    password: "sagar",
    followers: ["sagar@gmail.com"],
    following: ["sagar4@gmail.com", "sagar2@gmail.com", "sagar@gmail.com"],
    messages: [
      {
        username: "sagar3@gmail.com",
        text: "hello world Message posted successfully hello world Message posted successfully",
        timestamp: "2024-01-11T10:55:42.555Z",
      },
    ],
  },
  {
    username: "sagar4@gmail.com",
    name: "sagar4",
    password: "sagar",
    followers: ["sagar@gmail.com", "sagar1@gmail.com", "sagar3@gmail.com"],
    following: [],
    messages: [
      {
        username: "sagar4@gmail.com",
        text: "hello world Message posted successfully hello world Message posted successfully",
        timestamp: "2024-01-11T10:55:47.702Z",
      },
      {
        username: "sagar4@gmail.com",
        text: "hello world hello world Message posted successfully",
        timestamp: "2024-01-11T10:56:09.356Z",
      },
    ],
  },
];

app.use(bodyParser.json());
var corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

// Signup/Log
// use the same route for login and signup both
app.post("/signup", (req, res) => {
  const { name, username, password } = req.body;

  // Check if the user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Create a new user
  const newUser = { name, username, password, followers: [], messages: [] };
  users.push(newUser);

  res.status(200).json({
    message: "Signup successful",
    data: newUser,
  });
});

app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = users.find((user) => user.username === username);
  if (!existingUser) {
    return res.status(400).json({ error: "User does not exist" });
  }

  // Create a new user
  if (existingUser.password !== password) {
    return res.status(403).json({ error: "Incorrect Password." });
  }

  res.status(200).json({
    message: "Signin successful",
    data: existingUser,
  });
});

app.get("/get-user", (req, res) => {
  const sortedFeed = users.sort((a, b) => b.timestamp - a.timestamp);

  res.json(sortedFeed);
});

// PostMessage
app.post("/postMessage", (req, res) => {
  const { username, message } = req.body;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Add the message to the user's messages
  user.messages.push({ text: message, timestamp: new Date() });

  // Send the message to all followers
  user.followers.forEach((follower) => {
    const followerUser = users.find((u) => u.username === follower);
    if (followerUser) {
      followerUser.messages.push({ text: message, timestamp: new Date() });
    }
  });

  res.json({ message: "Message posted successfully" });
});

// FollowUser
app.post("/followUser", (req, res) => {
  const { username, followUsername } = req.body;

  const user = users.find((user) => user.username === username);
  const followUser = users.find((user) => user.username === followUsername);

  if (!user || !followUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if the user is already following
  if (user.followers.includes(followUsername)) {
    return res.status(400).json({ error: "Already following this user" });
  }

  // Add the user to the follower's list
  user.followers.push(followUsername);
  followUser.following.push(username);

  res.json({ message: "User followed successfully" });
});

// GetMyFeed
app.get("/feed/:username", (req, res) => {
  const { username } = req.params;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Combine user's messages and followed users' messages and sort them by timestamp
  const feed = user.messages.concat(
    user.followers.reduce((acc, follower) => {
      const followerUser = users.find((u) => u.username === follower);
      if (followerUser) {
        acc = acc.concat(followerUser.messages);
      }
      return acc;
    }, [])
  );

  // Sort the feed by timestamp
  const sortedFeed = feed.sort((a, b) => b.timestamp - a.timestamp);

  res.json(sortedFeed);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
