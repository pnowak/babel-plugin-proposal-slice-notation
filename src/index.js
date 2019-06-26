import { declare } from "@babel/helper-plugin-utils";
import syntaxSliceNotation from "@babel/plugin-syntax-slice-notation";
import { template, types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  const hasLengthProperty = object => {
    if (typeof object === 'string') {
      object = Object(object);
    }

    if ('length' in object) {
      return true;

    } else {
      return false;
    }
  }

  const setValue = (expression, bound, defaultValue) => {
    if (t.isNumericLiteral(expression)) {
      bound = expression.value;

    } else if (t.isUnaryExpression(expression) && t.isUnaryExpression({ operator: "-" })) {
      if (expression !== thirdExpression) {
        bound = Math.max((expression.argument.value + defaultValue), 0);

      } else {
        isNegativeStep = true;
        bound = expression.argument.value;
      }

    } else {
      bound = defaultValue;
    }
  }

  const buildSliceFunction = template.ast(`
    function slice(start, end, step) {
      const a = [];

      for (let index = start; index < end; index += step) {
        if (arr[index]) {
          a.push(arr[index]);
        }
      }

      return typeof arr === 'string' ? a.join('') : a;
    }
  `);

  const buildSliceFunctionWithNegativeStep = template.ast(`
    function slice(start, end, step) {
      const a = [];

      for (let index = end; index > start; index -= step) {
        if (arr[index]) {
          a.push(arr[index]);
        }
      }

      return typeof arr === 'string' ? a.join('') : a;
    }
  `);

  return {
    name: "proposal-slice-notation",
    inherits: syntaxSliceNotation,

    visitor: {
      memberExpression(path) {
        const { node, scope } = path;
        const { object, property, computed } = node;
        let isNegativeStep;

        if (computed !== true && !hasLengthProperty(object)) {
          return;
        }

        const DEFAULT_START = 0;
        const DEFAULT_END = object.length;
        const DEFAULT_STEP = 1;
        let start;
        let end;
        let step;

        if (t.isNumericLiteral(property)) {
          start = property.value || DEFAULT_START;
          end = DEFAULT_END;
          step = DEFAULT_STEP;

        } else if (t.isSequenceExpression(property)) {
          const firstExpression = property[0];
          const secondExpression = property[1];
          const thirdExpression = property[2];

          setValue(firstExpression, start, DEFAULT_START);
          setValue(secondExpression, end, DEFAULT_END);
          setValue(thirdExpression, step, DEFAULT_STEP);
        }

        if (isNegativeStep) {
          path.replaceWith(
            t.callExpression(buildSliceFunctionWithNegativeStep, [
              t.numericLiteral(start),
              t.numericLiteral(end),
              t.numericLiteral(step)
            ]);
          );

        } else {
          path.replaceWith(
            t.callExpression(buildSliceFunction, [
              t.numericLiteral(start),
              t.numericLiteral(end),
              t.numericLiteral(step)
            ]);
          );
        }
      }
    }
  };
});
