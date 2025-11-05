import type { Plugin, ViteDevServer } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

type ConfigPatchBody = {
  leId: string;
  prop: string;
  newValue: any;
};

type ConfigBatchBody = {
  leId: string;
  updates: Record<string, any>;
};

type ResetConfigBody = {
  action: 'reset-config';
  config: any;
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
            console.log(`✅ Updated ${body.leId}.${body.prop} in config file`);

            server.ws.send({
              type: 'custom',
              event: 'liveedit:config-update',
              data: { config },
            });
            console.log('📡 Sent HMR config update to client');
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

      server.middlewares.use('/_liveedit/config-batch', async (req, res) => {
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
          const body = JSON.parse(Buffer.concat(chunks).toString()) as ConfigBatchBody;

          const projectRoot = server.config.root;
          const fullConfigPath = path.resolve(projectRoot, configPath);

          writePromise = writePromise.then(async () => {
            const configContent = await fs.readFile(fullConfigPath, 'utf-8');
            const config = JSON.parse(configContent);

            if (!config.components[body.leId]) {
              throw new Error(`Component not found: ${body.leId}`);
            }

            const props = config.components[body.leId].props;
            
            for (const [key, value] of Object.entries(body.updates)) {
              if (key === 'rows' || key === 'cols') {
                const numValue = typeof value === 'number' ? value : parseInt(value, 10);
                props[key] = Math.max(1, Math.min(20, numValue));
              } else if (key === 'gap') {
                const numValue = typeof value === 'number' ? value : parseInt(value, 10);
                props[key] = Math.max(0, Math.min(50, numValue));
              } else {
                props[key] = value;
              }
            }

            const jsonStr = JSON.stringify(config, null, 2);
            
            try {
              JSON.parse(jsonStr);
            } catch (e) {
              throw new Error(`Invalid JSON generated: ${e}`);
            }

            await fs.writeFile(fullConfigPath, jsonStr, 'utf-8');
            console.log(`✅ Batch updated ${body.leId} with ${Object.keys(body.updates).join(', ')}`);

            server.ws.send({
              type: 'custom',
              event: 'liveedit:config-update',
              data: { config },
            });
            console.log('📡 Sent HMR config update to client');
          });

          await writePromise;

          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          console.error('❌ Live Edit Batch Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });

      server.middlewares.use('/_liveedit/patch', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString());

          // Handle reset-config action
          if (body.action === 'reset-config') {
            const projectRoot = server.config.root;
            const fullConfigPath = path.resolve(projectRoot, configPath);

            writePromise = writePromise.then(async () => {
              const jsonStr = JSON.stringify(body.config, null, 2);
              
              try {
                JSON.parse(jsonStr);
              } catch (e) {
                throw new Error(`Invalid JSON provided: ${e}`);
              }

              await fs.writeFile(fullConfigPath, jsonStr, 'utf-8');
              console.log('✅ Configuration reset to default');

              server.ws.send({
                type: 'custom',
                event: 'liveedit:config-update',
                data: { config: body.config },
              });
            });

            await writePromise;

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Unknown action' }));
          }
        } catch (error) {
          console.error('❌ Live Edit Patch Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}
