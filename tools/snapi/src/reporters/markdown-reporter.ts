import type { AnalysisResult, PackageAnalysis, ApiChange } from '../types.js';

/**
 * Generates human-readable Markdown reports for GitHub PR comments
 */
export class ReportGenerator {
  generateMarkdownReport(result: AnalysisResult): string {
    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader(result));

    // Summary
    sections.push(this.generateSummary(result));

    // Detailed changes per package
    if (result.summary.packagesWithChanges > 0) {
      sections.push(this.generatePackageDetails(result));
    }

    // Suppressions info
    const suppressedChanges = this.getSuppressedChanges(result);
    if (suppressedChanges.length > 0) {
      sections.push(this.generateSuppressionsSection(suppressedChanges));
    }

    // Footer with actions
    sections.push(this.generateFooter(result));

    return sections.join('\n\n---\n\n');
  }

  private generateHeader(result: AnalysisResult): string {
    const icon = result.hasBreakingChanges ? '💥' : result.summary.packagesWithChanges > 0 ? '📝' : '✅';
    const title = result.hasBreakingChanges
      ? 'Breaking Changes Detected'
      : result.summary.packagesWithChanges > 0
        ? 'API Changes Detected'
        : 'No API Changes';

    return `# ${icon} ${title}\n\n${this.generateStatusBadges(result)}`;
  }

  private generateStatusBadges(result: AnalysisResult): string {
    const badges: string[] = [];

    // CI Status badge
    if (result.ciShouldFail) {
      badges.push('![CI Status](https://img.shields.io/badge/CI-FAIL-red)');
    } else {
      badges.push('![CI Status](https://img.shields.io/badge/CI-PASS-green)');
    }

    // Breaking changes badge
    if (result.hasBreakingChanges) {
      badges.push(
        `![Breaking Changes](https://img.shields.io/badge/Breaking%20Changes-${result.summary.breakingChanges}-red)`,
      );
    }

    // Packages affected badge
    if (result.summary.packagesWithChanges > 0) {
      badges.push(
        `![Packages Affected](https://img.shields.io/badge/Packages%20Affected-${result.summary.packagesWithChanges}-blue)`,
      );
    }

    return badges.join(' ');
  }

  private generateSummary(result: AnalysisResult): string {
    let summary = '## Summary\n\n';

    if (result.summary.packagesWithChanges === 0) {
      summary += '✅ No API changes detected in any packages.\n\n';
      summary += 'All public APIs remain stable and backward compatible.';
      return summary;
    }

    summary += `📊 **${result.summary.packagesWithChanges}** out of **${result.summary.totalPackages}** packages have API changes:\n\n`;

    if (result.summary.breakingChanges > 0) {
      summary += `- 💥 **${result.summary.breakingChanges}** breaking changes\n`;
    }
    if (result.summary.nonBreakingChanges > 0) {
      summary += `- 🔄 **${result.summary.nonBreakingChanges}** non-breaking changes\n`;
    }
    if (result.summary.additions > 0) {
      summary += `- ✨ **${result.summary.additions}** new additions\n`;
    }

    // Version bump recommendations
    summary += '\n### Version Bump Recommendations\n\n';

    const packagesNeedingVersionBumps = result.packages.filter(
      p => !p.isValidBump && p.changes.some(c => !c.isSuppressed),
    );

    if (packagesNeedingVersionBumps.length > 0) {
      summary += '⚠️ The following packages need version bumps:\n\n';
      for (const pkg of packagesNeedingVersionBumps) {
        summary += `- **${pkg.packageName}**: ${pkg.version.current} → recommended **${pkg.recommendedVersionBump}** bump\n`;
      }
    } else {
      summary += '✅ All packages have appropriate version bumps.';
    }

    return summary;
  }

  private generatePackageDetails(result: AnalysisResult): string {
    let details = '## Package Details\n\n';

    const packagesWithChanges = result.packages.filter(p => p.changes.length > 0);

    for (const pkg of packagesWithChanges) {
      details += this.generatePackageSection(pkg);
      details += '\n';
    }

    return details;
  }

  private generatePackageSection(pkg: PackageAnalysis): string {
    const unsuppressedChanges = pkg.changes.filter(c => !c.isSuppressed);
    const icon = pkg.hasBreakingChanges ? '💥' : '📝';

    let section = `### ${icon} ${pkg.packageName}\n\n`;

    // Version info
    section += `**Version:** ${pkg.version.previous} → ${pkg.version.current}`;
    if (pkg.actualVersionBump) {
      section += ` (${pkg.actualVersionBump} bump)`;
    }
    section += '\n\n';

    // Version bump validation
    if (!pkg.isValidBump && unsuppressedChanges.length > 0) {
      section += `⚠️ **Version bump required:** This package needs a **${pkg.recommendedVersionBump}** version bump\n\n`;
    }

    // Changes by category
    const changesByType = this.groupChangesByType(unsuppressedChanges);

    if (changesByType.breaking.length > 0) {
      section += '#### 💥 Breaking Changes\n\n';
      section += this.generateChangesList(changesByType.breaking);
      section += '\n';
    }

    if (changesByType.nonBreaking.length > 0) {
      section += '#### 🔄 Non-Breaking Changes\n\n';
      section += this.generateChangesList(changesByType.nonBreaking);
      section += '\n';
    }

    if (changesByType.additions.length > 0) {
      section += '#### ✨ New Additions\n\n';
      section += this.generateChangesList(changesByType.additions);
      section += '\n';
    }

    // Show suppressed changes if any
    const suppressedChanges = pkg.changes.filter(c => c.isSuppressed);
    if (suppressedChanges.length > 0) {
      section += '<details>\n<summary>🔇 Suppressed Changes</summary>\n\n';
      section += this.generateChangesList(suppressedChanges);
      section += '\n</details>\n\n';
    }

    return section;
  }

  private generateChangesList(changes: ApiChange[]): string {
    let list = '';

    for (const change of changes) {
      list += `- **${change.category}** \`${change.description}\``;

      if (change.isSuppressed && change.suppressionReason) {
        list += ` _(suppressed: ${change.suppressionReason})_`;
      }
      list += '\n';

      // Add code snippets if available
      if (change.beforeSnippet || change.afterSnippet) {
        if (change.beforeSnippet && change.afterSnippet) {
          list += '  <details>\n  <summary>Show diff</summary>\n\n';
          list += '  ```diff\n';
          list += `  - ${change.beforeSnippet}\n`;
          list += `  + ${change.afterSnippet}\n`;
          list += '  ```\n  </details>\n';
        } else if (change.beforeSnippet) {
          list += `  <details>\n  <summary>Removed</summary>\n\n  \`\`\`typescript\n  ${change.beforeSnippet}\n  \`\`\`\n  </details>\n`;
        } else if (change.afterSnippet) {
          list += `  <details>\n  <summary>Added</summary>\n\n  \`\`\`typescript\n  ${change.afterSnippet}\n  \`\`\`\n  </details>\n`;
        }
      }
    }

    return list;
  }

  private groupChangesByType(changes: ApiChange[]): Record<string, ApiChange[]> {
    return {
      breaking: changes.filter(c => c.type === 'breaking'),
      nonBreaking: changes.filter(c => c.type === 'non-breaking'),
      additions: changes.filter(c => c.type === 'addition'),
    };
  }

  private getSuppressedChanges(result: AnalysisResult): ApiChange[] {
    return result.packages.flatMap(p => p.changes).filter(c => c.isSuppressed);
  }

  private generateSuppressionsSection(suppressedChanges: ApiChange[]): string {
    let section = '## 🔇 Suppressed Changes\n\n';
    section += `${suppressedChanges.length} changes have been suppressed and will not affect CI status:\n\n`;

    const suppressionsByPackage = new Map<string, ApiChange[]>();
    for (const change of suppressedChanges) {
      const packageChanges = suppressionsByPackage.get(change.location?.file || 'unknown') || [];
      packageChanges.push(change);
      suppressionsByPackage.set(change.location?.file || 'unknown', packageChanges);
    }

    for (const [pkg, changes] of suppressionsByPackage) {
      section += `### ${pkg}\n\n`;
      section += this.generateChangesList(changes);
      section += '\n';
    }

    return section;
  }

  private generateFooter(result: AnalysisResult): string {
    let footer = '## Next Steps\n\n';

    if (result.ciShouldFail) {
      footer += '❌ **CI will fail** until the version bumps are corrected.\n\n';
      footer += '### Required Actions:\n\n';

      const packagesNeedingBumps = result.packages.filter(p => !p.isValidBump && p.changes.some(c => !c.isSuppressed));

      for (const pkg of packagesNeedingBumps) {
        footer += `1. Update \`${pkg.packageName}\` version to require a **${pkg.recommendedVersionBump}** bump\n`;
      }

      footer += '\n### Or:\n\n';
      footer += '- Suppress specific changes if they are not actually breaking\n';
      footer += '- Update the API to maintain backward compatibility\n';
    } else if (result.hasBreakingChanges) {
      footer += '⚠️ Breaking changes detected but appropriate version bumps are in place.\n\n';
      footer += '**Please ensure these changes are intentional and properly documented.**';
    } else if (result.summary.packagesWithChanges > 0) {
      footer += '✅ All changes are backward compatible and properly versioned.\n\n';
      footer += '**Safe to merge when ready.**';
    } else {
      footer += '✅ No API changes detected.\n\n';
      footer += '**Safe to merge.**';
    }

    footer += '\n\n---\n\n';
    footer += '_This report was generated by the API Breakage Detector. ';
    footer += 'For more information, see the [documentation](https://github.com/your-org/snapi)._';

    return footer;
  }

  /**
   * Generate a compact summary for GitHub status checks
   */
  generateStatusSummary(result: AnalysisResult): string {
    if (result.hasBreakingChanges) {
      return `💥 ${result.summary.breakingChanges} breaking changes detected`;
    } else if (result.summary.packagesWithChanges > 0) {
      return `📝 ${result.summary.packagesWithChanges} packages with API changes`;
    } else {
      return '✅ No API changes';
    }
  }

  /**
   * Generate JSON report
   */
  generateJsonReport(result: AnalysisResult): string {
    return JSON.stringify(result, null, 2);
  }
}
