import ChildProcess, { exec } from "child_process";
// @ts-ignore
import advzip from "advzip-bin";
import fs from "fs";
// import path from "path";

const compressDistFolder = () => {
  if (fs.existsSync(ZIP_FILE_PATH)) {
    ChildProcess.execSync(`rm ${ZIP_FILE_PATH}`);
  }

  const args = ["-r", ZIP_FILE_PATH, DIST_FOLDER_PATH];

  ChildProcess.execSync(`zip ${args.reduce((p, n) => p + " " + n, "")}`);
};

const recompressWithAdvzip = () => {
  try {
    const args = ["--recompress", "--shrink-extra", ZIP_FILE_PATH];
    const result = ChildProcess.execFileSync(advzip, args);

    console.log(result.toString().trim());

    const stats = fs.statSync(ZIP_FILE_PATH);

    console.log("advzip ZIP size", stats.size);
  } catch (err) {
    console.log("advzip error", err);
  }
};

exec("cd ../");

const ZIP_FILE_PATH = "dist.zip";
const DIST_FOLDER_PATH = "dist/";

compressDistFolder();
recompressWithAdvzip();
