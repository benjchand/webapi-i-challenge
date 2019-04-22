// implement your API here

const express = require("express");
const db = require("./data/db.js");

const server = express();
server.use(express.json());

const sendUserError = (status, message, res) => {
  res.status(status).json({ errorMessage: message });
  return;
};

server.get("/", (req, res) => {
  console.log(req.query);
  console.log(req.users);
  const { users } = req;
  if (!users) {
    res.json("Welcome to express");
  }
  if (users.length === 0) {
    sendUserError(404, `No ${req.query.name} in our database`, res);
    return;
  } else {
    res.json({ users });
  }
});

// server.post("/api/users", (req, res) => {
//   const { name, bio, created_at, updated_at } = req.body;
//   if (!name || !bio) {
//     sendUserError(400, "Please provide name and bio for the user.", res);
//     return;
//   }
//   db.insert({
//     name,
//     bio,
//     created_at,
//     updated_at
//   })
//     .then(response => {
//       res.status(201).json(response);
//     })
//     .catch(error => {
//       console.log(error);
//       sendUserError(400, error, res);
//       return;
//     });
// });
server.post("/api/users", (req, res) => {
  const { name, bio } = req.body;
  if (!name || !bio) {
    sendUserError(400, "Must provide name and bio", res);
    return;
  }
  db.insert({
    name,
    bio
  })
    .then(response => {
      res.status(201).json(response);
    })
    .catch(error => {
      console.log(error);
      sendUserError(400, error, res);
      return;
    });
});

server.get("/api/users", (req, res) => {
  db.find()
    .then(users => {
      res.json({ users });
    })
    .catch(error => {
      sendUserError(500, "That user cannot be retrieved.", res);
      return;
    });
});

server.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.findById(id)
    .then(user => {
      if (user.length === 0) {
        sendUserError(404, "User with that id not found", res);
        return;
      }
      res.json(user);
    })
    .catch(error => {
      sendUserError(500, "Error searching for user", res);
    });
});

server.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.remove(id)
    .then(response => {
      if (response === 0) {
        sendUserError(
          404,
          "No user with that specified ID does not exist.",
          res
        );
        return;
      }
      res.json({ success: `User with id: ${id} removed from system` });
    })
    .catch(error => {
      sendUserError(500, `The user with id: ${id} could not be removed`, res);
      return;
    });
});

server.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  if (!name || !bio) {
    sendUserError(400, "Please provide name and bio for the user.", res);
    return;
  }
  db.update(id, { name, bio })
    .then(response => {
      if (response === 0) {
        sendUserError(
          404,
          "The user with the specified ID does not exist.",
          res
        );
        return;
      }
      db.findById(id)
        .then(user => {
          if (user.length === 0) {
            sendUserError(404, "User with that id not found", res);
            return;
          }
          res.json(user);
        })
        .catch(error => {
          sendUserError(500, "Error looking up user", res);
        });
    })
    .catch(error => {
      sendUserError(500, "Something went wrong with the database", res);
      return;
    });
});

server.listen(5000, () => {
  console.log("\n*** API running on port 5000***\n");
});
