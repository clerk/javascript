<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_tailwindcss_transformer" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/tailwindcss-transformer

> [!WARNING]  
> This is an experimental package and breaking changes may occur regularly. Usage at your own risk!

Input:

```jsx
export function Example({ flag }) {
  let className = cn('absolute inset-0', flag && 'uppercase');
  return <div className={cn('flex items-center text-sm', className)} />;
}
```

Ouput:

```jsx
export function Example({ flag }) {
  let className = cn('cl-7601190e', flag && 'cl-d2cf63c7');
  return <div className={cn('cl-f64ae6a6', className)} />;
}
```

```css
.cl-7601190e {
  @apply absolute inset-0;
}

.cl-d2cf63c7 {
  @apply uppercase;
}

.cl-f64ae6a6 {
  @apply flex items-center text-sm;
}
```

```css
.cl-7601190e {
  position: absolute;
  inset: 0;
}

.cl-d2cf63c7 {
  text-transform: uppercase;
}

.cl-f64ae6a6 {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}
```

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/tailwindcss-transformer/LICENSE) for more information.
