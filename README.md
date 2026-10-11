# iTheme

[![CI](https://github.com/ImpressCMS/iTheme/actions/workflows/ci.yml/badge.svg)](https://github.com/ImpressCMS/iTheme/actions/workflows/ci.yml)
[![ImpressCMS](https://img.shields.io/badge/ImpressCMS-theme-blue.svg)](https://www.impresscms.org/)

The original iTheme of ImpressCMS, designed by [Mr. Theme Design](http://www.mrtheme.com), built with the pipeline of
[ImpressCMS Easel](https://github.com/ImpressCMS/impresscms-easel). The theme looks and works as it did in
ImpressCMS 1.x and 2.x; what changed is how it is made: the sources are in `src/`, Vite bundles and minifies the
stylesheets, and `npm run build` writes the installable theme to `dist/`.

The credits and the transfer of the rights to ImpressCMS are in [src/README.txt](src/README.txt). How the theme was
moved to the pipeline, step by step, is in [MIGRATION.md](MIGRATION.md).

## Install

Download the zip of the latest release and unpack it in `htdocs/themes/`, or build the theme yourself (below) and
copy the contents of `dist/` to `htdocs/themes/iTheme`. Select the theme in the ImpressCMS preferences.

## Development

Node.js 20.19+ or 22.12+ is required.

```bash
npm install
npm run build            # the installable theme in dist/
npm run watch            # rebuild on every change
npm test                 # unit tests, contrast check, build and build output test
```

To build straight into a local ImpressCMS installation and rebuild on every change:

```bash
ICMS_THEME_OUT_DIR=/path/to/htdocs/themes/iTheme npm run watch
```

Smarty keeps compiled copies of the templates in `templates_c/`. Remove the ones that belong to the theme after
changing a template.

| Path | Contents |
| --- | --- |
| `src/theme.html`, `src/theme_admin.html` | The layout of the website and of the administration |
| `src/templates/` | Partials that the layouts include: the block zones of the side columns and of the page |
| `src/modules/system/` | Template override of the "site closed" page |
| `src/css/` | `layout.css`, `blocks.css` and `content.css`, imported by `style.css` (website) and `style_admin.css`; `rtl/` for right-to-left languages |
| `src/img/`, `src/icons/`, `src/shot.gif` | Static files, copied as they are |
| `build/vite-plugin-icms-theme/` | The Vite plugin that builds the theme, see its [README](build/vite-plugin-icms-theme/README.md) |
| `tests/` | Build output test and page tests |

A template links a stylesheet with an HTML comment. The build replaces it with the `<link>` of the hashed bundle:

```html
<!-- vite: css/style.css -->
```

Every stylesheet that a template links is an entry in `vite.config.js`. The paths of `include` and `includeq` are not
touched by the build, so they have to point to the file in `dist/`, e.g. `$theme_name/templates/blockszone.html.tpl`.

## Checks

`npm run check:contrast` prints the WCAG contrast of the colour pairs in `tests/contrast.config.mjs`. Some pairs of
the original design are below the minimum; they are reported but do not fail the check, see
[MIGRATION.md](MIGRATION.md#contrast).

`npm run test:pages` opens the pages in `tests/pages/config.mjs` in a real browser on a site that runs the built
theme and checks them with axe-core. It needs a running site (`ICMS_TEST_URL`) and Chrome or Edge
(`ICMS_TEST_BROWSER=msedge`). The test that expects a skip link as the first focusable element fails for this theme,
because the original has none.

## GitHub workflows

| Workflow | When | What |
| --- | --- | --- |
| `ci.yml` | Push to `main`, pull requests | `npm test` on Node 22 and 24, the built theme as an artifact |
| `release.yml` | A release is created | `npm test`, then a zip with the theme folder is attached to the release |
| `conventional-commits.yml` | Pull requests | Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) |

## License

See [LICENSE](LICENSE) and [src/README.txt](src/README.txt).

---

iTheme is maintained by the [ImpressCMS Project](https://github.com/ImpressCMS).
For documentation and community support, visit [impresscms.org](https://www.impresscms.org/).
