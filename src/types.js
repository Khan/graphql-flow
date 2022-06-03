// @flow

import type {GenerateConfig} from './cli/config';
import type {BabelNode} from '@babel/types';
import type {
    FragmentDefinitionNode,
    IntrospectionEnumType,
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionInterfaceType,
    IntrospectionObjectType,
    IntrospectionUnionType,
    SelectionNode,
} from 'graphql';

export type Selections = $ReadOnlyArray<SelectionNode>;

export type Schema = {
    interfacesByName: {
        [key: string]: IntrospectionInterfaceType & {
            fieldsByName: {[key: string]: IntrospectionField},
            possibleTypesByName: {[key: string]: boolean},
        },
    },
    inputObjectsByName: {
        [key: string]: IntrospectionInputObjectType,
    },
    typesByName: {
        [key: string]: IntrospectionObjectType & {
            fieldsByName: {[key: string]: IntrospectionField},
        },
    },
    unionsByName: {
        [key: string]: IntrospectionUnionType,
    },
    enumsByName: {
        [key: string]: IntrospectionEnumType,
    },
};

export type Context = {
    path: Array<string>,

    strictNullability: boolean,
    readOnlyArray: boolean,
    schema: Schema,
    scalars: Scalars,

    fragments: {[key: string]: FragmentDefinitionNode},

    errors: Array<string>,
    allObjectTypes: null | {[key: string]: BabelNode},
    experimentalEnumsMap?: {[key: string]: BabelNode}, // index signature that is populated with declarations
};
export type Scalars = {[key: string]: 'string' | 'number' | 'boolean'};
