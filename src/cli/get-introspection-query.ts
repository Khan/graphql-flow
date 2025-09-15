import {
    getIntrospectionQuery as getIntrospectionQueryWithOptions,
    type IntrospectionOptions,
} from "graphql";

const INTROSPECTION_OPTIONS: IntrospectionOptions = {
    descriptions: true,
    inputValueDeprecation: true,
};

export const getIntrospectionQuery = () => {
    return getIntrospectionQueryWithOptions(INTROSPECTION_OPTIONS);
};
