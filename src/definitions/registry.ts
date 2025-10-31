import { EditableComponentDef, EditableProperty } from './types';

export class EditableComponentRegistry {
  private definitions: Map<string, EditableComponentDef> = new Map();

  register(def: EditableComponentDef): void {
    this.definitions.set(def.name, def);
  }

  registerMultiple(defs: EditableComponentDef[]): void {
    defs.forEach(def => this.register(def));
  }

  get(name: string): EditableComponentDef | undefined {
    return this.definitions.get(name);
  }

  getEffectiveProperties(componentName: string): Record<string, EditableProperty> {
    const def = this.get(componentName);
    if (!def) {
      throw new Error(`Component definition not found: ${componentName}`);
    }

    const properties: Record<string, EditableProperty> = {};

    if (def.extends) {
      const parentProps = this.getEffectiveProperties(def.extends);
      Object.assign(properties, parentProps);
    }

    Object.assign(properties, def.properties);

    return properties;
  }

  getEffectiveDefinition(componentName: string): EditableComponentDef {
    const def = this.get(componentName);
    if (!def) {
      throw new Error(`Component definition not found: ${componentName}`);
    }

    return {
      ...def,
      properties: this.getEffectiveProperties(componentName),
    };
  }

  listDefinitions(): EditableComponentDef[] {
    return Array.from(this.definitions.values());
  }
}

export const registry = new EditableComponentRegistry();
