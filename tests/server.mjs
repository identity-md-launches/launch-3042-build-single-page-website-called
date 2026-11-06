import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
export async function startServer() {
  const root=resolve('dist');
  const server=createServer(async(req,res)=>{
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/preview\//,'/');
      const file=resolve(root,'.'+pathname,pathname.endsWith('/')?'index.html':'');
      if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
      res.setHeader('Content-Type',extname(file)==='.html'?'text/html; charset=utf-8':'image/png');
      res.end(await readFile(file));
    } catch {res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {url:`http://127.0.0.1:${server.address().port}/preview/`,close:()=>new Promise(resolve=>server.close(resolve))};
}
