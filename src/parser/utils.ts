import fs from "fs";
import {Config} from "../types";

export const getPathWithExtension = (
    pathWithoutExtension: string,
    config: Config,
): string => {
    // Process the path so that we can handle aliases.
    if (config.alias) {
        for (const {find, replacement} of config.alias) {
            pathWithoutExtension = pathWithoutExtension.replace(
                find,
                replacement,
            );
        }
    }
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
    // NOTE(john): This is a bit of a hack, but it's necessary for when we
    // have a file that doesn't exist. This will happen when we delete all of
    // the type files before re-running graphql-flow again. We want to ensure
    // that we don't error out in this case.
    return "";
};
