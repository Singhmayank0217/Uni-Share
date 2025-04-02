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
  { name: "Electrical Engineering", code: "EE", description: "Study of electrical systems and technology" },
  { name: "Mechanical Engineering", code: "ME", description: "Study of mechanical systems and manufacturing" },
  { name: "Civil Engineering", code: "CE", description: "Study of design and construction of the built environment" },
  {
    name: "Electronics & Communication",
    code: "ECE",
    description: "Study of electronic devices and communication systems",
  },
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
    const cse = insertedBranches.find((b) => b.code === "CSE")
    subjects.push(
      // Semester 1 - Added the requested subjects
      { name: "Introduction to Problem Solving", code: "CS101", branch: cse._id, semester: 1 },
      { name: "Digital Electronics", code: "CS102", branch: cse._id, semester: 1 },
      { name: "Math-1", code: "MA101", branch: cse._id, semester: 1 },
      { name: "Biology", code: "BIO101", branch: cse._id, semester: 1 },

      // Semester 2 - Added the requested subjects
      { name: "BEEE", code: "EE201", branch: cse._id, semester: 2 },
      { name: "Math-2", code: "MA201", branch: cse._id, semester: 2 },
      { name: "Physics", code: "PH201", branch: cse._id, semester: 2 },
      { name: "Data Structures", code: "CS201", branch: cse._id, semester: 2 },

      // Other semesters
      { name: "Algorithms", code: "CS301", branch: cse._id, semester: 3 },
      { name: "Database Systems", code: "CS401", branch: cse._id, semester: 4 },
      { name: "Operating Systems", code: "CS501", branch: cse._id, semester: 5 },
      { name: "Computer Networks", code: "CS601", branch: cse._id, semester: 6 },
      { name: "Artificial Intelligence", code: "CS701", branch: cse._id, semester: 7 },
      { name: "Machine Learning", code: "CS801", branch: cse._id, semester: 8 },
    )

    // EE Subjects
    const ee = insertedBranches.find((b) => b.code === "EE")
    subjects.push(
      { name: "Basic Electrical Engineering", code: "EE101", branch: ee._id, semester: 1 },
      { name: "Circuit Theory", code: "EE201", branch: ee._id, semester: 2 },
      { name: "Electrical Machines", code: "EE301", branch: ee._id, semester: 3 },
      { name: "Power Systems", code: "EE401", branch: ee._id, semester: 4 },
      { name: "Control Systems", code: "EE501", branch: ee._id, semester: 5 },
      { name: "Power Electronics", code: "EE601", branch: ee._id, semester: 6 },
      { name: "Renewable Energy", code: "EE701", branch: ee._id, semester: 7 },
      { name: "Smart Grid Technology", code: "EE801", branch: ee._id, semester: 8 },
    )

    // ME Subjects
    const me = insertedBranches.find((b) => b.code === "ME")
    subjects.push(
      { name: "Engineering Mechanics", code: "ME101", branch: me._id, semester: 1 },
      { name: "Thermodynamics", code: "ME201", branch: me._id, semester: 2 },
      { name: "Fluid Mechanics", code: "ME301", branch: me._id, semester: 3 },
      { name: "Machine Design", code: "ME401", branch: me._id, semester: 4 },
      { name: "Heat Transfer", code: "ME501", branch: me._id, semester: 5 },
      { name: "Manufacturing Processes", code: "ME601", branch: me._id, semester: 6 },
      { name: "Robotics", code: "ME701", branch: me._id, semester: 7 },
      { name: "Automobile Engineering", code: "ME801", branch: me._id, semester: 8 },
    )

    // Insert all subjects
    await Subject.insertMany(subjects)

    console.log("Database seeded successfully")
    mongoose.connection.close()
  } catch (error) {
    console.error("Error seeding database:", error)
    mongoose.connection.close()
  }
}

