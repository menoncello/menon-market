import { z } from "zod";

export const TemplateConfigSchema = z.object({
  PLUGIN_NAME: z.string().min(1).max(50),
  AUTHOR: z.string().min(1).max(100),
  VERSION: z.string().regex(/^\d+\.\d+\.\d+$/),
  DESCRIPTION: z.string().optional(),
  DATABASE_TYPE: z.enum(["sqlite", "postgres", "mysql"]).default("sqlite"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  STRICT_MODE: z.boolean().default(true),
  AUTO_FIX: z.boolean().default(false),
  OUTPUT_DIR: z.string().default("./generated"),
  TEMPLATE_DIR: z.string().default("./templates"),
});

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

export const defaultConfig: Partial<TemplateConfig> = {
  DATABASE_TYPE: "sqlite",
  LOG_LEVEL: "info",
  STRICT_MODE: true,
  AUTO_FIX: false,
  OUTPUT_DIR: "./generated",
  TEMPLATE_DIR: "./templates",
};

export function validateConfig(config: unknown): {
  success: boolean;
  data?: TemplateConfig;
  errors?: string[];
} {
  try {
    const data = TemplateConfigSchema.parse(config);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function mergeWithDefaults(
  config: Partial<TemplateConfig>,
): TemplateConfig {
  return TemplateConfigSchema.parse({ ...defaultConfig, ...config });
}
