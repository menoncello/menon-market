/**
 * Menon Marketplace Frontend
 * Built with Bun and TypeScript
 */

import React from "react";
import { createRoot } from "react-dom/client";
import "./static/styles.css";

// Types
interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  icon?: string;
  downloads: number;
  rating: number;
  repository?: string;
  homepage?: string;
}

interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  icon?: string;
  downloads: number;
  rating: number;
  repository?: string;
  homepage?: string;
}

interface MarketplaceData {
  plugins: Plugin[];
  skills: Skill[];
}

// Sample data
const samplePlugins: Plugin[] = [
  {
    id: "code-formatter",
    name: "Code Formatter",
    version: "1.0.0",
    description: "Professional code formatting with support for multiple languages and customizable rules.",
    author: "Eduardo Menoncello",
    category: "development",
    tags: ["formatting", "code-quality", "productivity"],
    icon: "🎨",
    downloads: 1250,
    rating: 4.8,
    repository: "https://github.com/menoncello/code-formatter",
    homepage: "https://menoncello.com/code-formatter"
  },
  {
    id: "git-enhanced",
    name: "Git Enhanced",
    version: "2.1.0",
    description: "Advanced Git operations with intelligent commit suggestions and branch management.",
    author: "Dev Tools Inc",
    category: "development",
    tags: ["git", "version-control", "productivity"],
    icon: "🔧",
    downloads: 890,
    rating: 4.6
  },
  {
    id: "api-tester",
    name: "API Tester",
    version: "1.5.0",
    description: "Comprehensive API testing tool with automatic documentation generation.",
    author: "API Masters",
    category: "development",
    tags: ["api", "testing", "documentation"],
    icon: "🚀",
    downloads: 756,
    rating: 4.7
  }
];

const sampleSkills: Skill[] = [
  {
    id: "code-review-assistant",
    name: "Code Review Assistant",
    version: "1.0.0",
    description: "AI-powered code review with suggestions for improvements, security checks, and best practices.",
    author: "Eduardo Menoncello",
    category: "analysis",
    tags: ["code-review", "ai", "quality-assurance"],
    icon: "🔍",
    downloads: 2100,
    rating: 4.9,
    repository: "https://github.com/menoncello/code-review-assistant"
  },
  {
    id: "documentation-generator",
    name: "Documentation Generator",
    version: "2.0.0",
    description: "Automatically generate comprehensive documentation from your codebase.",
    author: "DocGen Team",
    category: "generation",
    tags: ["documentation", "automation", "productivity"],
    icon: "📚",
    downloads: 1450,
    rating: 4.5
  },
  {
    id: "performance-optimizer",
    name: "Performance Optimizer",
    version: "1.3.0",
    description: "Analyze and optimize your code for better performance and resource usage.",
    author: "Perf Masters",
    category: "optimization",
    tags: ["performance", "optimization", "analysis"],
    icon: "⚡",
    downloads: 980,
    rating: 4.4
  }
];

// Components
const ItemCard: React.FC<{ item: Plugin | Skill; onClick: () => void }> = ({ item, onClick }) => {
  return (
    <div className="item-card" onClick={onClick}>
      <div className="item-header">
        <div className="item-icon">{item.icon || "📦"}</div>
        <div className="item-info">
          <div className="item-name">{item.name}</div>
          <div className="item-author">by {item.author}</div>
        </div>
      </div>
      <div className="item-description">{item.description}</div>
      <div className="item-tags">
        {item.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <div className="item-footer">
        <span className="item-category">{item.category}</span>
        <div className="item-stats">
          <span className="item-version">v{item.version}</span>
          <span className="item-downloads">⬇️ {item.downloads}</span>
          <span className="item-rating">⭐ {item.rating}</span>
        </div>
      </div>
    </div>
  );
};

const ItemModal: React.FC<{
  item: Plugin | Skill | null;
  onClose: () => void;
}> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <div className="modal-header">
          <div className="item-icon" style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            {item.icon || "📦"}
          </div>
          <h2>{item.name}</h2>
          <p>by {item.author}</p>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: "1.5rem", color: "#64748b" }}>{item.description}</p>

          <div className="modal-stats" style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
            <div>
              <strong>Version:</strong> {item.version}
            </div>
            <div>
              <strong>Category:</strong> {item.category}
            </div>
            <div>
              <strong>Downloads:</strong> {item.downloads}
            </div>
            <div>
              <strong>Rating:</strong> ⭐ {item.rating}
            </div>
          </div>

          <div className="modal-tags" style={{ marginBottom: "1.5rem" }}>
            <strong>Tags:</strong>
            <div style={{ marginTop: "0.5rem" }}>
              {item.tags.map(tag => (
                <span key={tag} className="tag" style={{ marginRight: "0.5rem" }}>{tag}</span>
              ))}
            </div>
          </div>

          {item.repository && (
            <div className="modal-links" style={{ marginTop: "1.5rem" }}>
              <a href={item.repository} target="_blank" rel="noopener noreferrer"
                 style={{ display: "block", marginBottom: "0.5rem", color: "#2563eb" }}>
                🔗 Repository
              </a>
            </div>
          )}

          {item.homepage && (
            <div className="modal-links">
              <a href={item.homepage} target="_blank" rel="noopener noreferrer"
                 style={{ display: "block", color: "#2563eb" }}>
                🌐 Homepage
              </a>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: "2rem", textAlign: "center" }}>
            <button style={{
              background: "#2563eb",
              color: "white",
              padding: "0.75rem 2rem",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              cursor: "pointer",
              marginRight: "1rem"
            }}>
              📥 Install
            </button>
            <button style={{
              background: "#64748b",
              color: "white",
              padding: "0.75rem 2rem",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              cursor: "pointer"
            }}>
              📖 Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchAndFilter: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ searchTerm, onSearchChange, activeCategory, onCategoryChange }) => {
  return (
    <section className="search-section">
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search plugins and skills..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => onCategoryChange("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${activeCategory === "development" ? "active" : ""}`}
            onClick={() => onCategoryChange("development")}
          >
            Development
          </button>
          <button
            className={`filter-tab ${activeCategory === "productivity" ? "active" : ""}`}
            onClick={() => onCategoryChange("productivity")}
          >
            Productivity
          </button>
          <button
            className={`filter-tab ${activeCategory === "automation" ? "active" : ""}`}
            onClick={() => onCategoryChange("automation")}
          >
            Automation
          </button>
          <button
            className={`filter-tab ${activeCategory === "integration" ? "active" : ""}`}
            onClick={() => onCategoryChange("integration")}
          >
            Integration
          </button>
        </div>
      </div>
    </section>
  );
};

// Main App Component
const App: React.FC = () => {
  const [plugins] = React.useState<Plugin[]>(samplePlugins);
  const [skills] = React.useState<Skill[]>(sampleSkills);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [selectedItem, setSelectedItem] = React.useState<Plugin | Skill | null>(null);

  // Filter functions
  const filterItems = <T extends Plugin | Skill>(items: T[]): T[] => {
    return items.filter(item => {
      const matchesSearch = searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = activeCategory === "all" || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const filteredPlugins = filterItems(plugins);
  const filteredSkills = filterItems(skills);

  // Calculate stats
  const totalDownloads = plugins.reduce((sum, p) => sum + p.downloads, 0) +
                        skills.reduce((sum, s) => sum + s.downloads, 0);

  return (
    <>
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <section id="plugins" className="marketplace-section">
        <div className="section-header">
          <h2>🔌 Plugins</h2>
          <p>Extend Claude Code with powerful plugins</p>
        </div>
        <div className="items-grid">
          {filteredPlugins.length > 0 ? (
            filteredPlugins.map(plugin => (
              <ItemCard
                key={plugin.id}
                item={plugin}
                onClick={() => setSelectedItem(plugin)}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No plugins found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <section id="skills" className="marketplace-section">
        <div className="section-header">
          <h2>🧠 Skills</h2>
          <p>Enhance Claude Code with specialized skills</p>
        </div>
        <div className="items-grid">
          {filteredSkills.length > 0 ? (
            filteredSkills.map(skill => (
              <ItemCard
                key={skill.id}
                item={skill}
                onClick={() => setSelectedItem(skill)}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No skills found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};

// Initialize React app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize stats
  const pluginCount = document.getElementById('plugin-count');
  const skillCount = document.getElementById('skill-count');
  const downloadCount = document.getElementById('download-count');

  if (pluginCount) pluginCount.textContent = samplePlugins.length.toString();
  if (skillCount) skillCount.textContent = sampleSkills.length.toString();
  if (downloadCount) {
    const totalDownloads = samplePlugins.reduce((sum, p) => sum + p.downloads, 0) +
                          sampleSkills.reduce((sum, s) => sum + s.downloads, 0);
    downloadCount.textContent = totalDownloads.toString();
  }

  // Initialize React app only once
  const reactRoot = document.getElementById('react-root');
  if (reactRoot && !reactRoot.hasChildNodes()) {
    const appRoot = createRoot(reactRoot);
    appRoot.render(<App />);
  }
});