// @flow

import * as babelTypes from '@babel/types';
import {BabelNodeObjectTypeProperty} from '@babel/types';

export const liftLeadingPropertyComments = (
    property: BabelNodeObjectTypeProperty,
): BabelNodeObjectTypeProperty => {
    return transferLeadingComments(property.value, property);
};

export const maybeAddDescriptionComment = <T: babelTypes.BabelNode>(
    description: ?string,
    node: T,
): T => {
    if (description) {
        addCommentAsLineComments(description, node);
    }
    return node;
};

export function addCommentAsLineComments(
    description: string,
    res: babelTypes.BabelNode,
) {
    if (res.leadingComments?.length) {
        res.leadingComments[0].value += '\n\n---\n\n' + description;
    } else {
        babelTypes.addComment(
            res,
            'leading',
            '* ' + description,
            false, // this specifies that it's a block comment, not a line comment
        );
    }
}

export const transferLeadingComments = <T: babelTypes.BabelNode>(
    source: babelTypes.BabelNode,
    dest: T,
): T => {
    if (source.leadingComments?.length) {
        dest.leadingComments = [
            ...(dest.leadingComments || []),
            ...source.leadingComments,
        ];
        source.leadingComments = [];
    }
    return dest;
};
