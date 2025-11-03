
type HandlebarsTemplateDelegate = any;

export class TemplateCache {
  private cache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlMs = 300000) {
    // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  set(key: string, template: HandlebarsTemplateDelegate): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, template);

    // Set TTL cleanup
    setTimeout(() => {
      this.cache.delete(key);
    }, this.ttl);
  }

  get(key: string): HandlebarsTemplateDelegate | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}
