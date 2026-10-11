// Checks the built theme in dist/ (npm run build first; npm test does both).
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')
const dist = path.join(root, 'dist')

const sourceTemplates = fg.sync(['**/*.html', '**/*.tpl'], { cwd: src })
const builtTemplates = fg.sync(['**/*.html', '**/*.tpl'], { cwd: dist })
const read = (file) => readFileSync(path.join(dist, file), 'utf8')

test('dist contains every template', () => {
    assert.ok(existsSync(path.join(dist, 'theme.html')), 'dist/theme.html is missing')
    assert.deepEqual([...builtTemplates].sort(), [...sourceTemplates].sort())
})

test('no vite directive is left in the templates', () => {
    const unresolved = builtTemplates.filter((file) => read(file).includes('<!-- vite:'))

    assert.deepEqual(unresolved, [])
})

test('every file referenced through $icms_imageurl exists', () => {
    const missing = builtTemplates.flatMap((file) =>
        [...read(file).matchAll(/<\{\$icms_imageurl\}>([\w./-]+)/g)]
            .map((match) => match[1])
            .filter((reference) => ! existsSync(path.join(dist, reference)))
            .map((reference) => `${file}: ${reference}`),
    )

    assert.deepEqual(missing, [])
})

test('the theme links the stylesheets of the website and of right-to-left languages', () => {
    const theme = read('theme.html')
    const stylesheet = /<link rel="stylesheet" href="<\{\$icms_imageurl\}>assets\/style-[\w-]+\.css">/g

    assert.equal(theme.match(stylesheet)?.length, 2)
    assert.match(theme, /<\{if \$icms_rtl\}><link rel="stylesheet"/)
    assert.doesNotMatch(theme, /<script type="module"/)
})

test('the screenshot and images are copied and the manifest is removed', () => {
    assert.ok(existsSync(path.join(dist, 'shot.gif')), 'dist/shot.gif is missing')
    assert.ok(fg.sync('img/**', { cwd: dist }).length > 0, 'dist/img is empty')
    assert.equal(existsSync(path.join(dist, '.vite')), false)
})
