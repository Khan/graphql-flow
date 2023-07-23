import * as babelTypes from '@babel/types';
import {ObjectTypeProperty} from '@babel/types';

export const liftLeadingPropertyComments = (property: ObjectTypeProperty): ObjectTypeProperty => {
    return transferLeadingComments(property.value, property);
};

export const maybeAddDescriptionComment = <T extends babelTypes.Node>(description: string | null | undefined, node: T): T => {
    if (description) {
        addCommentAsLineComments(description, node);
    }
    return node;
};

export function addCommentAsLineComments(
    description: string,
    res: babelTypes.Node,
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

export const transferLeadingComments = <T extends babelTypes.Node>(source: babelTypes.Node, dest: T): T => {
    if (source.leadingComments?.length) {
        dest.leadingComments = [
            ...(dest.leadingComments || []),
            ...source.leadingComments,
        ];
        source.leadingComments = [];
    }
    return dest;
};
