/**
 *
 * This is the minified string output of transforming workerTimers.worker.ts
 * Once the tsdown docs are complete, we will write a similar plugin as the one below:
 *
 * (this was the previous esbuild plugin we were using)
 * export const WebWorkerMinifyPlugin: Plugin = {
 *  name: 'WebWorkerMinifyPlugin',
 * setup(build) {
 *   build.onLoad({ filter: /\.worker\.ts/ }, async args => {
 *     console.log('aaaaaaaaaaaaa');
 *     const f = await readFile(args.path);
 *     const js = await esbuild.transform(f, { loader: 'ts', minify: true });
 *     return { loader: 'text', contents: js.code };
 *   });
 * },
 * };
 *
 */
export default 'const respond=r=>{self.postMessage(r)},workerToTabIds={};self.addEventListener("message",r=>{const e=r.data;switch(e.type){case"setTimeout":workerToTabIds[e.id]=setTimeout(()=>{respond({id:e.id}),delete workerToTabIds[e.id]},e.ms);break;case"clearTimeout":workerToTabIds[e.id]&&(clearTimeout(workerToTabIds[e.id]),delete workerToTabIds[e.id]);break;case"setInterval":workerToTabIds[e.id]=setInterval(()=>{respond({id:e.id})},e.ms);break;case"clearInterval":workerToTabIds[e.id]&&(clearInterval(workerToTabIds[e.id]),delete workerToTabIds[e.id]);break}});\n';
