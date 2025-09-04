/**
 * Takes the introspectionQuery response and parses it into the "Schema"
 * type that we use to look up types, interfaces, etc.
 */
import util from "node:util";
import type {IntrospectionQuery} from "graphql";
import type {Schema} from "./types";

export const schemaFromIntrospectionData = (
    schema: IntrospectionQuery,
): Schema => {
    const result: Schema = {
        interfacesByName: {},
        typesByName: {},
        inputObjectsByName: {},
        unionsByName: {},
        enumsByName: {},
    };

    schema.__schema.types.forEach((type) => {
        if (type.kind === "ENUM") {
            result.enumsByName[type.name] = type;
            return;
        }
        if (type.kind === "UNION") {
            result.unionsByName[type.name] = type;
            return;
        }
        if (type.kind === "INTERFACE") {
            result.interfacesByName[type.name] = {
                ...type,
                possibleTypesByName: {},
                fieldsByName: {},
            };
            type.possibleTypes.forEach(
                (p) =>
                    (result.interfacesByName[type.name].possibleTypesByName[
                        p.name
                    ] = true),
            );
            type.fields.forEach((field) => {
                result.interfacesByName[type.name].fieldsByName[field.name] =
                    field;
            });
            return;
        }
        if (type.kind === "INPUT_OBJECT") {
            result.inputObjectsByName[type.name] = type;
            return;
        }
        if (type.kind === "SCALAR") {
            return;
        }
        result.typesByName[type.name] = {
            ...type,
            fieldsByName: {},
        };
        if (!type.fields) {
            return;
        }

        type.fields.forEach((field) => {
            result.typesByName[type.name].fieldsByName[field.name] = field;
        });
    });

    return result;
};
