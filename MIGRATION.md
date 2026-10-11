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

## Step 1: baseline

**Goal:** make the repository identify as iTheme and record where the migration starts.

**What was done**

- `package.json` and `package-lock.json`: `name` changed from `impresscms-easel` to `itheme`. The release workflow
  uses this name for the zip, so it has to be the folder name of the theme.
- `package.json`: `description` changed.
- This file added.

**Why:** the rename is a separate, trivial change, so that the later pull requests only contain theme code.

**Playbook:** set `name` in `package.json` to the folder name of the theme before anything else.
