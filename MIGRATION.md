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

| Step | Branch | What | Pull request |
| --- | --- | --- | --- |
| 1 | `migrate/01-baseline` | Rename the package and start this logbook | [#2](https://github.com/ImpressCMS/iTheme/pull/2) |
| 2 | `migrate/02-assets` | Move the images, favicons, screenshot and credits into `src/` | [#3](https://github.com/ImpressCMS/iTheme/pull/3) |
| 3 | `migrate/03-styles` | Move the stylesheets into `src/css/` and make them build entries | [#4](https://github.com/ImpressCMS/iTheme/pull/4) |
| 4 | `migrate/04-front-end-layout` | Port `theme.html` and the block zone partials, link the bundles, replace the template skeleton | [#5](https://github.com/ImpressCMS/iTheme/pull/5) |
| 5 | `migrate/05-admin-and-site-closed` | Port `theme_admin.html`, its partial and the site closed template | [#6](https://github.com/ImpressCMS/iTheme/pull/6) |
| 6 | `migrate/06-docs` | Rewrite the README, finish this logbook | [#7](https://github.com/ImpressCMS/iTheme/pull/7) |
| 7 | `migrate/07-verification` | Install on a test site, compare with the original, log the findings | [#8](https://github.com/ImpressCMS/iTheme/pull/8) |
| 8 | `migrate/08-small-fixes` | Add `lang` to `<html>`, list the core findings in `axeKnown` | this pull request |

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

## Step 4: the layout of the website

**Goal:** the original `theme.html` and its partials run on the pipeline, and the skeleton of the Easel template is
gone.

**What was done**

- `theme.html` of the original copied to `src/theme.html` (LF line endings). The markup is unchanged, including the
  XHTML 1.1 doctype and the `THEME_*` language constants of the header menu. Two things changed:
  - The stylesheet link, `<link ... href="<{$icms_imageurl}><{if $icms_rtl}>rtl/<{/if}>style.css" />`, became
    `<{if $icms_rtl}><!-- vite: css/rtl/style.css --><{else}><!-- vite: css/style.css --><{/if}>`. The plugin
    replaces each directive with the `<link>` of the hashed bundle, so the template links one of two bundles, just as
    the original chose between `style.css` and `rtl/style.css`.
  - The `includeq` paths. The partials moved from the theme root to `templates/` and got the `.html.tpl` extension
    of the Easel conventions: `$theme_name/blockszone.html` became `$theme_name/templates/blockszone.html.tpl`, and
    the same for `centerblocks.html`. The build does not touch `include`/`includeq` paths, so these have to match the
    location in `dist/` exactly.
- `blockszone.html` and `centerblocks.html` copied to `src/templates/blockszone.html.tpl` and
  `src/templates/centerblocks.html.tpl`, content unchanged.
- Removed the skeleton of the Easel template, which the original theme replaces: `src/templates/header.html.tpl`,
  `footer.html.tpl` and the skeleton's `blockszone.html.tpl`, `src/css/theme.css`, `src/js/theme.js`,
  `src/img/favicon.svg`, `src/img/logo.svg` and the static mockup `src/index.html`. The original draws its header and
  footer inside `theme.html` and has no JavaScript, so there is no `js/` entry: the template's `<script>` tag is
  gone from `theme.html`.
- `vite.config.js`: removed the `js/theme.js` entry and the `exclude` for the mockup.
- `tests/dist.test.mjs`: the test that expected a script bundle now expects the two stylesheet links of the
  website (one for right-to-left languages, one for the others) and no script. The mockup is no longer ignored.
- `tests/contrast.config.mjs`: see below.

**Contrast**

The Easel contrast check reads the palette from custom properties in one stylesheet. The original iTheme has literal
colours, so the pairs are literal colours of `src/css/style.css`. Five of the eight pairs do not reach WCAG 2.1 AA
(4.5:1 for text): links on hover (`#8e8e8e` on white, 3.28), the header menu (`#666` on `#8bbcdd`, 2.83, and `#fff`
on hover, 2.03), the footer text (`#666` on `#59b9e4`, 2.59) and the footer links on hover (`#fff`, 2.21). The
migration keeps the original design, so these five are marked `informational`: they are printed by
`npm run check:contrast`, but do not fail the build. Fixing the colours is a design change and not part of this
migration.

**Not done**

- `npm run dev` has no mockup to show any more (the original has none). The theme can only be tried in an
  ImpressCMS site, see `ICMS_THEME_OUT_DIR` in the README.
- The page tests (`npm run test:pages`) were not run: they need a running site. They also expect a skip link as the
  first focusable element, which the original theme does not have.
- The administration layout and the "site closed" page are still missing: step 5.

**Result:** `npm test` passes. `dist/theme.html` links `assets/style-<hash>.css` for left-to-right and
`assets/style-<other hash>.css` for right-to-left languages.

**Playbook**

1. Replace the template's skeleton, do not merge into it.
2. Put every partial that `include`/`includeq` loads in `src/templates/` with the extension `.html.tpl` and update
   the paths; they are the only paths the build does not rewrite.
3. Replace the stylesheet `<link>` with a `<!-- vite: ... -->` directive, one per entry, inside the same
   `{if}` as before.
4. Check the pairs in `tests/contrast.config.mjs` against the real colours of the theme.

## Step 5: the administration and the "site closed" page

**Goal:** the remaining three templates of the original run on the pipeline.

**What was done**

- `theme_admin.html` copied to `src/theme_admin.html`. Changed, as in step 4:
  - the theme stylesheet link became `<!-- vite: css/style_admin.css -->`;
  - the `includeq` paths became `$theme_name/templates/blockszone.html.tpl` and
    `$theme_name/templates/centerblocks_admin.html.tpl`.
- `centerblocks_admin.html` copied to `src/templates/centerblocks_admin.html.tpl`, unchanged.
- `modules/system/system_siteclosed.html` copied to `src/modules/system/system_siteclosed.html`. Its theme
  stylesheet `<link href="<{$icms_themecss}>">` became `<!-- vite: css/style.css -->`. The core fills `icms_themecss`
  with the URL of `style.css` in the theme folder (`xoops_getcss()`), and that file does not exist any more: the
  stylesheet is now a hashed bundle in `assets/`. The core does assign `icms_imageurl` on this page
  (`htdocs/include/site-closed.php`), so the URL prefix that the plugin writes resolves. The `$icms_style` link of the
  core and the rest of the template (it still uses the `xoops_*` variables) are unchanged.

**Things in the original that were kept, or that did not work there either**

- The core stylesheet `modules/system/style[_rtl].css` is still linked from `theme_admin.html`, before the theme
  stylesheet. It belongs to the system module and is not part of the theme.
- The original linked `rtl/style_admin.css` for right-to-left languages, but the `rtl/` folder of the original has no
  such file: the administration of a right-to-left language had no theme stylesheet. The migrated template links
  `css/style_admin.css` for every language. That is a fix and not a faithful copy, but a link that returns a 404
  cannot be intended. A real right-to-left administration stylesheet is still to be written.
- `theme_admin.html` starts with a `<{php}>` block that moves a redirect message from the session to a template
  variable. The template minifier only joins its lines; the PHP is unchanged. `<{php}>` is not available in Smarty 3
  and later, so this depends on the Smarty version of the ImpressCMS release.
- `<{ if $modname != '' }>` (with spaces inside the delimiters) is kept as it was and is preserved by the minifier.

**Result:** `npm test` passes; the build writes six templates (`theme.html`, `theme_admin.html`, two zone partials,
the admin partial and the site closed template). No template is copied unminified (no warnings in the build).

**Not verified:** none of the templates were rendered by ImpressCMS in this migration, only built and checked by the
output test. Step 6 lists what has to be checked on a running site.

**Playbook:** every template that links the theme stylesheet through a variable of the core
(`$icms_themecss`) has to link the hashed bundle with a directive instead, in the theme layouts and in the module
overrides. Search the templates for `style.css`, `themecss` and `imageurl` before and after the migration.

## Step 6: documentation and wrap-up

**What was done**

- `README.md` rewritten for iTheme: what it is, how to install, build and check it. The text of the Easel template
  (use this template, adding a framework, the skeleton, the admin theme how-to) was removed because it does not apply
  to this repository; it remains in the Easel repository. The header banner `easel-github-header-banner.png` was
  removed with it, and the badges point to this repository.
- This logbook completed with the overview below.

### Where every file of the original went

| Original (`htdocs/themes/iTheme`) | Here | Built to |
| --- | --- | --- |
| `theme.html` | `src/theme.html` | `theme.html` |
| `theme_admin.html` | `src/theme_admin.html` | `theme_admin.html` |
| `blockszone.html`, `centerblocks.html`, `centerblocks_admin.html` | `src/templates/*.html.tpl` | `templates/*.html.tpl` |
| `modules/system/system_siteclosed.html` | `src/modules/system/system_siteclosed.html` | `modules/system/system_siteclosed.html` |
| `layout.css`, `blocks.css`, `content.css`, `style.css` | `src/css/` | `assets/style-<hash>.css` |
| `style_admin.css` (and its imports) | `src/css/style_admin.css` | `assets/style_admin-<hash>.css` |
| `rtl/*.css` | `src/css/rtl/` | `assets/style-<hash>.css` (the second one) |
| `img/*`, `icons/*`, `shot.gif`, `README.txt` | `src/img/`, `src/icons/`, `src/shot.gif`, `src/README.txt` | same paths |
| `index.html` in every folder | not migrated | none |

### Contrast

See step 4. Five colour pairs of the original design are below WCAG 2.1 AA. They are informational in
`tests/contrast.config.mjs`; remove `informational` from a pair once its colour is fixed.

### Still to do

These are things that this migration did not do or could not check.

1. **Check the rest on a running site.** The website was checked in step 7. The administration, the "site closed"
   page, a right-to-left language and centre blocks were not; see "Not checked" in step 7.
2. **Check the Smarty version.** `theme_admin.html` uses `<{php}>`.
3. **License.** `LICENSE` is the MIT license of the Easel template. `src/README.txt` says that the theme adopts the
   license of the ImpressCMS project. Decide which one applies to this repository.
4. **Right-to-left administration.** There never was a stylesheet for it, see step 5.
5. **The contrast findings** and the missing skip link, which the page tests expect.
6. **Duplication in `rtl/`.** The four right-to-left stylesheets are full copies of the left-to-right ones with a few
   properties swapped. Logical properties (`margin-inline-start`) would remove the copies, but that is a rewrite of
   the CSS.
7. **Inlined images.** Vite inlines the background images in each bundle; the files in `img/` are copied as well. The
   duplicates can be removed once nothing but the CSS uses them.

### Summary playbook for another classic theme

1. Create the repository from the Easel template; set `name` in `package.json`. (step 1)
2. Copy the static files; leave out the directory-guard `index.html` files. (step 2)
3. Copy the stylesheets and add each one that a layout links to `entries`; fix the `url()` paths. (step 3)
4. Copy the layout and the partials, put the partials in `src/templates/*.html.tpl`, replace the stylesheet links
   with directives and fix the `includeq` paths; remove the skeleton of the template; adapt the contrast pairs and the
   output test. (step 4)
5. Do the same for the administration layout and every module override that links the theme stylesheet. (step 5)
6. Build, install on a site, compare with the original. (step 6)

## Step 7: verification on a test site

**Goal:** see the built theme in a running ImpressCMS and compare it with the original.

**Setup (2026-10-11)**

- The theme was built straight into the themes folder of a local test site:
  `ICMS_THEME_OUT_DIR=<site>/themes/iTheme npm run build`. The site already had `iTheme` as its active theme and a copy
  of the original theme next to it (`iTheme-original`).
- The site was not changed: no settings, no login.

**What was checked and the result**

| Check | Result |
| --- | --- |
| The website loads the new theme | Yes: `theme.html` links `themes/iTheme/assets/style-<hash>.css`, the page looks like the original |
| Computed styles and position of all 132 elements of the home page, new CSS against the original `style.css` | No differences, except `background-position` `0px` against `0%`, which is the same value written differently (the CSS minifier rewrites `top right`) |
| The same comparison for the right-to-left bundle against `rtl/style.css` and for the administration bundle against `style_admin.css` | No differences (same exception). This compares the CSS on the home page, not a right-to-left or administration page |
| `img/` (6 files), `icons/` (2 files) and `shot.gif` | All served (HTTP 200); the logo and the favicons are the ones linked in the page |
| Console | No errors |

The comparison swaps the stylesheet of the page for the original one in the browser and compares `getComputedStyle()`
and `getBoundingClientRect()` of every element. It proves that the bundling, the `@import` handling and the `url()`
paths did not change the CSS. It does not compare the templates, because the original theme could not be selected on
the test site (only one theme is allowed).

**Page tests** (`npm run test:pages`, Edge: `ICMS_TEST_BROWSER=msedge`, against `/`, `/user.php` and `/search.php`):
12 of 19 pass. The seven that fail are properties of the original design, not of the migration:

| Finding | Where | Cause |
| --- | --- | --- |
| No skip link | all pages | The original has none |
| Page scrolls horizontally at 375 px: 5 px (home), 80 px (login), 205 px (search) | all pages, only at 375 px | The layout has fixed widths and is not responsive |
| axe `html-has-lang` (serious) | all pages | `theme.html` sets `xml:lang` but not `lang` on `<html>` |
| axe `label` (critical) | login block, search block | Fields without a label; the markup comes from the blocks of the core |
| axe `select-name` (critical) | search page | `#andor` has no accessible name; core markup |
| axe `color-contrast` (serious) | header menu links, 375 px | The known contrast pairs of step 4 |

The `label` and `select-name` findings come from block and module templates of the core. According to the README
they belong in `axeKnown` in `tests/pages/config.mjs` with a reason, or in a template override. `html-has-lang` is in
`theme.html` and is a one-attribute fix.

**Not checked**

- The administration (`theme_admin.html`, including the `<{php}>` block and the `centerblocks_admin` partial).
  Logging in was out of scope.
- The "site closed" page, including the change from `$icms_themecss` to the bundle directive (step 5). It can only
  be seen with the site closed.
- A real right-to-left language.
- Pages with blocks in the centre zones (`centerblocks.html.tpl`); the test site had none.
- The template output of the original theme next to the new one (see above).

**Playbook**

1. Build into the themes folder of a test site with `ICMS_THEME_OUT_DIR`; it does not empty the folder.
2. Keep the original theme next to it, so the stylesheet of the page can be swapped and the computed styles compared.
   This is quick and finds every path and import error.
3. Run the page tests before the migration on the original, so that findings of the design are separated from
   findings of the migration. This run was done only after it, so the claim "these are in the original" rests on the
   markup and the CSS, not on a baseline run.
4. Chrome is not installed everywhere; Edge works (`ICMS_TEST_BROWSER=msedge`).

## Step 8: small fixes after the verification

**Goal:** remove the findings of step 7 that have a small, safe fix or that do not belong to the theme.

**What was done**

- `src/theme.html` and `src/theme_admin.html`: `lang="<{$icms_langcode}>"` added to `<html>`, next to the existing
  `xml:lang`. This is the markup for XHTML 1.x documents served as HTML, and it fixes the axe rule `html-has-lang`.
  Nothing else in the templates changed.
- `tests/pages/config.mjs`: `axeKnown` lists the findings that come from the core and not from the theme, each with a
  reason: unlabelled fields of the login block, the search block and the lost password form (`label`), and the
  `#andor` select of the search form (`select-name`). Each entry matches the start of the HTML of the node, so a
  new unlabelled field in the theme itself is still reported.

**Result on the test site** (same pages and browser as step 7): the axe findings `html-has-lang`, `label` and
`select-name` are gone. The page tests still fail on three things, all of them design properties of the original,
which this migration keeps:

| Finding | Pages |
| --- | --- |
| Page scrolls horizontally at 375 px | all three |
| axe `color-contrast` at 375 px (header menu links) | all three |
| No skip link | the navigation test |

12 of 19 tests pass, as before: the count did not change because each axe test also contained the contrast finding.
`npm test` passes.

**Not fixed on purpose:** the contrast, the fixed layout and the missing skip link. Each is a design change (colours,
a responsive layout, new markup and CSS) and is a separate piece of work.

**Playbook:** classify every page test finding as "theme", "core" or "design of the original". Fix the theme ones,
list the core ones in `axeKnown` with a reason, and write the design ones down, as was done here.
