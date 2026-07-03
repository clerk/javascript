interface CommandItem {
  title: string;
  hint?: string;
  group: string;
  keywords: string;
  run: () => void;
}

const ROOT_HTML = `
<div
  id="cmdk"
  class="fixed inset-0 z-50 hidden items-start justify-center bg-black/40 px-4 pt-[18vh] backdrop-blur-sm dark:bg-black/60"
  role="dialog"
  aria-modal="true"
  aria-label="Command palette"
>
  <div
    class="border-sidebar-border bg-sidebar text-sidebar-foreground w-full max-w-lg overflow-hidden rounded-lg border shadow-2xl"
  >
    <div class="border-sidebar-border flex items-center gap-2 border-b px-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-sidebar-muted-foreground size-4 shrink-0"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        data-cmdk-input
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="Type a command or search…"
        class="placeholder:text-sidebar-muted-foreground w-full bg-transparent py-3 text-sm outline-none"
      />
      <kbd
        class="border-sidebar-border text-sidebar-muted-foreground hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block"
        >ESC</kbd
      >
    </div>
    <div data-cmdk-list class="max-h-[50vh] overflow-y-auto p-1" role="listbox"></div>
    <div
      class="border-sidebar-border text-sidebar-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-[10px]"
    >
      <span class="flex items-center gap-1"
        ><kbd class="border-sidebar-border rounded border px-1 py-0.5">↑</kbd
        ><kbd class="border-sidebar-border rounded border px-1 py-0.5">↓</kbd> Navigate</span
      >
      <span class="flex items-center gap-1"
        ><kbd class="border-sidebar-border rounded border px-1 py-0.5">↵</kbd> Select</span
      >
      <span class="flex items-center gap-1"
        ><kbd class="border-sidebar-border rounded border px-1 py-0.5">⌘</kbd
        ><kbd class="border-sidebar-border rounded border px-1 py-0.5">K</kbd> Toggle</span
      >
    </div>
  </div>
</div>
`;

function escapeHtml(value: string): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function collectNavItems(): CommandItem[] {
  const items: CommandItem[] = [];
  const links = document.querySelectorAll('[data-sidebar] nav-link');
  links.forEach(el => {
    const href = el.getAttribute('href') ?? '';
    const label = el.getAttribute('label') ?? '';
    const component = el.getAttribute('component') ?? '';
    const group = el.closest('nav-group')?.getAttribute('label') ?? 'Navigate';
    items.push({
      title: label,
      hint: component,
      group,
      keywords: `${label} ${component} ${group} ${href}`.toLowerCase(),
      run: () => {
        window.location.href = href;
      },
    });
  });
  return items;
}

function collectAppearanceItems(): CommandItem[] {
  return [
    {
      title: 'Toggle dark mode',
      group: 'Appearance',
      keywords: 'toggle dark mode theme appearance',
      run: () => {
        const on = document.documentElement.classList.toggle('dark');
        localStorage.setItem('clerk-js-sandbox-dark-mode', on ? 'on' : 'off');
      },
    },
    {
      title: 'Toggle sidebar',
      group: 'Appearance',
      keywords: 'toggle sidebar collapse expand',
      run: () => {
        const collapsed = document.documentElement.hasAttribute('data-sidebar-collapsed');
        if (collapsed) {
          document.documentElement.removeAttribute('data-sidebar-collapsed');
          localStorage.removeItem('clerk-js-sandbox-sidebar-collapsed');
        } else {
          document.documentElement.setAttribute('data-sidebar-collapsed', '');
          localStorage.setItem('clerk-js-sandbox-sidebar-collapsed', '1');
        }
      },
    },
  ];
}

function buildItems(): CommandItem[] {
  return [...collectNavItems(), ...collectAppearanceItems()];
}

export function initCommandPalette(): void {
  const container = document.createElement('div');
  container.innerHTML = ROOT_HTML.trim();
  const root = container.firstElementChild as HTMLElement;
  document.body.appendChild(root);

  const input = root.querySelector<HTMLInputElement>('[data-cmdk-input]')!;
  const list = root.querySelector<HTMLDivElement>('[data-cmdk-list]')!;

  let filtered: CommandItem[] = [];
  let activeIndex = 0;

  function render() {
    const query = input.value.trim().toLowerCase();
    const all = buildItems();
    filtered = query ? all.filter(it => it.keywords.includes(query)) : all;
    activeIndex = filtered.length ? 0 : -1;

    if (!filtered.length) {
      list.innerHTML = '<div class="text-sidebar-muted-foreground px-3 py-6 text-center text-xs">No results</div>';
      return;
    }

    let html = '';
    let currentGroup: string | null = null;
    filtered.forEach((it, idx) => {
      if (it.group !== currentGroup) {
        currentGroup = it.group;
        html += `<div class="text-sidebar-muted-foreground px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide">${escapeHtml(currentGroup)}</div>`;
      }
      const hint = it.hint
        ? `<span class="text-sidebar-muted-foreground group-aria-selected:text-sidebar-accent-foreground/70 max-w-[11rem] shrink truncate font-mono text-[9px]/none" style="font-family: var(--font-mono);">${escapeHtml(it.hint)}</span>`
        : '';
      html += `<button type="button" role="option" data-idx="${idx}" class="cmdk-item group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-selected:bg-sidebar-accent-strong aria-selected:text-sidebar-accent-foreground"><span class="min-w-0 truncate">${escapeHtml(it.title)}</span>${hint}</button>`;
    });
    list.innerHTML = html;
    updateSelection();
  }

  function updateSelection() {
    const nodes = list.querySelectorAll<HTMLElement>('.cmdk-item');
    nodes.forEach((node, idx) => {
      if (idx === activeIndex) {
        node.setAttribute('aria-selected', 'true');
        node.scrollIntoView({ block: 'nearest' });
      } else {
        node.removeAttribute('aria-selected');
      }
    });
  }

  function isOpen() {
    return !root.classList.contains('hidden');
  }

  function open() {
    root.classList.remove('hidden');
    root.classList.add('flex');
    input.value = '';
    render();
    setTimeout(() => input.focus(), 0);
  }

  function close() {
    root.classList.add('hidden');
    root.classList.remove('flex');
  }

  function runActive() {
    const it = filtered[activeIndex];
    if (!it) return;
    close();
    it.run();
  }

  document.addEventListener('keydown', e => {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isOpen()) close();
      else open();
      return;
    }
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length) {
        activeIndex = (activeIndex + 1) % filtered.length;
        updateSelection();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length) {
        activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
        updateSelection();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runActive();
    }
  });

  input.addEventListener('input', render);

  list.addEventListener('click', e => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.cmdk-item');
    if (!target) return;
    activeIndex = parseInt(target.getAttribute('data-idx') ?? '0', 10);
    runActive();
  });

  list.addEventListener('mousemove', e => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.cmdk-item');
    if (!target) return;
    const idx = parseInt(target.getAttribute('data-idx') ?? '0', 10);
    if (idx !== activeIndex) {
      activeIndex = idx;
      updateSelection();
    }
  });

  root.addEventListener('click', e => {
    if (e.target === root) close();
  });
}
