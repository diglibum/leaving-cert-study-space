import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'ai-pack', 'leaving-cert-tutor', 'data')

const server = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'error',
})
try {
  const { buildRussianPack, renderPack } = await server.ssrLoadModule('/src/features/aipack/russianPack.ts')
  const files = renderPack(buildRussianPack())
  await mkdir(outDir, { recursive: true })
  for (const [name, text] of Object.entries(files)) {
    await writeFile(join(outDir, name), text)
    console.log(`${name}: ${(text.length / 1024).toFixed(0)} KB`)
  }
} finally {
  await server.close()
}
