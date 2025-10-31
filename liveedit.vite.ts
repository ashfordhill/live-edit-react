import type { Plugin, ViteDevServer } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

type ConfigPatchBody = {
  leId: string;
  prop: string;
  newValue: any;
};

export function liveEditPlugin(): Plugin {
  let server: ViteDevServer;
  const configPath = '.liveedit.config.json';
  let writePromise = Promise.resolve();

  return {
    name: 'live-edit-plugin',
    configureServer(_server) {
      server = _server;

      server.middlewares.use('/_liveedit/config', async (req, res) => {
        if (req.method !== 'PATCH') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString()) as ConfigPatchBody;

          const projectRoot = server.config.root;
          const fullConfigPath = path.resolve(projectRoot, configPath);

          writePromise = writePromise.then(async () => {
            const configContent = await fs.readFile(fullConfigPath, 'utf-8');
            const config = JSON.parse(configContent);

            if (!config.components[body.leId]) {
              throw new Error(`Component not found: ${body.leId}`);
            }

            config.components[body.leId].props[body.prop] = body.newValue;

            const jsonStr = JSON.stringify(config, null, 2);
            
            try {
              JSON.parse(jsonStr);
            } catch (e) {
              throw new Error(`Invalid JSON generated: ${e}`);
            }

            await fs.writeFile(fullConfigPath, jsonStr, 'utf-8');

            server.ws.send({
              type: 'custom',
              event: 'liveedit:config-update',
              data: { config },
            });
          });

          await writePromise;

          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          console.error('❌ Live Edit Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}