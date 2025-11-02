---
name: content-analyzer
description: "Advanced content analysis skill that provides insights, summaries, and recommendations for various types of content"
category: analysis
tags: ["content-analysis", "summarization", "insights", "recommendations"]
triggers:
  - type: keyword
    pattern: "analyze this"
    priority: 3
  - type: keyword
    pattern: "summarize"
    priority: 2
  - type: keyword
    pattern: "content insights"
    priority: 2
  - type: pattern
    pattern: "^(what|tell me) about (this|the) content"
    priority: 1
  - type: context
    pattern: "text-analysis"
    priority: 1
---

# Content Analyzer Skill

This skill provides comprehensive content analysis capabilities including summarization, sentiment analysis, key insights extraction, and actionable recommendations.

## When to Use This Skill

Use this skill when you need to:
- **Analyze documents** for key themes and insights
- **Summarize long content** into concise overviews
- **Extract actionable information** from text
- **Identify sentiment and tone** in communications
- **Get recommendations** based on content analysis
- **Compare and contrast** multiple pieces of content
- **Identify trends and patterns** in textual data

## Capabilities

### 1. Content Summarization
- Extract key points and main ideas
- Generate executive summaries
- Create bullet-point summaries
- Provide TL;DR (Too Long; Didn't Read) versions

### 2. Sentiment Analysis
- Detect emotional tone (positive, negative, neutral)
- Identify sentiment intensity
- Analyze sentiment in different sections
- Track sentiment changes over time

### 3. Topic Extraction
- Identify main topics and themes
- Extract keywords and phrases
- Categorize content by subject matter
- Find related concepts and connections

### 4. Insight Generation
- Highlight important findings
- Identify patterns and trends
- Spot anomalies and outliers
- Provide context and background

### 5. Recommendations
- Suggest actions based on content
- Recommend related resources
- Identify areas for improvement
- Provide next steps

## Analysis Framework

### Step 1: Content Preprocessing
- Clean and normalize text
- Remove noise and irrelevant content
- Identify content type and structure
- Extract metadata

### Step 2: Initial Analysis
- Calculate basic statistics (word count, readability)
- Identify language and encoding
- Detect content structure (headings, lists, tables)
- Extract key entities and concepts

### Step 3: Deep Analysis
- Perform sentiment analysis
- Extract topics and themes
- Identify relationships and connections
- Analyze writing style and tone

### Step 4: Insight Generation
- Synthesize findings into insights
- Identify patterns and trends
- Highlight important information
- Generate recommendations

### Step 5: Result Presentation
- Structure results clearly
- Provide different view levels (overview, detailed)
- Include visual representations when applicable
- Offer actionable next steps

## Input Requirements

The skill can analyze various types of content:
- **Documents**: Reports, articles, essays
- **Code**: Source code files, documentation
- **Communications**: Emails, messages, chat logs
- **Data**: CSV files, JSON data, logs
- **Web content**: Articles, blog posts, documentation

### Optimal Input Size
- **Short content**: Up to 1,000 words - Quick analysis
- **Medium content**: 1,000-10,000 words - Comprehensive analysis
- **Long content**: 10,000+ words - Structured analysis with sections

### Supported Formats
- Plain text files
- Markdown files
- JSON data
- CSV files
- Source code files
- Structured documents

## Output Format

### Analysis Summary
```
📊 Content Analysis Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Content Type: [Type]
Word Count: [Number]
Reading Time: [Minutes]
Overall Sentiment: [Positive/Negative/Neutral]
Key Topics: [List of topics]

🎯 Key Insights
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [Most important insight]
2. [Second important insight]
3. [Third important insight]

📝 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Concise summary of main points]

💡 Recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [Actionable recommendation 1]
2. [Actionable recommendation 2]
3. [Actionable recommendation 3]
```

### Detailed Analysis
For longer content, the skill provides:
- **Section-by-section analysis**
- **Topic evolution tracking**
- **Sentiment changes over time**
- **Comparative analysis** (if multiple pieces)
- **Visual representations** (charts, graphs)

## Configuration Options

### Analysis Depth
- **Quick**: Basic summary and key points
- **Standard**: Full analysis with insights
- **Comprehensive**: Deep analysis with recommendations

### Focus Areas
- **General**: Balanced analysis of all aspects
- **Sentiment**: Focus on emotional tone and sentiment
- **Topics**: Emphasis on themes and subjects
- **Actions**: Focus on actionable insights and recommendations

### Output Format
- **Concise**: Brief summary and key points
- **Standard**: Detailed analysis with insights
- **Comprehensive**: Full analysis with all details

## Advanced Features

### Comparative Analysis
When analyzing multiple pieces of content:
- Identify similarities and differences
- Track changes over time
- Compare sentiment and topics
- Find consistent themes

### Pattern Recognition
- Detect recurring themes
- Identify writing patterns
- Find structural similarities
- Spot unusual content

### Context Awareness
- Consider source and purpose
- Account for target audience
- Understand industry context
- Recognize content type conventions

## Best Practices

### For Best Results:
1. **Provide clear, complete content**
2. **Specify desired focus area if applicable**
3. **Indicate output format preference**
4. **Provide context about content purpose**
5. **Specify if comparative analysis is needed**

### Common Use Cases:
- **Business reports**: Executive summaries and key insights
- **Technical documentation**: Simplification and clarity improvements
- **Customer feedback**: Sentiment analysis and recommendations
- **Research papers**: Key findings and literature gaps
- **Project updates**: Progress analysis and next steps
- **Meeting notes**: Action items and decisions

## Limitations

- **Language support**: Primarily optimized for English content
- **Technical jargon**: May struggle with highly specialized content
- **Real-time data**: Cannot access external data sources
- **Visual content**: Cannot analyze images or videos
- **File size limits**: Very large files may be truncated

## Examples

### Example 1: Business Report Analysis
```
Input: Quarterly business report (2,500 words)
Output: Executive summary highlighting key metrics, trends, and recommendations for next quarter
```

### Example 2: Customer Feedback Analysis
```
Input: Customer reviews and feedback (100 entries)
Output: Sentiment analysis, common themes, and actionable improvement suggestions
```

### Example 3: Technical Documentation Review
```
Input: API documentation (5,000 words)
Output: Clarity assessment, missing information identification, and structure recommendations
```

## Integration Capabilities

This skill can be combined with other skills for enhanced analysis:
- **Code analyzer**: For technical documentation
- **Data visualizer**: For analytical reports
- **Research assistant**: For academic content
- **Writing coach**: For content improvement

## Quality Assurance

The analysis results are validated through:
- **Consistency checks**: Ensuring insights are supported by content
- **Relevance verification**: Confirming recommendations are applicable
- **Clarity assessment**: Ensuring results are understandable
- **Actionability testing**: Verifying recommendations are practical

---

*This content analyzer skill is designed to provide comprehensive, actionable insights while maintaining high accuracy and relevance. Adjust configuration options based on your specific analysis needs.*