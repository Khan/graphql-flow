// @flow

// NOTE: This file was produced via flow-typed's "typescript conversion" utility,
// and has some incongruities :( Unfortunately flow-typed doesn't have types for
// @babel/types, and the babel project has long since moved on to typescript.

declare module '@babel/types' {
    // declare function objectTypeProperty(number, boolean): string;
    declare function objectTypeProperty(
        key: BabelNodeIdentifier | BabelNodeStringLiteral,
        value: BabelNodeFlowType,
        variance?: BabelNodeVariance,
    ): BabelNodeObjectTypeProperty;
    declare function identifier(name: string): BabelNodeIdentifier;
    declare function anyTypeAnnotation(): BabelNodeAnyTypeAnnotation;
    declare function stringLiteralTypeAnnotation(
        value: string,
    ): BabelNodeStringLiteralTypeAnnotation;
    declare function stringTypeAnnotation(): BabelNodeStringTypeAnnotation;
    declare function symbolTypeAnnotation(): BabelNodeSymbolTypeAnnotation;
    declare function thisTypeAnnotation(): BabelNodeThisTypeAnnotation;

    declare function arrayExpression(
        elements?: Array<null | BabelNodeExpression | BabelNodeSpreadElement>,
    ): BabelNodeArrayExpression;
    declare function assignmentExpression(
        operator: string,
        left: BabelNodeLVal,
        right: BabelNodeExpression,
    ): BabelNodeAssignmentExpression;
    declare function binaryExpression(
        operator:
            | '+'
            | '-'
            | '/'
            | '%'
            | '*'
            | '**'
            | '&'
            | '|'
            | '>>'
            | '>>>'
            | '<<'
            | '^'
            | '=='
            | '==='
            | '!='
            | '!=='
            | 'in'
            | 'instanceof'
            | '>'
            | '<'
            | '>='
            | '<=',
        left: BabelNodeExpression | BabelNodePrivateName,
        right: BabelNodeExpression,
    ): BabelNodeBinaryExpression;
    declare function interpreterDirective(
        value: string,
    ): BabelNodeInterpreterDirective;
    declare function directive(
        value: BabelNodeDirectiveLiteral,
    ): BabelNodeDirective;
    declare function directiveLiteral(value: string): BabelNodeDirectiveLiteral;
    declare function blockStatement(
        body: Array<BabelNodeStatement>,
        directives?: Array<BabelNodeDirective>,
    ): BabelNodeBlockStatement;
    declare function breakStatement(
        label?: BabelNodeIdentifier,
    ): BabelNodeBreakStatement;
    declare function callExpression(
        callee: BabelNodeExpression | BabelNodeV8IntrinsicIdentifier,
        _arguments: Array<
            | BabelNodeExpression
            | BabelNodeSpreadElement
            | BabelNodeJSXNamespacedName
            | BabelNodeArgumentPlaceholder,
        >,
    ): BabelNodeCallExpression;
    declare function catchClause(
        param?:
            | BabelNodeIdentifier
            | BabelNodeArrayPattern
            | BabelNodeObjectPattern,
        body: BabelNodeBlockStatement,
    ): BabelNodeCatchClause;
    declare function conditionalExpression(
        test: BabelNodeExpression,
        consequent: BabelNodeExpression,
        alternate: BabelNodeExpression,
    ): BabelNodeConditionalExpression;
    declare function continueStatement(
        label?: BabelNodeIdentifier,
    ): BabelNodeContinueStatement;
    declare function debuggerStatement(): BabelNodeDebuggerStatement;
    declare function doWhileStatement(
        test: BabelNodeExpression,
        body: BabelNodeStatement,
    ): BabelNodeDoWhileStatement;
    declare function emptyStatement(): BabelNodeEmptyStatement;
    declare function expressionStatement(
        expression: BabelNodeExpression,
    ): BabelNodeExpressionStatement;
    declare function file(
        program: BabelNodeProgram,
        comments?: Array<BabelNodeCommentBlock | BabelNodeCommentLine>,
        tokens?: Array<any>,
    ): BabelNodeFile;
    declare function forInStatement(
        left: BabelNodeVariableDeclaration | BabelNodeLVal,
        right: BabelNodeExpression,
        body: BabelNodeStatement,
    ): BabelNodeForInStatement;
    declare function forStatement(
        init?: BabelNodeVariableDeclaration | BabelNodeExpression,
        test?: BabelNodeExpression,
        update?: BabelNodeExpression,
        body: BabelNodeStatement,
    ): BabelNodeForStatement;
    declare function functionDeclaration(
        id?: BabelNodeIdentifier,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        body: BabelNodeBlockStatement,
        generator?: boolean,
        async?: boolean,
    ): BabelNodeFunctionDeclaration;
    declare function functionExpression(
        id?: BabelNodeIdentifier,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        body: BabelNodeBlockStatement,
        generator?: boolean,
        async?: boolean,
    ): BabelNodeFunctionExpression;
    declare function ifStatement(
        test: BabelNodeExpression,
        consequent: BabelNodeStatement,
        alternate?: BabelNodeStatement,
    ): BabelNodeIfStatement;
    declare function labeledStatement(
        label: BabelNodeIdentifier,
        body: BabelNodeStatement,
    ): BabelNodeLabeledStatement;
    declare function stringLiteral(value: string): BabelNodeStringLiteral;
    declare function numericLiteral(value: number): BabelNodeNumericLiteral;
    declare function nullLiteral(): BabelNodeNullLiteral;
    declare function booleanLiteral(value: boolean): BabelNodeBooleanLiteral;
    declare function regExpLiteral(
        pattern: string,
        flags?: string,
    ): BabelNodeRegExpLiteral;
    declare function logicalExpression(
        operator: '||' | '&&' | '??',
        left: BabelNodeExpression,
        right: BabelNodeExpression,
    ): BabelNodeLogicalExpression;
    declare function memberExpression(
        object: BabelNodeExpression,
        property:
            | BabelNodeExpression
            | BabelNodeIdentifier
            | BabelNodePrivateName,
        computed?: boolean,
        optional?: true | false,
    ): BabelNodeMemberExpression;
    declare function newExpression(
        callee: BabelNodeExpression | BabelNodeV8IntrinsicIdentifier,
        _arguments: Array<
            | BabelNodeExpression
            | BabelNodeSpreadElement
            | BabelNodeJSXNamespacedName
            | BabelNodeArgumentPlaceholder,
        >,
    ): BabelNodeNewExpression;
    declare function program(
        body: Array<BabelNodeStatement>,
        directives?: Array<BabelNodeDirective>,
        sourceType?: 'script' | 'module',
        interpreter?: BabelNodeInterpreterDirective,
    ): BabelNodeProgram;
    declare function objectExpression(
        properties: Array<
            | BabelNodeObjectMethod
            | BabelNodeObjectProperty
            | BabelNodeSpreadElement,
        >,
    ): BabelNodeObjectExpression;
    declare function objectMethod(
        kind?: 'method' | 'get' | 'set',
        key:
            | BabelNodeExpression
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        body: BabelNodeBlockStatement,
        computed?: boolean,
        generator?: boolean,
        async?: boolean,
    ): BabelNodeObjectMethod;
    declare function objectProperty(
        key:
            | BabelNodeExpression
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral,
        value: BabelNodeExpression | BabelNodePatternLike,
        computed?: boolean,
        shorthand?: boolean,
        decorators?: Array<BabelNodeDecorator>,
    ): BabelNodeObjectProperty;
    declare function restElement(argument: BabelNodeLVal): BabelNodeRestElement;
    declare function returnStatement(
        argument?: BabelNodeExpression,
    ): BabelNodeReturnStatement;
    declare function sequenceExpression(
        expressions: Array<BabelNodeExpression>,
    ): BabelNodeSequenceExpression;
    declare function parenthesizedExpression(
        expression: BabelNodeExpression,
    ): BabelNodeParenthesizedExpression;
    declare function switchCase(
        test?: BabelNodeExpression,
        consequent: Array<BabelNodeStatement>,
    ): BabelNodeSwitchCase;
    declare function switchStatement(
        discriminant: BabelNodeExpression,
        cases: Array<BabelNodeSwitchCase>,
    ): BabelNodeSwitchStatement;
    declare function thisExpression(): BabelNodeThisExpression;
    declare function throwStatement(
        argument: BabelNodeExpression,
    ): BabelNodeThrowStatement;
    declare function tryStatement(
        block: BabelNodeBlockStatement,
        handler?: BabelNodeCatchClause,
        finalizer?: BabelNodeBlockStatement,
    ): BabelNodeTryStatement;
    declare function unaryExpression(
        operator:
            | 'void'
            | 'throw'
            | 'delete'
            | '!'
            | '+'
            | '-'
            | '~'
            | 'typeof',
        argument: BabelNodeExpression,
        prefix?: boolean,
    ): BabelNodeUnaryExpression;
    declare function updateExpression(
        operator: '++' | '--',
        argument: BabelNodeExpression,
        prefix?: boolean,
    ): BabelNodeUpdateExpression;
    declare function variableDeclaration(
        kind: 'var' | 'let' | 'const',
        declarations: Array<BabelNodeVariableDeclarator>,
    ): BabelNodeVariableDeclaration;
    declare function variableDeclarator(
        id: BabelNodeLVal,
        init?: BabelNodeExpression,
    ): BabelNodeVariableDeclarator;
    declare function whileStatement(
        test: BabelNodeExpression,
        body: BabelNodeStatement,
    ): BabelNodeWhileStatement;
    declare function withStatement(
        object: BabelNodeExpression,
        body: BabelNodeStatement,
    ): BabelNodeWithStatement;
    declare function assignmentPattern(
        left:
            | BabelNodeIdentifier
            | BabelNodeObjectPattern
            | BabelNodeArrayPattern
            | BabelNodeMemberExpression,
        right: BabelNodeExpression,
    ): BabelNodeAssignmentPattern;
    declare function arrayPattern(
        elements: Array<null | BabelNodePatternLike>,
    ): BabelNodeArrayPattern;
    declare function arrowFunctionExpression(
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        body: BabelNodeBlockStatement | BabelNodeExpression,
        async?: boolean,
    ): BabelNodeArrowFunctionExpression;
    declare function classBody(
        body: Array<
            | BabelNodeClassMethod
            | BabelNodeClassPrivateMethod
            | BabelNodeClassProperty
            | BabelNodeClassPrivateProperty
            | BabelNodeTSDeclareMethod
            | BabelNodeTSIndexSignature,
        >,
    ): BabelNodeClassBody;
    declare function classExpression(
        id?: BabelNodeIdentifier,
        superClass?: BabelNodeExpression,
        body: BabelNodeClassBody,
        decorators?: Array<BabelNodeDecorator>,
    ): BabelNodeClassExpression;
    declare function classDeclaration(
        id: BabelNodeIdentifier,
        superClass?: BabelNodeExpression,
        body: BabelNodeClassBody,
        decorators?: Array<BabelNodeDecorator>,
    ): BabelNodeClassDeclaration;
    declare function exportAllDeclaration(
        source: BabelNodeStringLiteral,
    ): BabelNodeExportAllDeclaration;
    declare function exportDefaultDeclaration(
        declaration:
            | BabelNodeFunctionDeclaration
            | BabelNodeTSDeclareFunction
            | BabelNodeClassDeclaration
            | BabelNodeExpression,
    ): BabelNodeExportDefaultDeclaration;
    declare function exportNamedDeclaration(
        declaration?: BabelNodeDeclaration,
        specifiers?: Array<
            | BabelNodeExportSpecifier
            | BabelNodeExportDefaultSpecifier
            | BabelNodeExportNamespaceSpecifier,
        >,
        source?: BabelNodeStringLiteral,
    ): BabelNodeExportNamedDeclaration;

    declare function existsTypeAnnotation(): BabelNodeExistsTypeAnnotation;
    declare function functionTypeAnnotation(
        typeParameters?: BabelNodeTypeParameterDeclaration,
        params: Array<BabelNodeFunctionTypeParam>,
        rest?: BabelNodeFunctionTypeParam,
        returnType: BabelNodeFlowType,
    ): BabelNodeFunctionTypeAnnotation;
    declare function functionTypeParam(
        name?: BabelNodeIdentifier,
        typeAnnotation: BabelNodeFlowType,
    ): BabelNodeFunctionTypeParam;
    declare function genericTypeAnnotation(
        id: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier,
        typeParameters?: BabelNodeTypeParameterInstantiation,
    ): BabelNodeGenericTypeAnnotation;
    declare function inferredPredicate(): BabelNodeInferredPredicate;
    declare function interfaceExtends(
        id: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier,
        typeParameters?: BabelNodeTypeParameterInstantiation,
    ): BabelNodeInterfaceExtends;
    declare function interfaceDeclaration(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        _extends?: Array<BabelNodeInterfaceExtends>,
        body: BabelNodeObjectTypeAnnotation,
    ): BabelNodeInterfaceDeclaration;
    declare function interfaceTypeAnnotation(
        _extends?: Array<BabelNodeInterfaceExtends>,
        body: BabelNodeObjectTypeAnnotation,
    ): BabelNodeInterfaceTypeAnnotation;
    declare function intersectionTypeAnnotation(
        types: Array<BabelNodeFlowType>,
    ): BabelNodeIntersectionTypeAnnotation;
    declare function mixedTypeAnnotation(): BabelNodeMixedTypeAnnotation;
    declare function emptyTypeAnnotation(): BabelNodeEmptyTypeAnnotation;
    declare function nullableTypeAnnotation(
        typeAnnotation: BabelNodeFlowType,
    ): BabelNodeNullableTypeAnnotation;
    declare function numberLiteralTypeAnnotation(
        value: number,
    ): BabelNodeNumberLiteralTypeAnnotation;
    declare function numberTypeAnnotation(): BabelNodeNumberTypeAnnotation;
    declare function objectTypeAnnotation(
        properties: Array<
            BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty,
        >,
        indexers?: Array<BabelNodeObjectTypeIndexer>,
        callProperties?: Array<BabelNodeObjectTypeCallProperty>,
        internalSlots?: Array<BabelNodeObjectTypeInternalSlot>,
        exact?: boolean,
    ): BabelNodeObjectTypeAnnotation;
    declare function unionTypeAnnotation(
        types: Array<BabelNodeFlowType>,
    ): BabelNodeUnionTypeAnnotation;
    declare function typeParameterInstantiation(
        params: Array<BabelNodeFlowType>,
    ): BabelNodeTypeParameterInstantiation;

    declare function enumDeclaration(
        id: BabelNodeIdentifier,
        body:
            | BabelNodeEnumBooleanBody
            | BabelNodeEnumNumberBody
            | BabelNodeEnumStringBody
            | BabelNodeEnumSymbolBody,
    ): BabelNodeEnumDeclaration;
    declare function enumStringBody(
        members: Array<
            BabelNodeEnumStringMember | BabelNodeEnumDefaultedMember,
        >,
    ): BabelNodeEnumStringBody;
    declare function enumDefaultedMember(
        id: BabelNodeIdentifier,
    ): BabelNodeEnumDefaultedMember;

    /*
    NOTE(jared): There's something weird in the following couple hundred lines
    that makes flow ignore this whole file ????.
    I'm assuming once we upgrade our flow, then it will go away, and be fine again.
    I've moved everything we're actually using above this line, so our code type checks.

    declare function exportSpecifier(
        local: BabelNodeIdentifier,
        exported: BabelNodeIdentifier | BabelNodeStringLiteral,
    ): BabelNodeExportSpecifier;
    declare function forOfStatement(
        left: BabelNodeVariableDeclaration | BabelNodeLVal,
        right: BabelNodeExpression,
        body: BabelNodeStatement,
        _await?: boolean,
    ): BabelNodeForOfStatement;
    declare function importDeclaration(
        specifiers: Array<
            | BabelNodeImportSpecifier
            | BabelNodeImportDefaultSpecifier
            | BabelNodeImportNamespaceSpecifier,
        >,
        source: BabelNodeStringLiteral,
    ): BabelNodeImportDeclaration;
    declare function importDefaultSpecifier(
        local: BabelNodeIdentifier,
    ): BabelNodeImportDefaultSpecifier;
    declare function importNamespaceSpecifier(
        local: BabelNodeIdentifier,
    ): BabelNodeImportNamespaceSpecifier;
    declare function importSpecifier(
        local: BabelNodeIdentifier,
        imported: BabelNodeIdentifier | BabelNodeStringLiteral,
    ): BabelNodeImportSpecifier;
    declare function metaProperty(
        meta: BabelNodeIdentifier,
        property: BabelNodeIdentifier,
    ): BabelNodeMetaProperty;
    declare function classMethod(
        kind?: 'get' | 'set' | 'method' | 'constructor',
        key:
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral
            | BabelNodeExpression,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        body: BabelNodeBlockStatement,
        computed?: boolean,
        _static?: boolean,
        generator?: boolean,
        async?: boolean,
    ): BabelNodeClassMethod;
    declare function objectPattern(
        properties: Array<BabelNodeRestElement | BabelNodeObjectProperty>,
    ): BabelNodeObjectPattern;
    declare function spreadElement(
        argument: BabelNodeExpression,
    ): BabelNodeSpreadElement;
    declare function _super(): BabelNodeSuper;
    declare export {_super as super};
    declare function taggedTemplateExpression(
        tag: BabelNodeExpression,
        quasi: BabelNodeTemplateLiteral,
    ): BabelNodeTaggedTemplateExpression;
    declare function templateElement(
        value: {raw: string, cooked?: string},
        tail?: boolean,
    ): BabelNodeTemplateElement;
    declare function templateLiteral(
        quasis: Array<BabelNodeTemplateElement>,
        expressions: Array<BabelNodeExpression | BabelNodeTSType>,
    ): BabelNodeTemplateLiteral;
    declare function yieldExpression(
        argument?: BabelNodeExpression,
        delegate?: boolean,
    ): BabelNodeYieldExpression;
    declare function awaitExpression(
        argument: BabelNodeExpression,
    ): BabelNodeAwaitExpression;
    declare function _import(): BabelNodeImport;
    declare export {_import as import};
    declare function bigIntLiteral(value: string): BabelNodeBigIntLiteral;
    declare function exportNamespaceSpecifier(
        exported: BabelNodeIdentifier,
    ): BabelNodeExportNamespaceSpecifier;
    declare function optionalMemberExpression(
        object: BabelNodeExpression,
        property: BabelNodeExpression | BabelNodeIdentifier,
        computed?: boolean,
        optional: boolean,
    ): BabelNodeOptionalMemberExpression;
    declare function optionalCallExpression(
        callee: BabelNodeExpression,
        _arguments: Array<
            | BabelNodeExpression
            | BabelNodeSpreadElement
            | BabelNodeJSXNamespacedName,
        >,
        optional: boolean,
    ): BabelNodeOptionalCallExpression;
    declare function arrayTypeAnnotation(
        elementType: BabelNodeFlowType,
    ): BabelNodeArrayTypeAnnotation;
    declare function booleanTypeAnnotation(): BabelNodeBooleanTypeAnnotation;
    declare function booleanLiteralTypeAnnotation(
        value: boolean,
    ): BabelNodeBooleanLiteralTypeAnnotation;
    declare function nullLiteralTypeAnnotation(): BabelNodeNullLiteralTypeAnnotation;
    declare function classImplements(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterInstantiation,
    ): BabelNodeClassImplements;
    declare function declareClass(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        _extends?: Array<BabelNodeInterfaceExtends>,
        body: BabelNodeObjectTypeAnnotation,
    ): BabelNodeDeclareClass;
    declare function declareFunction(
        id: BabelNodeIdentifier,
    ): BabelNodeDeclareFunction;
    declare function declareInterface(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        _extends?: Array<BabelNodeInterfaceExtends>,
        body: BabelNodeObjectTypeAnnotation,
    ): BabelNodeDeclareInterface;
    declare function declareModule(
        id: BabelNodeIdentifier | BabelNodeStringLiteral,
        body: BabelNodeBlockStatement,
        kind?: 'CommonJS' | 'ES',
    ): BabelNodeDeclareModule;
    declare function declareModuleExports(
        typeAnnotation: BabelNodeTypeAnnotation,
    ): BabelNodeDeclareModuleExports;
    declare function declareTypeAlias(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        right: BabelNodeFlowType,
    ): BabelNodeDeclareTypeAlias;
    declare function declareOpaqueType(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        supertype?: BabelNodeFlowType,
    ): BabelNodeDeclareOpaqueType;
    declare function declareVariable(
        id: BabelNodeIdentifier,
    ): BabelNodeDeclareVariable;
    declare function declareExportDeclaration(
        declaration?: BabelNodeFlow,
        specifiers?: Array<
            BabelNodeExportSpecifier | BabelNodeExportNamespaceSpecifier,
        >,
        source?: BabelNodeStringLiteral,
    ): BabelNodeDeclareExportDeclaration;
    declare function declareExportAllDeclaration(
        source: BabelNodeStringLiteral,
    ): BabelNodeDeclareExportAllDeclaration;
    declare function declaredPredicate(
        value: BabelNodeFlow,
    ): BabelNodeDeclaredPredicate;
    declare function objectTypeInternalSlot(
        id: BabelNodeIdentifier,
        value: BabelNodeFlowType,
        optional: boolean,
        _static: boolean,
        method: boolean,
    ): BabelNodeObjectTypeInternalSlot;
    declare function objectTypeCallProperty(
        value: BabelNodeFlowType,
    ): BabelNodeObjectTypeCallProperty;
    declare function objectTypeIndexer(
        id?: BabelNodeIdentifier,
        key: BabelNodeFlowType,
        value: BabelNodeFlowType,
        variance?: BabelNodeVariance,
    ): BabelNodeObjectTypeIndexer;
    declare function objectTypeSpreadProperty(
        argument: BabelNodeFlowType,
    ): BabelNodeObjectTypeSpreadProperty;
    declare function opaqueType(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        supertype?: BabelNodeFlowType,
        impltype: BabelNodeFlowType,
    ): BabelNodeOpaqueType;
    declare function qualifiedTypeIdentifier(
        id: BabelNodeIdentifier,
        qualification: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier,
    ): BabelNodeQualifiedTypeIdentifier;
    declare function tupleTypeAnnotation(
        types: Array<BabelNodeFlowType>,
    ): BabelNodeTupleTypeAnnotation;
    declare function typeofTypeAnnotation(
        argument: BabelNodeFlowType,
    ): BabelNodeTypeofTypeAnnotation;
    declare function typeAlias(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTypeParameterDeclaration,
        right: BabelNodeFlowType,
    ): BabelNodeTypeAlias;
    declare function typeAnnotation(
        typeAnnotation: BabelNodeFlowType,
    ): BabelNodeTypeAnnotation;
    declare function typeCastExpression(
        expression: BabelNodeExpression,
        typeAnnotation: BabelNodeTypeAnnotation,
    ): BabelNodeTypeCastExpression;
    declare function typeParameter(
        bound?: BabelNodeTypeAnnotation,
        _default?: BabelNodeFlowType,
        variance?: BabelNodeVariance,
    ): BabelNodeTypeParameter;
    declare function typeParameterDeclaration(
        params: Array<BabelNodeTypeParameter>,
    ): BabelNodeTypeParameterDeclaration;
    declare function variance(kind: 'minus' | 'plus'): BabelNodeVariance;
    declare function voidTypeAnnotation(): BabelNodeVoidTypeAnnotation;
    declare function enumDeclaration(
        id: BabelNodeIdentifier,
        body:
            | BabelNodeEnumBooleanBody
            | BabelNodeEnumNumberBody
            | BabelNodeEnumStringBody
            | BabelNodeEnumSymbolBody,
    ): BabelNodeEnumDeclaration;
    declare function enumBooleanBody(
        members: Array<BabelNodeEnumBooleanMember>,
    ): BabelNodeEnumBooleanBody;
    declare function enumNumberBody(
        members: Array<BabelNodeEnumNumberMember>,
    ): BabelNodeEnumNumberBody;
    declare function enumStringBody(
        members: Array<
            BabelNodeEnumStringMember | BabelNodeEnumDefaultedMember,
        >,
    ): BabelNodeEnumStringBody;
    declare function enumSymbolBody(
        members: Array<BabelNodeEnumDefaultedMember>,
    ): BabelNodeEnumSymbolBody;
    declare function enumBooleanMember(
        id: BabelNodeIdentifier,
    ): BabelNodeEnumBooleanMember;
    declare function enumNumberMember(
        id: BabelNodeIdentifier,
        init: BabelNodeNumericLiteral,
    ): BabelNodeEnumNumberMember;
    declare function enumStringMember(
        id: BabelNodeIdentifier,
        init: BabelNodeStringLiteral,
    ): BabelNodeEnumStringMember;
    declare function jsxAttribute(
        name: BabelNodeJSXIdentifier | BabelNodeJSXNamespacedName,
        value?:
            | BabelNodeJSXElement
            | BabelNodeJSXFragment
            | BabelNodeStringLiteral
            | BabelNodeJSXExpressionContainer,
    ): BabelNodeJSXAttribute;
    declare function jsxClosingElement(
        name:
            | BabelNodeJSXIdentifier
            | BabelNodeJSXMemberExpression
            | BabelNodeJSXNamespacedName,
    ): BabelNodeJSXClosingElement;
    declare function jsxElement(
        openingElement: BabelNodeJSXOpeningElement,
        closingElement?: BabelNodeJSXClosingElement,
        children: Array<
            | BabelNodeJSXText
            | BabelNodeJSXExpressionContainer
            | BabelNodeJSXSpreadChild
            | BabelNodeJSXElement
            | BabelNodeJSXFragment,
        >,
        selfClosing?: boolean,
    ): BabelNodeJSXElement;


    // BAD HERE

    declare function jsxEmptyExpression(): BabelNodeJSXEmptyExpression;
    declare function jsxExpressionContainer(
        expression: BabelNodeExpression | BabelNodeJSXEmptyExpression,
    ): BabelNodeJSXExpressionContainer;
    declare function jsxSpreadChild(
        expression: BabelNodeExpression,
    ): BabelNodeJSXSpreadChild;
    declare function jsxIdentifier(name: string): BabelNodeJSXIdentifier;
    declare function jsxMemberExpression(
        object: BabelNodeJSXMemberExpression | BabelNodeJSXIdentifier,
        property: BabelNodeJSXIdentifier,
    ): BabelNodeJSXMemberExpression;
    declare function jsxNamespacedName(
        namespace: BabelNodeJSXIdentifier,
        name: BabelNodeJSXIdentifier,
    ): BabelNodeJSXNamespacedName;
    declare function jsxOpeningElement(
        name:
            | BabelNodeJSXIdentifier
            | BabelNodeJSXMemberExpression
            | BabelNodeJSXNamespacedName,
        attributes: Array<BabelNodeJSXAttribute | BabelNodeJSXSpreadAttribute>,
        selfClosing?: boolean,
    ): BabelNodeJSXOpeningElement;
    declare function jsxSpreadAttribute(
        argument: BabelNodeExpression,
    ): BabelNodeJSXSpreadAttribute;
    declare function jsxText(value: string): BabelNodeJSXText;
    declare function jsxFragment(
        openingFragment: BabelNodeJSXOpeningFragment,
        closingFragment: BabelNodeJSXClosingFragment,
        children: Array<
            | BabelNodeJSXText
            | BabelNodeJSXExpressionContainer
            | BabelNodeJSXSpreadChild
            | BabelNodeJSXElement
            | BabelNodeJSXFragment,
        >,
    ): BabelNodeJSXFragment;
    declare function jsxOpeningFragment(): BabelNodeJSXOpeningFragment;
    declare function jsxClosingFragment(): BabelNodeJSXClosingFragment;
    declare function noop(): BabelNodeNoop;
    declare function placeholder(
        expectedNode:
            | 'Identifier'
            | 'StringLiteral'
            | 'Expression'
            | 'Statement'
            | 'Declaration'
            | 'BlockStatement'
            | 'ClassBody'
            | 'Pattern',
        name: BabelNodeIdentifier,
    ): BabelNodePlaceholder;
    declare function v8IntrinsicIdentifier(
        name: string,
    ): BabelNodeV8IntrinsicIdentifier;
    declare function argumentPlaceholder(): BabelNodeArgumentPlaceholder;
    declare function bindExpression(
        object: BabelNodeExpression,
        callee: BabelNodeExpression,
    ): BabelNodeBindExpression;
    declare function classProperty(
        key:
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral
            | BabelNodeExpression,
        value?: BabelNodeExpression,
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop,
        decorators?: Array<BabelNodeDecorator>,
        computed?: boolean,
        _static?: boolean,
    ): BabelNodeClassProperty;
    declare function pipelineTopicExpression(
        expression: BabelNodeExpression,
    ): BabelNodePipelineTopicExpression;
    declare function pipelineBareFunction(
        callee: BabelNodeExpression,
    ): BabelNodePipelineBareFunction;
    declare function pipelinePrimaryTopicReference(): BabelNodePipelinePrimaryTopicReference;
    declare function classPrivateProperty(
        key: BabelNodePrivateName,
        value?: BabelNodeExpression,
        decorators?: Array<BabelNodeDecorator>,
        _static: any,
    ): BabelNodeClassPrivateProperty;
    declare function classPrivateMethod(
        kind?: 'get' | 'set' | 'method' | 'constructor',
        key: BabelNodePrivateName,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        body: BabelNodeBlockStatement,
        _static?: boolean,
    ): BabelNodeClassPrivateMethod;
    declare function importAttribute(
        key: BabelNodeIdentifier | BabelNodeStringLiteral,
        value: BabelNodeStringLiteral,
    ): BabelNodeImportAttribute;
    declare function decorator(
        expression: BabelNodeExpression,
    ): BabelNodeDecorator;
    declare function doExpression(
        body: BabelNodeBlockStatement,
    ): BabelNodeDoExpression;
    declare function exportDefaultSpecifier(
        exported: BabelNodeIdentifier,
    ): BabelNodeExportDefaultSpecifier;
    declare function privateName(id: BabelNodeIdentifier): BabelNodePrivateName;
    declare function recordExpression(
        properties: Array<BabelNodeObjectProperty | BabelNodeSpreadElement>,
    ): BabelNodeRecordExpression;
    declare function tupleExpression(
        elements?: Array<BabelNodeExpression | BabelNodeSpreadElement>,
    ): BabelNodeTupleExpression;
    declare function decimalLiteral(value: string): BabelNodeDecimalLiteral;
    declare function staticBlock(
        body: Array<BabelNodeStatement>,
    ): BabelNodeStaticBlock;
    declare function tsParameterProperty(
        parameter: BabelNodeIdentifier | BabelNodeAssignmentPattern,
    ): BabelNodeTSParameterProperty;
    declare function tsDeclareFunction(
        id?: BabelNodeIdentifier,
        typeParameters?: BabelNodeTSTypeParameterDeclaration | BabelNodeNoop,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        returnType?: BabelNodeTSTypeAnnotation | BabelNodeNoop,
    ): BabelNodeTSDeclareFunction;
    declare function tsDeclareMethod(
        decorators?: Array<BabelNodeDecorator>,
        key:
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral
            | BabelNodeExpression,
        typeParameters?: BabelNodeTSTypeParameterDeclaration | BabelNodeNoop,
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >,
        returnType?: BabelNodeTSTypeAnnotation | BabelNodeNoop,
    ): BabelNodeTSDeclareMethod;
    declare function tsQualifiedName(
        left: BabelNodeTSEntityName,
        right: BabelNodeIdentifier,
    ): BabelNodeTSQualifiedName;
    declare function tsCallSignatureDeclaration(
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
    ): BabelNodeTSCallSignatureDeclaration;
    declare function tsConstructSignatureDeclaration(
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
    ): BabelNodeTSConstructSignatureDeclaration;
    declare function tsPropertySignature(
        key: BabelNodeExpression,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
        initializer?: BabelNodeExpression,
    ): BabelNodeTSPropertySignature;
    declare function tsMethodSignature(
        key: BabelNodeExpression,
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
    ): BabelNodeTSMethodSignature;
    declare function tsIndexSignature(
        parameters: Array<BabelNodeIdentifier>,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
    ): BabelNodeTSIndexSignature;
    declare function tsAnyKeyword(): BabelNodeTSAnyKeyword;
    declare function tsBooleanKeyword(): BabelNodeTSBooleanKeyword;
    declare function tsBigIntKeyword(): BabelNodeTSBigIntKeyword;
    declare function tsIntrinsicKeyword(): BabelNodeTSIntrinsicKeyword;
    declare function tsNeverKeyword(): BabelNodeTSNeverKeyword;
    declare function tsNullKeyword(): BabelNodeTSNullKeyword;
    declare function tsNumberKeyword(): BabelNodeTSNumberKeyword;
    declare function tsObjectKeyword(): BabelNodeTSObjectKeyword;
    declare function tsStringKeyword(): BabelNodeTSStringKeyword;
    declare function tsSymbolKeyword(): BabelNodeTSSymbolKeyword;
    declare function tsUndefinedKeyword(): BabelNodeTSUndefinedKeyword;
    declare function tsUnknownKeyword(): BabelNodeTSUnknownKeyword;
    declare function tsVoidKeyword(): BabelNodeTSVoidKeyword;
    declare function tsThisType(): BabelNodeTSThisType;
    declare function tsFunctionType(
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
    ): BabelNodeTSFunctionType;
    declare function tsConstructorType(
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
    ): BabelNodeTSConstructorType;
    declare function tsTypeReference(
        typeName: BabelNodeTSEntityName,
        typeParameters?: BabelNodeTSTypeParameterInstantiation,
    ): BabelNodeTSTypeReference;
    declare function tsTypePredicate(
        parameterName: BabelNodeIdentifier | BabelNodeTSThisType,
        typeAnnotation?: BabelNodeTSTypeAnnotation,
        asserts?: boolean,
    ): BabelNodeTSTypePredicate;
    declare function tsTypeQuery(
        exprName: BabelNodeTSEntityName | BabelNodeTSImportType,
    ): BabelNodeTSTypeQuery;
    declare function tsTypeLiteral(
        members: Array<BabelNodeTSTypeElement>,
    ): BabelNodeTSTypeLiteral;
    declare function tsArrayType(
        elementType: BabelNodeTSType,
    ): BabelNodeTSArrayType;
    declare function tsTupleType(
        elementTypes: Array<BabelNodeTSType | BabelNodeTSNamedTupleMember>,
    ): BabelNodeTSTupleType;
    declare function tsOptionalType(
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSOptionalType;
    declare function tsRestType(
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSRestType;
    declare function tsNamedTupleMember(
        label: BabelNodeIdentifier,
        elementType: BabelNodeTSType,
        optional?: boolean,
    ): BabelNodeTSNamedTupleMember;
    declare function tsUnionType(
        types: Array<BabelNodeTSType>,
    ): BabelNodeTSUnionType;
    declare function tsIntersectionType(
        types: Array<BabelNodeTSType>,
    ): BabelNodeTSIntersectionType;
    declare function tsConditionalType(
        checkType: BabelNodeTSType,
        extendsType: BabelNodeTSType,
        trueType: BabelNodeTSType,
        falseType: BabelNodeTSType,
    ): BabelNodeTSConditionalType;
    declare function tsInferType(
        typeParameter: BabelNodeTSTypeParameter,
    ): BabelNodeTSInferType;
    declare function tsParenthesizedType(
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSParenthesizedType;
    declare function tsTypeOperator(
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSTypeOperator;
    declare function tsIndexedAccessType(
        objectType: BabelNodeTSType,
        indexType: BabelNodeTSType,
    ): BabelNodeTSIndexedAccessType;
    declare function tsMappedType(
        typeParameter: BabelNodeTSTypeParameter,
        typeAnnotation?: BabelNodeTSType,
        nameType?: BabelNodeTSType,
    ): BabelNodeTSMappedType;
    declare function tsLiteralType(
        literal:
            | BabelNodeNumericLiteral
            | BabelNodeStringLiteral
            | BabelNodeBooleanLiteral
            | BabelNodeBigIntLiteral,
    ): BabelNodeTSLiteralType;
    declare function tsExpressionWithTypeArguments(
        expression: BabelNodeTSEntityName,
        typeParameters?: BabelNodeTSTypeParameterInstantiation,
    ): BabelNodeTSExpressionWithTypeArguments;
    declare function tsInterfaceDeclaration(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        _extends?: Array<BabelNodeTSExpressionWithTypeArguments>,
        body: BabelNodeTSInterfaceBody,
    ): BabelNodeTSInterfaceDeclaration;
    declare function tsInterfaceBody(
        body: Array<BabelNodeTSTypeElement>,
    ): BabelNodeTSInterfaceBody;
    declare function tsTypeAliasDeclaration(
        id: BabelNodeIdentifier,
        typeParameters?: BabelNodeTSTypeParameterDeclaration,
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSTypeAliasDeclaration;
    declare function tsAsExpression(
        expression: BabelNodeExpression,
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSAsExpression;
    declare function tsTypeAssertion(
        typeAnnotation: BabelNodeTSType,
        expression: BabelNodeExpression,
    ): BabelNodeTSTypeAssertion;
    declare function tsEnumDeclaration(
        id: BabelNodeIdentifier,
        members: Array<BabelNodeTSEnumMember>,
    ): BabelNodeTSEnumDeclaration;
    declare function tsEnumMember(
        id: BabelNodeIdentifier | BabelNodeStringLiteral,
        initializer?: BabelNodeExpression,
    ): BabelNodeTSEnumMember;
    declare function tsModuleDeclaration(
        id: BabelNodeIdentifier | BabelNodeStringLiteral,
        body: BabelNodeTSModuleBlock | BabelNodeTSModuleDeclaration,
    ): BabelNodeTSModuleDeclaration;
    declare function tsModuleBlock(
        body: Array<BabelNodeStatement>,
    ): BabelNodeTSModuleBlock;
    declare function tsImportType(
        argument: BabelNodeStringLiteral,
        qualifier?: BabelNodeTSEntityName,
        typeParameters?: BabelNodeTSTypeParameterInstantiation,
    ): BabelNodeTSImportType;
    declare function tsImportEqualsDeclaration(
        id: BabelNodeIdentifier,
        moduleReference:
            | BabelNodeTSEntityName
            | BabelNodeTSExternalModuleReference,
    ): BabelNodeTSImportEqualsDeclaration;
    declare function tsExternalModuleReference(
        expression: BabelNodeStringLiteral,
    ): BabelNodeTSExternalModuleReference;
    declare function tsNonNullExpression(
        expression: BabelNodeExpression,
    ): BabelNodeTSNonNullExpression;
    declare function tsExportAssignment(
        expression: BabelNodeExpression,
    ): BabelNodeTSExportAssignment;
    declare function tsNamespaceExportDeclaration(
        id: BabelNodeIdentifier,
    ): BabelNodeTSNamespaceExportDeclaration;
    declare function tsTypeAnnotation(
        typeAnnotation: BabelNodeTSType,
    ): BabelNodeTSTypeAnnotation;
    declare function tsTypeParameterInstantiation(
        params: Array<BabelNodeTSType>,
    ): BabelNodeTSTypeParameterInstantiation;
    declare function tsTypeParameterDeclaration(
        params: Array<BabelNodeTSTypeParameter>,
    ): BabelNodeTSTypeParameterDeclaration;
    declare function tsTypeParameter(
        constraint?: BabelNodeTSType,
        _default?: BabelNodeTSType,
        name: string,
    ): BabelNodeTSTypeParameter;
    declare function isArrayExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeArrayExpression);
    declare function assertArrayExpression(node: ?Object, opts?: ?Object): void;
    declare function isAssignmentExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeAssignmentExpression);
    declare function assertAssignmentExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isBinaryExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBinaryExpression);
    declare function assertBinaryExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isInterpreterDirective(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeInterpreterDirective);
    declare function assertInterpreterDirective(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDirective(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDirective);
    declare function assertDirective(node: ?Object, opts?: ?Object): void;
    declare function isDirectiveLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDirectiveLiteral);
    declare function assertDirectiveLiteral(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isBlockStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBlockStatement);
    declare function assertBlockStatement(node: ?Object, opts?: ?Object): void;
    declare function isBreakStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBreakStatement);
    declare function assertBreakStatement(node: ?Object, opts?: ?Object): void;
    declare function isCallExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeCallExpression);
    declare function assertCallExpression(node: ?Object, opts?: ?Object): void;
    declare function isCatchClause(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeCatchClause);
    declare function assertCatchClause(node: ?Object, opts?: ?Object): void;
    declare function isConditionalExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeConditionalExpression);
    declare function assertConditionalExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isContinueStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeContinueStatement);
    declare function assertContinueStatement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDebuggerStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDebuggerStatement);
    declare function assertDebuggerStatement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDoWhileStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDoWhileStatement);
    declare function assertDoWhileStatement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isEmptyStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEmptyStatement);
    declare function assertEmptyStatement(node: ?Object, opts?: ?Object): void;
    declare function isExpressionStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExpressionStatement);
    declare function assertExpressionStatement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isFile(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeFile);
    declare function assertFile(node: ?Object, opts?: ?Object): void;
    declare function isForInStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeForInStatement);
    declare function assertForInStatement(node: ?Object, opts?: ?Object): void;
    declare function isForStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeForStatement);
    declare function assertForStatement(node: ?Object, opts?: ?Object): void;
    declare function isFunctionDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeFunctionDeclaration);
    declare function assertFunctionDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isFunctionExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeFunctionExpression);
    declare function assertFunctionExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isIdentifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeIdentifier);
    declare function assertIdentifier(node: ?Object, opts?: ?Object): void;
    declare function isIfStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeIfStatement);
    declare function assertIfStatement(node: ?Object, opts?: ?Object): void;
    declare function isLabeledStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeLabeledStatement);
    declare function assertLabeledStatement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isStringLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeStringLiteral);
    declare function assertStringLiteral(node: ?Object, opts?: ?Object): void;
    declare function isNumericLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNumericLiteral);
    declare function assertNumericLiteral(node: ?Object, opts?: ?Object): void;
    declare function isNullLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNullLiteral);
    declare function assertNullLiteral(node: ?Object, opts?: ?Object): void;
    declare function isBooleanLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBooleanLiteral);
    declare function assertBooleanLiteral(node: ?Object, opts?: ?Object): void;
    declare function isRegExpLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeRegExpLiteral);
    declare function assertRegExpLiteral(node: ?Object, opts?: ?Object): void;
    declare function isLogicalExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeLogicalExpression);
    declare function assertLogicalExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isMemberExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeMemberExpression);
    declare function assertMemberExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isNewExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNewExpression);
    declare function assertNewExpression(node: ?Object, opts?: ?Object): void;
    declare function isProgram(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeProgram);
    declare function assertProgram(node: ?Object, opts?: ?Object): void;
    declare function isObjectExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectExpression);
    declare function assertObjectExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectMethod(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectMethod);
    declare function assertObjectMethod(node: ?Object, opts?: ?Object): void;
    declare function isObjectProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectProperty);
    declare function assertObjectProperty(node: ?Object, opts?: ?Object): void;
    declare function isRestElement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeRestElement);
    declare function assertRestElement(node: ?Object, opts?: ?Object): void;
    declare function isReturnStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeReturnStatement);
    declare function assertReturnStatement(node: ?Object, opts?: ?Object): void;
    declare function isSequenceExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSequenceExpression);
    declare function assertSequenceExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isParenthesizedExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeParenthesizedExpression);
    declare function assertParenthesizedExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isSwitchCase(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSwitchCase);
    declare function assertSwitchCase(node: ?Object, opts?: ?Object): void;
    declare function isSwitchStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSwitchStatement);
    declare function assertSwitchStatement(node: ?Object, opts?: ?Object): void;
    declare function isThisExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeThisExpression);
    declare function assertThisExpression(node: ?Object, opts?: ?Object): void;
    declare function isThrowStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeThrowStatement);
    declare function assertThrowStatement(node: ?Object, opts?: ?Object): void;
    declare function isTryStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTryStatement);
    declare function assertTryStatement(node: ?Object, opts?: ?Object): void;
    declare function isUnaryExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeUnaryExpression);
    declare function assertUnaryExpression(node: ?Object, opts?: ?Object): void;
    declare function isUpdateExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeUpdateExpression);
    declare function assertUpdateExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isVariableDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeVariableDeclaration);
    declare function assertVariableDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isVariableDeclarator(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeVariableDeclarator);
    declare function assertVariableDeclarator(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isWhileStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeWhileStatement);
    declare function assertWhileStatement(node: ?Object, opts?: ?Object): void;
    declare function isWithStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeWithStatement);
    declare function assertWithStatement(node: ?Object, opts?: ?Object): void;
    declare function isAssignmentPattern(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeAssignmentPattern);
    declare function assertAssignmentPattern(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isArrayPattern(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeArrayPattern);
    declare function assertArrayPattern(node: ?Object, opts?: ?Object): void;
    declare function isArrowFunctionExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeArrowFunctionExpression);
    declare function assertArrowFunctionExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isClassBody(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassBody);
    declare function assertClassBody(node: ?Object, opts?: ?Object): void;
    declare function isClassExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassExpression);
    declare function assertClassExpression(node: ?Object, opts?: ?Object): void;
    declare function isClassDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassDeclaration);
    declare function assertClassDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isExportAllDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExportAllDeclaration);
    declare function assertExportAllDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isExportDefaultDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExportDefaultDeclaration);
    declare function assertExportDefaultDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isExportNamedDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExportNamedDeclaration);
    declare function assertExportNamedDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isExportSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExportSpecifier);
    declare function assertExportSpecifier(node: ?Object, opts?: ?Object): void;
    declare function isForOfStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeForOfStatement);
    declare function assertForOfStatement(node: ?Object, opts?: ?Object): void;
    declare function isImportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeImportDeclaration);
    declare function assertImportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isImportDefaultSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeImportDefaultSpecifier);
    declare function assertImportDefaultSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isImportNamespaceSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeImportNamespaceSpecifier);
    declare function assertImportNamespaceSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isImportSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeImportSpecifier);
    declare function assertImportSpecifier(node: ?Object, opts?: ?Object): void;
    declare function isMetaProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeMetaProperty);
    declare function assertMetaProperty(node: ?Object, opts?: ?Object): void;
    declare function isClassMethod(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassMethod);

    // BAD HERE

    declare function assertClassMethod(node: ?Object, opts?: ?Object): void;
    declare function isObjectPattern(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectPattern);
    declare function assertObjectPattern(node: ?Object, opts?: ?Object): void;
    declare function isSpreadElement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSpreadElement);
    declare function assertSpreadElement(node: ?Object, opts?: ?Object): void;
    declare function isSuper(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSuper);
    declare function assertSuper(node: ?Object, opts?: ?Object): void;
    declare function isTaggedTemplateExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTaggedTemplateExpression);
    declare function assertTaggedTemplateExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTemplateElement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTemplateElement);
    declare function assertTemplateElement(node: ?Object, opts?: ?Object): void;
    declare function isTemplateLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTemplateLiteral);
    declare function assertTemplateLiteral(node: ?Object, opts?: ?Object): void;
    declare function isYieldExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeYieldExpression);
    declare function assertYieldExpression(node: ?Object, opts?: ?Object): void;
    declare function isAwaitExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeAwaitExpression);
    declare function assertAwaitExpression(node: ?Object, opts?: ?Object): void;
    declare function isImport(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeImport);
    declare function assertImport(node: ?Object, opts?: ?Object): void;
    declare function isBigIntLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBigIntLiteral);
    declare function assertBigIntLiteral(node: ?Object, opts?: ?Object): void;
    declare function isExportNamespaceSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExportNamespaceSpecifier);
    declare function assertExportNamespaceSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isOptionalMemberExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeOptionalMemberExpression);
    declare function assertOptionalMemberExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isOptionalCallExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeOptionalCallExpression);
    declare function assertOptionalCallExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isAnyTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeAnyTypeAnnotation);
    declare function assertAnyTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isArrayTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeArrayTypeAnnotation);
    declare function assertArrayTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isBooleanTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBooleanTypeAnnotation);
    declare function assertBooleanTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isBooleanLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBooleanLiteralTypeAnnotation);
    declare function assertBooleanLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isNullLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNullLiteralTypeAnnotation);
    declare function assertNullLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isClassImplements(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassImplements);
    declare function assertClassImplements(node: ?Object, opts?: ?Object): void;
    declare function isDeclareClass(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareClass);
    declare function assertDeclareClass(node: ?Object, opts?: ?Object): void;
    declare function isDeclareFunction(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareFunction);
    declare function assertDeclareFunction(node: ?Object, opts?: ?Object): void;
    declare function isDeclareInterface(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareInterface);
    declare function assertDeclareInterface(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDeclareModule(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareModule);
    declare function assertDeclareModule(node: ?Object, opts?: ?Object): void;
    declare function isDeclareModuleExports(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareModuleExports);
    declare function assertDeclareModuleExports(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDeclareTypeAlias(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareTypeAlias);
    declare function assertDeclareTypeAlias(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDeclareOpaqueType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareOpaqueType);
    declare function assertDeclareOpaqueType(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDeclareVariable(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareVariable);
    declare function assertDeclareVariable(node: ?Object, opts?: ?Object): void;
    declare function isDeclareExportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareExportDeclaration);
    declare function assertDeclareExportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDeclareExportAllDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclareExportAllDeclaration);
    declare function assertDeclareExportAllDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isDeclaredPredicate(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDeclaredPredicate);
    declare function assertDeclaredPredicate(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isExistsTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExistsTypeAnnotation);
    declare function assertExistsTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isFunctionTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeFunctionTypeAnnotation);
    declare function assertFunctionTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isFunctionTypeParam(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeFunctionTypeParam);
    declare function assertFunctionTypeParam(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isGenericTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeGenericTypeAnnotation);
    declare function assertGenericTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isInferredPredicate(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeInferredPredicate);
    declare function assertInferredPredicate(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isInterfaceExtends(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeInterfaceExtends);
    declare function assertInterfaceExtends(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isInterfaceDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeInterfaceDeclaration);
    declare function assertInterfaceDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isInterfaceTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeInterfaceTypeAnnotation);
    declare function assertInterfaceTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isIntersectionTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeIntersectionTypeAnnotation);
    declare function assertIntersectionTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isMixedTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeMixedTypeAnnotation);
    declare function assertMixedTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isEmptyTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEmptyTypeAnnotation);
    declare function assertEmptyTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isNullableTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNullableTypeAnnotation);
    declare function assertNullableTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isNumberLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNumberLiteralTypeAnnotation);
    declare function assertNumberLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isNumberTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNumberTypeAnnotation);
    declare function assertNumberTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectTypeAnnotation);
    declare function assertObjectTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectTypeInternalSlot(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectTypeInternalSlot);
    declare function assertObjectTypeInternalSlot(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectTypeCallProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectTypeCallProperty);
    declare function assertObjectTypeCallProperty(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectTypeIndexer(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectTypeIndexer);
    declare function assertObjectTypeIndexer(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectTypeProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectTypeProperty);
    declare function assertObjectTypeProperty(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isObjectTypeSpreadProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeObjectTypeSpreadProperty);
    declare function assertObjectTypeSpreadProperty(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isOpaqueType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeOpaqueType);
    declare function assertOpaqueType(node: ?Object, opts?: ?Object): void;
    declare function isQualifiedTypeIdentifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeQualifiedTypeIdentifier);
    declare function assertQualifiedTypeIdentifier(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isStringLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeStringLiteralTypeAnnotation);
    declare function assertStringLiteralTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isStringTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeStringTypeAnnotation);
    declare function assertStringTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isSymbolTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSymbolTypeAnnotation);
    declare function assertSymbolTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isThisTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeThisTypeAnnotation);
    declare function assertThisTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTupleTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTupleTypeAnnotation);
    declare function assertTupleTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTypeofTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeofTypeAnnotation);
    declare function assertTypeofTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTypeAlias(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeAlias);
    declare function assertTypeAlias(node: ?Object, opts?: ?Object): void;
    declare function isTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeAnnotation);
    declare function assertTypeAnnotation(node: ?Object, opts?: ?Object): void;
    declare function isTypeCastExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeCastExpression);
    declare function assertTypeCastExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTypeParameter(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeParameter);
    declare function assertTypeParameter(node: ?Object, opts?: ?Object): void;
    declare function isTypeParameterDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeParameterDeclaration);
    declare function assertTypeParameterDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTypeParameterInstantiation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTypeParameterInstantiation);
    declare function assertTypeParameterInstantiation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isUnionTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeUnionTypeAnnotation);
    declare function assertUnionTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isVariance(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeVariance);
    declare function assertVariance(node: ?Object, opts?: ?Object): void;
    declare function isVoidTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeVoidTypeAnnotation);
    declare function assertVoidTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isEnumDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumDeclaration);
    declare function assertEnumDeclaration(node: ?Object, opts?: ?Object): void;
    declare function isEnumBooleanBody(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumBooleanBody);
    declare function assertEnumBooleanBody(node: ?Object, opts?: ?Object): void;
    declare function isEnumNumberBody(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumNumberBody);
    declare function assertEnumNumberBody(node: ?Object, opts?: ?Object): void;
    declare function isEnumStringBody(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumStringBody);
    declare function assertEnumStringBody(node: ?Object, opts?: ?Object): void;
    declare function isEnumSymbolBody(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumSymbolBody);
    declare function assertEnumSymbolBody(node: ?Object, opts?: ?Object): void;
    declare function isEnumBooleanMember(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumBooleanMember);
    declare function assertEnumBooleanMember(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isEnumNumberMember(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumNumberMember);
    declare function assertEnumNumberMember(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isEnumStringMember(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumStringMember);
    declare function assertEnumStringMember(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isEnumDefaultedMember(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeEnumDefaultedMember);
    declare function assertEnumDefaultedMember(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXAttribute(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXAttribute);
    declare function assertJSXAttribute(node: ?Object, opts?: ?Object): void;
    declare function isJSXClosingElement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXClosingElement);
    declare function assertJSXClosingElement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXElement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXElement);
    declare function assertJSXElement(node: ?Object, opts?: ?Object): void;
    declare function isJSXEmptyExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXEmptyExpression);
    declare function assertJSXEmptyExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXExpressionContainer(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXExpressionContainer);
    declare function assertJSXExpressionContainer(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXSpreadChild(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXSpreadChild);
    declare function assertJSXSpreadChild(node: ?Object, opts?: ?Object): void;
    declare function isJSXIdentifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXIdentifier);
    declare function assertJSXIdentifier(node: ?Object, opts?: ?Object): void;
    declare function isJSXMemberExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXMemberExpression);
    declare function assertJSXMemberExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXNamespacedName(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXNamespacedName);
    declare function assertJSXNamespacedName(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXOpeningElement(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXOpeningElement);
    declare function assertJSXOpeningElement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXSpreadAttribute(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXSpreadAttribute);
    declare function assertJSXSpreadAttribute(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXText(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXText);
    declare function assertJSXText(node: ?Object, opts?: ?Object): void;
    declare function isJSXFragment(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXFragment);
    declare function assertJSXFragment(node: ?Object, opts?: ?Object): void;
    declare function isJSXOpeningFragment(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXOpeningFragment);
    declare function assertJSXOpeningFragment(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isJSXClosingFragment(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeJSXClosingFragment);
    declare function assertJSXClosingFragment(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isNoop(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNoop);
    declare function assertNoop(node: ?Object, opts?: ?Object): void;
    declare function isPlaceholder(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodePlaceholder);
    declare function assertPlaceholder(node: ?Object, opts?: ?Object): void;
    declare function isV8IntrinsicIdentifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeV8IntrinsicIdentifier);
    declare function assertV8IntrinsicIdentifier(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isArgumentPlaceholder(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeArgumentPlaceholder);
    declare function assertArgumentPlaceholder(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isBindExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeBindExpression);
    declare function assertBindExpression(node: ?Object, opts?: ?Object): void;
    declare function isClassProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassProperty);
    declare function assertClassProperty(node: ?Object, opts?: ?Object): void;
    declare function isPipelineTopicExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodePipelineTopicExpression);
    declare function assertPipelineTopicExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isPipelineBareFunction(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodePipelineBareFunction);
    declare function assertPipelineBareFunction(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isPipelinePrimaryTopicReference(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodePipelinePrimaryTopicReference);
    declare function assertPipelinePrimaryTopicReference(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isClassPrivateProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassPrivateProperty);
    declare function assertClassPrivateProperty(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isClassPrivateMethod(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeClassPrivateMethod);
    declare function assertClassPrivateMethod(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isImportAttribute(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeImportAttribute);
    declare function assertImportAttribute(node: ?Object, opts?: ?Object): void;
    declare function isDecorator(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDecorator);
    declare function assertDecorator(node: ?Object, opts?: ?Object): void;
    declare function isDoExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDoExpression);
    declare function assertDoExpression(node: ?Object, opts?: ?Object): void;
    declare function isExportDefaultSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeExportDefaultSpecifier);
    declare function assertExportDefaultSpecifier(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isPrivateName(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodePrivateName);
    declare function assertPrivateName(node: ?Object, opts?: ?Object): void;
    declare function isRecordExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeRecordExpression);
    declare function assertRecordExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTupleExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTupleExpression);
    declare function assertTupleExpression(node: ?Object, opts?: ?Object): void;
    declare function isDecimalLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeDecimalLiteral);
    declare function assertDecimalLiteral(node: ?Object, opts?: ?Object): void;
    declare function isStaticBlock(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeStaticBlock);
    declare function assertStaticBlock(node: ?Object, opts?: ?Object): void;
    declare function isTSParameterProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSParameterProperty);
    declare function assertTSParameterProperty(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSDeclareFunction(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSDeclareFunction);
    declare function assertTSDeclareFunction(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSDeclareMethod(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSDeclareMethod);
    declare function assertTSDeclareMethod(node: ?Object, opts?: ?Object): void;
    declare function isTSQualifiedName(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSQualifiedName);
    declare function assertTSQualifiedName(node: ?Object, opts?: ?Object): void;
    declare function isTSCallSignatureDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSCallSignatureDeclaration);
    declare function assertTSCallSignatureDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSConstructSignatureDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof
        BabelNodeTSConstructSignatureDeclaration);
    declare function assertTSConstructSignatureDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSPropertySignature(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSPropertySignature);
    declare function assertTSPropertySignature(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSMethodSignature(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSMethodSignature);
    declare function assertTSMethodSignature(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSIndexSignature(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSIndexSignature);
    declare function assertTSIndexSignature(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSAnyKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSAnyKeyword);
    declare function assertTSAnyKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSBooleanKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSBooleanKeyword);
    declare function assertTSBooleanKeyword(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSBigIntKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSBigIntKeyword);
    declare function assertTSBigIntKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSIntrinsicKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSIntrinsicKeyword);
    declare function assertTSIntrinsicKeyword(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSNeverKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSNeverKeyword);
    declare function assertTSNeverKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSNullKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSNullKeyword);
    declare function assertTSNullKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSNumberKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSNumberKeyword);
    declare function assertTSNumberKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSObjectKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSObjectKeyword);
    declare function assertTSObjectKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSStringKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSStringKeyword);
    declare function assertTSStringKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSSymbolKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSSymbolKeyword);
    declare function assertTSSymbolKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSUndefinedKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSUndefinedKeyword);
    declare function assertTSUndefinedKeyword(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSUnknownKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSUnknownKeyword);
    declare function assertTSUnknownKeyword(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSVoidKeyword(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSVoidKeyword);
    declare function assertTSVoidKeyword(node: ?Object, opts?: ?Object): void;
    declare function isTSThisType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSThisType);
    declare function assertTSThisType(node: ?Object, opts?: ?Object): void;
    declare function isTSFunctionType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSFunctionType);
    declare function assertTSFunctionType(node: ?Object, opts?: ?Object): void;
    declare function isTSConstructorType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSConstructorType);
    declare function assertTSConstructorType(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSTypeReference(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeReference);
    declare function assertTSTypeReference(node: ?Object, opts?: ?Object): void;
    declare function isTSTypePredicate(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypePredicate);
    declare function assertTSTypePredicate(node: ?Object, opts?: ?Object): void;
    declare function isTSTypeQuery(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeQuery);
    declare function assertTSTypeQuery(node: ?Object, opts?: ?Object): void;
    declare function isTSTypeLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeLiteral);
    declare function assertTSTypeLiteral(node: ?Object, opts?: ?Object): void;
    declare function isTSArrayType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSArrayType);
    declare function assertTSArrayType(node: ?Object, opts?: ?Object): void;
    declare function isTSTupleType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTupleType);
    declare function assertTSTupleType(node: ?Object, opts?: ?Object): void;
    declare function isTSOptionalType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSOptionalType);
    declare function assertTSOptionalType(node: ?Object, opts?: ?Object): void;
    declare function isTSRestType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSRestType);
    declare function assertTSRestType(node: ?Object, opts?: ?Object): void;
    declare function isTSNamedTupleMember(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSNamedTupleMember);
    declare function assertTSNamedTupleMember(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSUnionType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSUnionType);
    declare function assertTSUnionType(node: ?Object, opts?: ?Object): void;
    declare function isTSIntersectionType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSIntersectionType);
    declare function assertTSIntersectionType(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSConditionalType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSConditionalType);
    declare function assertTSConditionalType(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSInferType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSInferType);
    declare function assertTSInferType(node: ?Object, opts?: ?Object): void;
    declare function isTSParenthesizedType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSParenthesizedType);
    declare function assertTSParenthesizedType(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSTypeOperator(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeOperator);
    declare function assertTSTypeOperator(node: ?Object, opts?: ?Object): void;
    declare function isTSIndexedAccessType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSIndexedAccessType);
    declare function assertTSIndexedAccessType(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSMappedType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSMappedType);
    declare function assertTSMappedType(node: ?Object, opts?: ?Object): void;
    declare function isTSLiteralType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSLiteralType);
    declare function assertTSLiteralType(node: ?Object, opts?: ?Object): void;
    declare function isTSExpressionWithTypeArguments(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSExpressionWithTypeArguments);
    declare function assertTSExpressionWithTypeArguments(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSInterfaceDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSInterfaceDeclaration);
    declare function assertTSInterfaceDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSInterfaceBody(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSInterfaceBody);
    declare function assertTSInterfaceBody(node: ?Object, opts?: ?Object): void;
    declare function isTSTypeAliasDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeAliasDeclaration);
    declare function assertTSTypeAliasDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSAsExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSAsExpression);
    declare function assertTSAsExpression(node: ?Object, opts?: ?Object): void;
    declare function isTSTypeAssertion(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeAssertion);
    declare function assertTSTypeAssertion(node: ?Object, opts?: ?Object): void;
    declare function isTSEnumDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSEnumDeclaration);
    declare function assertTSEnumDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSEnumMember(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSEnumMember);
    declare function assertTSEnumMember(node: ?Object, opts?: ?Object): void;
    declare function isTSModuleDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSModuleDeclaration);
    declare function assertTSModuleDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSModuleBlock(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSModuleBlock);
    declare function assertTSModuleBlock(node: ?Object, opts?: ?Object): void;
    declare function isTSImportType(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSImportType);
    declare function assertTSImportType(node: ?Object, opts?: ?Object): void;
    declare function isTSImportEqualsDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSImportEqualsDeclaration);
    declare function assertTSImportEqualsDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSExternalModuleReference(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSExternalModuleReference);
    declare function assertTSExternalModuleReference(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSNonNullExpression(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSNonNullExpression);
    declare function assertTSNonNullExpression(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSExportAssignment(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSExportAssignment);
    declare function assertTSExportAssignment(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSNamespaceExportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSNamespaceExportDeclaration);
    declare function assertTSNamespaceExportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeAnnotation);
    declare function assertTSTypeAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSTypeParameterInstantiation(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeParameterInstantiation);
    declare function assertTSTypeParameterInstantiation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSTypeParameterDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeParameterDeclaration);
    declare function assertTSTypeParameterDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isTSTypeParameter(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeTSTypeParameter);
    declare function assertTSTypeParameter(node: ?Object, opts?: ?Object): void;
    declare function isExpression(node: ?Object, opts?: ?Object): boolean;
    declare function assertExpression(node: ?Object, opts?: ?Object): void;
    declare function isBinary(node: ?Object, opts?: ?Object): boolean;
    declare function assertBinary(node: ?Object, opts?: ?Object): void;
    declare function isScopable(node: ?Object, opts?: ?Object): boolean;
    declare function assertScopable(node: ?Object, opts?: ?Object): void;
    declare function isBlockParent(node: ?Object, opts?: ?Object): boolean;
    declare function assertBlockParent(node: ?Object, opts?: ?Object): void;
    declare function isBlock(node: ?Object, opts?: ?Object): boolean;
    declare function assertBlock(node: ?Object, opts?: ?Object): void;
    declare function isStatement(node: ?Object, opts?: ?Object): boolean;
    declare function assertStatement(node: ?Object, opts?: ?Object): void;
    declare function isTerminatorless(node: ?Object, opts?: ?Object): boolean;
    declare function assertTerminatorless(node: ?Object, opts?: ?Object): void;
    declare function isCompletionStatement(
        node: ?Object,
        opts?: ?Object,
    ): boolean;
    declare function assertCompletionStatement(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isConditional(node: ?Object, opts?: ?Object): boolean;
    declare function assertConditional(node: ?Object, opts?: ?Object): void;
    declare function isLoop(node: ?Object, opts?: ?Object): boolean;
    declare function assertLoop(node: ?Object, opts?: ?Object): void;
    declare function isWhile(node: ?Object, opts?: ?Object): boolean;
    declare function assertWhile(node: ?Object, opts?: ?Object): void;
    declare function isExpressionWrapper(
        node: ?Object,
        opts?: ?Object,
    ): boolean;
    declare function assertExpressionWrapper(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isFor(node: ?Object, opts?: ?Object): boolean;
    declare function assertFor(node: ?Object, opts?: ?Object): void;
    declare function isForXStatement(node: ?Object, opts?: ?Object): boolean;
    declare function assertForXStatement(node: ?Object, opts?: ?Object): void;
    declare function isFunction(node: ?Object, opts?: ?Object): boolean;
    declare function assertFunction(node: ?Object, opts?: ?Object): void;
    declare function isFunctionParent(node: ?Object, opts?: ?Object): boolean;
    declare function assertFunctionParent(node: ?Object, opts?: ?Object): void;
    declare function isPureish(node: ?Object, opts?: ?Object): boolean;
    declare function assertPureish(node: ?Object, opts?: ?Object): void;
    declare function isDeclaration(node: ?Object, opts?: ?Object): boolean;
    declare function assertDeclaration(node: ?Object, opts?: ?Object): void;
    declare function isPatternLike(node: ?Object, opts?: ?Object): boolean;
    declare function assertPatternLike(node: ?Object, opts?: ?Object): void;
    declare function isLVal(node: ?Object, opts?: ?Object): boolean;
    declare function assertLVal(node: ?Object, opts?: ?Object): void;
    declare function isTSEntityName(node: ?Object, opts?: ?Object): boolean;
    declare function assertTSEntityName(node: ?Object, opts?: ?Object): void;
    declare function isLiteral(node: ?Object, opts?: ?Object): boolean;
    declare function assertLiteral(node: ?Object, opts?: ?Object): void;
    declare function isImmutable(node: ?Object, opts?: ?Object): boolean;
    declare function assertImmutable(node: ?Object, opts?: ?Object): void;
    declare function isUserWhitespacable(
        node: ?Object,
        opts?: ?Object,
    ): boolean;
    declare function assertUserWhitespacable(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isMethod(node: ?Object, opts?: ?Object): boolean;
    declare function assertMethod(node: ?Object, opts?: ?Object): void;
    declare function isObjectMember(node: ?Object, opts?: ?Object): boolean;
    declare function assertObjectMember(node: ?Object, opts?: ?Object): void;
    declare function isProperty(node: ?Object, opts?: ?Object): boolean;
    declare function assertProperty(node: ?Object, opts?: ?Object): void;
    declare function isUnaryLike(node: ?Object, opts?: ?Object): boolean;
    declare function assertUnaryLike(node: ?Object, opts?: ?Object): void;
    declare function isPattern(node: ?Object, opts?: ?Object): boolean;
    declare function assertPattern(node: ?Object, opts?: ?Object): void;
    declare function isClass(node: ?Object, opts?: ?Object): boolean;
    declare function assertClass(node: ?Object, opts?: ?Object): void;
    declare function isModuleDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean;
    declare function assertModuleDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isExportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): boolean;
    declare function assertExportDeclaration(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isModuleSpecifier(node: ?Object, opts?: ?Object): boolean;
    declare function assertModuleSpecifier(node: ?Object, opts?: ?Object): void;
    declare function isFlow(node: ?Object, opts?: ?Object): boolean;
    declare function assertFlow(node: ?Object, opts?: ?Object): void;
    declare function isFlowType(node: ?Object, opts?: ?Object): boolean;
    declare function assertFlowType(node: ?Object, opts?: ?Object): void;
    declare function isFlowBaseAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): boolean;
    declare function assertFlowBaseAnnotation(
        node: ?Object,
        opts?: ?Object,
    ): void;
    declare function isFlowDeclaration(node: ?Object, opts?: ?Object): boolean;
    declare function assertFlowDeclaration(node: ?Object, opts?: ?Object): void;
    declare function isFlowPredicate(node: ?Object, opts?: ?Object): boolean;
    declare function assertFlowPredicate(node: ?Object, opts?: ?Object): void;
    declare function isEnumBody(node: ?Object, opts?: ?Object): boolean;
    declare function assertEnumBody(node: ?Object, opts?: ?Object): void;
    declare function isEnumMember(node: ?Object, opts?: ?Object): boolean;
    declare function assertEnumMember(node: ?Object, opts?: ?Object): void;
    declare function isJSX(node: ?Object, opts?: ?Object): boolean;
    declare function assertJSX(node: ?Object, opts?: ?Object): void;
    declare function isPrivate(node: ?Object, opts?: ?Object): boolean;
    declare function assertPrivate(node: ?Object, opts?: ?Object): void;
    declare function isTSTypeElement(node: ?Object, opts?: ?Object): boolean;
    declare function assertTSTypeElement(node: ?Object, opts?: ?Object): void;
    declare function isTSType(node: ?Object, opts?: ?Object): boolean;
    declare function assertTSType(node: ?Object, opts?: ?Object): void;
    declare function isTSBaseType(node: ?Object, opts?: ?Object): boolean;
    declare function assertTSBaseType(node: ?Object, opts?: ?Object): void;
    declare function isNumberLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeNumericLiteral);
    declare function assertNumberLiteral(node: ?Object, opts?: ?Object): void;
    declare function isRegexLiteral(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeRegExpLiteral);
    declare function assertRegexLiteral(node: ?Object, opts?: ?Object): void;
    declare function isRestProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeRestElement);
    declare function assertRestProperty(node: ?Object, opts?: ?Object): void;
    declare function isSpreadProperty(
        node: ?Object,
        opts?: ?Object,
    ): boolean %checks(node instanceof BabelNodeSpreadElement);
    declare function assertSpreadProperty(node: ?Object, opts?: ?Object): void;
    declare function assertNode(obj: any): void;
    declare function createTypeAnnotationBasedOnTypeof(
        type:
            | 'string'
            | 'number'
            | 'undefined'
            | 'boolean'
            | 'function'
            | 'object'
            | 'symbol',
    ): BabelNodeTypeAnnotation;
    declare function createUnionTypeAnnotation(
        types: Array<BabelNodeFlowType>,
    ): BabelNodeUnionTypeAnnotation;
    declare function createFlowUnionType(
        types: Array<BabelNodeFlowType>,
    ): BabelNodeUnionTypeAnnotation;
    declare function buildChildren(node: {
        children: Array<
            | BabelNodeJSXText
            | BabelNodeJSXExpressionContainer
            | BabelNodeJSXSpreadChild
            | BabelNodeJSXElement
            | BabelNodeJSXFragment
            | BabelNodeJSXEmptyExpression,
        >,
    }): Array<
        | BabelNodeJSXText
        | BabelNodeJSXExpressionContainer
        | BabelNodeJSXSpreadChild
        | BabelNodeJSXElement
        | BabelNodeJSXFragment,
    >;
    declare function clone<T>(n: T): T;
    declare function cloneDeep<T>(n: T): T;
    declare function cloneDeepWithoutLoc<T>(n: T): T;
    declare function cloneNode<T>(
        n: T,
        deep?: boolean,
        withoutLoc?: boolean,
    ): T;
    declare function cloneWithoutLoc<T>(n: T): T;
    declare function inheritInnerComments(node: Node, parent: Node): void;
    declare function inheritLeadingComments(node: Node, parent: Node): void;
    declare function inheritsComments<T: Node>(node: T, parent: Node): void;
    declare function inheritTrailingComments(node: Node, parent: Node): void;
    declare function removeComments<T: Node>(node: T): T;
    declare function ensureBlock(
        node: BabelNode,
        key: string,
    ): BabelNodeBlockStatement;
    declare function toBindingIdentifierName(name?: ?string): string;
    declare function toBlock(
        node: BabelNodeStatement | BabelNodeExpression,
        parent?: BabelNodeFunction | null,
    ): BabelNodeBlockStatement;
    declare function toComputedKey(
        node: BabelNodeMethod | BabelNodeProperty,
        key?: BabelNodeExpression | BabelNodeIdentifier,
    ): BabelNodeExpression;
    declare function toExpression(
        node:
            | BabelNodeExpressionStatement
            | BabelNodeExpression
            | BabelNodeClass
            | BabelNodeFunction,
    ): BabelNodeExpression;
    declare function toIdentifier(name?: ?string): string;
    declare function toKeyAlias(
        node: BabelNodeMethod | BabelNodeProperty,
        key?: BabelNode,
    ): string;
    declare function toStatement(
        node:
            | BabelNodeStatement
            | BabelNodeClass
            | BabelNodeFunction
            | BabelNodeAssignmentExpression,
        ignore?: boolean,
    ): BabelNodeStatement | void;
    declare function valueToNode(value: any): BabelNodeExpression;
    declare function removeTypeDuplicates(
        types: Array<BabelNodeFlowType>,
    ): Array<BabelNodeFlowType>;
    declare function appendToMemberExpression(
        member: BabelNodeMemberExpression,
        append: BabelNode,
        computed?: boolean,
    ): BabelNodeMemberExpression;
    declare function inherits<T: Node>(
        child: T,
        parent: BabelNode | null | void,
    ): T;
    declare function prependToMemberExpression(
        member: BabelNodeMemberExpression,
        prepend: BabelNodeExpression,
    ): BabelNodeMemberExpression;
    declare function removeProperties<T>(n: T, opts: ?{}): void;
    declare function removePropertiesDeep<T>(n: T, opts: ?{}): T;
    declare function getBindingIdentifiers(
        node: BabelNode,
        duplicates: boolean,
        outerOnly?: boolean,
    ): {[key: string]: BabelNodeIdentifier | Array<BabelNodeIdentifier>};
    declare function getOuterBindingIdentifiers(
        node: Node,
        duplicates: boolean,
    ): {[key: string]: BabelNodeIdentifier | Array<BabelNodeIdentifier>};
    declare type TraversalAncestors = Array<{
        node: BabelNode,
        key: string,
        index?: number,
    }>;
    declare type TraversalHandler<T> = (
        BabelNode,
        TraversalAncestors,
        T,
    ) => void;
    declare type TraversalHandlers<T> = {
        enter?: TraversalHandler<T>,
        exit?: TraversalHandler<T>,
    };
    declare function traverse<T>(
        n: BabelNode,
        TraversalHandler<T> | TraversalHandlers<T>,
        state?: T,
    ): void;
    declare function traverseFast<T>(
        n: Node,
        h: TraversalHandler<T>,
        state?: T,
    ): void;
    declare function shallowEqual(actual: Object, expected: Object): boolean;
    declare function buildMatchMemberExpression(
        match: string,
        allowPartial?: boolean,
    ): (?BabelNode) => boolean;
    declare function is(type: string, n: BabelNode, opts: Object): boolean;
    declare function isBinding(
        node: BabelNode,
        parent: BabelNode,
        grandparent?: BabelNode,
    ): boolean;
    declare function isBlockScoped(node: BabelNode): boolean;
    declare function isImmutable(node: BabelNode): boolean;
    declare function isLet(node: BabelNode): boolean;
    declare function isNode(node: ?Object): boolean;
    declare function isNodesEquivalent(a: any, b: any): boolean;
    declare function isPlaceholderType(
        placeholderType: string,
        targetType: string,
    ): boolean;
    declare function isReferenced(
        node: BabelNode,
        parent: BabelNode,
        grandparent?: BabelNode,
    ): boolean;
    declare function isScope(node: BabelNode, parent: BabelNode): boolean;
    declare function isSpecifierDefault(
        specifier: BabelNodeModuleSpecifier,
    ): boolean;
    declare function isType(nodetype: ?string, targetType: string): boolean;
    declare function isValidES3Identifier(name: string): boolean;
    declare function isValidES3Identifier(name: string): boolean;
    declare function isValidIdentifier(name: string): boolean;
    declare function isVar(node: BabelNode): boolean;
    declare function matchesPattern(
        node: ?BabelNode,
        match: string | Array<string>,
        allowPartial?: boolean,
    ): boolean;
    declare function validate(n: BabelNode, key: string, value: mixed): void;

    /*

































    */

    declare type CommentTypeShorthand = 'leading' | 'inner' | 'trailing';
    // KA> NOTE(jared): I had to change T: Node (which didn't exit) to T: BabelNode.
    declare function addComment<T: BabelNode>(
        node: T,
        type: CommentTypeShorthand,
        content: string,
        line?: boolean,
    ): T;
    declare function addComments<T: BabelNode>(
        node: T,
        type: CommentTypeShorthand,
        comments: Array<Comment>,
    ): T;
    // <KA

    declare class BabelNodeComment {
        value: string;
        start: number;
        end: number;
        loc: BabelNodeSourceLocation;
    }

    declare class BabelNodeCommentBlock extends BabelNodeComment {
        type: 'CommentBlock';
    }

    declare class BabelNodeCommentLine extends BabelNodeComment {
        type: 'CommentLine';
    }

    declare class BabelNodeSourceLocation {
        start: {
            line: number,
            column: number,
        };

        end: {
            line: number,
            column: number,
        };
    }

    declare class BabelNode {
        leadingComments?: Array<BabelNodeComment>;
        innerComments?: Array<BabelNodeComment>;
        trailingComments?: Array<BabelNodeComment>;
        start: ?number;
        end: ?number;
        loc: ?BabelNodeSourceLocation;
        extra?: {[string]: mixed};
    }

    declare class BabelNodeArrayExpression extends BabelNode {
        type: 'ArrayExpression';
        elements?: Array<null | BabelNodeExpression | BabelNodeSpreadElement>;
    }

    declare class BabelNodeAssignmentExpression extends BabelNode {
        type: 'AssignmentExpression';
        operator: string;
        left: BabelNodeLVal;
        right: BabelNodeExpression;
    }

    declare class BabelNodeBinaryExpression extends BabelNode {
        type: 'BinaryExpression';
        operator:
            | '+'
            | '-'
            | '/'
            | '%'
            | '*'
            | '**'
            | '&'
            | '|'
            | '>>'
            | '>>>'
            | '<<'
            | '^'
            | '=='
            | '==='
            | '!='
            | '!=='
            | 'in'
            | 'instanceof'
            | '>'
            | '<'
            | '>='
            | '<=';
        left: BabelNodeExpression | BabelNodePrivateName;
        right: BabelNodeExpression;
    }

    declare class BabelNodeInterpreterDirective extends BabelNode {
        type: 'InterpreterDirective';
        value: string;
    }

    declare class BabelNodeDirective extends BabelNode {
        type: 'Directive';
        value: BabelNodeDirectiveLiteral;
    }

    declare class BabelNodeDirectiveLiteral extends BabelNode {
        type: 'DirectiveLiteral';
        value: string;
    }

    declare class BabelNodeBlockStatement extends BabelNode {
        type: 'BlockStatement';
        body: Array<BabelNodeStatement>;
        directives?: Array<BabelNodeDirective>;
    }

    declare class BabelNodeBreakStatement extends BabelNode {
        type: 'BreakStatement';
        label?: BabelNodeIdentifier;
    }

    declare class BabelNodeCallExpression extends BabelNode {
        type: 'CallExpression';
        callee: BabelNodeExpression | BabelNodeV8IntrinsicIdentifier;
        arguments: Array<
            | BabelNodeExpression
            | BabelNodeSpreadElement
            | BabelNodeJSXNamespacedName
            | BabelNodeArgumentPlaceholder,
        >;
        optional?: true | false;
        typeArguments?: BabelNodeTypeParameterInstantiation;
        typeParameters?: BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeCatchClause extends BabelNode {
        type: 'CatchClause';
        param?:
            | BabelNodeIdentifier
            | BabelNodeArrayPattern
            | BabelNodeObjectPattern;
        body: BabelNodeBlockStatement;
    }

    declare class BabelNodeConditionalExpression extends BabelNode {
        type: 'ConditionalExpression';
        test: BabelNodeExpression;
        consequent: BabelNodeExpression;
        alternate: BabelNodeExpression;
    }

    declare class BabelNodeContinueStatement extends BabelNode {
        type: 'ContinueStatement';
        label?: BabelNodeIdentifier;
    }

    declare class BabelNodeDebuggerStatement extends BabelNode {
        type: 'DebuggerStatement';
    }

    declare class BabelNodeDoWhileStatement extends BabelNode {
        type: 'DoWhileStatement';
        test: BabelNodeExpression;
        body: BabelNodeStatement;
    }

    declare class BabelNodeEmptyStatement extends BabelNode {
        type: 'EmptyStatement';
    }

    declare class BabelNodeExpressionStatement extends BabelNode {
        type: 'ExpressionStatement';
        expression: BabelNodeExpression;
    }

    declare class BabelNodeFile extends BabelNode {
        type: 'File';
        program: BabelNodeProgram;
        comments?: Array<BabelNodeCommentBlock | BabelNodeCommentLine>;
        tokens?: Array<any>;
    }

    declare class BabelNodeForInStatement extends BabelNode {
        type: 'ForInStatement';
        left: BabelNodeVariableDeclaration | BabelNodeLVal;
        right: BabelNodeExpression;
        body: BabelNodeStatement;
    }

    declare class BabelNodeForStatement extends BabelNode {
        type: 'ForStatement';
        init?: BabelNodeVariableDeclaration | BabelNodeExpression;
        test?: BabelNodeExpression;
        update?: BabelNodeExpression;
        body: BabelNodeStatement;
    }

    declare class BabelNodeFunctionDeclaration extends BabelNode {
        type: 'FunctionDeclaration';
        id?: BabelNodeIdentifier;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        body: BabelNodeBlockStatement;
        generator?: boolean;
        async?: boolean;
        declare?: boolean;
        returnType?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeFunctionExpression extends BabelNode {
        type: 'FunctionExpression';
        id?: BabelNodeIdentifier;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        body: BabelNodeBlockStatement;
        generator?: boolean;
        async?: boolean;
        returnType?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeIdentifier extends BabelNode {
        type: 'Identifier';
        name: string;
        decorators?: Array<BabelNodeDecorator>;
        optional?: boolean;
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
    }

    declare class BabelNodeIfStatement extends BabelNode {
        type: 'IfStatement';
        test: BabelNodeExpression;
        consequent: BabelNodeStatement;
        alternate?: BabelNodeStatement;
    }

    declare class BabelNodeLabeledStatement extends BabelNode {
        type: 'LabeledStatement';
        label: BabelNodeIdentifier;
        body: BabelNodeStatement;
    }

    declare class BabelNodeStringLiteral extends BabelNode {
        type: 'StringLiteral';
        value: string;
    }

    declare class BabelNodeNumericLiteral extends BabelNode {
        type: 'NumericLiteral';
        value: number;
    }

    declare class BabelNodeNullLiteral extends BabelNode {
        type: 'NullLiteral';
    }

    declare class BabelNodeBooleanLiteral extends BabelNode {
        type: 'BooleanLiteral';
        value: boolean;
    }

    declare class BabelNodeRegExpLiteral extends BabelNode {
        type: 'RegExpLiteral';
        pattern: string;
        flags?: string;
    }

    declare class BabelNodeLogicalExpression extends BabelNode {
        type: 'LogicalExpression';
        operator: '||' | '&&' | '??';
        left: BabelNodeExpression;
        right: BabelNodeExpression;
    }

    declare class BabelNodeMemberExpression extends BabelNode {
        type: 'MemberExpression';
        object: BabelNodeExpression;
        property:
            | BabelNodeExpression
            | BabelNodeIdentifier
            | BabelNodePrivateName;
        computed?: boolean;
        optional?: true | false;
    }

    declare class BabelNodeNewExpression extends BabelNode {
        type: 'NewExpression';
        callee: BabelNodeExpression | BabelNodeV8IntrinsicIdentifier;
        arguments: Array<
            | BabelNodeExpression
            | BabelNodeSpreadElement
            | BabelNodeJSXNamespacedName
            | BabelNodeArgumentPlaceholder,
        >;
        optional?: true | false;
        typeArguments?: BabelNodeTypeParameterInstantiation;
        typeParameters?: BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeProgram extends BabelNode {
        type: 'Program';
        body: Array<BabelNodeStatement>;
        directives?: Array<BabelNodeDirective>;
        sourceType?: 'script' | 'module';
        interpreter?: BabelNodeInterpreterDirective;
        sourceFile: string;
    }

    declare class BabelNodeObjectExpression extends BabelNode {
        type: 'ObjectExpression';
        properties: Array<
            | BabelNodeObjectMethod
            | BabelNodeObjectProperty
            | BabelNodeSpreadElement,
        >;
    }

    declare class BabelNodeObjectMethod extends BabelNode {
        type: 'ObjectMethod';
        kind?: 'method' | 'get' | 'set';
        key:
            | BabelNodeExpression
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        body: BabelNodeBlockStatement;
        computed?: boolean;
        generator?: boolean;
        async?: boolean;
        decorators?: Array<BabelNodeDecorator>;
        returnType?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeObjectProperty extends BabelNode {
        type: 'ObjectProperty';
        key:
            | BabelNodeExpression
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral;
        value: BabelNodeExpression | BabelNodePatternLike;
        computed?: boolean;
        shorthand?: boolean;
        decorators?: Array<BabelNodeDecorator>;
    }

    declare class BabelNodeRestElement extends BabelNode {
        type: 'RestElement';
        argument: BabelNodeLVal;
        decorators?: Array<BabelNodeDecorator>;
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
    }

    declare class BabelNodeReturnStatement extends BabelNode {
        type: 'ReturnStatement';
        argument?: BabelNodeExpression;
    }

    declare class BabelNodeSequenceExpression extends BabelNode {
        type: 'SequenceExpression';
        expressions: Array<BabelNodeExpression>;
    }

    declare class BabelNodeParenthesizedExpression extends BabelNode {
        type: 'ParenthesizedExpression';
        expression: BabelNodeExpression;
    }

    declare class BabelNodeSwitchCase extends BabelNode {
        type: 'SwitchCase';
        test?: BabelNodeExpression;
        consequent: Array<BabelNodeStatement>;
    }

    declare class BabelNodeSwitchStatement extends BabelNode {
        type: 'SwitchStatement';
        discriminant: BabelNodeExpression;
        cases: Array<BabelNodeSwitchCase>;
    }

    declare class BabelNodeThisExpression extends BabelNode {
        type: 'ThisExpression';
    }

    declare class BabelNodeThrowStatement extends BabelNode {
        type: 'ThrowStatement';
        argument: BabelNodeExpression;
    }

    declare class BabelNodeTryStatement extends BabelNode {
        type: 'TryStatement';
        block: BabelNodeBlockStatement;
        handler?: BabelNodeCatchClause;
        finalizer?: BabelNodeBlockStatement;
    }

    declare class BabelNodeUnaryExpression extends BabelNode {
        type: 'UnaryExpression';
        operator:
            | 'void'
            | 'throw'
            | 'delete'
            | '!'
            | '+'
            | '-'
            | '~'
            | 'typeof';
        argument: BabelNodeExpression;
        prefix?: boolean;
    }

    declare class BabelNodeUpdateExpression extends BabelNode {
        type: 'UpdateExpression';
        operator: '++' | '--';
        argument: BabelNodeExpression;
        prefix?: boolean;
    }

    declare class BabelNodeVariableDeclaration extends BabelNode {
        type: 'VariableDeclaration';
        kind: 'var' | 'let' | 'const';
        declarations: Array<BabelNodeVariableDeclarator>;
        declare?: boolean;
    }

    declare class BabelNodeVariableDeclarator extends BabelNode {
        type: 'VariableDeclarator';
        id: BabelNodeLVal;
        init?: BabelNodeExpression;
        definite?: boolean;
    }

    declare class BabelNodeWhileStatement extends BabelNode {
        type: 'WhileStatement';
        test: BabelNodeExpression;
        body: BabelNodeStatement;
    }

    declare class BabelNodeWithStatement extends BabelNode {
        type: 'WithStatement';
        object: BabelNodeExpression;
        body: BabelNodeStatement;
    }

    declare class BabelNodeAssignmentPattern extends BabelNode {
        type: 'AssignmentPattern';
        left:
            | BabelNodeIdentifier
            | BabelNodeObjectPattern
            | BabelNodeArrayPattern
            | BabelNodeMemberExpression;
        right: BabelNodeExpression;
        decorators?: Array<BabelNodeDecorator>;
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
    }

    declare class BabelNodeArrayPattern extends BabelNode {
        type: 'ArrayPattern';
        elements: Array<null | BabelNodePatternLike>;
        decorators?: Array<BabelNodeDecorator>;
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
    }

    declare class BabelNodeArrowFunctionExpression extends BabelNode {
        type: 'ArrowFunctionExpression';
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        body: BabelNodeBlockStatement | BabelNodeExpression;
        async?: boolean;
        expression: boolean;
        generator?: boolean;
        returnType?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeClassBody extends BabelNode {
        type: 'ClassBody';
        body: Array<
            | BabelNodeClassMethod
            | BabelNodeClassPrivateMethod
            | BabelNodeClassProperty
            | BabelNodeClassPrivateProperty
            | BabelNodeTSDeclareMethod
            | BabelNodeTSIndexSignature,
        >;
    }

    declare class BabelNodeClassExpression extends BabelNode {
        type: 'ClassExpression';
        id?: BabelNodeIdentifier;
        superClass?: BabelNodeExpression;
        body: BabelNodeClassBody;
        decorators?: Array<BabelNodeDecorator>;
        mixins?: BabelNodeInterfaceExtends;
        superTypeParameters?:
            | BabelNodeTypeParameterInstantiation
            | BabelNodeTSTypeParameterInstantiation;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeClassDeclaration extends BabelNode {
        type: 'ClassDeclaration';
        id: BabelNodeIdentifier;
        superClass?: BabelNodeExpression;
        body: BabelNodeClassBody;
        decorators?: Array<BabelNodeDecorator>;
        abstract?: boolean;
        declare?: boolean;
        mixins?: BabelNodeInterfaceExtends;
        superTypeParameters?:
            | BabelNodeTypeParameterInstantiation
            | BabelNodeTSTypeParameterInstantiation;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeExportAllDeclaration extends BabelNode {
        type: 'ExportAllDeclaration';
        source: BabelNodeStringLiteral;
        assertions?: BabelNodeImportAttribute;
    }

    declare class BabelNodeExportDefaultDeclaration extends BabelNode {
        type: 'ExportDefaultDeclaration';
        declaration:
            | BabelNodeFunctionDeclaration
            | BabelNodeTSDeclareFunction
            | BabelNodeClassDeclaration
            | BabelNodeExpression;
    }

    declare class BabelNodeExportNamedDeclaration extends BabelNode {
        type: 'ExportNamedDeclaration';
        declaration?: BabelNodeDeclaration;
        specifiers?: Array<
            | BabelNodeExportSpecifier
            | BabelNodeExportDefaultSpecifier
            | BabelNodeExportNamespaceSpecifier,
        >;
        source?: BabelNodeStringLiteral;
        assertions?: BabelNodeImportAttribute;
        exportKind?: 'type' | 'value';
    }

    declare class BabelNodeExportSpecifier extends BabelNode {
        type: 'ExportSpecifier';
        local: BabelNodeIdentifier;
        exported: BabelNodeIdentifier | BabelNodeStringLiteral;
    }

    declare class BabelNodeForOfStatement extends BabelNode {
        type: 'ForOfStatement';
        left: BabelNodeVariableDeclaration | BabelNodeLVal;
        right: BabelNodeExpression;
        body: BabelNodeStatement;
    }

    declare class BabelNodeImportDeclaration extends BabelNode {
        type: 'ImportDeclaration';
        specifiers: Array<
            | BabelNodeImportSpecifier
            | BabelNodeImportDefaultSpecifier
            | BabelNodeImportNamespaceSpecifier,
        >;
        source: BabelNodeStringLiteral;
        assertions?: BabelNodeImportAttribute;
        importKind?: 'type' | 'typeof' | 'value';
    }

    declare class BabelNodeImportDefaultSpecifier extends BabelNode {
        type: 'ImportDefaultSpecifier';
        local: BabelNodeIdentifier;
    }

    declare class BabelNodeImportNamespaceSpecifier extends BabelNode {
        type: 'ImportNamespaceSpecifier';
        local: BabelNodeIdentifier;
    }

    declare class BabelNodeImportSpecifier extends BabelNode {
        type: 'ImportSpecifier';
        local: BabelNodeIdentifier;
        imported: BabelNodeIdentifier | BabelNodeStringLiteral;
        importKind?: 'type' | 'typeof';
    }

    declare class BabelNodeMetaProperty extends BabelNode {
        type: 'MetaProperty';
        meta: BabelNodeIdentifier;
        property: BabelNodeIdentifier;
    }

    declare class BabelNodeClassMethod extends BabelNode {
        type: 'ClassMethod';
        kind?: 'get' | 'set' | 'method' | 'constructor';
        key:
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral
            | BabelNodeExpression;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        body: BabelNodeBlockStatement;
        computed?: boolean;
        generator?: boolean;
        async?: boolean;
        abstract?: boolean;
        access?: 'public' | 'private' | 'protected';
        accessibility?: 'public' | 'private' | 'protected';
        decorators?: Array<BabelNodeDecorator>;
        optional?: boolean;
        returnType?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeObjectPattern extends BabelNode {
        type: 'ObjectPattern';
        properties: Array<BabelNodeRestElement | BabelNodeObjectProperty>;
        decorators?: Array<BabelNodeDecorator>;
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
    }

    declare class BabelNodeSpreadElement extends BabelNode {
        type: 'SpreadElement';
        argument: BabelNodeExpression;
    }

    declare class BabelNodeSuper extends BabelNode {
        type: 'Super';
    }

    declare class BabelNodeTaggedTemplateExpression extends BabelNode {
        type: 'TaggedTemplateExpression';
        tag: BabelNodeExpression;
        quasi: BabelNodeTemplateLiteral;
        typeParameters?:
            | BabelNodeTypeParameterInstantiation
            | BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeTemplateElement extends BabelNode {
        type: 'TemplateElement';
        value: {raw: string, cooked?: string};
        tail?: boolean;
    }

    declare class BabelNodeTemplateLiteral extends BabelNode {
        type: 'TemplateLiteral';
        quasis: Array<BabelNodeTemplateElement>;
        expressions: Array<BabelNodeExpression | BabelNodeTSType>;
    }

    declare class BabelNodeYieldExpression extends BabelNode {
        type: 'YieldExpression';
        argument?: BabelNodeExpression;
        delegate?: boolean;
    }

    declare class BabelNodeAwaitExpression extends BabelNode {
        type: 'AwaitExpression';
        argument: BabelNodeExpression;
    }

    declare class BabelNodeImport extends BabelNode {
        type: 'Import';
    }

    declare class BabelNodeBigIntLiteral extends BabelNode {
        type: 'BigIntLiteral';
        value: string;
    }

    declare class BabelNodeExportNamespaceSpecifier extends BabelNode {
        type: 'ExportNamespaceSpecifier';
        exported: BabelNodeIdentifier;
    }

    declare class BabelNodeOptionalMemberExpression extends BabelNode {
        type: 'OptionalMemberExpression';
        object: BabelNodeExpression;
        property: BabelNodeExpression | BabelNodeIdentifier;
        computed?: boolean;
        optional: boolean;
    }

    declare class BabelNodeOptionalCallExpression extends BabelNode {
        type: 'OptionalCallExpression';
        callee: BabelNodeExpression;
        arguments: Array<
            | BabelNodeExpression
            | BabelNodeSpreadElement
            | BabelNodeJSXNamespacedName,
        >;
        optional: boolean;
        typeArguments?: BabelNodeTypeParameterInstantiation;
        typeParameters?: BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeAnyTypeAnnotation extends BabelNode {
        type: 'AnyTypeAnnotation';
    }

    declare class BabelNodeArrayTypeAnnotation extends BabelNode {
        type: 'ArrayTypeAnnotation';
        elementType: BabelNodeFlowType;
    }

    declare class BabelNodeBooleanTypeAnnotation extends BabelNode {
        type: 'BooleanTypeAnnotation';
    }

    declare class BabelNodeBooleanLiteralTypeAnnotation extends BabelNode {
        type: 'BooleanLiteralTypeAnnotation';
        value: boolean;
    }

    declare class BabelNodeNullLiteralTypeAnnotation extends BabelNode {
        type: 'NullLiteralTypeAnnotation';
    }

    declare class BabelNodeClassImplements extends BabelNode {
        type: 'ClassImplements';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterInstantiation;
    }

    declare class BabelNodeDeclareClass extends BabelNode {
        type: 'DeclareClass';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        body: BabelNodeObjectTypeAnnotation;
        mixins?: Array<BabelNodeInterfaceExtends>;
    }

    declare class BabelNodeDeclareFunction extends BabelNode {
        type: 'DeclareFunction';
        id: BabelNodeIdentifier;
        predicate?: BabelNodeDeclaredPredicate;
    }

    declare class BabelNodeDeclareInterface extends BabelNode {
        type: 'DeclareInterface';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        body: BabelNodeObjectTypeAnnotation;
        mixins?: Array<BabelNodeInterfaceExtends>;
    }

    declare class BabelNodeDeclareModule extends BabelNode {
        type: 'DeclareModule';
        id: BabelNodeIdentifier | BabelNodeStringLiteral;
        body: BabelNodeBlockStatement;
        kind?: 'CommonJS' | 'ES';
    }

    declare class BabelNodeDeclareModuleExports extends BabelNode {
        type: 'DeclareModuleExports';
        typeAnnotation: BabelNodeTypeAnnotation;
    }

    declare class BabelNodeDeclareTypeAlias extends BabelNode {
        type: 'DeclareTypeAlias';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        right: BabelNodeFlowType;
    }

    declare class BabelNodeDeclareOpaqueType extends BabelNode {
        type: 'DeclareOpaqueType';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        supertype?: BabelNodeFlowType;
    }

    declare class BabelNodeDeclareVariable extends BabelNode {
        type: 'DeclareVariable';
        id: BabelNodeIdentifier;
    }

    declare class BabelNodeDeclareExportDeclaration extends BabelNode {
        type: 'DeclareExportDeclaration';
        declaration?: BabelNodeFlow;
        specifiers?: Array<
            BabelNodeExportSpecifier | BabelNodeExportNamespaceSpecifier,
        >;
        source?: BabelNodeStringLiteral;
    }

    declare class BabelNodeDeclareExportAllDeclaration extends BabelNode {
        type: 'DeclareExportAllDeclaration';
        source: BabelNodeStringLiteral;
        exportKind?: 'type' | 'value';
    }

    declare class BabelNodeDeclaredPredicate extends BabelNode {
        type: 'DeclaredPredicate';
        value: BabelNodeFlow;
    }

    declare class BabelNodeExistsTypeAnnotation extends BabelNode {
        type: 'ExistsTypeAnnotation';
    }

    declare class BabelNodeFunctionTypeAnnotation extends BabelNode {
        type: 'FunctionTypeAnnotation';
        typeParameters?: BabelNodeTypeParameterDeclaration;
        params: Array<BabelNodeFunctionTypeParam>;
        rest?: BabelNodeFunctionTypeParam;
        returnType: BabelNodeFlowType;
    }

    declare class BabelNodeFunctionTypeParam extends BabelNode {
        type: 'FunctionTypeParam';
        name?: BabelNodeIdentifier;
        typeAnnotation: BabelNodeFlowType;
        optional?: boolean;
    }

    declare class BabelNodeGenericTypeAnnotation extends BabelNode {
        type: 'GenericTypeAnnotation';
        id: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier;
        typeParameters?: BabelNodeTypeParameterInstantiation;
    }

    declare class BabelNodeInferredPredicate extends BabelNode {
        type: 'InferredPredicate';
    }

    declare class BabelNodeInterfaceExtends extends BabelNode {
        type: 'InterfaceExtends';
        id: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier;
        typeParameters?: BabelNodeTypeParameterInstantiation;
    }

    declare class BabelNodeInterfaceDeclaration extends BabelNode {
        type: 'InterfaceDeclaration';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        body: BabelNodeObjectTypeAnnotation;
        mixins?: Array<BabelNodeInterfaceExtends>;
    }

    declare class BabelNodeInterfaceTypeAnnotation extends BabelNode {
        type: 'InterfaceTypeAnnotation';
        body: BabelNodeObjectTypeAnnotation;
    }

    declare class BabelNodeIntersectionTypeAnnotation extends BabelNode {
        type: 'IntersectionTypeAnnotation';
        types: Array<BabelNodeFlowType>;
    }

    declare class BabelNodeMixedTypeAnnotation extends BabelNode {
        type: 'MixedTypeAnnotation';
    }

    declare class BabelNodeEmptyTypeAnnotation extends BabelNode {
        type: 'EmptyTypeAnnotation';
    }

    declare class BabelNodeNullableTypeAnnotation extends BabelNode {
        type: 'NullableTypeAnnotation';
        typeAnnotation: BabelNodeFlowType;
    }

    declare class BabelNodeNumberLiteralTypeAnnotation extends BabelNode {
        type: 'NumberLiteralTypeAnnotation';
        value: number;
    }

    declare class BabelNodeNumberTypeAnnotation extends BabelNode {
        type: 'NumberTypeAnnotation';
    }

    declare class BabelNodeObjectTypeAnnotation extends BabelNode {
        type: 'ObjectTypeAnnotation';
        properties: Array<
            BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty,
        >;
        indexers?: Array<BabelNodeObjectTypeIndexer>;
        callProperties?: Array<BabelNodeObjectTypeCallProperty>;
        internalSlots?: Array<BabelNodeObjectTypeInternalSlot>;
        exact?: boolean;
        inexact?: boolean;
    }

    declare class BabelNodeObjectTypeInternalSlot extends BabelNode {
        type: 'ObjectTypeInternalSlot';
        id: BabelNodeIdentifier;
        value: BabelNodeFlowType;
        optional: boolean;
        method: boolean;
    }

    declare class BabelNodeObjectTypeCallProperty extends BabelNode {
        type: 'ObjectTypeCallProperty';
        value: BabelNodeFlowType;
    }

    declare class BabelNodeObjectTypeIndexer extends BabelNode {
        type: 'ObjectTypeIndexer';
        id?: BabelNodeIdentifier;
        key: BabelNodeFlowType;
        value: BabelNodeFlowType;
        variance?: BabelNodeVariance;
    }

    declare class BabelNodeObjectTypeProperty extends BabelNode {
        type: 'ObjectTypeProperty';
        key: BabelNodeIdentifier | BabelNodeStringLiteral;
        value: BabelNodeFlowType;
        variance?: BabelNodeVariance;
        kind: 'init' | 'get' | 'set';
        optional: boolean;
        proto: boolean;
    }

    declare class BabelNodeObjectTypeSpreadProperty extends BabelNode {
        type: 'ObjectTypeSpreadProperty';
        argument: BabelNodeFlowType;
    }

    declare class BabelNodeOpaqueType extends BabelNode {
        type: 'OpaqueType';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        supertype?: BabelNodeFlowType;
        impltype: BabelNodeFlowType;
    }

    declare class BabelNodeQualifiedTypeIdentifier extends BabelNode {
        type: 'QualifiedTypeIdentifier';
        id: BabelNodeIdentifier;
        qualification: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier;
    }

    declare class BabelNodeStringLiteralTypeAnnotation extends BabelNode {
        type: 'StringLiteralTypeAnnotation';
        value: string;
    }

    declare class BabelNodeStringTypeAnnotation extends BabelNode {
        type: 'StringTypeAnnotation';
    }

    declare class BabelNodeSymbolTypeAnnotation extends BabelNode {
        type: 'SymbolTypeAnnotation';
    }

    declare class BabelNodeThisTypeAnnotation extends BabelNode {
        type: 'ThisTypeAnnotation';
    }

    declare class BabelNodeTupleTypeAnnotation extends BabelNode {
        type: 'TupleTypeAnnotation';
        types: Array<BabelNodeFlowType>;
    }

    declare class BabelNodeTypeofTypeAnnotation extends BabelNode {
        type: 'TypeofTypeAnnotation';
        argument: BabelNodeFlowType;
    }

    declare class BabelNodeTypeAlias extends BabelNode {
        type: 'TypeAlias';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTypeParameterDeclaration;
        right: BabelNodeFlowType;
    }

    declare class BabelNodeTypeAnnotation extends BabelNode {
        type: 'TypeAnnotation';
        typeAnnotation: BabelNodeFlowType;
    }

    declare class BabelNodeTypeCastExpression extends BabelNode {
        type: 'TypeCastExpression';
        expression: BabelNodeExpression;
        typeAnnotation: BabelNodeTypeAnnotation;
    }

    declare class BabelNodeTypeParameter extends BabelNode {
        type: 'TypeParameter';
        bound?: BabelNodeTypeAnnotation;
        variance?: BabelNodeVariance;
        name: string;
    }

    declare class BabelNodeTypeParameterDeclaration extends BabelNode {
        type: 'TypeParameterDeclaration';
        params: Array<BabelNodeTypeParameter>;
    }

    declare class BabelNodeTypeParameterInstantiation extends BabelNode {
        type: 'TypeParameterInstantiation';
        params: Array<BabelNodeFlowType>;
    }

    declare class BabelNodeUnionTypeAnnotation extends BabelNode {
        type: 'UnionTypeAnnotation';
        types: Array<BabelNodeFlowType>;
    }

    declare class BabelNodeVariance extends BabelNode {
        type: 'Variance';
        kind: 'minus' | 'plus';
    }

    declare class BabelNodeVoidTypeAnnotation extends BabelNode {
        type: 'VoidTypeAnnotation';
    }

    declare class BabelNodeEnumDeclaration extends BabelNode {
        type: 'EnumDeclaration';
        id: BabelNodeIdentifier;
        body:
            | BabelNodeEnumBooleanBody
            | BabelNodeEnumNumberBody
            | BabelNodeEnumStringBody
            | BabelNodeEnumSymbolBody;
    }

    declare class BabelNodeEnumBooleanBody extends BabelNode {
        type: 'EnumBooleanBody';
        members: Array<BabelNodeEnumBooleanMember>;
        explicit: boolean;
    }

    declare class BabelNodeEnumNumberBody extends BabelNode {
        type: 'EnumNumberBody';
        members: Array<BabelNodeEnumNumberMember>;
        explicit: boolean;
    }

    declare class BabelNodeEnumStringBody extends BabelNode {
        type: 'EnumStringBody';
        members: Array<
            BabelNodeEnumStringMember | BabelNodeEnumDefaultedMember,
        >;
        explicit: boolean;
    }

    declare class BabelNodeEnumSymbolBody extends BabelNode {
        type: 'EnumSymbolBody';
        members: Array<BabelNodeEnumDefaultedMember>;
    }

    declare class BabelNodeEnumBooleanMember extends BabelNode {
        type: 'EnumBooleanMember';
        id: BabelNodeIdentifier;
        init: BabelNodeBooleanLiteral;
    }

    declare class BabelNodeEnumNumberMember extends BabelNode {
        type: 'EnumNumberMember';
        id: BabelNodeIdentifier;
        init: BabelNodeNumericLiteral;
    }

    declare class BabelNodeEnumStringMember extends BabelNode {
        type: 'EnumStringMember';
        id: BabelNodeIdentifier;
        init: BabelNodeStringLiteral;
    }

    declare class BabelNodeEnumDefaultedMember extends BabelNode {
        type: 'EnumDefaultedMember';
        id: BabelNodeIdentifier;
    }

    declare class BabelNodeJSXAttribute extends BabelNode {
        type: 'JSXAttribute';
        name: BabelNodeJSXIdentifier | BabelNodeJSXNamespacedName;
        value?:
            | BabelNodeJSXElement
            | BabelNodeJSXFragment
            | BabelNodeStringLiteral
            | BabelNodeJSXExpressionContainer;
    }

    declare class BabelNodeJSXClosingElement extends BabelNode {
        type: 'JSXClosingElement';
        name:
            | BabelNodeJSXIdentifier
            | BabelNodeJSXMemberExpression
            | BabelNodeJSXNamespacedName;
    }

    declare class BabelNodeJSXElement extends BabelNode {
        type: 'JSXElement';
        openingElement: BabelNodeJSXOpeningElement;
        closingElement?: BabelNodeJSXClosingElement;
        children: Array<
            | BabelNodeJSXText
            | BabelNodeJSXExpressionContainer
            | BabelNodeJSXSpreadChild
            | BabelNodeJSXElement
            | BabelNodeJSXFragment,
        >;
        selfClosing?: boolean;
    }

    declare class BabelNodeJSXEmptyExpression extends BabelNode {
        type: 'JSXEmptyExpression';
    }

    declare class BabelNodeJSXExpressionContainer extends BabelNode {
        type: 'JSXExpressionContainer';
        expression: BabelNodeExpression | BabelNodeJSXEmptyExpression;
    }

    declare class BabelNodeJSXSpreadChild extends BabelNode {
        type: 'JSXSpreadChild';
        expression: BabelNodeExpression;
    }

    declare class BabelNodeJSXIdentifier extends BabelNode {
        type: 'JSXIdentifier';
        name: string;
    }

    declare class BabelNodeJSXMemberExpression extends BabelNode {
        type: 'JSXMemberExpression';
        object: BabelNodeJSXMemberExpression | BabelNodeJSXIdentifier;
        property: BabelNodeJSXIdentifier;
    }

    declare class BabelNodeJSXNamespacedName extends BabelNode {
        type: 'JSXNamespacedName';
        namespace: BabelNodeJSXIdentifier;
        name: BabelNodeJSXIdentifier;
    }

    declare class BabelNodeJSXOpeningElement extends BabelNode {
        type: 'JSXOpeningElement';
        name:
            | BabelNodeJSXIdentifier
            | BabelNodeJSXMemberExpression
            | BabelNodeJSXNamespacedName;
        attributes: Array<BabelNodeJSXAttribute | BabelNodeJSXSpreadAttribute>;
        selfClosing?: boolean;
        typeParameters?:
            | BabelNodeTypeParameterInstantiation
            | BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeJSXSpreadAttribute extends BabelNode {
        type: 'JSXSpreadAttribute';
        argument: BabelNodeExpression;
    }

    declare class BabelNodeJSXText extends BabelNode {
        type: 'JSXText';
        value: string;
    }

    declare class BabelNodeJSXFragment extends BabelNode {
        type: 'JSXFragment';
        openingFragment: BabelNodeJSXOpeningFragment;
        closingFragment: BabelNodeJSXClosingFragment;
        children: Array<
            | BabelNodeJSXText
            | BabelNodeJSXExpressionContainer
            | BabelNodeJSXSpreadChild
            | BabelNodeJSXElement
            | BabelNodeJSXFragment,
        >;
    }

    declare class BabelNodeJSXOpeningFragment extends BabelNode {
        type: 'JSXOpeningFragment';
    }

    declare class BabelNodeJSXClosingFragment extends BabelNode {
        type: 'JSXClosingFragment';
    }

    declare class BabelNodeNoop extends BabelNode {
        type: 'Noop';
    }

    declare class BabelNodePlaceholder extends BabelNode {
        type: 'Placeholder';
        expectedNode:
            | 'Identifier'
            | 'StringLiteral'
            | 'Expression'
            | 'Statement'
            | 'Declaration'
            | 'BlockStatement'
            | 'ClassBody'
            | 'Pattern';
        name: BabelNodeIdentifier;
    }

    declare class BabelNodeV8IntrinsicIdentifier extends BabelNode {
        type: 'V8IntrinsicIdentifier';
        name: string;
    }

    declare class BabelNodeArgumentPlaceholder extends BabelNode {
        type: 'ArgumentPlaceholder';
    }

    declare class BabelNodeBindExpression extends BabelNode {
        type: 'BindExpression';
        object: BabelNodeExpression;
        callee: BabelNodeExpression;
    }

    declare class BabelNodeClassProperty extends BabelNode {
        type: 'ClassProperty';
        key:
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral
            | BabelNodeExpression;
        value?: BabelNodeExpression;
        typeAnnotation?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        decorators?: Array<BabelNodeDecorator>;
        computed?: boolean;
        abstract?: boolean;
        accessibility?: 'public' | 'private' | 'protected';
        declare?: boolean;
        definite?: boolean;
        optional?: boolean;
        readonly?: boolean;
    }

    declare class BabelNodePipelineTopicExpression extends BabelNode {
        type: 'PipelineTopicExpression';
        expression: BabelNodeExpression;
    }

    declare class BabelNodePipelineBareFunction extends BabelNode {
        type: 'PipelineBareFunction';
        callee: BabelNodeExpression;
    }

    declare class BabelNodePipelinePrimaryTopicReference extends BabelNode {
        type: 'PipelinePrimaryTopicReference';
    }

    declare class BabelNodeClassPrivateProperty extends BabelNode {
        type: 'ClassPrivateProperty';
        key: BabelNodePrivateName;
        value?: BabelNodeExpression;
        decorators?: Array<BabelNodeDecorator>;
    }

    declare class BabelNodeClassPrivateMethod extends BabelNode {
        type: 'ClassPrivateMethod';
        kind?: 'get' | 'set' | 'method' | 'constructor';
        key: BabelNodePrivateName;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        body: BabelNodeBlockStatement;
        abstract?: boolean;
        access?: 'public' | 'private' | 'protected';
        accessibility?: 'public' | 'private' | 'protected';
        async?: boolean;
        computed?: boolean;
        decorators?: Array<BabelNodeDecorator>;
        generator?: boolean;
        optional?: boolean;
        returnType?:
            | BabelNodeTypeAnnotation
            | BabelNodeTSTypeAnnotation
            | BabelNodeNoop;
        typeParameters?:
            | BabelNodeTypeParameterDeclaration
            | BabelNodeTSTypeParameterDeclaration
            | BabelNodeNoop;
    }

    declare class BabelNodeImportAttribute extends BabelNode {
        type: 'ImportAttribute';
        key: BabelNodeIdentifier | BabelNodeStringLiteral;
        value: BabelNodeStringLiteral;
    }

    declare class BabelNodeDecorator extends BabelNode {
        type: 'Decorator';
        expression: BabelNodeExpression;
    }

    declare class BabelNodeDoExpression extends BabelNode {
        type: 'DoExpression';
        body: BabelNodeBlockStatement;
    }

    declare class BabelNodeExportDefaultSpecifier extends BabelNode {
        type: 'ExportDefaultSpecifier';
        exported: BabelNodeIdentifier;
    }

    declare class BabelNodePrivateName extends BabelNode {
        type: 'PrivateName';
        id: BabelNodeIdentifier;
    }

    declare class BabelNodeRecordExpression extends BabelNode {
        type: 'RecordExpression';
        properties: Array<BabelNodeObjectProperty | BabelNodeSpreadElement>;
    }

    declare class BabelNodeTupleExpression extends BabelNode {
        type: 'TupleExpression';
        elements?: Array<BabelNodeExpression | BabelNodeSpreadElement>;
    }

    declare class BabelNodeDecimalLiteral extends BabelNode {
        type: 'DecimalLiteral';
        value: string;
    }

    declare class BabelNodeStaticBlock extends BabelNode {
        type: 'StaticBlock';
        body: Array<BabelNodeStatement>;
    }

    declare class BabelNodeTSParameterProperty extends BabelNode {
        type: 'TSParameterProperty';
        parameter: BabelNodeIdentifier | BabelNodeAssignmentPattern;
        accessibility?: 'public' | 'private' | 'protected';
        readonly?: boolean;
    }

    declare class BabelNodeTSDeclareFunction extends BabelNode {
        type: 'TSDeclareFunction';
        id?: BabelNodeIdentifier;
        typeParameters?: BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        returnType?: BabelNodeTSTypeAnnotation | BabelNodeNoop;
        async?: boolean;
        declare?: boolean;
        generator?: boolean;
    }

    declare class BabelNodeTSDeclareMethod extends BabelNode {
        type: 'TSDeclareMethod';
        decorators?: Array<BabelNodeDecorator>;
        key:
            | BabelNodeIdentifier
            | BabelNodeStringLiteral
            | BabelNodeNumericLiteral
            | BabelNodeExpression;
        typeParameters?: BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
        params: Array<
            | BabelNodeIdentifier
            | BabelNodePattern
            | BabelNodeRestElement
            | BabelNodeTSParameterProperty,
        >;
        returnType?: BabelNodeTSTypeAnnotation | BabelNodeNoop;
        abstract?: boolean;
        access?: 'public' | 'private' | 'protected';
        accessibility?: 'public' | 'private' | 'protected';
        async?: boolean;
        computed?: boolean;
        generator?: boolean;
        kind?: 'get' | 'set' | 'method' | 'constructor';
        optional?: boolean;
    }

    declare class BabelNodeTSQualifiedName extends BabelNode {
        type: 'TSQualifiedName';
        left: BabelNodeTSEntityName;
        right: BabelNodeIdentifier;
    }

    declare class BabelNodeTSCallSignatureDeclaration extends BabelNode {
        type: 'TSCallSignatureDeclaration';
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
    }

    declare class BabelNodeTSConstructSignatureDeclaration extends BabelNode {
        type: 'TSConstructSignatureDeclaration';
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
    }

    declare class BabelNodeTSPropertySignature extends BabelNode {
        type: 'TSPropertySignature';
        key: BabelNodeExpression;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
        initializer?: BabelNodeExpression;
        computed?: boolean;
        optional?: boolean;
        readonly?: boolean;
    }

    declare class BabelNodeTSMethodSignature extends BabelNode {
        type: 'TSMethodSignature';
        key: BabelNodeExpression;
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
        computed?: boolean;
        optional?: boolean;
    }

    declare class BabelNodeTSIndexSignature extends BabelNode {
        type: 'TSIndexSignature';
        parameters: Array<BabelNodeIdentifier>;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
        readonly?: boolean;
    }

    declare class BabelNodeTSAnyKeyword extends BabelNode {
        type: 'TSAnyKeyword';
    }

    declare class BabelNodeTSBooleanKeyword extends BabelNode {
        type: 'TSBooleanKeyword';
    }

    declare class BabelNodeTSBigIntKeyword extends BabelNode {
        type: 'TSBigIntKeyword';
    }

    declare class BabelNodeTSIntrinsicKeyword extends BabelNode {
        type: 'TSIntrinsicKeyword';
    }

    declare class BabelNodeTSNeverKeyword extends BabelNode {
        type: 'TSNeverKeyword';
    }

    declare class BabelNodeTSNullKeyword extends BabelNode {
        type: 'TSNullKeyword';
    }

    declare class BabelNodeTSNumberKeyword extends BabelNode {
        type: 'TSNumberKeyword';
    }

    declare class BabelNodeTSObjectKeyword extends BabelNode {
        type: 'TSObjectKeyword';
    }

    declare class BabelNodeTSStringKeyword extends BabelNode {
        type: 'TSStringKeyword';
    }

    declare class BabelNodeTSSymbolKeyword extends BabelNode {
        type: 'TSSymbolKeyword';
    }

    declare class BabelNodeTSUndefinedKeyword extends BabelNode {
        type: 'TSUndefinedKeyword';
    }

    declare class BabelNodeTSUnknownKeyword extends BabelNode {
        type: 'TSUnknownKeyword';
    }

    declare class BabelNodeTSVoidKeyword extends BabelNode {
        type: 'TSVoidKeyword';
    }

    declare class BabelNodeTSThisType extends BabelNode {
        type: 'TSThisType';
    }

    declare class BabelNodeTSFunctionType extends BabelNode {
        type: 'TSFunctionType';
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
    }

    declare class BabelNodeTSConstructorType extends BabelNode {
        type: 'TSConstructorType';
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
    }

    declare class BabelNodeTSTypeReference extends BabelNode {
        type: 'TSTypeReference';
        typeName: BabelNodeTSEntityName;
        typeParameters?: BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeTSTypePredicate extends BabelNode {
        type: 'TSTypePredicate';
        parameterName: BabelNodeIdentifier | BabelNodeTSThisType;
        typeAnnotation?: BabelNodeTSTypeAnnotation;
        asserts?: boolean;
    }

    declare class BabelNodeTSTypeQuery extends BabelNode {
        type: 'TSTypeQuery';
        exprName: BabelNodeTSEntityName | BabelNodeTSImportType;
    }

    declare class BabelNodeTSTypeLiteral extends BabelNode {
        type: 'TSTypeLiteral';
        members: Array<BabelNodeTSTypeElement>;
    }

    declare class BabelNodeTSArrayType extends BabelNode {
        type: 'TSArrayType';
        elementType: BabelNodeTSType;
    }

    declare class BabelNodeTSTupleType extends BabelNode {
        type: 'TSTupleType';
        elementTypes: Array<BabelNodeTSType | BabelNodeTSNamedTupleMember>;
    }

    declare class BabelNodeTSOptionalType extends BabelNode {
        type: 'TSOptionalType';
        typeAnnotation: BabelNodeTSType;
    }

    declare class BabelNodeTSRestType extends BabelNode {
        type: 'TSRestType';
        typeAnnotation: BabelNodeTSType;
    }

    declare class BabelNodeTSNamedTupleMember extends BabelNode {
        type: 'TSNamedTupleMember';
        label: BabelNodeIdentifier;
        elementType: BabelNodeTSType;
        optional?: boolean;
    }

    declare class BabelNodeTSUnionType extends BabelNode {
        type: 'TSUnionType';
        types: Array<BabelNodeTSType>;
    }

    declare class BabelNodeTSIntersectionType extends BabelNode {
        type: 'TSIntersectionType';
        types: Array<BabelNodeTSType>;
    }

    declare class BabelNodeTSConditionalType extends BabelNode {
        type: 'TSConditionalType';
        checkType: BabelNodeTSType;
        extendsType: BabelNodeTSType;
        trueType: BabelNodeTSType;
        falseType: BabelNodeTSType;
    }

    declare class BabelNodeTSInferType extends BabelNode {
        type: 'TSInferType';
        typeParameter: BabelNodeTSTypeParameter;
    }

    declare class BabelNodeTSParenthesizedType extends BabelNode {
        type: 'TSParenthesizedType';
        typeAnnotation: BabelNodeTSType;
    }

    declare class BabelNodeTSTypeOperator extends BabelNode {
        type: 'TSTypeOperator';
        typeAnnotation: BabelNodeTSType;
        operator: string;
    }

    declare class BabelNodeTSIndexedAccessType extends BabelNode {
        type: 'TSIndexedAccessType';
        objectType: BabelNodeTSType;
        indexType: BabelNodeTSType;
    }

    declare class BabelNodeTSMappedType extends BabelNode {
        type: 'TSMappedType';
        typeParameter: BabelNodeTSTypeParameter;
        typeAnnotation?: BabelNodeTSType;
        nameType?: BabelNodeTSType;
        optional?: boolean;
        readonly?: boolean;
    }

    declare class BabelNodeTSLiteralType extends BabelNode {
        type: 'TSLiteralType';
        literal:
            | BabelNodeNumericLiteral
            | BabelNodeStringLiteral
            | BabelNodeBooleanLiteral
            | BabelNodeBigIntLiteral;
    }

    declare class BabelNodeTSExpressionWithTypeArguments extends BabelNode {
        type: 'TSExpressionWithTypeArguments';
        expression: BabelNodeTSEntityName;
        typeParameters?: BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeTSInterfaceDeclaration extends BabelNode {
        type: 'TSInterfaceDeclaration';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        body: BabelNodeTSInterfaceBody;
        declare?: boolean;
    }

    declare class BabelNodeTSInterfaceBody extends BabelNode {
        type: 'TSInterfaceBody';
        body: Array<BabelNodeTSTypeElement>;
    }

    declare class BabelNodeTSTypeAliasDeclaration extends BabelNode {
        type: 'TSTypeAliasDeclaration';
        id: BabelNodeIdentifier;
        typeParameters?: BabelNodeTSTypeParameterDeclaration;
        typeAnnotation: BabelNodeTSType;
        declare?: boolean;
    }

    declare class BabelNodeTSAsExpression extends BabelNode {
        type: 'TSAsExpression';
        expression: BabelNodeExpression;
        typeAnnotation: BabelNodeTSType;
    }

    declare class BabelNodeTSTypeAssertion extends BabelNode {
        type: 'TSTypeAssertion';
        typeAnnotation: BabelNodeTSType;
        expression: BabelNodeExpression;
    }

    declare class BabelNodeTSEnumDeclaration extends BabelNode {
        type: 'TSEnumDeclaration';
        id: BabelNodeIdentifier;
        members: Array<BabelNodeTSEnumMember>;
        declare?: boolean;
        initializer?: BabelNodeExpression;
    }

    declare class BabelNodeTSEnumMember extends BabelNode {
        type: 'TSEnumMember';
        id: BabelNodeIdentifier | BabelNodeStringLiteral;
        initializer?: BabelNodeExpression;
    }

    declare class BabelNodeTSModuleDeclaration extends BabelNode {
        type: 'TSModuleDeclaration';
        id: BabelNodeIdentifier | BabelNodeStringLiteral;
        body: BabelNodeTSModuleBlock | BabelNodeTSModuleDeclaration;
        declare?: boolean;
        global?: boolean;
    }

    declare class BabelNodeTSModuleBlock extends BabelNode {
        type: 'TSModuleBlock';
        body: Array<BabelNodeStatement>;
    }

    declare class BabelNodeTSImportType extends BabelNode {
        type: 'TSImportType';
        argument: BabelNodeStringLiteral;
        qualifier?: BabelNodeTSEntityName;
        typeParameters?: BabelNodeTSTypeParameterInstantiation;
    }

    declare class BabelNodeTSImportEqualsDeclaration extends BabelNode {
        type: 'TSImportEqualsDeclaration';
        id: BabelNodeIdentifier;
        moduleReference:
            | BabelNodeTSEntityName
            | BabelNodeTSExternalModuleReference;
        isExport: boolean;
    }

    declare class BabelNodeTSExternalModuleReference extends BabelNode {
        type: 'TSExternalModuleReference';
        expression: BabelNodeStringLiteral;
    }

    declare class BabelNodeTSNonNullExpression extends BabelNode {
        type: 'TSNonNullExpression';
        expression: BabelNodeExpression;
    }

    declare class BabelNodeTSExportAssignment extends BabelNode {
        type: 'TSExportAssignment';
        expression: BabelNodeExpression;
    }

    declare class BabelNodeTSNamespaceExportDeclaration extends BabelNode {
        type: 'TSNamespaceExportDeclaration';
        id: BabelNodeIdentifier;
    }

    declare class BabelNodeTSTypeAnnotation extends BabelNode {
        type: 'TSTypeAnnotation';
        typeAnnotation: BabelNodeTSType;
    }

    declare class BabelNodeTSTypeParameterInstantiation extends BabelNode {
        type: 'TSTypeParameterInstantiation';
        params: Array<BabelNodeTSType>;
    }

    declare class BabelNodeTSTypeParameterDeclaration extends BabelNode {
        type: 'TSTypeParameterDeclaration';
        params: Array<BabelNodeTSTypeParameter>;
    }

    declare class BabelNodeTSTypeParameter extends BabelNode {
        type: 'TSTypeParameter';
        constraint?: BabelNodeTSType;
        name: string;
    }

    declare type BabelNodeExpression =
        | BabelNodeArrayExpression
        | BabelNodeAssignmentExpression
        | BabelNodeBinaryExpression
        | BabelNodeCallExpression
        | BabelNodeConditionalExpression
        | BabelNodeFunctionExpression
        | BabelNodeIdentifier
        | BabelNodeStringLiteral
        | BabelNodeNumericLiteral
        | BabelNodeNullLiteral
        | BabelNodeBooleanLiteral
        | BabelNodeRegExpLiteral
        | BabelNodeLogicalExpression
        | BabelNodeMemberExpression
        | BabelNodeNewExpression
        | BabelNodeObjectExpression
        | BabelNodeSequenceExpression
        | BabelNodeParenthesizedExpression
        | BabelNodeThisExpression
        | BabelNodeUnaryExpression
        | BabelNodeUpdateExpression
        | BabelNodeArrowFunctionExpression
        | BabelNodeClassExpression
        | BabelNodeMetaProperty
        | BabelNodeSuper
        | BabelNodeTaggedTemplateExpression
        | BabelNodeTemplateLiteral
        | BabelNodeYieldExpression
        | BabelNodeAwaitExpression
        | BabelNodeImport
        | BabelNodeBigIntLiteral
        | BabelNodeOptionalMemberExpression
        | BabelNodeOptionalCallExpression
        | BabelNodeTypeCastExpression
        | BabelNodeJSXElement
        | BabelNodeJSXFragment
        | BabelNodeBindExpression
        | BabelNodePipelinePrimaryTopicReference
        | BabelNodeDoExpression
        | BabelNodeRecordExpression
        | BabelNodeTupleExpression
        | BabelNodeDecimalLiteral
        | BabelNodeTSAsExpression
        | BabelNodeTSTypeAssertion
        | BabelNodeTSNonNullExpression;
    declare type BabelNodeBinary =
        | BabelNodeBinaryExpression
        | BabelNodeLogicalExpression;
    declare type BabelNodeScopable =
        | BabelNodeBlockStatement
        | BabelNodeCatchClause
        | BabelNodeDoWhileStatement
        | BabelNodeForInStatement
        | BabelNodeForStatement
        | BabelNodeFunctionDeclaration
        | BabelNodeFunctionExpression
        | BabelNodeProgram
        | BabelNodeObjectMethod
        | BabelNodeSwitchStatement
        | BabelNodeWhileStatement
        | BabelNodeArrowFunctionExpression
        | BabelNodeClassExpression
        | BabelNodeClassDeclaration
        | BabelNodeForOfStatement
        | BabelNodeClassMethod
        | BabelNodeClassPrivateMethod
        | BabelNodeStaticBlock
        | BabelNodeTSModuleBlock;
    declare type BabelNodeBlockParent =
        | BabelNodeBlockStatement
        | BabelNodeCatchClause
        | BabelNodeDoWhileStatement
        | BabelNodeForInStatement
        | BabelNodeForStatement
        | BabelNodeFunctionDeclaration
        | BabelNodeFunctionExpression
        | BabelNodeProgram
        | BabelNodeObjectMethod
        | BabelNodeSwitchStatement
        | BabelNodeWhileStatement
        | BabelNodeArrowFunctionExpression
        | BabelNodeForOfStatement
        | BabelNodeClassMethod
        | BabelNodeClassPrivateMethod
        | BabelNodeStaticBlock
        | BabelNodeTSModuleBlock;
    declare type BabelNodeBlock =
        | BabelNodeBlockStatement
        | BabelNodeProgram
        | BabelNodeTSModuleBlock;
    declare type BabelNodeStatement =
        | BabelNodeBlockStatement
        | BabelNodeBreakStatement
        | BabelNodeContinueStatement
        | BabelNodeDebuggerStatement
        | BabelNodeDoWhileStatement
        | BabelNodeEmptyStatement
        | BabelNodeExpressionStatement
        | BabelNodeForInStatement
        | BabelNodeForStatement
        | BabelNodeFunctionDeclaration
        | BabelNodeIfStatement
        | BabelNodeLabeledStatement
        | BabelNodeReturnStatement
        | BabelNodeSwitchStatement
        | BabelNodeThrowStatement
        | BabelNodeTryStatement
        | BabelNodeVariableDeclaration
        | BabelNodeWhileStatement
        | BabelNodeWithStatement
        | BabelNodeClassDeclaration
        | BabelNodeExportAllDeclaration
        | BabelNodeExportDefaultDeclaration
        | BabelNodeExportNamedDeclaration
        | BabelNodeForOfStatement
        | BabelNodeImportDeclaration
        | BabelNodeDeclareClass
        | BabelNodeDeclareFunction
        | BabelNodeDeclareInterface
        | BabelNodeDeclareModule
        | BabelNodeDeclareModuleExports
        | BabelNodeDeclareTypeAlias
        | BabelNodeDeclareOpaqueType
        | BabelNodeDeclareVariable
        | BabelNodeDeclareExportDeclaration
        | BabelNodeDeclareExportAllDeclaration
        | BabelNodeInterfaceDeclaration
        | BabelNodeOpaqueType
        | BabelNodeTypeAlias
        | BabelNodeEnumDeclaration
        | BabelNodeTSDeclareFunction
        | BabelNodeTSInterfaceDeclaration
        | BabelNodeTSTypeAliasDeclaration
        | BabelNodeTSEnumDeclaration
        | BabelNodeTSModuleDeclaration
        | BabelNodeTSImportEqualsDeclaration
        | BabelNodeTSExportAssignment
        | BabelNodeTSNamespaceExportDeclaration;
    declare type BabelNodeTerminatorless =
        | BabelNodeBreakStatement
        | BabelNodeContinueStatement
        | BabelNodeReturnStatement
        | BabelNodeThrowStatement
        | BabelNodeYieldExpression
        | BabelNodeAwaitExpression;
    declare type BabelNodeCompletionStatement =
        | BabelNodeBreakStatement
        | BabelNodeContinueStatement
        | BabelNodeReturnStatement
        | BabelNodeThrowStatement;
    declare type BabelNodeConditional =
        | BabelNodeConditionalExpression
        | BabelNodeIfStatement;
    declare type BabelNodeLoop =
        | BabelNodeDoWhileStatement
        | BabelNodeForInStatement
        | BabelNodeForStatement
        | BabelNodeWhileStatement
        | BabelNodeForOfStatement;
    declare type BabelNodeWhile =
        | BabelNodeDoWhileStatement
        | BabelNodeWhileStatement;
    declare type BabelNodeExpressionWrapper =
        | BabelNodeExpressionStatement
        | BabelNodeParenthesizedExpression
        | BabelNodeTypeCastExpression;
    declare type BabelNodeFor =
        | BabelNodeForInStatement
        | BabelNodeForStatement
        | BabelNodeForOfStatement;
    declare type BabelNodeForXStatement =
        | BabelNodeForInStatement
        | BabelNodeForOfStatement;
    declare type BabelNodeFunction =
        | BabelNodeFunctionDeclaration
        | BabelNodeFunctionExpression
        | BabelNodeObjectMethod
        | BabelNodeArrowFunctionExpression
        | BabelNodeClassMethod
        | BabelNodeClassPrivateMethod;
    declare type BabelNodeFunctionParent =
        | BabelNodeFunctionDeclaration
        | BabelNodeFunctionExpression
        | BabelNodeObjectMethod
        | BabelNodeArrowFunctionExpression
        | BabelNodeClassMethod
        | BabelNodeClassPrivateMethod;
    declare type BabelNodePureish =
        | BabelNodeFunctionDeclaration
        | BabelNodeFunctionExpression
        | BabelNodeStringLiteral
        | BabelNodeNumericLiteral
        | BabelNodeNullLiteral
        | BabelNodeBooleanLiteral
        | BabelNodeRegExpLiteral
        | BabelNodeArrowFunctionExpression
        | BabelNodeBigIntLiteral
        | BabelNodeDecimalLiteral;
    declare type BabelNodeDeclaration =
        | BabelNodeFunctionDeclaration
        | BabelNodeVariableDeclaration
        | BabelNodeClassDeclaration
        | BabelNodeExportAllDeclaration
        | BabelNodeExportDefaultDeclaration
        | BabelNodeExportNamedDeclaration
        | BabelNodeImportDeclaration
        | BabelNodeDeclareClass
        | BabelNodeDeclareFunction
        | BabelNodeDeclareInterface
        | BabelNodeDeclareModule
        | BabelNodeDeclareModuleExports
        | BabelNodeDeclareTypeAlias
        | BabelNodeDeclareOpaqueType
        | BabelNodeDeclareVariable
        | BabelNodeDeclareExportDeclaration
        | BabelNodeDeclareExportAllDeclaration
        | BabelNodeInterfaceDeclaration
        | BabelNodeOpaqueType
        | BabelNodeTypeAlias
        | BabelNodeEnumDeclaration
        | BabelNodeTSDeclareFunction
        | BabelNodeTSInterfaceDeclaration
        | BabelNodeTSTypeAliasDeclaration
        | BabelNodeTSEnumDeclaration
        | BabelNodeTSModuleDeclaration;
    declare type BabelNodePatternLike =
        | BabelNodeIdentifier
        | BabelNodeRestElement
        | BabelNodeAssignmentPattern
        | BabelNodeArrayPattern
        | BabelNodeObjectPattern;
    declare type BabelNodeLVal =
        | BabelNodeIdentifier
        | BabelNodeMemberExpression
        | BabelNodeRestElement
        | BabelNodeAssignmentPattern
        | BabelNodeArrayPattern
        | BabelNodeObjectPattern
        | BabelNodeTSParameterProperty;
    declare type BabelNodeTSEntityName =
        | BabelNodeIdentifier
        | BabelNodeTSQualifiedName;
    declare type BabelNodeLiteral =
        | BabelNodeStringLiteral
        | BabelNodeNumericLiteral
        | BabelNodeNullLiteral
        | BabelNodeBooleanLiteral
        | BabelNodeRegExpLiteral
        | BabelNodeTemplateLiteral
        | BabelNodeBigIntLiteral
        | BabelNodeDecimalLiteral;
    declare type BabelNodeImmutable =
        | BabelNodeStringLiteral
        | BabelNodeNumericLiteral
        | BabelNodeNullLiteral
        | BabelNodeBooleanLiteral
        | BabelNodeBigIntLiteral
        | BabelNodeJSXAttribute
        | BabelNodeJSXClosingElement
        | BabelNodeJSXElement
        | BabelNodeJSXExpressionContainer
        | BabelNodeJSXSpreadChild
        | BabelNodeJSXOpeningElement
        | BabelNodeJSXText
        | BabelNodeJSXFragment
        | BabelNodeJSXOpeningFragment
        | BabelNodeJSXClosingFragment
        | BabelNodeDecimalLiteral;
    declare type BabelNodeUserWhitespacable =
        | BabelNodeObjectMethod
        | BabelNodeObjectProperty
        | BabelNodeObjectTypeInternalSlot
        | BabelNodeObjectTypeCallProperty
        | BabelNodeObjectTypeIndexer
        | BabelNodeObjectTypeProperty
        | BabelNodeObjectTypeSpreadProperty;
    declare type BabelNodeMethod =
        | BabelNodeObjectMethod
        | BabelNodeClassMethod
        | BabelNodeClassPrivateMethod;
    declare type BabelNodeObjectMember =
        | BabelNodeObjectMethod
        | BabelNodeObjectProperty;
    declare type BabelNodeProperty =
        | BabelNodeObjectProperty
        | BabelNodeClassProperty
        | BabelNodeClassPrivateProperty;
    declare type BabelNodeUnaryLike =
        | BabelNodeUnaryExpression
        | BabelNodeSpreadElement;
    declare type BabelNodePattern =
        | BabelNodeAssignmentPattern
        | BabelNodeArrayPattern
        | BabelNodeObjectPattern;
    declare type BabelNodeClass =
        | BabelNodeClassExpression
        | BabelNodeClassDeclaration;
    declare type BabelNodeModuleDeclaration =
        | BabelNodeExportAllDeclaration
        | BabelNodeExportDefaultDeclaration
        | BabelNodeExportNamedDeclaration
        | BabelNodeImportDeclaration;
    declare type BabelNodeExportDeclaration =
        | BabelNodeExportAllDeclaration
        | BabelNodeExportDefaultDeclaration
        | BabelNodeExportNamedDeclaration;
    declare type BabelNodeModuleSpecifier =
        | BabelNodeExportSpecifier
        | BabelNodeImportDefaultSpecifier
        | BabelNodeImportNamespaceSpecifier
        | BabelNodeImportSpecifier
        | BabelNodeExportNamespaceSpecifier
        | BabelNodeExportDefaultSpecifier;
    declare type BabelNodeFlow =
        | BabelNodeAnyTypeAnnotation
        | BabelNodeArrayTypeAnnotation
        | BabelNodeBooleanTypeAnnotation
        | BabelNodeBooleanLiteralTypeAnnotation
        | BabelNodeNullLiteralTypeAnnotation
        | BabelNodeClassImplements
        | BabelNodeDeclareClass
        | BabelNodeDeclareFunction
        | BabelNodeDeclareInterface
        | BabelNodeDeclareModule
        | BabelNodeDeclareModuleExports
        | BabelNodeDeclareTypeAlias
        | BabelNodeDeclareOpaqueType
        | BabelNodeDeclareVariable
        | BabelNodeDeclareExportDeclaration
        | BabelNodeDeclareExportAllDeclaration
        | BabelNodeDeclaredPredicate
        | BabelNodeExistsTypeAnnotation
        | BabelNodeFunctionTypeAnnotation
        | BabelNodeFunctionTypeParam
        | BabelNodeGenericTypeAnnotation
        | BabelNodeInferredPredicate
        | BabelNodeInterfaceExtends
        | BabelNodeInterfaceDeclaration
        | BabelNodeInterfaceTypeAnnotation
        | BabelNodeIntersectionTypeAnnotation
        | BabelNodeMixedTypeAnnotation
        | BabelNodeEmptyTypeAnnotation
        | BabelNodeNullableTypeAnnotation
        | BabelNodeNumberLiteralTypeAnnotation
        | BabelNodeNumberTypeAnnotation
        | BabelNodeObjectTypeAnnotation
        | BabelNodeObjectTypeInternalSlot
        | BabelNodeObjectTypeCallProperty
        | BabelNodeObjectTypeIndexer
        | BabelNodeObjectTypeProperty
        | BabelNodeObjectTypeSpreadProperty
        | BabelNodeOpaqueType
        | BabelNodeQualifiedTypeIdentifier
        | BabelNodeStringLiteralTypeAnnotation
        | BabelNodeStringTypeAnnotation
        | BabelNodeSymbolTypeAnnotation
        | BabelNodeThisTypeAnnotation
        | BabelNodeTupleTypeAnnotation
        | BabelNodeTypeofTypeAnnotation
        | BabelNodeTypeAlias
        | BabelNodeTypeAnnotation
        | BabelNodeTypeCastExpression
        | BabelNodeTypeParameter
        | BabelNodeTypeParameterDeclaration
        | BabelNodeTypeParameterInstantiation
        | BabelNodeUnionTypeAnnotation
        | BabelNodeVariance
        | BabelNodeVoidTypeAnnotation;
    declare type BabelNodeFlowType =
        | BabelNodeAnyTypeAnnotation
        | BabelNodeArrayTypeAnnotation
        | BabelNodeBooleanTypeAnnotation
        | BabelNodeBooleanLiteralTypeAnnotation
        | BabelNodeNullLiteralTypeAnnotation
        | BabelNodeExistsTypeAnnotation
        | BabelNodeFunctionTypeAnnotation
        | BabelNodeGenericTypeAnnotation
        | BabelNodeInterfaceTypeAnnotation
        | BabelNodeIntersectionTypeAnnotation
        | BabelNodeMixedTypeAnnotation
        | BabelNodeEmptyTypeAnnotation
        | BabelNodeNullableTypeAnnotation
        | BabelNodeNumberLiteralTypeAnnotation
        | BabelNodeNumberTypeAnnotation
        | BabelNodeObjectTypeAnnotation
        | BabelNodeStringLiteralTypeAnnotation
        | BabelNodeStringTypeAnnotation
        | BabelNodeSymbolTypeAnnotation
        | BabelNodeThisTypeAnnotation
        | BabelNodeTupleTypeAnnotation
        | BabelNodeTypeofTypeAnnotation
        | BabelNodeUnionTypeAnnotation
        | BabelNodeVoidTypeAnnotation;
    declare type BabelNodeFlowBaseAnnotation =
        | BabelNodeAnyTypeAnnotation
        | BabelNodeBooleanTypeAnnotation
        | BabelNodeNullLiteralTypeAnnotation
        | BabelNodeMixedTypeAnnotation
        | BabelNodeEmptyTypeAnnotation
        | BabelNodeNumberTypeAnnotation
        | BabelNodeStringTypeAnnotation
        | BabelNodeSymbolTypeAnnotation
        | BabelNodeThisTypeAnnotation
        | BabelNodeVoidTypeAnnotation;
    declare type BabelNodeFlowDeclaration =
        | BabelNodeDeclareClass
        | BabelNodeDeclareFunction
        | BabelNodeDeclareInterface
        | BabelNodeDeclareModule
        | BabelNodeDeclareModuleExports
        | BabelNodeDeclareTypeAlias
        | BabelNodeDeclareOpaqueType
        | BabelNodeDeclareVariable
        | BabelNodeDeclareExportDeclaration
        | BabelNodeDeclareExportAllDeclaration
        | BabelNodeInterfaceDeclaration
        | BabelNodeOpaqueType
        | BabelNodeTypeAlias;
    declare type BabelNodeFlowPredicate =
        | BabelNodeDeclaredPredicate
        | BabelNodeInferredPredicate;
    declare type BabelNodeEnumBody =
        | BabelNodeEnumBooleanBody
        | BabelNodeEnumNumberBody
        | BabelNodeEnumStringBody
        | BabelNodeEnumSymbolBody;
    declare type BabelNodeEnumMember =
        | BabelNodeEnumBooleanMember
        | BabelNodeEnumNumberMember
        | BabelNodeEnumStringMember
        | BabelNodeEnumDefaultedMember;
    declare type BabelNodeJSX =
        | BabelNodeJSXAttribute
        | BabelNodeJSXClosingElement
        | BabelNodeJSXElement
        | BabelNodeJSXEmptyExpression
        | BabelNodeJSXExpressionContainer
        | BabelNodeJSXSpreadChild
        | BabelNodeJSXIdentifier
        | BabelNodeJSXMemberExpression
        | BabelNodeJSXNamespacedName
        | BabelNodeJSXOpeningElement
        | BabelNodeJSXSpreadAttribute
        | BabelNodeJSXText
        | BabelNodeJSXFragment
        | BabelNodeJSXOpeningFragment
        | BabelNodeJSXClosingFragment;
    declare type BabelNodePrivate =
        | BabelNodeClassPrivateProperty
        | BabelNodeClassPrivateMethod
        | BabelNodePrivateName;
    declare type BabelNodeTSTypeElement =
        | BabelNodeTSCallSignatureDeclaration
        | BabelNodeTSConstructSignatureDeclaration
        | BabelNodeTSPropertySignature
        | BabelNodeTSMethodSignature
        | BabelNodeTSIndexSignature;
    declare type BabelNodeTSType =
        | BabelNodeTSAnyKeyword
        | BabelNodeTSBooleanKeyword
        | BabelNodeTSBigIntKeyword
        | BabelNodeTSIntrinsicKeyword
        | BabelNodeTSNeverKeyword
        | BabelNodeTSNullKeyword
        | BabelNodeTSNumberKeyword
        | BabelNodeTSObjectKeyword
        | BabelNodeTSStringKeyword
        | BabelNodeTSSymbolKeyword
        | BabelNodeTSUndefinedKeyword
        | BabelNodeTSUnknownKeyword
        | BabelNodeTSVoidKeyword
        | BabelNodeTSThisType
        | BabelNodeTSFunctionType
        | BabelNodeTSConstructorType
        | BabelNodeTSTypeReference
        | BabelNodeTSTypePredicate
        | BabelNodeTSTypeQuery
        | BabelNodeTSTypeLiteral
        | BabelNodeTSArrayType
        | BabelNodeTSTupleType
        | BabelNodeTSOptionalType
        | BabelNodeTSRestType
        | BabelNodeTSUnionType
        | BabelNodeTSIntersectionType
        | BabelNodeTSConditionalType
        | BabelNodeTSInferType
        | BabelNodeTSParenthesizedType
        | BabelNodeTSTypeOperator
        | BabelNodeTSIndexedAccessType
        | BabelNodeTSMappedType
        | BabelNodeTSLiteralType
        | BabelNodeTSExpressionWithTypeArguments
        | BabelNodeTSImportType;
    declare type BabelNodeTSBaseType =
        | BabelNodeTSAnyKeyword
        | BabelNodeTSBooleanKeyword
        | BabelNodeTSBigIntKeyword
        | BabelNodeTSIntrinsicKeyword
        | BabelNodeTSNeverKeyword
        | BabelNodeTSNullKeyword
        | BabelNodeTSNumberKeyword
        | BabelNodeTSObjectKeyword
        | BabelNodeTSStringKeyword
        | BabelNodeTSSymbolKeyword
        | BabelNodeTSUndefinedKeyword
        | BabelNodeTSUnknownKeyword
        | BabelNodeTSVoidKeyword
        | BabelNodeTSThisType
        | BabelNodeTSLiteralType;
}
