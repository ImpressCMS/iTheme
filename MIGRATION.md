# Migrating iTheme to the Easel build pipeline

This file is the logbook of the migration of the original iTheme to the build pipeline of
[impresscms-easel](https://github.com/ImpressCMS/impresscms-easel). It is meant as a playbook for the migration of
other classic ImpressCMS themes: every step below is one pull request, in the order in which they were made.

## Starting point

**The theme.** The original iTheme, as it ships with ImpressCMS 1.x and 2.x in `htdocs/themes/iTheme`, by Mr. Theme
Design (ownership was given to the ImpressCMS project, see `README.txt` of the theme). It has no build step:

| Path | Contents |
| --- | --- |
| `theme.html`, `theme_admin.html` | Page layout of the website and of the administration |
| `blockszone.html`, `centerblocks.html`, `centerblocks_admin.html` | Partials that `theme*.html` include with `includeq` |
| `modules/system/system_siteclosed.html` | Template override of the "site closed" page |
| `layout.css`, `blocks.css`, `content.css` | Styles, imported by `style.css` and `style_admin.css` with `@import url()` |
| `style.css`, `style_admin.css` | The stylesheets that the layouts link |
| `rtl/` | Right-to-left versions of the four files that make up `style.css` |
| `img/`, `icons/`, `shot.gif` | Images, favicons and the screenshot of the themes block |

The theme has no JavaScript and no CSS framework.

**The pipeline.** This repository was created from the Easel template: Vite 8 with the `vite-plugin-icms-theme`
plugin (`build/vite-plugin-icms-theme`). The plugin bundles the CSS/JS entries that are listed in `vite.config.js`
with hashed file names, replaces `<!-- vite: <entry> -->` directives in the Smarty templates with the tags of those
bundles, minifies the templates and copies the static files (`img/`, `icons/`, `fonts/`, `language/`, `shot.*`,
`favicon.*`, `*.php`, `*.ini`, `*.txt`). `npm test` runs the unit tests, a WCAG contrast check, a build and a test of
the build output.

## The steps

Every pull request is based on the branch of the previous one, so merge them in order.

| Step | Branch | What |
| --- | --- | --- |
| 1 | `migrate/01-baseline` | Rename the package and start this logbook |
| 2 | `migrate/02-assets` | Move the images, favicons, screenshot and credits into `src/` |
| 3 | `migrate/03-styles` | Move the stylesheets into `src/css/` and make them build entries |

## Step 1: baseline

**Goal:** make the repository identify as iTheme and record where the migration starts.

**What was done**

- `package.json` and `package-lock.json`: `name` changed from `impresscms-easel` to `itheme`. The release workflow
  uses this name for the zip, so it has to be the folder name of the theme.
- `package.json`: `description` changed.
- This file added.

**Why:** the rename is a separate, trivial change, so that the later pull requests only contain theme code.

**Playbook:** set `name` in `package.json` to the folder name of the theme before anything else.

## Step 2: static assets

**Goal:** get the files that need no processing into `src/`, where the plugin copies them to the theme folder.

**What was done**

- `img/*.jpg`, `img/*.gif`, `img/logo.png` of the original theme copied to `src/img/` (7 files).
- `icons/favicon.ico` and `icons/icon.png` copied to `src/icons/`.
- `shot.gif` replaced the placeholder screenshot in `src/shot.gif`.
- `README.txt` (the credits and the transfer of the rights to ImpressCMS) copied to `src/README.txt`, with LF line
  endings like every other file in the repository.

**What was left out:** the `index.html` files in `img/`, `icons/`, `modules/` and `modules/system/` of the original
(`<script>history.go(-1);</script>`). They only keep the folders from being listed by the web server. The plugin
treats every `*.html` as a Smarty template and the build would copy them as such; the same protection belongs in the
web server configuration.

**Result:** `npm test` passes; `dist/` contains `img/`, `icons/`, `shot.gif` and `README.txt`.

**Not yet cleaned up:** the template's `src/img/favicon.svg` and `src/img/logo.svg` stay until step 4, because the
template's own `theme.html` still uses them.

**Playbook:** the plugin's `static` option covers `img/`, `images/`, `icons/`, `fonts/`, `language/`, `shot.*`,
`favicon.*` and `*.txt`. Anything else that has to be copied as it is (other folder names) needs an entry in `static`
in `vite.config.js`. Leave out the directory-guard `index.html` files.

## Step 3: stylesheets

**Goal:** get the CSS of the original theme into `src/css/` and let Vite bundle it.

**What was done**

- `layout.css`, `blocks.css`, `content.css`, `style.css` and `style_admin.css` copied to `src/css/`, and the four
  files of `rtl/` to `src/css/rtl/`. Line endings changed from CRLF to LF (see `.editorconfig`); the content is
  otherwise unchanged.
- The `@import url(layout.css)`, `@import url(blocks.css)` and `@import url(content.css)` lines in `style.css`,
  `style_admin.css` and `rtl/style.css` were kept. Vite follows them and writes one bundle per entry, so the
  browser no longer makes four requests per stylesheet.
- The paths in `url(...)` had to change, because Vite resolves them relative to the CSS file and not relative to the
  folder of the built theme: `url(img/x.jpg)` became `url(../img/x.jpg)` in `src/css/`, and `url(../img/x.gif)`
  became `url(../../img/x.gif)` in `src/css/rtl/`.
- `vite.config.js`: `css/style.css`, `css/style_admin.css` and `css/rtl/style.css` added to `entries`. The three
  stay separate entries because the layout picks one of them: the website, the administration and right-to-left
  languages each have their own stylesheet. `css/rtl/style.css` is not imported by `css/style.css`.

**What the build does with the CSS**

- The images that the CSS refers to are small (all under Vite's `assetsInlineLimit` of 4 kB), so Vite inlines them
  as `data:` URLs. Each bundle therefore contains its own copy. The files are still copied to `img/` as well, because
  `logo.png` is used by the templates.
- The three bundles are named `assets/style-<hash>.css` (twice) and `assets/style_admin-<hash>.css`: two entries
  with the same file name get different hashes, so they do not collide.

**Not yet done:** nothing links the bundles yet. The template's `theme.html` still links `js/theme.js`, which
imports the template's own `theme.css`. They are replaced in step 4, together with the contrast check that reads
that file.

**Result:** `npm test` passes (27 unit tests, contrast check, build, 5 output tests).

**Playbook:** classic themes import their partial stylesheets with `@import`; keep that, add one entry for every
stylesheet that a layout links, and fix every `url()` that is relative to the old folder.
