import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const app = express();
// ✅ Parse URL-encoded data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.set('view engine', 'ejs');

// Static folder if needed
// app.use(express.static('public'));

// Get current path for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Config
cloudinary.config({
  cloud_name: "dnx6opjp3",

  api_key: 663726526631721,
  api_secret: "87s0-nTdDLY0Anfdgtc_2YVu4Fw",
});

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://rj507943:RkduspLJsmp5MPik@cluster0.hdtpphn.mongodb.net/",
    {
      dbName: "NodeJs_Mastery_Course",
    }
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes rendering login
app.get("/", (req, res) => {
  res.render("home.ejs", { url: null });
});

app.get('/login', (req, res) => {
  res.render("Login.ejs", { url: null });
});

// Routes rendering register
app.get("/register", (req, res) => {
  res.render("Register.ejs", { url: null });
});

// Multer setup
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// Mongoose schema
const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  filename: { type: String },
  public_id: { type: String },
  imgUrl: { type: String },
});
const User = mongoose.model("user", userSchema);

// Upload route
app.post("/register", upload.single("file"), async (req, res) => {
  try {
    const file = req.file?.path;
    const { name, email, password } = req.body;

    if (!file) throw new Error("No file uploaded.");

    const cloudinaryRes = await cloudinary.uploader.upload(file, {
      folder: "NodeJs_Mastery_Course",
    });

    await User.create({
      name,
      email,
      password,
      filename: req.file.filename,
      public_id: cloudinaryRes.public_id,
      imgUrl: cloudinaryRes.secure_url,
    });

    res.redirect("/");

  } catch (error) {
    console.error("❌ Upload error:", error.message);
    console.error("🧾 Full Error:", error);
    res.status(500).send("An error occurred during upload.");
  }
});



app.post("/login", async (req, res) => {
  const {email,password} = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    res.render("Login.ejs"); // Consider showing an error message
  } else if (user.password !== password) {
    res.render("Login.ejs"); // Consider showing "wrong password"
  } else {
    res.render("profile.ejs", { user });
  }
});



// Start server
const PORT = 2000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
