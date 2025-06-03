import fs from 'fs-extra';
import {
  ApiModel,
  ApiItem,
  ApiItemKind,
  ApiFunction,
  ApiInterface,
  ApiClass,
  ApiEnum,
  ExcerptToken,
} from '@microsoft/api-extractor-model';
import { ChangeType, ChangeSeverity } from '../types.js';
import type { ApiChange } from '../types.js';
import { createHash } from 'crypto';

interface ComparisonContext {
  currentModel: ApiModel;
  previousModel: ApiModel;
  packageName: string;
}

/**
 * Analyzes differences between API models and categorizes changes
 */
export class ApiDiffAnalyzer {
  async compareApiModels(
    currentApiJsonPath: string,
    previousApiJsonPath: string,
    packageName: string,
  ): Promise<ApiChange[]> {
    if (!(await fs.pathExists(previousApiJsonPath))) {
      // No previous version to compare against - all current exports are additions
      return this.analyzeAsNewPackage(currentApiJsonPath, packageName);
    }

    const currentModel = new ApiModel();
    const previousModel = new ApiModel();

    try {
      currentModel.loadPackage(currentApiJsonPath);
      previousModel.loadPackage(previousApiJsonPath);
    } catch (error) {
      throw new Error(`Failed to load API models: ${error}`);
    }

    const context: ComparisonContext = {
      currentModel,
      previousModel,
      packageName,
    };

    return this.analyzeChanges(context);
  }

  private async analyzeAsNewPackage(apiJsonPath: string, packageName: string): Promise<ApiChange[]> {
    const model = new ApiModel();
    model.loadPackage(apiJsonPath);

    const changes: ApiChange[] = [];
    const apiPackage = model.packages[0];

    if (!apiPackage) return changes;

    // All items in new package are additions
    this.visitApiItems(apiPackage, item => {
      if (this.isPublicApi(item)) {
        changes.push(this.createAdditionChange(item, packageName));
      }
    });

    return changes;
  }

  private analyzeChanges(context: ComparisonContext): ApiChange[] {
    const changes: ApiChange[] = [];

    const currentPackage = context.currentModel.packages[0];
    const previousPackage = context.previousModel.packages[0];

    if (!currentPackage || !previousPackage) {
      return changes;
    }

    // Create maps for efficient lookup
    const currentItems = this.createItemMap(currentPackage);
    const previousItems = this.createItemMap(previousPackage);

    // Find removed items (breaking changes)
    for (const [key, previousItem] of previousItems) {
      if (!currentItems.has(key) && this.isPublicApi(previousItem)) {
        changes.push(this.createRemovalChange(previousItem, context.packageName));
      }
    }

    // Find added items (additions)
    for (const [key, currentItem] of currentItems) {
      if (!previousItems.has(key) && this.isPublicApi(currentItem)) {
        changes.push(this.createAdditionChange(currentItem, context.packageName));
      }
    }

    // Find modified items (potential breaking changes)
    for (const [key, currentItem] of currentItems) {
      const previousItem = previousItems.get(key);
      if (previousItem && this.isPublicApi(currentItem)) {
        const itemChanges = this.compareApiItems(currentItem, previousItem, context.packageName);
        changes.push(...itemChanges);
      }
    }

    return changes;
  }

  private createItemMap(packageItem: ApiItem): Map<string, ApiItem> {
    const map = new Map<string, ApiItem>();

    this.visitApiItems(packageItem, item => {
      const key = this.getItemKey(item);
      map.set(key, item);
    });

    return map;
  }

  private visitApiItems(root: ApiItem, callback: (item: ApiItem) => void): void {
    const visit = (item: ApiItem) => {
      callback(item);
      for (const child of item.members) {
        visit(child);
      }
    };

    visit(root);
  }

  private getItemKey(item: ApiItem): string {
    // Create a unique key that includes parent context
    const parts = [];
    let current: ApiItem | undefined = item;

    while (current && current.kind !== ApiItemKind.Package) {
      parts.unshift(current.displayName);
      current = current.parent;
    }

    return parts.join('.');
  }

  private compareApiItems(currentItem: ApiItem, previousItem: ApiItem, packageName: string): ApiChange[] {
    const changes: ApiChange[] = [];

    // Compare based on item type
    switch (currentItem.kind) {
      case ApiItemKind.Function:
        changes.push(...this.compareFunctions(currentItem as ApiFunction, previousItem as ApiFunction, packageName));
        break;

      case ApiItemKind.Interface:
        changes.push(...this.compareInterfaces(currentItem as ApiInterface, previousItem as ApiInterface, packageName));
        break;

      case ApiItemKind.Class:
        changes.push(...this.compareClasses(currentItem as ApiClass, previousItem as ApiClass, packageName));
        break;

      case ApiItemKind.Enum:
        changes.push(...this.compareEnums(currentItem as ApiEnum, previousItem as ApiEnum, packageName));
        break;

      default:
        // Generic comparison for other types
        changes.push(...this.compareGenericItems(currentItem, previousItem, packageName));
    }

    return changes;
  }

  private compareFunctions(currentFunc: ApiFunction, previousFunc: ApiFunction, packageName: string): ApiChange[] {
    const changes: ApiChange[] = [];

    // Get simplified signatures for comparison
    const currentSig = this.getFunctionSignature(currentFunc);
    const previousSig = this.getFunctionSignature(previousFunc);

    if (currentSig !== previousSig) {
      const isBreaking = this.isFunctionChangeBreaking(currentFunc, previousFunc);

      changes.push({
        id: this.generateChangeId(packageName, 'function', currentFunc.displayName, currentSig),
        type: isBreaking ? ChangeType.BREAKING : ChangeType.NON_BREAKING,
        severity: isBreaking ? ChangeSeverity.MAJOR : ChangeSeverity.MINOR,
        category: 'function',
        description: `Function '${currentFunc.displayName}' signature changed`,
        beforeSnippet: previousSig,
        afterSnippet: currentSig,
        location: this.getItemLocation(currentFunc),
      });
    }

    return changes;
  }

  private compareInterfaces(
    currentInterface: ApiInterface,
    previousInterface: ApiInterface,
    packageName: string,
  ): ApiChange[] {
    const changes: ApiChange[] = [];

    // Compare interface members
    const currentMembers = this.getInterfaceMembers(currentInterface);
    const previousMembers = this.getInterfaceMembers(previousInterface);

    // Check for removed members (breaking)
    for (const [name, previousMember] of previousMembers) {
      if (!currentMembers.has(name)) {
        changes.push({
          id: this.generateChangeId(packageName, 'interface', currentInterface.displayName, `removed-${name}`),
          type: ChangeType.BREAKING,
          severity: ChangeSeverity.MAJOR,
          category: 'interface',
          description: `Interface '${currentInterface.displayName}' removed member '${name}'`,
          beforeSnippet: previousMember,
          location: this.getItemLocation(currentInterface),
        });
      }
    }

    // Check for added members (potentially breaking if required)
    for (const [name, currentMember] of currentMembers) {
      if (!previousMembers.has(name)) {
        const isRequired = this.isRequiredMember(currentMember);
        changes.push({
          id: this.generateChangeId(packageName, 'interface', currentInterface.displayName, `added-${name}`),
          type: isRequired ? ChangeType.BREAKING : ChangeType.ADDITION,
          severity: isRequired ? ChangeSeverity.MAJOR : ChangeSeverity.MINOR,
          category: 'interface',
          description: `Interface '${currentInterface.displayName}' added ${isRequired ? 'required' : 'optional'} member '${name}'`,
          afterSnippet: currentMember,
          location: this.getItemLocation(currentInterface),
        });
      }
    }

    // Check for modified members
    for (const [name, currentMember] of currentMembers) {
      const previousMember = previousMembers.get(name);
      if (previousMember && currentMember !== previousMember) {
        const isBreaking = this.isMemberChangeBreaking(currentMember, previousMember);
        changes.push({
          id: this.generateChangeId(packageName, 'interface', currentInterface.displayName, `modified-${name}`),
          type: isBreaking ? ChangeType.BREAKING : ChangeType.NON_BREAKING,
          severity: isBreaking ? ChangeSeverity.MAJOR : ChangeSeverity.MINOR,
          category: 'interface',
          description: `Interface '${currentInterface.displayName}' modified member '${name}'`,
          beforeSnippet: previousMember,
          afterSnippet: currentMember,
          location: this.getItemLocation(currentInterface),
        });
      }
    }

    return changes;
  }

  private compareClasses(currentClass: ApiClass, previousClass: ApiClass, packageName: string): ApiChange[] {
    // Similar logic to interfaces but with additional considerations for:
    // - Constructor changes
    // - Method visibility changes
    // - Inheritance changes
    return this.compareGenericItems(currentClass, previousClass, packageName);
  }

  private compareEnums(currentEnum: ApiEnum, previousEnum: ApiEnum, packageName: string): ApiChange[] {
    const changes: ApiChange[] = [];

    const currentMembers = this.getEnumMembers(currentEnum);
    const previousMembers = this.getEnumMembers(previousEnum);

    // Removed enum members are breaking
    for (const previousMember of previousMembers) {
      if (!currentMembers.includes(previousMember)) {
        changes.push({
          id: this.generateChangeId(packageName, 'enum', currentEnum.displayName, `removed-${previousMember}`),
          type: ChangeType.BREAKING,
          severity: ChangeSeverity.MAJOR,
          category: 'enum',
          description: `Enum '${currentEnum.displayName}' removed member '${previousMember}'`,
          beforeSnippet: previousMember,
          location: this.getItemLocation(currentEnum),
        });
      }
    }

    // Added enum members are additions
    for (const currentMember of currentMembers) {
      if (!previousMembers.includes(currentMember)) {
        changes.push({
          id: this.generateChangeId(packageName, 'enum', currentEnum.displayName, `added-${currentMember}`),
          type: ChangeType.ADDITION,
          severity: ChangeSeverity.MINOR,
          category: 'enum',
          description: `Enum '${currentEnum.displayName}' added member '${currentMember}'`,
          afterSnippet: currentMember,
          location: this.getItemLocation(currentEnum),
        });
      }
    }

    return changes;
  }

  private compareGenericItems(currentItem: ApiItem, previousItem: ApiItem, packageName: string): ApiChange[] {
    // Generic comparison based on excerpt text
    const currentExcerpt = this.getItemExcerpt(currentItem);
    const previousExcerpt = this.getItemExcerpt(previousItem);

    if (currentExcerpt !== previousExcerpt) {
      return [
        {
          id: this.generateChangeId(packageName, 'generic', currentItem.displayName, 'modified'),
          type: ChangeType.BREAKING, // Conservative assumption
          severity: ChangeSeverity.MAJOR,
          category: this.getCategoryFromKind(currentItem.kind),
          description: `${this.getCategoryFromKind(currentItem.kind)} '${currentItem.displayName}' was modified`,
          beforeSnippet: previousExcerpt,
          afterSnippet: currentExcerpt,
          location: this.getItemLocation(currentItem),
        },
      ];
    }

    return [];
  }

  // Helper methods
  private isPublicApi(item: ApiItem): boolean {
    // Only consider items that are not marked as internal
    return (
      !item.displayName.startsWith('_') && item.kind !== ApiItemKind.Package && item.kind !== ApiItemKind.EntryPoint
    );
  }

  private getFunctionSignature(func: ApiFunction): string {
    // Simplified signature extraction using the excerpt tokens
    try {
      if (func.excerpt && Array.isArray((func.excerpt as any).tokens)) {
        return (func.excerpt as any).tokens.map((token: ExcerptToken) => token.text).join('');
      }
    } catch {
      // Fall back to display name
    }
    return func.displayName;
  }

  private isFunctionChangeBreaking(current: ApiFunction, previous: ApiFunction): boolean {
    // This is a simplified check - you'd want more sophisticated analysis
    const currentParams = this.extractParameters(current);
    const previousParams = this.extractParameters(previous);

    // More required parameters = breaking
    // Fewer parameters = potentially breaking
    // Changed parameter types = breaking

    return currentParams.required.length > previousParams.required.length || currentParams.total < previousParams.total;
  }

  private extractParameters(_func: ApiFunction): { required: string[]; total: number } {
    // This would need proper implementation based on API Extractor model
    return { required: [], total: 0 };
  }

  private getInterfaceMembers(interfaceItem: ApiInterface): Map<string, string> {
    const members = new Map<string, string>();

    for (const member of interfaceItem.members) {
      members.set(member.displayName, this.getItemExcerpt(member));
    }

    return members;
  }

  private getEnumMembers(enumItem: ApiEnum): string[] {
    return enumItem.members.map(member => member.displayName);
  }

  private isRequiredMember(memberSignature: string): boolean {
    // Check if member is optional (ends with ?)
    return !memberSignature.includes('?:');
  }

  private isMemberChangeBreaking(current: string, previous: string): boolean {
    // Conservative approach - most changes are considered breaking
    return current !== previous;
  }

  private getItemExcerpt(item: ApiItem): string {
    // Use the excerpt tokens to build the text representation
    try {
      const itemWithExcerpt = item as any;
      if (itemWithExcerpt.excerpt && Array.isArray(itemWithExcerpt.excerpt.tokens)) {
        return itemWithExcerpt.excerpt.tokens.map((token: ExcerptToken) => token.text).join('');
      }
    } catch {
      // Fall back to display name
    }
    return item.displayName || '';
  }

  private getCategoryFromKind(kind: ApiItemKind): ApiChange['category'] {
    switch (kind) {
      case ApiItemKind.Function:
        return 'function';
      case ApiItemKind.Interface:
        return 'interface';
      case ApiItemKind.Class:
        return 'class';
      case ApiItemKind.Enum:
        return 'enum';
      case ApiItemKind.TypeAlias:
        return 'type';
      default:
        return 'export';
    }
  }

  private getItemLocation(_item: ApiItem): { file: string; line?: number } | undefined {
    // This would need proper implementation to extract source location
    // API Extractor model doesn't directly provide source locations
    return undefined;
  }

  private createRemovalChange(item: ApiItem, packageName: string): ApiChange {
    return {
      id: this.generateChangeId(packageName, 'removal', item.displayName, 'removed'),
      type: ChangeType.BREAKING,
      severity: ChangeSeverity.MAJOR,
      category: this.getCategoryFromKind(item.kind),
      description: `Removed ${this.getCategoryFromKind(item.kind)} '${item.displayName}'`,
      beforeSnippet: this.getItemExcerpt(item),
      location: this.getItemLocation(item),
    };
  }

  private createAdditionChange(item: ApiItem, packageName: string): ApiChange {
    return {
      id: this.generateChangeId(packageName, 'addition', item.displayName, 'added'),
      type: ChangeType.ADDITION,
      severity: ChangeSeverity.MINOR,
      category: this.getCategoryFromKind(item.kind),
      description: `Added ${this.getCategoryFromKind(item.kind)} '${item.displayName}'`,
      afterSnippet: this.getItemExcerpt(item),
      location: this.getItemLocation(item),
    };
  }

  private generateChangeId(packageName: string, category: string, itemName: string, changeType: string): string {
    const content = `${packageName}:${category}:${itemName}:${changeType}`;
    return createHash('sha256').update(content).digest('hex').substring(0, 8);
  }
}
