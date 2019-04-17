import { declare } from "@babel/helper-plugin-utils";
import syntaxSliceNotation from "@babel/plugin-syntax-slice-notation";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-slice-notation",
    inherits: syntaxSliceNotation,

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

    visitor: {
      memberExpression(path) {
        const { node, scope } = path;
        const { object, property, computed, optional } = node;
        if (computed !== true && !hasLengthProperty(object)) {
          return;
        }

      },
    },
  };
});
