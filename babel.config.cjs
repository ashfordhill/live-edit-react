module.exports = {
  presets: [],
  plugins: [
    function liveEditAnnotate({ types: t }) {
      return {
        visitor: {
          JSXOpeningElement(path, state) {
            const isDev = process.env.NODE_ENV !== 'production';
            if (!isDev) return;

            const filename = state.file?.opts?.filename || 'unknown';
            // Normalize Windows paths to use forward slashes
            const normalizedFilename = filename.replace(/\\/g, '/');
            
            const tagName = path.node.name;
            const nameStr = t.isJSXIdentifier(tagName) ? tagName.name : null;
            if (!nameStr) return;

            // Inject an id (tagName:line:column) and file pointer
            const start = path.node.loc?.start || { line: 0, column: 0 };
            const id = `${nameStr}:${start.line}:${start.column}`;

            const hasId = path.node.attributes.some(
              (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name, { name: "data-le-id" })
            );
            if (!hasId) {
              path.node.attributes.push(
                t.jsxAttribute(t.jsxIdentifier("data-le-id"), t.stringLiteral(id))
              );
            }

            const hasFile = path.node.attributes.some(
              (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name, { name: "data-le-file" })
            );
            if (!hasFile) {
              path.node.attributes.push(
                t.jsxAttribute(t.jsxIdentifier("data-le-file"), t.stringLiteral(normalizedFilename))
              );
            }
          }
        }
      };
    }
  ]
};
