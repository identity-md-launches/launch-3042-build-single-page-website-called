// Audit added files without writing the Git index. Scratch/inputs are excluded by
// the assignment; this report records only files eligible for the submission.
import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const LIMIT = 8_388_608;
const output = 'docs/submission-audit.json';
const hash = (data) => createHash('sha256').update(data).digest('hex');
const source = await readFile('index.html');
const built = await readFile('dist/index.html');
assert.equal(hash(source), hash(built), 'Source and export must match');
assert.deepEqual((await readdir('dist')).sort(), ['index.html', 'social-card.png']);
assert.equal(hash(await readFile('assets/social-card.png')), hash(await readFile('dist/social-card.png')));
const paths = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean).filter(p => p !== output);
const files = [];
for (const path of paths) {
  assert.ok(!/(^|\/)(?:node_modules|\.git|\.github|\.cache|\.env(?:\..*)?)(?:\/|$)|\.tgz$|(^|\/)\.gitmodules$/.test(path), `Forbidden or unnecessary submission path: ${path}`);
  assert.ok(!(await lstat(path)).isSymbolicLink(), `Unexpected symlink: ${path}`);
  files.push({ path, bytes: (await stat(path)).size });
}
for (const required of ['index.html','dist/index.html','dist/social-card.png','assets/social-card.png','package.json','package-lock.json','DESIGN.md','README.md','VALIDATION.md']) assert.ok(paths.includes(required), `Required added file is ignored or missing: ${required}`);
const report = {
  date: '2026-11-06', limitBytes: LIMIT,
  note: 'Uncompressed newly added files. The report itself is included in totalAddedBytes; scratch, supplied inputs and existing ignored paths are not submission files.',
  sourceExportIdentical: true, sourceSha256: hash(source), exportFiles: ['index.html','social-card.png'],
  runtimeBytes: built.length + (await stat('dist/social-card.png')).size,
  noDependencyCachesArchivesOrSubmodulesInAddedFiles: true,
  totalAddedBytes: 0, remainingBytes: 0, files
};
const base = files.reduce((sum,file)=>sum+file.bytes,0);
let text = '';
for(let i=0;i<10;i++) {
  const total=base+Buffer.byteLength(text);
  report.totalAddedBytes=total; report.remainingBytes=LIMIT-total;
  const next=JSON.stringify(report,null,2)+'\n';
  if(next===text)break;
  text=next;
}
assert.ok(report.totalAddedBytes<LIMIT, 'Submission exceeds 8 MiB');
await mkdir('docs',{recursive:true});await writeFile(output,text);
console.log(`Submission: ${report.totalAddedBytes.toLocaleString()} / ${LIMIT.toLocaleString()} bytes. Export: ${report.runtimeBytes.toLocaleString()} bytes. Source/export identical.`);
