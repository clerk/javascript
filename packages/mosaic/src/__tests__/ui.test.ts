import { describe, expect, it } from 'vitest';

import * as stylesheetEntry from '../styles';
import * as ui from '../ui';

describe('@clerk/mosaic/ui', () => {
  it.each(Object.keys(ui))('extracts the CSS for %s into styles.css', name => {
    expect(stylesheetEntry).toHaveProperty(name);
  });
});
