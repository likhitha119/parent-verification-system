import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);
    // Allow localhost dev and all Vercel deployments
    if (
      origin.includes('localhost') ||
      origin.includes('.vercel.app') ||
      origin === process.env.FRONTEND_URL
    ) {
      return callback(null, true);
    }
    callback(null, true); // open for now
  },
  credentials: true,
}));
app.use(express.json());

/* ---------------- OTP STORE ---------------- */

const OTP_STORE = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;

const createOtp = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, "0");

/* ---------------- EMAIL CONFIG ---------------- */

const emailHost = process.env.EMAIL_HOST;
const emailPort = Number(process.env.EMAIL_PORT) || 587;
const emailSecure = process.env.EMAIL_SECURE === "true";
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailSender =
  process.env.EMAIL_FROM || '"EduParent" <no-reply@eduparent.com>';

let emailTransporter = null;

const createEmailTransporter = async () => {
  if (emailHost && emailUser && emailPass) {
    console.log(`Email transporter using ${emailHost}`);

    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log(
    "No SMTP credentials detected, falling back to Ethereal test account",
    testAccount.user
  );

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: testAccount,
  });
};

/* ---------------- MOCK DATA ---------------- */

const student = {
  id: "2021CS1042",
  name: "Ethan Wilson",
  gradeLevel: "10th Grade",
  major: "Computer Science",
  email: "ethan.wilson@student.edu",
  phone: "+1 (555) 123-4567",
  avatar:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Ethan&backgroundColor=fbd38d",
  isHosteler: true,
};

const academicSummary = {
  cgpa: 8.42,
  rank: 12,
  highestScore: 92,
  strongestSubject: "Data Structures",
};

const financials = {
  pendingAmount: 450.0,
  currency: "INR",
  dueDate: "2026-11-20",
};

const attendance = {
  overall: "88%",
};

const faculty = [
  { id: 1, name: "Ms. Sarah Jenkins", role: "CLASS ADVISOR" },
  { id: 2, name: "Dr. Robert Chen", role: "SUBJECT TEACHER" },
  { id: 3, name: "Mr. James Wilson", role: "SUBJECT TEACHER" },
];

// B.Tech Courses with Fee Structure
const bTechCourses = [
  {
    id: 1,
    name: "Computer Science & Engineering",
    code: "CSE",
    tuitionFee: 150000,
    busFee: 30000,
    hostelFee: 60000,
  },
  {
    id: 2,
    name: "Electronics & Communication Engineering",
    code: "ECE",
    tuitionFee: 140000,
    busFee: 30000,
    hostelFee: 60000,
  },
  {
    id: 3,
    name: "Mechanical Engineering",
    code: "ME",
    tuitionFee: 130000,
    busFee: 30000,
    hostelFee: 60000,
  },
  {
    id: 4,
    name: "Civil Engineering",
    code: "CE",
    tuitionFee: 120000,
    busFee: 30000,
    hostelFee: 60000,
  },
  {
    id: 5,
    name: "Electrical Engineering",
    code: "EE",
    tuitionFee: 135000,
    busFee: 30000,
    hostelFee: 60000,
  },
  {
    id: 6,
    name: "Information Technology",
    code: "IT",
    tuitionFee: 145000,
    busFee: 30000,
    hostelFee: 60000,
  },
];

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.send({ message: "EduParent backend is running." });
});

app.get("/api/profile", (req, res) => {
  res.json({ student });
});

app.get("/api/academic", (req, res) => {
  res.json({ academic: academicSummary });
});

app.get("/api/financials", (req, res) => {
  res.json({ financials });
});

app.get("/api/attendance", (req, res) => {
  res.json({ attendance });
});

app.get("/api/faculty", (req, res) => {
  res.json({ faculty });
});

app.get("/api/courses", (req, res) => {
  res.json({ courses: bTechCourses, student });
});

app.get("/api/course-fees/:courseId", (req, res) => {
  const { courseId } = req.params;
  const course = bTechCourses.find((c) => c.id === parseInt(courseId));

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const courseFees = {
    course,
    student,
    fees: {
      tuitionFee: course.tuitionFee,
      busFee: course.busFee,
      hostelFee: student.isHosteler ? course.hostelFee : 0,
    },
    currency: "INR",
  };

  const totalFee =
    course.tuitionFee +
    course.busFee +
    (student.isHosteler ? course.hostelFee : 0);
  courseFees.totalFee = totalFee;

  res.json(courseFees);
});

/* ---------------- SEND OTP ---------------- */

app.post("/api/send-otp", async (req, res) => {
  const rawEmail = req.body.email;
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email address required",
    });
  }

  const normalizedEmail = email.toLowerCase();
  const otp = createOtp();

  OTP_STORE.set(normalizedEmail, {
    code: otp,
    expires: Date.now() + OTP_TTL_MS,
  });

  const sendViaEmail = async () => {
    await emailTransporter.sendMail({
      from: emailSender,
      to: email,
      subject: "Your EduParent OTP",
      text: `Your EduParent OTP is: ${otp}`,
      html: `<p>Your EduParent OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });
  };

  try {
    if (emailTransporter) {
      await sendViaEmail();

      return res.json({
        success: true,
        message: "OTP sent to your email.",
      });
    }

    console.log(`OTP for ${email}: ${otp}`);

    return res.json({
      success: true,
      message: "OTP generated (check server console).",
    });
  } catch (err) {
    console.error("Email send failed:", err.message);

    OTP_STORE.delete(normalizedEmail);

    return res.status(500).json({
      success: false,
      error: "Failed to send OTP email.",
      details: err.message,
    });
  }
});

/* ---------------- VERIFY OTP ---------------- */

app.post("/api/verify-otp", (req, res) => {
  const rawEmail = req.body.email;
  const code = req.body.code;
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  if (!email || !code) {
    return res.status(400).json({
      error: "Email and OTP required",
    });
  }

  const normalizedEmail = email.toLowerCase();
  const record = OTP_STORE.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({
      verified: false,
      error: "OTP not found",
    });
  }

  if (Date.now() > record.expires) {
    OTP_STORE.delete(normalizedEmail);

    return res.status(400).json({
      verified: false,
      error: "OTP expired",
    });
  }

  if (record.code !== code) {
    return res.status(400).json({
      verified: false,
      error: "Incorrect OTP",
    });
  }

  OTP_STORE.delete(normalizedEmail);

  return res.json({
    verified: true,
  });
});

/* ---------------- CHAT ---------------- */

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message required",
    });
  }

  const text = message.toLowerCase();

  if (text.includes("cgpa")) {
    return res.json({
      type: "text",
      text: `Current CGPA is ${academicSummary.cgpa}`,
    });
  }

  if (text.includes("fee")) {
    return res.json({
      type: "text",
      text: `Pending fee is ${financials.currency} ${financials.pendingAmount}`,
    });
  }

  if (text.includes("attendance")) {
    return res.json({
      type: "text",
      text: `Overall attendance is ${attendance.overall}`,
    });
  }

  return res.json({
    type: "text",
    text: "Ask about CGPA, attendance or fees.",
  });
});

/* ---------------- ERROR ---------------- */

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

/* ---------------- START SERVER ---------------- */

const startServer = async () => {
  try {
    emailTransporter = await createEmailTransporter();
  } catch (err) {
    console.error(
      "Failed to set up email transporter; OTP emails will be logged to the console.",
      err
    );
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
