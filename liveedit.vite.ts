import type { Plugin } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as babelParse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

// Handle default export compatibility
const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;

/**
 * Parse TypeScript/JSX source code using Babel parser
 */
function parse(code: string) {
  return babelParse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy']
  });
}

type PatchBody = {
  file: string;   // absolute or relative path to the file on disk
  id: string;     // data-le-id of the JSX element (e.g. "div:12:4")
  prop: string;   // prop name to patch (e.g. "scale", "rotation", "opacity")
  newValue: any;  // new value (number/string/boolean)
};

/**
 * Vite plugin for live-editing React components.
 * Listens for HTTP POST requests to /_liveedit/patch
 * and modifies source code directly when UI controls change.
 */
export function liveEditPlugin(): Plugin {
  return {
    name: 'live-edit-plugin',
    configureServer(server) {
      // Middleware to handle live-edit patch requests
      server.middlewares.use('/_liveedit/patch', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          // Read the request body
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString()) as PatchBody;

          // Resolve file path relative to project root
          const projectRoot = server.config.root;
          const normalizedFile = body.file.replace(/\//g, path.sep);
          const filePath = path.isAbsolute(normalizedFile)
            ? normalizedFile
            : path.resolve(projectRoot, normalizedFile);

          // Read and parse the source code
          const sourceCode = await fs.readFile(filePath, 'utf-8');
          const ast = parse(sourceCode);
          
          // Parse the element ID to extract tag name and position
          // Format: "tagName:line:column" (e.g., "div:30:8")
          const [expectedTag, lineStr, columnStr] = body.id.split(':');
          const targetLine = parseInt(lineStr, 10);
          const targetColumn = parseInt(columnStr, 10);
          
          // Track if we found and modified the target element
          let modified = false;

          traverse(ast, {
            JSXElement(path) {
              const openingElement = path.node.openingElement;
              
              // Check if this element matches the target position
              const loc = openingElement.loc;
              if (!loc) return;
              
              const tagName = t.isJSXIdentifier(openingElement.name) 
                ? openingElement.name.name 
                : null;
              
              // Match by tag name and position
              if (
                tagName === expectedTag && 
                loc.start.line === targetLine && 
                loc.start.column === targetColumn
              ) {
                // Found the target element! Now update the prop
                const propAttr = openingElement.attributes.find(
                  (attr) =>
                    t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === body.prop
                ) as t.JSXAttribute | undefined;

                if (propAttr) {
                  // Update existing prop value
                  propAttr.value = createLiteralNode(body.newValue);
                  modified = true;
                } else {
                  // Prop doesn't exist, add it
                  const newAttr = t.jsxAttribute(
                    t.jsxIdentifier(body.prop),
                    createLiteralNode(body.newValue)
                  );
                  openingElement.attributes.push(newAttr);
                  modified = true;
                }
              }
            }
          });

          if (!modified) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Element not found' }));
            return;
          }

          // Generate updated source code
          const output = generate(ast, {
            retainLines: false,
            compact: false
          }).code;

          // Write back to file
          await fs.writeFile(filePath, output, 'utf-8');

          // Vite's HMR will automatically detect the file change and hot-reload
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));

        } catch (error) {
          console.error('❌ Live Edit Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    }
  };
}

/**
 * Create an appropriate AST node for a value based on its type
 */
function createLiteralNode(value: any): t.JSXExpressionContainer | t.StringLiteral {
  if (typeof value === 'number') {
    return t.jsxExpressionContainer(
      t.numericLiteral(value)
    );
  }
  if (typeof value === 'boolean') {
    return t.jsxExpressionContainer(
      t.booleanLiteral(value)
    );
  }
  // Default to string
  return t.stringLiteral(String(value));
}