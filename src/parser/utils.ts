import fs from "fs";

export const getPathWithExtension = (pathWithoutExtension: string) => {
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
