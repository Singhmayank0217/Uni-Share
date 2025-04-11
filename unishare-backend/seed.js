import mongoose from "mongoose"
import dotenv from "dotenv"
import Branch from "./models/Branch.js"
import Subject from "./models/Subject.js"

dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    seedDatabase()
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

// Seed data
const branches = [
  { name: "Computer Science Engineering", code: "CSE", description: "Study of computers and computational systems" },
  // { name: "Electrical Engineering", code: "EE", description: "Study of electrical systems and technology" },
  // { name: "Mechanical Engineering", code: "ME", description: "Study of mechanical systems and manufacturing" },
  // { name: "Civil Engineering", code: "CE", description: "Study of design and construction of the built environment" },
  // { name: "Electronics & Communication", code: "ECE", description: "Study of electronic devices and communication systems" },
]

// Seed database
async function seedDatabase() {
  try {
    // Clear existing data
    await Branch.deleteMany({})
    await Subject.deleteMany({})

    // Insert branches
    console.log("Inserting branches...")
    const insertedBranches = await Branch.insertMany(branches)

    // Create subjects for each branch
    console.log("Inserting subjects...")
    const subjects = []

    // CSE Subjects
    const cse = insertedBranches.find((b) => b.code === "CSE");
// Semester 1
subjects.push(
  { name: "Introduction to Problem Solving", code: "22CSH-101", branch: cse._id, semester: 1 },
  { name: "Digital Electronics", code: "22ECH-101", branch: cse._id, semester: 1 },
  { name: "Disruptive Technologies -1", code: "22ECH-102", branch: cse._id, semester: 1 },
  { name: "Mathematics - I", code: "22SMT-121", branch: cse._id, semester: 1 },
  { name: "Biology for Engineers", code: "22SZT-148", branch: cse._id, semester: 1 },
  { name: "Workshop Technology", code: "22CSP-102", branch: cse._id, semester: 1 },

  // Semester 2
  { name: "Object Oriented Programming Using C++", code: "22CSH-103", branch: cse._id, semester: 2 },
  { name: "Disruptive Technologies -2", code: "22ECH-103", branch: cse._id, semester: 2 },
  { name: "Basic Electrical and Electronics Engineering", code: "22ELH-101", branch: cse._id, semester: 2 },
  { name: "Mathematics - II", code: "22SMT-125", branch: cse._id, semester: 2 },
  { name: "Computer Graphics using CAD Lab", code: "22MEH-102", branch: cse._id, semester: 2 },
  
  // Semester 3
  { name: "Java Programming", code: "22CSH-201", branch: cse._id, semester: 3 },
  { name: "Data Structures", code: "22CSH-211", branch: cse._id, semester: 3 },
  { name: "Computer Organization and Architecture (Through SWAYAM)", code: "22CST-202", branch: cse._id, semester: 3 },
  { name: "Discrete Mathematics", code: "22CST-215", branch: cse._id, semester: 3 },
  { name: "Quantum Physics", code: "22SPT-241", branch: cse._id, semester: 3 },
  { name: "Social Internship", code: "22UCI-203", branch: cse._id, semester: 3 },
  { name: "Universal Human Values, Ethics and Life Skills-2", code: "22UCT-296", branch: cse._id, semester: 3 },

  // Semester 4
  { name: "Database Management System", code: "22CSH-254", branch: cse._id, semester: 4 },
  { name: "Numerical Methods and Optimization using Python", code: "22CSH-259", branch: cse._id, semester: 4 },
  { name: "Java Spring and Microservices", code: "22CST-225", branch: cse._id, semester: 4 },
  { name: "Operating System", code: "22CST-253", branch: cse._id, semester: 4 },
  { name: "Mini Project -1", code: "22CSR-264", branch: cse._id, semester: 4 },
  { name: "Probability and Statistics", code: "22SMT-257", branch: cse._id, semester: 4 },
  { name: "Gender Equity and Empowerment", code: "22UCT-297", branch: cse._id, semester: 4 },

  // Semester 5
  { name: "Design and Analysis of Algorithms", code: "22CSH-311", branch: cse._id, semester: 5 },
  { name: "Computer Networks", code: "22CSH-312", branch: cse._id, semester: 5 },
  { name: "Advanced Programming Lab - 1", code: "22CSP-314", branch: cse._id, semester: 5 },
  { name: "DevOps and Cloud Native", code: "22CST-327", branch: cse._id, semester: 5 },
  { name: "Software Engineering", code: "22CST-313", branch: cse._id, semester: 5 },
  { name: "DevOps and Cloud Native Lab", code: "22CSP-327", branch: cse._id, semester: 5 },
  { name: "Mini Project -II", code: "22CSR-318", branch: cse._id, semester: 5 },
  { name: "ENTREPRENEURSHIP", code: "22UCT-399", branch: cse._id, semester: 5 },

  // Semester 6
  { name: "Computer Graphics with Lab", code: "22CSH-352", branch: cse._id, semester: 6 },
  { name: "Project Based Learning in Java with Lab", code: "22CSH-359", branch: cse._id, semester: 6 },
  { name: "Advanced Programming Lab - 2", code: "22CSP-351", branch: cse._id, semester: 6 },
  { name: "Foundation of Cloud IoT Edge ML Lab", code: "22CSP-367", branch: cse._id, semester: 6 },
  { name: "Mini Project -III", code: "22CSR-369", branch: cse._id, semester: 6 },
  { name: "Theory of Computation", code: "22CST-353", branch: cse._id, semester: 6 },
  { name: "Parallel and Distributed Computing", code: "22CST-354", branch: cse._id, semester: 6 },
  { name: "Foundation of Cloud IoT Edge ML (Through SWAYAM)", code: "22CST-367", branch: cse._id, semester: 6 },
  { name: "Environmental Science, Waste and Disaster Management", code: "22UCT-394", branch: cse._id, semester: 6 }
);


    // EE Subjects
    // const ee = insertedBranches.find((b) => b.code === "EE")
    // subjects.push(
    //   { name: "Basic Electrical Engineering", code: "EE101", branch: ee._id, semester: 1 },
    //   { name: "Circuit Theory", code: "EE201", branch: ee._id, semester: 2 },
    //   { name: "Electrical Machines", code: "EE301", branch: ee._id, semester: 3 },
    //   { name: "Power Systems", code: "EE401", branch: ee._id, semester: 4 },
    //   { name: "Control Systems", code: "EE501", branch: ee._id, semester: 5 },
    //   { name: "Power Electronics", code: "EE601", branch: ee._id, semester: 6 },
    //   { name: "Renewable Energy", code: "EE701", branch: ee._id, semester: 7 },
    //   { name: "Smart Grid Technology", code: "EE801", branch: ee._id, semester: 8 },
    // )

    // // ME Subjects
    // const me = insertedBranches.find((b) => b.code === "ME")
    // subjects.push(
    //   { name: "Engineering Mechanics", code: "ME101", branch: me._id, semester: 1 },
    //   { name: "Thermodynamics", code: "ME201", branch: me._id, semester: 2 },
    //   { name: "Fluid Mechanics", code: "ME301", branch: me._id, semester: 3 },
    //   { name: "Machine Design", code: "ME401", branch: me._id, semester: 4 },
    //   { name: "Heat Transfer", code: "ME501", branch: me._id, semester: 5 },
    //   { name: "Manufacturing Processes", code: "ME601", branch: me._id, semester: 6 },
    //   { name: "Robotics", code: "ME701", branch: me._id, semester: 7 },
    //   { name: "Automobile Engineering", code: "ME801", branch: me._id, semester: 8 },
    // )

    // Insert all subjects
    await Subject.insertMany(subjects)

    console.log("Database seeded successfully")
    // mongoose.connection.close()
  } catch (error) {
    console.error("Error seeding database:", error)
    // mongoose.connection.close()
  }
}

export async function runSeed() {
  await seedDatabase();
}
