# Enhanced Insights Page - Product Requirements Document

## Overview

This PRD outlines the upgrade of the BTA Campaign Performance Dashboard's Insights page to support multi-data source analysis, enabling users to generate comprehensive AI-powered insights across multiple dashboard views simultaneously.

## Objectives

### Primary Goal
Transform the current single-tab insights functionality into a multi-data source analysis tool that provides more comprehensive and actionable insights by analyzing data from multiple dashboard views together.

### Success Metrics
- **Primary**: Users can generate insights from multiple data sources simultaneously
- **Secondary**: Improved insight quality and comprehensiveness
- **Tertiary**: Maintained or improved page performance despite larger datasets

## Current State

### Existing Functionality
- AI-powered insights available on individual dashboard tabs
- Single data source analysis per insight request
- Support for multiple LLM providers (Gemini Pro, GPT-4, Claude-3)
- Natural language query capability

### Current Data Sources
- Dashboard Non-LivCor Accounts
- Dashboard LivCor Accounts
- All Error Score Card
- Broken Error Dashboard
- Soft Error Dashboard

**Note**: Remove references to legacy Ad Groups Management and Search Terms Analysis features.

## User Stories

### Primary User Story
**As a campaign manager**, I want to analyze data from multiple dashboard views simultaneously so that I can get comprehensive insights that show relationships between budget performance, error patterns, and account health across all my data sources.

### Supporting User Stories
1. **As a user**, I want to select all data sources at once so that I can quickly analyze my complete campaign ecosystem.

2. **As a user**, I want to choose specific combinations of data sources so that I can focus my analysis on related areas (e.g., all error dashboards together).

3. **As a user**, I want to control how much data is analyzed so that I can balance insight depth with performance based on my needs.

4. **As a user**, I want the system to default to my most important data (LivCor dashboard) so that I can quickly start my analysis.

## Functional Requirements

### FR1: Multi-Data Source Selection
- **FR1.1**: Replace current single-tab dropdown with checkbox-based multi-selection interface
- **FR1.2**: Support individual data source selection via checkboxes
- **FR1.3**: Provide "Select All" and "Clear All" functionality
- **FR1.4**: Default selection: Dashboard LivCor (checked), all others unchecked
- **FR1.5**: Maintain visual indication of which data sources are selected

### FR2: Data Volume Control
- **FR2.1**: Add data row limit selector (dropdown or input field)
- **FR2.2**: Default limit: 500 rows per selected data source
- **FR2.3**: Limit options: 100, 250, 500, 1000, 2000, or custom input
- **FR2.4**: Display estimated total rows based on selections
- **FR2.5**: Show warning if total estimated rows exceed performance thresholds

### FR3: Enhanced AI Analysis
- **FR3.1**: Maintain existing LLM provider selection (Gemini Pro, GPT-4, Claude-3)
- **FR3.2**: Support natural language queries across combined datasets
- **FR3.3**: Provide context about which data sources are included in analysis
- **FR3.4**: Generate insights that identify cross-data-source patterns and relationships

### FR4: Legacy Feature Cleanup
- **FR4.1**: Remove all references to Ad Groups Management from insights page
- **FR4.2**: Remove all references to Search Terms Analysis from insights page
- **FR4.3**: Ensure removal doesn't break existing functionality
- **FR4.4**: Update any related navigation or UI elements

## Technical Requirements

### TR1: Data Handling
- **TR1.1**: Efficiently combine data from multiple sources before AI analysis
- **TR1.2**: Implement data row limiting per source before combination
- **TR1.3**: Maintain data integrity and relationships when combining sources
- **TR1.4**: Handle varying data schemas across different dashboard views

### TR2: Performance Optimization
- **TR2.1**: Implement client-side data limiting before processing
- **TR2.2**: Show loading states during data compilation
- **TR2.3**: Provide user feedback on processing time for large datasets
- **TR2.4**: Implement caching for recently used data source combinations

### TR3: Error Handling
- **TR3.1**: Gracefully handle cases where selected data sources are unavailable
- **TR3.2**: Provide clear error messages for data loading failures
- **TR3.3**: Allow partial analysis if some data sources fail to load
- **TR3.4**: Implement fallback behavior for performance issues

## User Interface Specifications

### UI1: Data Source Selection Panel
```
+-----------------------------------------+
¦ Select Data Sources for Analysis        ¦
+-----------------------------------------¦
¦ ? Dashboard Non-LivCor Accounts        ¦
¦ ? Dashboard LivCor Accounts (default)  ¦
¦ ? All Error Score Card                 ¦
¦ ? Broken Error Dashboard               ¦
¦ ? Soft Error Dashboard                 ¦
+-----------------------------------------¦
¦ [Select All] [Clear All]               ¦
+-----------------------------------------+
```

### UI2: Data Volume Control
```
+-----------------------------------------+
¦ Data Rows per Source: [500 ?]          ¦
¦ Estimated Total Rows: 500               ¦
¦ ? Large datasets may take longer        ¦
+-----------------------------------------+
```

### UI3: Analysis Status
```
+-----------------------------------------+
¦ Analyzing data from:                    ¦
¦ • Dashboard LivCor Accounts (500 rows) ¦
¦ • All Error Score Card (250 rows)      ¦
¦                                         ¦
¦ [?] Processing insights...              ¦
+-----------------------------------------+
```

## Implementation Plan

### Phase 1: UI Implementation (Week 1)
- Replace dropdown with checkbox interface
- Add data row limit selector
- Implement Select All/Clear All functionality
- Update default selections

### Phase 2: Backend Integration (Week 2)
- Modify data fetching logic for multiple sources
- Implement data row limiting
- Add data combination logic
- Update AI prompt context for multi-source data

### Phase 3: Performance & Polish (Week 3)
- Implement performance optimizations
- Add loading states and user feedback
- Test with various data source combinations
- Remove legacy feature references

### Phase 4: Testing & Refinement (Week 4)
- User acceptance testing
- Performance testing with large datasets
- Bug fixes and refinements
- Documentation updates

## Acceptance Criteria

### AC1: Data Source Selection
- [ ] Users can select multiple data sources using checkboxes
- [ ] Dashboard LivCor is selected by default
- [ ] Select All and Clear All buttons work correctly
- [ ] Visual feedback shows which sources are selected

### AC2: Data Volume Control
- [ ] Users can set row limits per data source
- [ ] Default limit is 500 rows
- [ ] System shows estimated total rows
- [ ] Performance warnings appear for large datasets

### AC3: Insights Generation
- [ ] AI analysis works with combined data from multiple sources
- [ ] Insights identify cross-source patterns and relationships
- [ ] Analysis context clearly indicates which data sources were used
- [ ] All existing LLM providers continue to work

### AC4: Performance & UX
- [ ] Page loads and responds within acceptable time limits
- [ ] Clear loading states during data processing
- [ ] Graceful error handling for data loading issues
- [ ] No references to legacy Ad Groups or Search Terms features

## Risk Mitigation

### Performance Risks
- **Risk**: Large combined datasets may cause slow performance
- **Mitigation**: Implement data row limiting and performance warnings

### Data Integrity Risks
- **Risk**: Combining different data schemas may cause errors
- **Mitigation**: Implement robust data validation and error handling

### User Experience Risks
- **Risk**: Complex interface may confuse users
- **Mitigation**: Default to most common use case (LivCor dashboard) with clear UI

## Future Considerations

### Potential Enhancements
1. Saved data source combinations/presets
2. Advanced filtering within selected data sources
3. Export functionality for multi-source insights
4. Scheduled analysis with multiple data sources
5. Collaborative insight sharing

---

**Prepared by**: Product Team  
**Date**: August 23, 2025  
**Version**: 1.0