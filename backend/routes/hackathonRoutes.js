import express from "express";

const router = express.Router();

const hackathons = [
 {
  title: "AI Innovation Challenge",
  location: "Online",
  domain: "AI",
  mode: "Online",
  prize: "₹1,00,000",
  date: "June 25 2026",
  link: "https://devpost.com",
},
  {
  title: "Web3 HackFest",
  location: "Bangalore",
  domain: "Blockchain",
  mode: "Offline",
  prize: "₹75,000",
  date: "July 10 2026",
  link: "https://devfolio.co",
},
  {
    title: "Smart India Hackathon",
    location: "India",
    domain: "Software",
    mode: "Offline",
    prize: "₹50,000",
    date: "August 15 2026",
    link: "https://devpost.com",
  },
  {
    title: "Cyber Security Clash",
    location: "Delhi",
    domain: "Cybersecurity",
    mode: "Offline",
    prize: "₹25,000",
    date: "September 20 2026",
    link: "https://devfolio.co",
  },
  {
    title: "ML Sprint",
    location: "Online",
    domain: "Machine Learning",
    mode: "Online",
    prize: "₹10,000",
    date: "October 5 2026",
    link: "https://devpost.com",
  },
];

router.get("/search", (req, res) => {
  const q = req.query.q?.toLowerCase() || "";

  const searchWords = q.split(" ");

  const filtered = hackathons.filter((h) =>
    searchWords.some(
      (word) =>
        h.title.toLowerCase().includes(word) ||
        h.domain.toLowerCase().includes(word) ||
        h.location.toLowerCase().includes(word) ||
        h.mode.toLowerCase().includes(word)
    )
  );

  res.json(filtered);
});

export default router;