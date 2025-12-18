const exp = require('express')
const cros = require('cors')
const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const app = exp()
const user = require("./model/Users")
const movie = require("./model/Movie")


app.use(cros())
app.use(exp.json())
app.use(exp())
const secret = "MYstack"
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(req.headers.authorization)

  if (!token) {
    return res.status(401).json({ messassge: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};


app.post("/signup", async (rq, rs) => {
  console.log(rq.body)


  const userEmailCheck = await user.findOne({ email: rq.body.email })
  console.log()
  if (userEmailCheck) {
    return rs.json({ msg: "email already registerd", status: false })
  }
  const hashpass = await bcrypt.hash(rq.body.password, 10)
  const User = await user.create({
    name: rq.body.name,
    email: rq.body.email,
    password: hashpass,
    role: rq.body.role
  })
  delete User.password
  // const token= jwt.sign({_id:User._id,username:User.username},secret)
  rs.json({ status: true, message: "Resgistration successfull" })
})

app.post("/Login", async (rq, rs) => {
  try {
    console.log(rq.body)
    const userNameCheck = await user.findOne({ email: rq.body.email })

    if (!userNameCheck) {
      console.log("in noot fou f")
      return rs.json({ msg: "Not a Valid User", status: false })
    }
    const passcheck = await bcrypt.compare(rq.body.password, userNameCheck.password)
    console.log(passcheck)
    if (passcheck) {
      delete userNameCheck.password
      const token = jwt.sign({ _id: userNameCheck._id, username: userNameCheck.username }, secret,
        { expiresIn: "24h" }
      )
      console.log(userNameCheck)
      rs.json({ user: userNameCheck, status: true, token: token })
    }
    else {
      rs.json({ status: false, message: "Invalid Credentials" })
    }
  }
  catch (error) {
    console.log(error)
  }
})

app.post("/movies", async (req, res) => {
  try {
    const movieCheck = await movie.findOne({ title: req.body.title });

    if (movieCheck) {
      return res.json({
        status: false,
        message: "Movie name already exists!"
      });
    }
    const movie1 = await movie.create({
      title: req.body.title,
      poster: req.body.poster,
      genre: req.body.genre,
      rating: req.body.rating,
      year: req.body.year,
      description: req.body.description
    });

    res.json({
      status: true,
      message: "Movie added successfully",
      movie,
    });
  } catch (error) {
    console.log(error)
    res.json({
      status: false,
      message: error.message || "Error adding movie",

    });
  }
})

app.get("/movies", async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search text
    const search = req.query.search || "";

    // Sort parameter
    let sortValue = {};
    const sort = req.query.sort || "rating_desc";

    // Define sort conditions
    if (sort === "rating_desc") sortValue = { rating: -1 };
    if (sort === "rating_asc") sortValue = { rating: 1 };
    if (sort === "year_desc") sortValue = { year: -1 };
    if (sort === "year_asc") sortValue = { year: 1 };
    if (sort === "title_asc") sortValue = { title: 1 };
    if (sort === "title_desc") sortValue = { title: -1 };

    // Search in title, description, genre
    const query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } }
      ]
    };

    // Fetch movies
    const movies = await movie
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortValue);

    // Total count
    const total = await movie.countDocuments(query);

    res.json({
      status: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      movies,
    });

  } catch (error) {
    res.json({
      status: false,
      message: "Failed to fetch movies",
      error: error.message,
    });
  }
});
app.get("/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const data = await movie.findById(id);
    console.log(data)
    if (!data) {
      return res.json({ status: false, message: "Movie not found" });
    }
    return res.json({ status: true, movie: data });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: err || "Server error" });
  }
});

app.put("/movies/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMovie = await movie.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.json({
        status: false,
        message: "Movie not found",
      });
    }

    return res.json({
      status: true,
      message: "Movie updated successfully",
      movie: updatedMovie,
    });

  } catch (err) {
    console.error(err);
    return res.json({
      status: false,
      message: err.message || "Server error",
    });
  }
});

app.delete("/movies/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const data = await movie.findByIdAndDelete(id);

    if (!data) {
      return res.json({
        status: false,
        message: "Movie not found",
      });
    }

    return res.json({
      status: true,
      message: "Movie deleted successfully",
    });

  } catch (err) {
    console.error(err);
    return res.json({
      status: false,
      message: err.message || "Server error",
    });
  }
});

app.get("/movies/search/sort", async (req, res) => {
  try {
    const {
      q = "",
      sortBy = "title",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (page - 1) * limit;

    const filter = q
      ? {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    const sortOptions = {
      [sortBy]: order === "desc" ? -1 : 1,
    };

    const movies = await movie
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await movie.countDocuments(filter);

    return res.json({
      status: true,
      movies,
      totalCount,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      status: false,
      message: err.message || "Server error",
    });
  }
});

app.get("/movies/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        status: false,
        message: "Search query is required",
      });
    }

    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    const movies = await movie
      .find(filter)
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await movie.countDocuments(filter);

    return res.json({
      status: true,
      movies,
      totalCount,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      status: false,
      message: err.message || "Server error",
    });
  }
});






app.listen(5000, () => {
  console.log("server started")
})