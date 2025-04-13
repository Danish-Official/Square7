const Plot = require("./models/Plot");
const connectDB = require("./db");

const plotData1 = [
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

const plotData2 = [
  { plotNumber: 1, areaSqMt: 168.3, areaSqFt: 1811.5661 },
  { plotNumber: 2, areaSqMt: 138.83, areaSqFt: 1494.35368 },
  { plotNumber: 3, areaSqMt: 145.58, areaSqFt: 1567.01008 },
  { plotNumber: 4, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 5, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 6, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 7, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 8, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 9, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 10, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 11, areaSqMt: 155.48, areaSqFt: 1673.99369 },
  { plotNumber: 12, areaSqMt: 155.48, areaSqFt: 1673.99369 },
  { plotNumber: 13, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 14, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 15, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 16, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 17, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 18, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 19, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 20, areaSqMt: 110.25, areaSqFt: 1186.72112 },
  { plotNumber: 21, areaSqMt: 145.58, areaSqFt: 1567.01008 },
  { plotNumber: 22, areaSqMt: 487.43, areaSqFt: 5246.65288 },
  { plotNumber: 23, areaSqMt: 443.03, areaSqFt: 4768.37523 },
  { plotNumber: 24, areaSqMt: 440.78, areaSqFt: 4744.51643 },
  { plotNumber: 25, areaSqMt: 443.18, areaSqFt: 4770.34982 },
  { plotNumber: 26, areaSqMt: 539.15, areaSqFt: 5803.3623 },
  { plotNumber: 27, areaSqMt: 572.91, areaSqFt: 6166.75192 },
  { plotNumber: 28, areaSqMt: 492.16, areaSqFt: 5297.56516 },
  { plotNumber: 29, areaSqMt: 491.12, areaSqFt: 5286.37168 },
  { plotNumber: 30, areaSqMt: 575.48, areaSqFt: 6194.41517 },
  { plotNumber: 31, areaSqMt: 147, areaSqFt: 1582.29 },
  { plotNumber: 32, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 33, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 34, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 35, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 36, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 37, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 38, areaSqMt: 105, areaSqFt: 1130.21 },
  { plotNumber: 39, areaSqMt: 156.16, areaSqFt: 1680.89225 },
  { plotNumber: 40, areaSqMt: 159.31, areaSqFt: 1714.79857 },
  { plotNumber: 41, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 42, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 43, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 44, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 45, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 46, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 47, areaSqMt: 189, areaSqFt: 2034.38 },
  { plotNumber: 48, areaSqMt: 144, areaSqFt: 1550 },
  { plotNumber: 49, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 50, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 51, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 52, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 53, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 54, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 55, areaSqMt: 114, areaSqFt: 1227.09 },
  { plotNumber: 56, areaSqMt: 200.63, areaSqFt: 2159.56335 }
];

const layouts = {
  layout1: {
    name: "Square7 Phase 1",
    plots: plotData1,
  },
  layout2: {
    name: "Square7 Phase 2",
    plots: plotData2,
  },
};

async function seedDatabase() {
  try {
    await connectDB();

    for (const [layoutId, layout] of Object.entries(layouts)) {
      for (const plot of layout.plots) {
        const existingPlot = await Plot.findOne({
          layoutId,
          plotNumber: plot.plotNumber,
        });

        if (existingPlot) {
          existingPlot.areaSqMt = plot.areaSqMt;
          existingPlot.areaSqFt = plot.areaSqFt;
          await existingPlot.save();
        } else {
          await Plot.create({
            ...plot,
            layoutId,
          });
        }
      }
    }

    console.log("Plot data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
