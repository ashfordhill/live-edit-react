export type PropertyType = 'number' | 'color' | 'boolean' | 'text' | 'select' | 'vector2';

export type PropertyCategory = 'layout' | 'typography' | 'appearance' | 'interaction';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface EditableProperty {
  type: PropertyType;
  label: string;
  defaultValue: any;

  min?: number;
  max?: number;
  step?: number;
  unit?: string;

  options?: SelectOption[];

  condition?: (values: Record<string, any>) => boolean;

  category?: PropertyCategory;
}

export interface EditableComponentDef {
  name: string;
  label: string;
  extends?: string;
  properties: Record<string, EditableProperty>;
  editMode?: 'inline' | 'floating' | 'sidebar';
  icon?: string;
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
