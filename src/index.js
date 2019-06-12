import { declare } from "@babel/helper-plugin-utils";
import syntaxSliceNotation from "@babel/plugin-syntax-slice-notation";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  function hasLengthProperty(object) {
    if (typeof object === 'string') {
      object = Object(object);
    }

    if ('length' in object) {
      return true;

    } else {
      return false;
    }
  }

  function slice(start = 0, end = object.length, step = 1) {
    const a = [];

    for (let index = start; index < end; index += step) {
      if (object[index]) {
        a.push(object[index]);
      }
    }

    return typeof object === 'string' ? a.join('') : a;
  }

  return {
    name: "proposal-slice-notation",
    inherits: syntaxSliceNotation,

    visitor: {
      memberExpression(path) {
        const { node, scope } = path;
        const { object, property, computed } = node;

        if (computed !== true && !hasLengthProperty(object)) {
          return;
        }

        const DEFAULT_START = 0;
        const DEFAULT_END = object.length;
        const DEFAULT_STEP = 1;
        let start;
        let end;
        let step;

        if (t.numericLiteral(property)) {
          start = property.value || DEFAULT_START;
          end = DEFAULT_END;
          step = DEFAULT_STEP;

        } else if (t.sequenceExpression(property)) {
          const firstExpression = property[0];
          const secondExpression = property[1];
          const thirdExpression = property[2];

          if (t.numericLiteral(firstExpression)) {
            start = firstExpression.value;

          } else if (t.unaryExpression(firstExpression) && t.isUnaryExpression({ operator: "-" })) {
            start = Math.max((firstExpression.argument.value + DEFAULT_START), 0);

          } else {
            start = DEFAULT_START;
          }

          if (t.numericLiteral(secondExpression)) {
            end = secondExpression.value;

          } else if (t.unaryExpression(secondExpression) && t.isUnaryExpression({ operator: "-" })) {
            end = Math.max((secondExpression.argument.value + DEFAULT_END), 0);

          } else {
            end = DEFAULT_END;
          }

          if (t.numericLiteral(thirdExpression)) {
            step = secondExpression.value;

          } else if (t.unaryExpression(secondExpression) && t.isUnaryExpression({ operator: "-" })) {
            //HOW TRAVERSE OBJECT IN REVERSE??

          } else {
            step = DEFAULT_STEP;
          }
        }

        path.replaceWith(
          t.forStatement(
            t.variableDeclaration("let", start),
            t.binaryExpression(
              "<",
              t.cloneNode(start),
              t.cloneNode(end),
            ),
            t.updateExpression("++", t.cloneNode(step)),
            block,
          ),
        );
      },
    },
  };
});
