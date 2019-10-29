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
const enumsByName = {};

schema.__schema.types.forEach(t => {
    if (t.kind === 'ENUM') {
        enumsByName[t.name] = t;
        return;
    }
    if (t.kind === 'UNION') {
        unionsByName[t.name] = t;
        return;
    }
    if (t.kind === 'INTERFACE') {
        interfacesByName[t.name] = t;
        t.possibleTypesByName = {};
        t.possibleTypes.forEach(p => (t.possibleTypesByName[p.name] = true));
        t.fieldsByName = {};
        t.fields.forEach(field => {
            t.fieldsByName[field.name] = field;
        });
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
            switch (selection.kind) {
                case 'FragmentSpread':
                    if (!fragments[selection.name.value]) {
                        console.warn(
                            'No fragment for selection named:',
                            selection.name.value,
                        );
                    }

                    return objectPropertiesToFlow(
                        fragments,
                        type,
                        fragments[selection.name.value].selectionSet.selections,
                    );

                case 'Field':
                    const name = selection.name.value;
                    const alias = selection.alias
                        ? selection.alias.value
                        : name;
                    if (!type.fieldsByName[name]) {
                        console.warn('Unknown field: ' + name);
                        return t.objectTypeProperty(
                            t.identifier(alias),
                            t.anyTypeAnnotation(),
                        );
                    }
                    const typeField = type.fieldsByName[name];
                    return [
                        t.objectTypeProperty(
                            t.identifier(alias),
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

const unionOrInterfaceSelection = (fragments, type, possible, selection) => {
    if (selection.kind === 'Field' && selection.name.value === '__typename') {
        const alias = selection.alias
            ? selection.alias.value
            : selection.name.value;
        return [
            t.objectTypeProperty(
                t.identifier(alias),
                t.stringLiteralTypeAnnotation(possible.name),
            ),
        ];
    }
    if (selection.kind === 'Field' && type.fields) {
        // this is an interface
        const name = selection.name.value;
        const alias = selection.alias ? selection.alias.value : name;
        if (!type.fieldsByName[name]) {
            console.warn(
                'Unknown field: ' +
                    name +
                    ' on type ' +
                    type.name +
                    ' for possible ' +
                    possible.name,
            );
            return [
                t.objectTypeProperty(
                    t.identifier(alias),
                    t.anyTypeAnnotation(),
                ),
            ];
        }
        const typeField = type.fieldsByName[name];
        return [
            t.objectTypeProperty(
                t.identifier(alias),
                typeToFlow(fragments, typeField.type, selection),
            ),
        ];
    }
    if (selection.kind === 'FragmentSpread') {
        const fragment = fragments[selection.name.value];
        const typeName = fragment.typeCondition.name.value;
        if (
            (interfacesByName[typeName] &&
                interfacesByName[typeName].possibleTypesByName[
                    possible.name
                ]) ||
            typeName === possible.name
        ) {
            return [].concat(
                ...fragment.selectionSet.selections.map(selection =>
                    unionOrInterfaceSelection(
                        fragments,
                        typesByName[possible.name],
                        possible,
                        selection,
                    ),
                ),
            );
        } else {
            return [];
        }
    }
    if (selection.kind !== 'InlineFragment') {
        console.warn('union selectors must be inline fragment', selection);
        if (type.kind === 'UNION') {
            console.warn(`You're trying to select a field from the union ${type.name},
but the only field you're allowed to select is "__typename".
Try using an inline fragment "... on SomeType {}".`);
        }
        console.warn(type);
        console.warn(possible);
        return [];
    }
    const typeName = selection.typeCondition.name.value;
    if (
        (interfacesByName[typeName] &&
            interfacesByName[typeName].possibleTypesByName[possible.name]) ||
        typeName === possible.name
    ) {
        return objectPropertiesToFlow(
            fragments,
            typesByName[possible.name],
            selection.selectionSet.selections,
        );
    }
    return [];
};

const unionOrInterfaceToFlow = (fragments, type, selections) => {
    const selectedAttributes = type.possibleTypes.map(possible =>
        [].concat(
            ...selections.map(selection =>
                unionOrInterfaceSelection(fragments, type, possible, selection),
            ),
        ),
    );
    const allFields = selections.every(selection => selection.kind === 'Field');
    if (selectedAttributes.length === 1 || allFields) {
        return t.objectTypeAnnotation(selectedAttributes[0]);
    }
    return t.unionTypeAnnotation(
        selectedAttributes.map(properties =>
            t.objectTypeAnnotation(properties),
        ),
    );
};

const typeToFlow = (fragments, type, selection) => {
    // NOTE (jeremy): Right now almost all of our GraphQL types are nullable,
    // but not really. When we get the types fixed up on the server we might
    // want to mark types as truly nullable.
    if (type.kind === 'NON_NULL') {
        return typeToFlow(fragments, type.ofType, selection);
    }

    if (type.kind === 'SCALAR') {
        switch (type.name) {
            case 'Boolean':
                return t.genericTypeAnnotation(t.identifier('boolean'));
            case 'ID':
            case 'String':
            case 'DateTime': // Serialized ISO-8801 dates...
                return t.genericTypeAnnotation(t.identifier('string'));
            case 'Int':
            case 'Float':
                return t.genericTypeAnnotation(t.identifier('number'));
            case 'JSONString':
                return t.genericTypeAnnotation(t.identifier('string'));
            default:
                // console.log('scalar', type.name);
                return t.anyTypeAnnotation();
        }
    }
    if (type.kind === 'LIST') {
        return t.genericTypeAnnotation(
            t.identifier('$ReadOnlyArray'),
            t.typeParameterInstantiation([
                typeToFlow(fragments, type.ofType, selection),
            ]),
        );
    }
    if (type.kind === 'UNION') {
        const union = unionsByName[type.name];
        if (!selection.selectionSet) {
            console.log('no selection set', selection);
            return t.anyTypeAnnotation();
        }
        return unionOrInterfaceToFlow(
            fragments,
            union,
            selection.selectionSet.selections,
        );
    }

    if (type.kind === 'INTERFACE') {
        if (!selection.selectionSet) {
            console.log('no selection set', selection);
            return t.anyTypeAnnotation();
        }
        return unionOrInterfaceToFlow(
            fragments,
            interfacesByName[type.name],
            selection.selectionSet.selections,
        );
    }
    if (type.kind === 'ENUM') {
        return t.unionTypeAnnotation(
            enumsByName[type.name].enumValues.map(n =>
                t.stringLiteralTypeAnnotation(n.name),
            ),
        );
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
