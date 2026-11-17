export interface BackupCodesDownload {
  codes: readonly string[];
  fileName: string;
  intro: string;
  instructions: string;
}

export function downloadBackupCodes({ codes, fileName, intro, instructions }: BackupCodesDownload): void {
  const content = [intro, instructions, '', ...codes].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printBackupCodes({ codes, title }: { codes: readonly string[]; title: string }): boolean {
  const printable = window.open('', '_blank', 'width=640,height=720');
  if (!printable) {
    return false;
  }
  try {
    printable.document.title = title;
    const heading = printable.document.createElement('h1');
    heading.textContent = title;
    const list = printable.document.createElement('pre');
    list.textContent = codes.join('\n');
    printable.document.body.append(heading, list);
    printable.addEventListener('afterprint', () => printable.close(), { once: true });
    printable.setTimeout(() => printable.close(), 60_000);
    printable.focus();
    printable.print();
    return true;
  } catch {
    printable.close();
    return false;
  }
}
