const { generateCombinedData } = require('../dataPipeline');

(async () => {
  const finalData = await generateCombinedData();
  console.log(
    `Conversion complete. combined.json created successfully with ${finalData.length} records.`,
  );
})();
