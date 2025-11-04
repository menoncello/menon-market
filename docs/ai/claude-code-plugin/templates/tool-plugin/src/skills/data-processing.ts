import { Skill } from '../types';

/**
 * Data Processing Skill
 *
 * Provides data transformation, analysis, and processing capabilities
 */
export class DataProcessingSkill implements Skill {
  private config: any;
  private logger: any;

  /**
   *
   * @param config
   * @param logger
   */
  constructor(config: any, logger: any) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Get skill information
   */
  getInfo(): SkillInfo {
    return {
      name: 'data-processing',
      description: 'Data transformation, analysis, and processing capabilities',
      version: '1.0.0',
      capabilities: [
        'csv-processing',
        'json-transformation',
        'data-validation',
        'statistical-analysis',
        'data-aggregation',
        'format-conversion'
      ]
    };
  }

  /**
   * Process CSV data
   * @param data CSV data or file path
   * @param options Processing options
   */
  async processCSV(data: string | Buffer, options: CSVOpts = {}): Promise<CSVResult> {
    try {
      const {
        delimiter = ',',
        hasHeader = true,
        skipEmptyLines = true,
        transform = null,
        filter = null
      } = options;

      let csvContent: string;

      csvContent = Buffer.isBuffer(data) ? data.toString() : data;

      const lines = csvContent.split('\n');
      let headers: string[] = [];
      const rows: string[][] = [];
      let startIndex = 0;

      // Parse headers
      if (hasHeader && lines.length > 0) {
        headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
        startIndex = 1;
      }

      // Parse rows
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();

        if (skipEmptyLines && !line) {
          continue;
        }

        const row = line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''));

        if (filter && !filter(row, headers)) {
          continue;
        }

        if (transform) {
          rows.push(transform(row, headers));
        } else {
          rows.push(row);
        }
      }

      this.logger.info(`Successfully processed CSV: ${rows.length} rows, ${headers.length} columns`);

      return {
        headers,
        rows,
        rowCount: rows.length,
        columnCount: headers.length,
        rawData: csvContent
      };
    } catch (error) {
      this.logger.error('Failed to process CSV data', error);
      throw error;
    }
  }

  /**
   * Transform JSON data
   * @param data JSON data
   * @param transform Transformation function or path
   */
  async transformJSON(data: any, transform: JSONTransform | string): Promise<any> {
    try {
      let transformFunction: JSONTransform;

      if (typeof transform === 'string') {
        // Parse transformation path (e.g., "user.profile.name")
        transformFunction = (obj: any) => this.getNestedValue(obj, transform);
      } else {
        transformFunction = transform;
      }

      const result = transformFunction(data);

      this.logger.info('Successfully transformed JSON data');

      return result;
    } catch (error) {
      this.logger.error('Failed to transform JSON data', error);
      throw error;
    }
  }

  /**
   * Validate data against schema
   * @param data Data to validate
   * @param schema Validation schema
   */
  async validateData(data: any, schema: ValidationSchema): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];
      const warnings: string[] = [];

      // Check required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) {
            errors.push({
              field,
              message: `Required field '${field}' is missing`,
              type: 'required'
            });
          }
        }
      }

      // Check field types and constraints
      if (schema.fields) {
        for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
          if (!(fieldName in data)) {
            continue;
          }

          const value = data[fieldName];
          const fieldErrors = this.validateField(fieldName, value, fieldSchema);
          errors.push(...fieldErrors);
        }
      }

      // Check custom validators
      if (schema.validators) {
        for (const validator of schema.validators) {
          try {
            const result = validator(data);
            if (typeof result === 'string') {
              warnings.push(result);
            } else if (!result) {
              errors.push({
                field: 'custom',
                message: 'Custom validation failed',
                type: 'custom'
              });
            }
          } catch (error) {
            errors.push({
              field: 'custom',
              message: `Custom validation error: ${error.message}`,
              type: 'custom'
            });
          }
        }
      }

      const isValid = errors.length === 0;

      this.logger.info(`Data validation completed: ${isValid ? 'Valid' : 'Invalid'} (${errors.length} errors, ${warnings.length} warnings)`);

      return {
        valid: isValid,
        errors,
        warnings
      };
    } catch (error) {
      this.logger.error('Failed to validate data', error);
      throw error;
    }
  }

  /**
   * Perform statistical analysis on data
   * @param data Numeric data array
   * @param options Analysis options
   */
  async analyzeStatistics(data: number[], options: StatisticsOpts = {}): Promise<StatisticsResult> {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of numbers');
      }

      const numericData = data.filter(item => typeof item === 'number' && !isNaN(item));

      if (numericData.length === 0) {
        throw new Error('No valid numeric data found');
      }

      const sorted = [...numericData].sort((a, b) => a - b);
      const sum = numericData.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericData.length;

      // Calculate median
      const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

      // Calculate mode
      const frequency: Record<number, number> = {};
      let maxFreq = 0;
      let modes: number[] = [];

      for (const value of numericData) {
        frequency[value] = (frequency[value] || 0) + 1;
        if (frequency[value] > maxFreq) {
          maxFreq = frequency[value];
          modes = [value];
        } else if (frequency[value] === maxFreq) {
          modes.push(value);
        }
      }

      // Calculate standard deviation
      const squaredDifferences = numericData.map(value => Math.pow(value - mean, 2));
      const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / numericData.length;
      const stdDev = Math.sqrt(variance);

      const result: StatisticsResult = {
        count: numericData.length,
        sum,
        mean,
        median,
        modes: modes.length === numericData.length ? [] : modes, // All values are unique = no mode
        min: sorted[0],
        max: sorted[sorted.length - 1],
        range: sorted[sorted.length - 1] - sorted[0],
        variance,
        standardDeviation: stdDev,
        quartiles: {
          q1: sorted[Math.floor(sorted.length * 0.25)],
          q2: median,
          q3: sorted[Math.floor(sorted.length * 0.75)]
        }
      };

      if (options.percentiles) {
        result.percentiles = {};
        for (const p of options.percentiles) {
          const index = Math.floor(sorted.length * (p / 100));
          result.percentiles[p] = sorted[index];
        }
      }

      this.logger.info(`Statistical analysis completed for ${numericData.length} data points`);

      return result;
    } catch (error) {
      this.logger.error('Failed to perform statistical analysis', error);
      throw error;
    }
  }

  /**
   * Aggregate data by grouping
   * @param data Array of objects to aggregate
   * @param groupBy Field to group by
   * @param aggregations Aggregation functions
   */
  async aggregateData(
    data: Array<Record<string, any>>,
    groupBy: string,
    aggregations: Record<string, AggregationFn>
  ): Promise<AggregatedResult> {
    try {
      const groups: Record<string, Array<Record<string, any>>> = {};

      // Group data
      for (const item of data) {
        const groupKey = String(item[groupBy] || 'unknown');
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
      }

      // Apply aggregations
      const result: Record<string, any> = {};

      for (const [groupKey, groupData] of Object.entries(groups)) {
        result[groupKey] = {
          count: groupData.length,
          group: groupKey
        };

        for (const [field, aggregationFn] of Object.entries(aggregations)) {
          const values = groupData.map(item => item[field]).filter(val => val != null);
          result[groupKey][field] = aggregationFn(values);
        }
      }

      this.logger.info(`Data aggregation completed: ${Object.keys(groups).length} groups`);

      return {
        groups: result,
        totalGroups: Object.keys(groups).length,
        totalItems: data.length
      };
    } catch (error) {
      this.logger.error('Failed to aggregate data', error);
      throw error;
    }
  }

  /**
   * Convert data between formats
   * @param data Input data
   * @param fromFormat Source format
   * @param toFormat Target format
   * @param options Conversion options
   */
  async convertFormat(
    data: any,
    fromFormat: string,
    toFormat: string,
    options: FormatConversionOpts = {}
  ): Promise<FormatConversionResult> {
    try {
      let convertedData: any;
      let metadata: Record<string, any> = {};

      if (fromFormat === 'csv' && toFormat === 'json') {
        const csvResult = await this.processCSV(data, options.csv);
        convertedData = csvResult.rows.map(row => {
          const obj: Record<string, any> = {};
          for (const [index, header] of csvResult.headers.entries()) {
            obj[header] = row[index];
          }
          return obj;
        });
        metadata = { rowCount: csvResult.rowCount, columnCount: csvResult.columnCount };
      } else if (fromFormat === 'json' && toFormat === 'csv') {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('JSON data must be a non-empty array');
        }

        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header] || ''));

        convertedData = this.arrayToCSV(headers, rows, options.csv);
        metadata = { rowCount: data.length, columnCount: headers.length };
      } else if (fromFormat === 'json' && toFormat === 'xml') {
        convertedData = this.jsonToXML(data, options.xml);
        metadata = { rootTag: options.xml?.rootTag || 'root' };
      } else if (fromFormat === 'xml' && toFormat === 'json') {
        convertedData = this.xmlToJSON(data, options.xml);
        metadata = { parsed: true };
      } else {
        throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported`);
      }

      this.logger.info(`Successfully converted data from ${fromFormat} to ${toFormat}`);

      return {
        data: convertedData,
        fromFormat,
        toFormat,
        metadata
      };
    } catch (error) {
      this.logger.error(`Failed to convert data from ${fromFormat} to ${toFormat}`, error);
      throw error;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param obj Source object
   * @param path Dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate a single field
   * @param fieldName Field name
   * @param value Field value
   * @param schema Field schema
   */
  private validateField(fieldName: string, value: any, schema: FieldSchema): ValidationError[] {
    const errors: ValidationError[] = [];

    // Type validation
    if (schema.type && typeof value !== schema.type) {
      errors.push({
        field: fieldName,
        message: `Expected type ${schema.type}, got ${typeof value}`,
        type: 'type'
      });
    }

    // Range validation for numbers
    if (typeof value === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        errors.push({
          field: fieldName,
          message: `Value ${value} is less than minimum ${schema.min}`,
          type: 'range'
        });
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push({
          field: fieldName,
          message: `Value ${value} is greater than maximum ${schema.max}`,
          type: 'range'
        });
      }
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push({
          field: fieldName,
          message: `String length ${value.length} is less than minimum ${schema.minLength}`,
          type: 'length'
        });
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push({
          field: fieldName,
          message: `String length ${value.length} is greater than maximum ${schema.maxLength}`,
          type: 'length'
        });
      }
    }

    // Pattern validation
    if (schema.pattern && typeof value === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          field: fieldName,
          message: `Value does not match required pattern`,
          type: 'pattern'
        });
      }
    }

    return errors;
  }

  /**
   * Convert array to CSV string
   * @param headers CSV headers
   * @param rows CSV rows
   * @param options CSV options
   */
  private arrayToCSV(headers: string[], rows: string[][], options: CSVOpts = {}): string {
    const delimiter = options.delimiter || ',';
    const lines = [headers.join(delimiter)];

    for (const row of rows) {
      lines.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter));
    }

    return lines.join('\n');
  }

  /**
   * Convert JSON to XML (simplified implementation)
   * @param data JSON data
   * @param options XML options
   */
  private jsonToXML(data: any, options: XMLOpts = {}): string {
    const rootTag = options.rootTag || 'root';
    const indent = options.indent || 2;

    // This is a simplified XML generator
    // In a real implementation, you would use a proper XML library
    return `<${rootTag}>${JSON.stringify(data)}</${rootTag}>`;
  }

  /**
   * Convert XML to JSON (simplified implementation)
   * @param xml XML data
   * @param options XML options
   */
  private xmlToJSON(xml: string, options: XMLOpts = {}): any {
    // This is a simplified XML parser
    // In a real implementation, you would use a proper XML parser
    return { parsed: xml };
  }
}

// Type definitions
interface SkillInfo {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
}

interface CSVOpts {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
  transform?: (row: string[], headers: string[]) => string[];
  filter?: (row: string[], headers: string[]) => boolean;
}

interface CSVResult {
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  rawData: string;
}

type JSONTransform = (obj: any) => any;

interface ValidationSchema {
  required?: string[];
  fields?: Record<string, FieldSchema>;
  validators?: Array<(data: any) => boolean | string>;
}

interface FieldSchema {
  type?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface ValidationError {
  field: string;
  message: string;
  type: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

interface StatisticsOpts {
  percentiles?: number[];
}

interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  variance: number;
  standardDeviation: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  percentiles?: Record<number, number>;
}

type AggregationFn = (values: any[]) => any;

interface AggregatedResult {
  groups: Record<string, any>;
  totalGroups: number;
  totalItems: number;
}

interface FormatConversionOpts {
  csv?: CSVOpts;
  xml?: XMLOpts;
}

interface XMLOpts {
  rootTag?: string;
  indent?: number;
}

interface FormatConversionResult {
  data: any;
  fromFormat: string;
  toFormat: string;
  metadata: Record<string, any>;
}