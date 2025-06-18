const path = require("path");
const os = require("os");
const fsp = require("fs/promises");

async function cloneUserDataDir(srcDir, destDir) {
  try {
    await fsp.rm(destDir, { recursive: true, force: true });
    await fsp.mkdir(destDir, { recursive: true });

    const filesToSkip = [
      "SingletonCookie",
      "SingletonLock",
      "SingletonSocket",
      ".com.google.Chrome.",
      "lockfile",
      "Cache",
      "GPUCache",
      "CacheStorage",
    ];

    const copyRecursive = async (src, dest) => {
      try {
        const entries = await fsp.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
          if (filesToSkip.some((skipFile) => entry.name.includes(skipFile))) {
            continue;
          }

          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          try {
            if (entry.isDirectory()) {
              await fsp.mkdir(destPath, { recursive: true });
              await copyRecursive(srcPath, destPath);
            } else {
              try {
                await fsp.copyFile(srcPath, destPath);
              } catch (copyErr) {
                console.log(
                  `Could not copy file ${srcPath}: ${copyErr.message}`,
                );
              }
            }
          } catch (entryErr) {
            console.log(`Error processing ${srcPath}: ${entryErr.message}`);
          }
        }
      } catch (readErr) {
        console.log(`Could not read directory ${src}: ${readErr.message}`);
      }
    };

    await copyRecursive(srcDir, destDir);
  } catch (err) {
    console.error("Error cloning user data dir:", err);
    throw err;
  }
}

function getDefaultChromeUserDataDir() {
  switch (process.platform) {
    case "win32":
      return path.join(
        os.homedir(),
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data",
      );
    case "darwin":
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Google",
        "Chrome",
      );
    default:
      return path.join(os.homedir(), ".config", "google-chrome");
  }
}

function getChromeExecutablePath() {
  switch (process.platform) {
    case "win32":
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    case "darwin":
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    default:
      return "/usr/bin/google-chrome";
  }
}

module.exports = {
  getDefaultChromeUserDataDir,
  getChromeExecutablePath,
  cloneUserDataDir,
};
