const readline = require("readline");
const generateFingerprint = require("./fingerprint.js");
const generateKeybox = require("./keybox.js");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Define the menu options
const menuOptions = ["Generate fingerprint overlay", "Generate keybox overlay"];

// Function to display the menu
function showMenu() {
  console.log("\nPlease select an option:");
  menuOptions.forEach((option, index) => {
    console.log(`${index + 1}. ${option}`);
  });
}

// Function to handle user's choice
function handleChoice(choice) {
  switch (choice) {
    case "1":
      generateFingerprint().then(() => {
        askToContinue();
      });
      break;
    case "2":
      generateKeybox().then(() => {
        askToContinue();
      });
      break;
    default:
      console.clear();
      console.log("Invalid choice, please select a valid option.");
      showMenu();
      promptUser();
  }
}

function askToContinue() {
  rl.question(
    "\nWould you like to make another selection? (y/n): ",
    (answer) => {
      if (answer.toLowerCase() === "y") {
        console.clear();
        showMenu();
        promptUser(); // Prompt for the next selection if user says 'y'
      } else if (answer.toLowerCase() === "n") {
        console.log("Goodbye!");
        rl.close();
        process.exit(); // Close the program if user says 'n'
      } else {
        console.log('Invalid input. Please respond with "y" or "n".');
        askToContinue(); // Re-prompt if the input is invalid
      }
    }
  );
}

// Function to prompt the user for input
function promptUser() {
  rl.question("Enter your choice (1-2): ", (answer) => {
    handleChoice(answer);
  });
}

// Start by showing the menu
showMenu();
promptUser();
