# Snapshot Testing for Clerk Resources

This directory contains snapshot tests for Clerk resource classes using Vitest. Snapshot tests help ensure that the structure and serialization of resource objects remain consistent over time.

## What are Snapshot Tests?

Snapshot tests capture the output of a function or object and store it as a "snapshot" file. When the test runs again, the current output is compared against the stored snapshot. If they differ, the test fails, alerting you to potential breaking changes.

## How to Add Snapshot Tests

### Basic Pattern

```typescript
describe('ResourceName Snapshots', () => {
  it('should match snapshot for resource instance structure', () => {
    const resource = new ResourceName({
      // Provide test data that represents a typical resource
      id: 'test_123',
      name: 'Test Resource',
      // ... other properties
    });

    const snapshot = {
      id: resource.id,
      name: resource.name,
      // Include relevant public properties
    };

    expect(snapshot).toMatchSnapshot();
  });
});
```

### Testing Different States

```typescript
it('should match snapshot for empty/null state', () => {
  const resource = new ResourceName({
    id: 'empty_test',
    name: null,
    // ... other properties with null/empty values
  } as any); // Use 'as any' if TypeScript complains about null values

  expect({
    id: resource.id,
    name: resource.name,
  }).toMatchSnapshot();
});
```

### Testing Serialization Methods

For resources with `__internal_toSnapshot()` methods:

```typescript
it('should match snapshot for __internal_toSnapshot method', () => {
  const resource = new ResourceName(testData);
  expect(resource.__internal_toSnapshot()).toMatchSnapshot();
});
```

## Best Practices

1. **Use Fixed Dates**: Use `vi.useFakeTimers()` and `vi.setSystemTime()` to ensure consistent timestamps in snapshots.

2. **Include Relevant Properties**: Focus on public API properties that consumers rely on, not internal implementation details.

3. **Test Edge Cases**: Include tests for null values, empty states, and different configurations.

4. **Keep Snapshots Small**: Focus on the essential structure rather than including every property.

5. **Update When Intentional**: When you intentionally change a resource's structure, update the snapshots using `npm test -- --update-snapshots`.

## Running Snapshot Tests

```bash
# Run all resource tests
npm test -- src/core/resources/__tests__/*.spec.ts

# Run specific test file
npm test -- src/core/resources/__tests__/Client.spec.ts

# Update snapshots when structure changes intentionally
npm test -- --update-snapshots
```

## Examples

See the following files for examples:

- `Client.spec.ts` - Complex resource with nested objects
- `Environment.spec.ts` - Resource with configuration objects
- `Image.spec.ts` - Simple resource with basic properties

## When Snapshots Fail

When a snapshot test fails:

1. **Review the diff** to understand what changed
2. **Determine if the change is intentional**:
   - If yes: Update the snapshot with `--update-snapshots`
   - If no: Fix the code to maintain backward compatibility
3. **Consider the impact** on API consumers
4. **Update documentation** if the public API changed

## Snapshot Files

Snapshot files are stored in `__snapshots__/` directories and should be committed to version control. They serve as documentation of your resource structures and help catch unintended changes.
