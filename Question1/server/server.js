const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan("dev"));

const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA4NTY1LCJpYXQiOjE3NDM2MDgyNjUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdjZDJkZWNmLTE1ZDUtNGIzYi1iNzAyLTNhOWU5ZThjNDkxMyIsInN1YiI6IjIyMDUzMzAzQGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1MzMwM0BraWl0LmFjLmluIiwibmFtZSI6Inl1dnJhaiBzaW5naCIsInJvbGxObyI6IjIyMDUzMzAzIiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiN2NkMmRlY2YtMTVkNS00YjNiLWI3MDItM2E5ZTllOGM0OTEzIiwiY2xpZW50U2VjcmV0IjoieVVCQXlWVHFmUUJGYkpQdyJ9.nO21xC8ABxe_T43YP28S3ULG9CvJ3_ukukAjna_4Y-I"

app.get("/users", async (req, res) => {
  try {
    const usersResponse = await fetch(
      "http://20.244.56.144/evaluation-service/users",
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const usersData = await usersResponse.json();

    if (!usersResponse.ok) {
      return res.status(usersResponse.status).json({
        error: `Failed to fetch users: ${usersResponse.statusText}`,
      });
    }

    if (!usersData || !usersData.users) {
      return res.status(500).json({ error: "Invalid users data format" });
    }

    const userPostCounts = [];
    for (const userId in usersData.users) {
      const postsResponse = await fetch(
        `http://20.244.56.144/evaluation-service/users/${userId}/posts`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const postsData = await postsResponse.json();

      if (!postsResponse.ok) {
        console.error(
          `Failed to fetch posts for user ${userId}: ${postsResponse.statusText}`
        );
        continue;
      }

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
  } catch (error) {
    console.error("Error in /users route:", error);
    res.status(500).json({
      error: `An error occurred while fetching data: ${error.message}`,
    });
  }
});

app.get("/posts", async (req, res) => {
  const { type } = req.query;

  try {
    const usersResponse = await fetch(
      "http://20.244.56.144/evaluation-service/users",
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );

    if (!usersResponse.ok) {
      return res
        .status(usersResponse.status)
        .json({ error: "Failed to fetch users" });
    }

    const usersData = await usersResponse.json();
    if (!usersData?.users) {
      return res.status(500).json({ error: "Invalid users data format" });
    }

    const userIds = Object.keys(usersData.users);
    const postRequests = userIds.map((userId) =>
      fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
        .then((res) => (res.ok ? res.json() : { posts: [] }))
        .catch(() => ({ posts: [] }))
    );

    let allPosts = (await Promise.all(postRequests)).flatMap(
      (data) => data.posts
    );

    if (type === "popular") {
      const commentRequests = allPosts.map((post) =>
        fetch(
          `http://20.244.56.144/evaluation-service/posts/${post.id}/comments`,
          {
            headers: { Authorization: `Bearer ${bearerToken}` },
          }
        )
          .then((res) => (res.ok ? res.json() : { comments: [] }))
          .catch(() => ({ comments: [] }))
      );

      const postCommentCounts = await Promise.all(commentRequests);
      allPosts = allPosts.map((post, index) => ({
        ...post,
        commentCount: postCommentCounts[index]?.comments?.length || 0,
      }));

      allPosts.sort((a, b) => b.commentCount - a.commentCount);
      res.json({
        status: "success",
        data: allPosts.slice(0, 5).map(({ id, content, commentCount }) => ({
          id,
          content,
          commentCount,
        })),
      });
    } else if (type === "latest") {
      allPosts.sort((a, b) => b.id - a.id);
      res.json({
        status: "success",
        data: allPosts.slice(0, 5).map(({ id, content }) => ({ id, content })),
      });
    } else {
      res
        .status(400)
        .json({ error: "Invalid type parameter. Use 'latest' or 'popular'." });
    }
  } catch (error) {
    console.error("Error in /posts route:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});