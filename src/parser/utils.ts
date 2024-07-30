import fs from "fs";
import {Config} from "../types";

export const fixPathResolution = (path: string, config: Config) => {
    if (config.alias) {
        for (const {find, replacement} of config.alias) {
            path = path.replace(find, replacement);
        }
    }
    return path;
};

export const getPathWithExtension = (
    pathWithoutExtension: string,
    config: Config,
) => {
    pathWithoutExtension = fixPathResolution(pathWithoutExtension, config);
    if (
        /\.(less|css|png|gif|jpg|jpeg|js|jsx|ts|tsx|mjs)$/.test(
            pathWithoutExtension,
        )
    ) {
        return pathWithoutExtension;
    }
    if (fs.existsSync(pathWithoutExtension + ".js")) {
        return pathWithoutExtension + ".js";
    }
    if (fs.existsSync(pathWithoutExtension + ".jsx")) {
        return pathWithoutExtension + ".jsx";
    }
    if (fs.existsSync(pathWithoutExtension + ".tsx")) {
        return pathWithoutExtension + ".tsx";
    }
    if (fs.existsSync(pathWithoutExtension + ".ts")) {
        return pathWithoutExtension + ".ts";
    }
    return null;
};
