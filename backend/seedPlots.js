const Plot = require("./models/Plot");
const connectDB = require("./db"); // Import the reusable DB connection

const plotData = [
    { plotNumber: 1, areaSqMt: 236.71, areaSqFt: 2547.9252 },
    { plotNumber: 2, areaSqMt: 200.62, areaSqFt: 2159.455 },
    { plotNumber: 3, areaSqMt: 200.62, areaSqFt: 2159.455 },
    { plotNumber: 4, areaSqMt: 200.62, areaSqFt: 2159.455 },
    { plotNumber: 5, areaSqMt: 200.62, areaSqFt: 2159.455 },
    { plotNumber: 6, areaSqMt: 200.62, areaSqFt: 2159.455 },
    { plotNumber: 7, areaSqMt: 200.62, areaSqFt: 2159.455 },
    { plotNumber: 8, areaSqMt: 238.52, areaSqFt: 2567.407 },
    { plotNumber: 9, areaSqMt: 113.22, areaSqFt: 1218.689 },
    { plotNumber: 10, areaSqMt: 86.46, areaSqFt: 930.647 },
    { plotNumber: 11, areaSqMt: 96.27, areaSqFt: 1036.241 },
    { plotNumber: 12, areaSqMt: 122.05, areaSqFt: 1313.735 },
    { plotNumber: 13, areaSqMt: 118.5, areaSqFt: 1275.523 },
    { plotNumber: 14, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 15, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 16, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 17, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 18, areaSqMt: 138.38, areaSqFt: 1489.509 },
    { plotNumber: 19, areaSqMt: 120.96, areaSqFt: 1302.002 },
    { plotNumber: 20, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 21, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 22, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 23, areaSqMt: 103.5, areaSqFt: 1114.064 },
    { plotNumber: 24, areaSqMt: 118.5, areaSqFt: 1275.523 },
    { plotNumber: 25, areaSqMt: 127.94, areaSqFt: 1377.134 },
    { plotNumber: 26, areaSqMt: 110.1, areaSqFt: 1185.106 },
    { plotNumber: 27, areaSqMt: 108.79, areaSqFt: 1171.005 },
    { plotNumber: 28, areaSqMt: 107.48, areaSqFt: 1156.905 },
    { plotNumber: 29, areaSqMt: 106.25, areaSqFt: 1143.665 },
    { plotNumber: 30, areaSqMt: 107.73, areaSqFt: 1159.596 },
    { plotNumber: 31, areaSqMt: 107.33, areaSqFt: 1155.29 },
    { plotNumber: 32, areaSqMt: 106.55, areaSqFt: 1146.894 },
    { plotNumber: 33, areaSqMt: 105.81, areaSqFt: 1138.929 },
    { plotNumber: 34, areaSqMt: 107.39, areaSqFt: 1155.936 },
    { plotNumber: 35, areaSqMt: 138.94, areaSqFt: 1495.537 },
    { plotNumber: 36, areaSqMt: 281.71, areaSqFt: 3032.301 },
    { plotNumber: 37, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 38, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 39, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 40, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 41, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 42, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 43, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 44, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 45, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 46, areaSqMt: 145.82, areaSqFt: 1569.593 },
    { plotNumber: 47, areaSqMt: 145.81, areaSqFt: 1569.485 },
    { plotNumber: 48, areaSqMt: 150.04, areaSqFt: 1615.017 },
  ];
  

async function seedDatabase() {
  try {
    await connectDB(); // Connect to the database

    // Clear existing data
    await Plot.deleteMany({});
    console.log("Existing plots cleared");

    // Insert new data
    await Plot.insertMany(plotData);
    console.log("Plot data seeded successfully");

    process.exit(0); // Exit the process after successful seeding
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1); // Exit the process with failure
  }
}

seedDatabase();
