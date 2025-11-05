export type PropertyType = 'number' | 'string' | 'color' | 'boolean' | 'select';

export interface PropertyDef {
  type: PropertyType;
  label: string;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  category?: string;
  options?: { label: string; value: any }[];
  condition?: (values: Record<string, any>) => boolean;
}

export interface EditableComponentDef {
  name: string;
  label: string;
  properties: Record<string, PropertyDef>;
}

export interface ComponentConfig {
  type: string;
  file: string;
  props: Record<string, any>;
}

export interface LiveEditConfig {
  schema: string;
  components: Record<string, ComponentConfig>;
}
