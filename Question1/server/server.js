const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));

// Dummy Data in JSON-compatible format
const dummyData = {
  users: {
    1: "Alice",
    2: "Bob",
    3: "Charlie",
    4: "Diana",
    5: "Eve",
    6: "Frank",
    7: "Grace",
    8: "Hank",
    9: "Ivy",
    10: "Jack",
  },
  posts: {
    1: [
      { id: 1, content: "Post 1 by Alice" },
      { id: 2, content: "Post 2 by Alice" },
      { id: 3, content: "Post 3 by Alice" },
      { id: 4, content: "Post 4 by Alice" },
      { id: 5, content: "Post 5 by Alice" },
      { id: 6, content: "Post 6 by Alice" },
      { id: 7, content: "Post 7 by Alice" },
    ],
    2: [
      { id: 8, content: "Post 1 by Bob" },
      { id: 9, content: "Post 2 by Bob" },
      { id: 10, content: "Post 3 by Bob" },
    ],
    3: [
      { id: 11, content: "Post 1 by Charlie" },
      { id: 12, content: "Post 2 by Charlie" },
      { id: 13, content: "Post 3 by Charlie" },
      { id: 14, content: "Post 4 by Charlie" },
      { id: 15, content: "Post 5 by Charlie" },
      { id: 16, content: "Post 6 by Charlie" },
      { id: 17, content: "Post 7 by Charlie" },
      { id: 18, content: "Post 8 by Charlie" },
      { id: 19, content: "Post 9 by Charlie" },
      { id: 20, content: "Post 10 by Charlie" },
      { id: 21, content: "Post 11 by Charlie" },
      { id: 22, content: "Post 12 by Charlie" },
    ],
    4: [
      { id: 23, content: "Post 1 by Diana" },
      { id: 24, content: "Post 2 by Diana" },
      { id: 25, content: "Post 3 by Diana" },
      { id: 26, content: "Post 4 by Diana" },
      { id: 27, content: "Post 5 by Diana" },
    ],
    5: [{ id: 28, content: "Post 1 by Eve" }],
    6: [
      { id: 29, content: "Post 1 by Frank" },
      { id: 30, content: "Post 2 by Frank" },
      { id: 31, content: "Post 3 by Frank" },
      { id: 32, content: "Post 4 by Frank" },
      { id: 33, content: "Post 5 by Frank" },
      { id: 34, content: "Post 6 by Frank" },
      { id: 35, content: "Post 7 by Frank" },
      { id: 36, content: "Post 8 by Frank" },
      { id: 37, content: "Post 9 by Frank" },
    ],
    7: [
      { id: 38, content: "Post 1 by Grace" },
      { id: 39, content: "Post 2 by Grace" },
      { id: 40, content: "Post 3 by Grace" },
      { id: 41, content: "Post 4 by Grace" },
    ],
    8: [
      { id: 42, content: "Post 1 by Hank" },
      { id: 43, content: "Post 2 by Hank" },
      { id: 44, content: "Post 3 by Hank" },
      { id: 45, content: "Post 4 by Hank" },
      { id: 46, content: "Post 5 by Hank" },
      { id: 47, content: "Post 6 by Hank" },
    ],
    9: [
      { id: 48, content: "Post 1 by Ivy" },
      { id: 49, content: "Post 2 by Ivy" },
    ],
    10: [
      { id: 50, content: "Post 1 by Jack" },
      { id: 51, content: "Post 2 by Jack" },
      { id: 52, content: "Post 3 by Jack" },
      { id: 53, content: "Post 4 by Jack" },
      { id: 54, content: "Post 5 by Jack" },
      { id: 55, content: "Post 6 by Jack" },
      { id: 56, content: "Post 7 by Jack" },
      { id: 57, content: "Post 8 by Jack" },
    ],
  },
  comments: {
    1: ["Comment 1 on post 1", "Comment 2 on post 1"],
    11: [
      "Comment 1 on post 11",
      "Comment 2 on post 11",
      "Comment 3 on post 11",
      "Comment 4 on post 11",
      "Comment 5 on post 11",
    ],
    23: [
      "Comment 1 on post 23",
      "Comment 2 on post 23",
      "Comment 3 on post 23",
    ],
    29: [
      "Comment 1 on post 29",
      "Comment 2 on post 29",
      "Comment 3 on post 29",
      "Comment 4 on post 29",
    ],
  },
};

const fetchData = async (endpoint) => {
  try {
    if (endpoint === "users") {
      return { users: dummyData.users };
    } else if (endpoint.startsWith("users/") && endpoint.endsWith("/posts")) {
      const userId = endpoint.split("/")[1];
      return dummyData.posts[userId]
        ? { posts: dummyData.posts[userId] }
        : null;
    } else if (
      endpoint.startsWith("posts/") &&
      endpoint.endsWith("/comments")
    ) {
      const postId = endpoint.split("/")[1];
      return { comments: dummyData.comments[postId] || [] };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
};

app.get("/users", async (req, res) => {
  const usersData = await fetchData("users");
  if (!usersData || !usersData.users)
    return res.status(500).json({ error: "Failed to fetch users." });

  const userPostCounts = [];
  for (const userId in usersData.users) {
    const postsData = await fetchData(`users/${userId}/posts`);
    if (postsData && postsData.posts) {
      userPostCounts.push({
        id: userId,
        name: usersData.users[userId],
        postCount: postsData.posts.length,
      });
    }
  }

  userPostCounts.sort((a, b) => b.postCount - a.postCount);
  res.json(userPostCounts.slice(0, 5));
});

app.get("/posts", async (req, res) => {
  const { type } = req.query;
  const usersData = await fetchData("users");
  if (!usersData || !usersData.users)
    return res.status(500).json({ error: "Failed to fetch users." });

  let allPosts = [];
  for (const userId in usersData.users) {
    const postsData = await fetchData(`users/${userId}/posts`);
    if (postsData && postsData.posts) {
      allPosts = allPosts.concat(postsData.posts);
    }
  }

  if (type === "popular") {
    let postCommentCounts = [];
    for (const post of allPosts) {
      const commentsData = await fetchData(`posts/${post.id}/comments`);
      const commentCount =
        commentsData && commentsData.comments
          ? commentsData.comments.length
          : 0;
      postCommentCounts.push({ ...post, commentCount });
    }

    const maxComments = Math.max(
      ...postCommentCounts.map((p) => p.commentCount)
    );
    res.json(postCommentCounts.filter((p) => p.commentCount === maxComments));
  } else if (type === "latest") {
    allPosts.sort((a, b) => b.id - a.id); // Higher ID = newer post
    res.json(allPosts.slice(0, 5));
  } else {
    res
      .status(400)
      .json({ error: "Invalid type parameter. Use 'latest' or 'popular'." });
  }
});

app.get("/users/:userid/posts", async (req, res) => {
  const { userid } = req.params;
  const userPosts = await fetchData(`users/${userid}/posts`);
  res.json(userPosts?.posts || []);
});

app.get("/posts/:postid/comments", async (req, res) => {
  const { postid } = req.params;
  const postComments = await fetchData(`posts/${postid}/comments`);
  res.json(postComments?.comments || []);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
