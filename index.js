/* eslint-disable no-console */

/**
 * This tool generates flowtype definitions from graphql queries.
 *
 * It relies on `introspection-query.json` existing in this directory,
 * which is produced by running `./tools/graphql-flow/sendIntrospection.js`.
 */

const schema = require('./introspection-query.json');

const t = require('@babel/types');
const generate = require('@babel/generator').default;

const interfacesByName = {};
const typesByName = {};
const unionsByName = {};

schema.__schema.types.forEach(t => {
    if (t.kind === 'UNION') {
        unionsByName[t.name] = t;
        return;
    }
    if (t.kind === 'INTERFACE') {
        interfacesByName[t.name] = t;
        t.possibleTypesByName = {};
        t.possibleTypes.forEach(p => (t.possibleTypesByName[p.name] = true));
        return;
    }
    if (t.kind !== 'OBJECT') {
        return;
    }
    typesByName[t.name] = t;
    t.fieldsByName = {};
    if (!t.fields) {
        console.log('no fields', t.name);
        return;
    }

    t.fields.forEach(field => {
        t.fieldsByName[field.name] = field;
    });
});

const objectPropertiesToFlow = (fragments, type, selections) => {
    return [].concat(
        ...selections.map(selection => {
            const name = selection.name.value;
            switch (selection.kind) {
                case 'FragmentSpread':
                    return objectPropertiesToFlow(
                        fragments,
                        type,
                        fragments[selection.name.value].selectionSet.selections,
                    );

                case 'Field':
                    if (!type.fieldsByName[name]) {
                        console.warn('Unknown field: ' + name);
                        return t.objectTypeProperty(
                            t.identifier(name),
                            t.anyTypeAnnotation(),
                        );
                    }
                    const typeField = type.fieldsByName[name];
                    return [
                        t.objectTypeProperty(
                            t.identifier(name),
                            typeToFlow(fragments, typeField.type, selection),
                        ),
                    ];

                default:
                    console.log('unsupported selection', selection);
                    return [];
            }
        }),
    );
};

const unionToFlow = (fragments, type, selections) => {
    return t.unionTypeAnnotation(
        type.possibleTypes.map(possible => {
            return t.objectTypeAnnotation(
                [].concat(
                    ...selections.map(selection => {
                        if (
                            selection.kind === 'Field' &&
                            selection.name.value === '__typename'
                        ) {
                            return [
                                t.objectTypeProperty(
                                    t.identifier(selection.name.value),
                                    t.stringLiteralTypeAnnotation(
                                        possible.name,
                                    ),
                                ),
                            ];
                        }
                        if (selection.kind !== 'InlineFragment') {
                            console.log(
                                'union selectors must be inline fragment',
                                selection,
                            );
                            return [];
                        }
                        const typeName = selection.typeCondition.name.value;
                        if (
                            (interfacesByName[typeName] &&
                                interfacesByName[typeName].possibleTypesByName[
                                    possible.name
                                ]) ||
                            typeName === possible.name
                        ) {
                            return objectPropertiesToFlow(
                                fragments,
                                typesByName[possible.name],
                                selection.selectionSet.selections,
                            );
                        }
                        return [];
                    }),
                ),
            );
        }),
    );
};

const typeToFlow = (fragments, type, selection) => {
    if (type.kind === 'SCALAR') {
        switch (type.name) {
            case 'Boolean':
                return t.genericTypeAnnotation(t.identifier('boolean'));
            case 'ID':
            case 'String':
                return t.genericTypeAnnotation(t.identifier('string'));
            case 'Int':
            case 'Float':
                return t.genericTypeAnnotation(t.identifier('number'));
            case 'JSONString':
                return t.genericTypeAnnotation(t.identifier('string'));
            default:
                console.log('scalar', type.name);
                return t.anyTypeAnnotation();
        }
    }
    if (type.kind === 'LIST') {
        return t.arrayTypeAnnotation(
            typeToFlow(fragments, type.ofType, selection),
        );
    }
    if (type.kind === 'UNION') {
        const union = unionsByName[type.name];
        if (!selection.selectionSet) {
            console.log('no selection set', selection);
            return t.anyTypeAnnotation();
        }
        return unionToFlow(fragments, union, selection.selectionSet.selections);
    }

    if (type.kind !== 'OBJECT') {
        console.log('not object', type);
        return t.anyTypeAnnotation();
    }

    const tname = type.name;
    if (!typesByName[tname]) {
        console.log('unknown referenced type', tname);
        return t.anyTypeAnnotation();
    }
    const childType = typesByName[tname];
    if (!selection.selectionSet) {
        console.log('no selection set', selection);
        return t.anyTypeAnnotation();
    }
    return querySelectionToObjectType(
        fragments,
        selection.selectionSet.selections,
        childType,
    );
};

/**
 * FUTURE(jared): Currently basically everything in our schema is nullable,
 * (including e.g. Topic id's and titles) - which doesn't actually make sense.
 * So for now I'm ignoring the fact that most things are nullable. This is a
 * potential source of bugs, because some things might *actually* be nullable
 * in practice, and that won't be reflected in the types.
 * Unfortunately, until our graphql schema better reflects reality, this is
 * the cleanest way to do things.
 * Once the schema is better, we can use this function to add in the
 * nullability.
 *
 * const typeToFlow = (type, selection) => {
 *     if (type.kind === 'NON_NULL') {
 *         return _typeToFlow(type.ofType, selection)
 *     }
 *     return t.nullableTypeAnnotation(_typeToFlow(type, selection))
 * };
 */

const querySelectionToObjectType = (fragments, selections, type) => {
    return t.objectTypeAnnotation(
        objectPropertiesToFlow(fragments, type, selections),
    );
};

module.exports = (query, definitions) => {
    const fragments = {};
    definitions.forEach(def => {
        if (def.kind === 'FragmentDefinition') {
            fragments[def.name.value] = def;
        }
    });
    return generate(
        querySelectionToObjectType(
            fragments,
            query.selectionSet.selections,
            typesByName.Query,
        ),
    ).code;
};
