async function loadModule(moduleName: string) {
  try {
    const module = await import(`./${moduleName}`);
    const seed = module.generateSeed();
    console.log(seed);
  } catch (error) {
    console.error("Error loading module:", error);
  }
}

// Example usage:
const moduleName = "sic-ball-rtp"; // This could be dynamically determined
loadModule(moduleName);
