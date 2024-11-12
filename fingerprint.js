const axios = require("axios");
const fs = require("fs");
const xml2js = require("xml2js");

// Path to the fingerprint JSON file
const FINGERPRINT_FILE = "./fingerprint.json";

// URL to fetch JSON data if the local file doesn't exist
const FINGERPRINT_URL =
  "https://raw.githubusercontent.com/chiteroman/PlayIntegrityFix/main/module/pif.json";

// Helper function to conditionally add an item if the value exists
const addItem = (key, value, items) => {
  if (value) {
    items.push(`${key}:${value}`);
  }
};

// Generate XML from JSON data with optional items
async function generateXml(data) {
  const builder = new xml2js.Builder({
    renderOpts: {
      pretty: true, // Add line breaks for readability
      indent: "    ", // Use 4 spaces for indentation
      newline: "\n", // Use newlines to separate elements
    },
    declaration: {
      // Add XML declaration at the top
      version: "1.0",
      encoding: "utf-8",
    },
  });

  // Create the base XML structure
  const xmlObj = {
    resources: {
      array: [
        {
          $: { name: "config_certifiedBuildProperties" },
          item: [],
        },
      ],
    },
  };

  // Organize the items into different categories based on available data
  const productInfo = [];
  const versionInfo = [];
  const securityInfo = [];

  // Add product-related data
  addItem("PRODUCT", data.PRODUCT, productInfo);
  addItem("DEVICE", data.DEVICE, productInfo);
  addItem("MANUFACTURER", data.MANUFACTURER, productInfo);
  addItem("BRAND", data.BRAND, productInfo);
  addItem("MODEL", data.MODEL, productInfo);
  addItem("ID", data.ID, versionInfo);

  // Add version-related data
  addItem("VERSION.RELEASE", data.VERSION_RELEASE, versionInfo);
  addItem("VERSION.INCREMENTAL", data.VERSION_INCREMENTAL, versionInfo);
  addItem("FINGERPRINT", data.FINGERPRINT, versionInfo);

  // Add security patch-related data
  addItem("VERSION.SECURITY_PATCH", data.SECURITY_PATCH, securityInfo);
  addItem(
    "VERSION.DEVICE_INITIAL_SDK_INT",
    data.DEVICE_INITIAL_SDK_INT,
    securityInfo
  );

  // Combine all available sections into the main items array
  xmlObj.resources.array[0].item.push(
    ...productInfo,
    ...versionInfo,
    ...securityInfo
  );

  // Convert the JSON object to XML string
  return builder.buildObject(xmlObj);
}

// Fetch fingerprint data from URL or read from local file
async function fetchFingerprintData() {
  try {
    // Check if local fingerprint file exists
    if (fs.existsSync(FINGERPRINT_FILE)) {
      const data = fs.readFileSync(FINGERPRINT_FILE, "utf-8");
      return JSON.parse(data); // Parse the local fingerprint.json
    } else {
      // Fetch fingerprint data from the URL if the file does not exist
      const response = await axios.get(FINGERPRINT_URL);
      return response.data; // Return the data fetched from the URL
    }
  } catch (error) {
    console.error("Error fetching or reading fingerprint data:", error);
    throw error;
  }
}

// Main function to generate and save the XML overlay
async function main() {
  try {
    // Fetch the fingerprint data
    const fingerprintData = await fetchFingerprintData();

    // Generate the XML overlay from the fingerprint data
    const xmlOutput = await generateXml(fingerprintData);

    // Write the XML output to a file (e.g., overlay.xml)
    fs.writeFileSync("overlay.xml", xmlOutput);
    console.log("XML overlay generated successfully: overlay.xml");
  } catch (error) {
    console.error("Failed to generate the XML overlay:", error);
  }
}

// Run the main function
module.exports = main;
