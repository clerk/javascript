// @ts-check
/**
 * Mirrors `prepareRouter` + `prepareTheme` from `typedoc-plugin-markdown` `render()` so code outside the
 * markdown render pass can build a `MarkdownThemeContext` (same `partials` as generated pages).
 *
 * Only `member`, `module`, and plugin-registered routers (e.g. `clerk-router`) are supported — matching this repo's
 * TypeDoc config.
 *
 * @see https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/renderer/render.ts
 */
import { MarkdownTheme, MemberRouter, ModuleRouter } from 'typedoc-plugin-markdown';

/**
 * @param {import('typedoc').Renderer} renderer
 * @returns {string}
 */
function getRouterName(renderer) {
  const routerOption = renderer.application.options.getValue('router');
  if (!renderer.application.options.isSet('router')) {
    if (renderer.application.options.isSet('outputFileStrategy')) {
      const outputFileStrategy = renderer.application.options.getValue('outputFileStrategy');
      return outputFileStrategy === 'modules' ? 'module' : 'member';
    }
    return 'member';
  }
  return routerOption;
}

/**
 * TypeDoc types `Renderer['routers']` as private; at runtime plugins register routers on this map (e.g. `clerk-router`).
 *
 * @param {import('typedoc').Renderer} renderer
 * @param {string} routerName
 * @returns {typeof MemberRouter | typeof ModuleRouter | (new (application: import('typedoc').Application) => import('typedoc').Router) | undefined}
 */
function getRouterConstructor(renderer, routerName) {
  if (routerName === 'member') {
    return MemberRouter;
  }
  if (routerName === 'module') {
    return ModuleRouter;
  }
  const routers =
    /** @type {{ routers: Map<string, new (application: import('typedoc').Application) => import('typedoc').Router> }} */ (
      /** @type {unknown} */ (renderer)
    ).routers;
  return routers.get(routerName);
}

/**
 * Same situation as {@link getRouterConstructor}: `themes` is public at runtime but typed private.
 *
 * @param {import('typedoc').Renderer} renderer
 * @returns {Map<string, new (renderer: import('typedoc').Renderer) => import('typedoc').Theme>}
 */
function getThemeRegistry(renderer) {
  return /** @type {{ themes: Map<string, new (renderer: import('typedoc').Renderer) => import('typedoc').Theme> }} */ (
    /** @type {unknown} */ (renderer)
  ).themes;
}

/**
 * @param {import('typedoc').Renderer} renderer
 */
function prepareRouter(renderer) {
  const routerName = getRouterName(renderer);
  const RouterCtor = getRouterConstructor(renderer, routerName);
  if (!RouterCtor) {
    throw new Error(
      `[prepare-markdown-renderer] Router "${routerName}" is not registered (expected member, module, or a custom router from a plugin)`,
    );
  }
  renderer.router = new RouterCtor(renderer.application);
}

/**
 * @param {import('typedoc').Renderer} renderer
 */
function getThemeName(renderer) {
  const themeOption = renderer.application.options.getValue('theme');
  return themeOption === 'default' ? 'markdown' : themeOption;
}

/**
 * @param {import('typedoc').Renderer} renderer
 */
function prepareTheme(renderer) {
  const themes = getThemeRegistry(renderer);
  const themeName = getThemeName(renderer);
  const ThemeCtor = themes.get(themeName);
  if (!ThemeCtor) {
    throw new Error(`[prepare-markdown-renderer] Theme "${themeName}" is not registered`);
  }
  const theme = new ThemeCtor(renderer);
  if (!(theme instanceof MarkdownTheme)) {
    renderer.application.logger.warn(
      `[prepare-markdown-renderer] Theme "${themeName}" is not MarkdownTheme; falling back to built-in markdown theme`,
    );
    renderer.theme = new /** @type {typeof MarkdownTheme} */ (themes.get('markdown'))(renderer);
    return;
  }
  renderer.theme = theme;
}

/**
 * @param {import('typedoc').Application} app
 * @param {import('typedoc').ProjectReflection} project
 */
export function prepareMarkdownRenderer(app, project) {
  prepareRouter(app.renderer);
  prepareTheme(app.renderer);
  // Required so `referenceType` / links can resolve (`getFullUrl`); same as `render()` before each page.
  const router = app.renderer.router;
  if (!router) {
    throw new Error('[prepare-markdown-renderer] Router was not set after prepareRouter');
  }
  router.buildPages(project);
}
