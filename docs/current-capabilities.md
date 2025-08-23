# BTA Campaign Performance Dashboard - Current Capabilities

## Overview
The BTA (Builders to Applications) Campaign Performance Dashboard is a comprehensive web application designed for advertising campaign management and performance monitoring. Built with Next.js 15, React 18, and TypeScript, it provides real-time insights into Google Ads campaign performance, error monitoring, and AI-powered data analysis.

## Technology Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Data Visualization**: Recharts, D3.js, Tremor
- **Data Fetching**: SWR for client-side data fetching
- **AI Integration**: Multiple LLM providers (Gemini Pro, OpenAI GPT-4, Anthropic Claude-3)
- **Data Storage**: Google Sheets deployed as web app with Google Apps Script backend
- **State Management**: React Context API with custom hooks
- **Form Handling**: React Hook Form with Zod validation

## Core Features & Capabilities

### 1. Multi-Dashboard System

#### Dashboard - Non-LivCor Accounts
- **Account Overview**: Displays account names, codes, and budget metrics
- **Budget Tracking**: 
  - Whole month media budget percentage
  - Budget with rollover calculations
  - Over/under budget analysis
- **Progress Monitoring**: Month progress tracking with visual indicators
- **Summary Metrics**: Aggregated account statistics and averages

#### Dashboard LivCor - LivCor Accounts
- **Specialized Tracking**: Dedicated dashboard for LivCor account management
- **Budget Management**: Same budget tracking capabilities as standard dashboard
- **Performance Indicators**: Visual status indicators for budget vs. progress
- **Account Grouping**: Separate management for LivCor-specific accounts

### 2. Error Monitoring & Management

#### All Error Score Card
- **Error Scoring**: Comprehensive error scoring system (0-10 scale)
- **Priority Classification**:
  - Critical Priority (Score > 6)
  - High Priority (Score > 4)
  - Medium Priority (Score > 2)
  - Low Priority (Score ≤ 2)
- **Statistical Analysis**: Average and median error scores
- **Account Prioritization**: Automatic sorting by error severity

#### Broken Error Dashboard
- **Critical Issue Tracking**:
  - Ads disapprovals count
  - Asset disapprovals count
  - Conversion issues identification
  - Missing end dates detection
- **Zero Spender Accounts**: Identification of non-performing accounts
- **Issue Aggregation**: Total counts across all accounts

#### Soft Error Dashboard
- **Performance Optimization Issues**:
  - Negative keyword conflicts
  - Impressions outside target country
  - Display apps running status
  - Geographic location targeting issues
- **Warning System**: Non-critical but important optimization opportunities

### 3. Campaign Performance Analytics

#### Legacy Features (Removed)
- **Ad Groups Management**: Previously provided comprehensive ad group metrics and performance tracking
- **Search Terms Analysis**: Previously offered search term level insights and optimization opportunities

*Note: These features have been removed from the insights page to focus on dashboard-level analysis and multi-source insights.*

### 4. Data Insights & AI Analysis

#### AI-Powered Data Analysis
- **Multi-LLM Support**:
  - Google Gemini Pro
  - OpenAI GPT-4
  - Anthropic Claude-3
- **Natural Language Queries**: Ask questions about data in plain English
- **Contextual Analysis**: AI understands data structure and relationships
- **Actionable Insights**: Generate recommendations and insights

#### Advanced Data Filtering
- **Multi-Column Filtering**: Filter by any data column
- **Operator Support**:
  - Dimension filters: contains, equals, starts with, ends with
  - Metric filters: greater than, less than, equals
  - Date filters: before, after, on or before
- **Complex Queries**: Multiple filter conditions
- **Real-time Filtering**: Instant data updates

#### Data Visualization
- **Interactive Charts**: Bar charts, line charts, pie charts, scatter plots
- **Responsive Design**: Charts adapt to screen size
- **Custom Styling**: Branded color scheme and design
- **Export Capabilities**: Data export functionality

### 5. Settings & Configuration

#### Data Source Management
- **Google Sheets Integration**: Primary data source via Google Apps Script
- **Multiple Data Sources**: Support for various data formats
- **Real-time Updates**: Automatic data refresh capabilities
- **Error Handling**: Graceful handling of data connection issues

#### User Preferences
- **Currency Settings**: Configurable currency display
- **Campaign Selection**: Filter by specific campaigns
- **Tab Management**: Customizable dashboard tabs
- **Theme Support**: Consistent branding and styling

### 6. User Interface & Experience

#### Navigation System
- **Tab-based Navigation**: Easy switching between dashboards
- **Breadcrumb Navigation**: Clear location awareness
- **Responsive Design**: Mobile and desktop optimized
- **Accessibility**: WCAG compliant components

#### Visual Design
- **Brand Consistency**: Adtaxi color scheme and branding
- **Status Indicators**: Color-coded performance indicators
- **Progress Bars**: Visual budget and progress tracking
- **Alert System**: Toast notifications for user feedback

#### Performance Optimization
- **Lazy Loading**: Efficient data loading
- **Caching**: SWR-based data caching
- **Optimized Rendering**: React best practices
- **Error Boundaries**: Graceful error handling

## Data Management Capabilities

### Data Types Supported
- **Campaign Metrics**: Performance data at campaign level
- **Ad Group Metrics**: Granular ad group performance
- **Search Term Data**: Keyword and search term analytics
- **Error Metrics**: Various error and issue tracking
- **Budget Data**: Financial tracking and projections

### Data Processing
- **Real-time Calculations**: Automatic metric calculations
- **Data Aggregation**: Sum, average, and statistical functions
- **Data Validation**: Type checking and error handling
- **Data Transformation**: Format conversion and normalization

### Integration Capabilities
- **Google Sheets API**: Direct integration with Google Sheets
- **Google Apps Script**: Backend data processing
- **RESTful APIs**: Standard API endpoints
- **Webhook Support**: Real-time data updates

## Security & Performance

### Security Features
- **Environment Variables**: Secure API key management
- **Data Validation**: Input sanitization and validation
- **Error Handling**: Secure error messages
- **Access Control**: User permission management

### Performance Features
- **Optimized Loading**: Efficient data fetching
- **Caching Strategy**: Intelligent data caching
- **Code Splitting**: Lazy-loaded components
- **Bundle Optimization**: Minimized JavaScript bundles

## Current Limitations & Areas for Enhancement

### Known Limitations
1. **Data Source Flexibility**: Currently primarily Google Sheets-based
2. **User Authentication**: No user login system implemented
3. **Real-time Updates**: Limited to manual refresh
4. **Export Options**: Basic export functionality
5. **Mobile Optimization**: Could be enhanced for mobile users

### Potential Enhancement Areas
1. **Multi-User Support**: User authentication and role-based access
2. **Advanced Reporting**: Custom report generation
3. **Alert System**: Automated notifications for critical issues
4. **Data Integration**: Support for additional data sources
5. **Advanced Analytics**: Machine learning insights
6. **API Development**: Public API for third-party integrations

## Technical Architecture

### Frontend Architecture
- **Component-Based**: Modular, reusable components
- **Type Safety**: Full TypeScript implementation
- **State Management**: Context API with custom hooks
- **Routing**: Next.js App Router

### Backend Integration
- **Google Apps Script**: Data processing and API endpoints
- **Google Sheets**: Primary data storage
- **External APIs**: LLM provider integrations

### Data Flow
1. Google Sheets → Google Apps Script → Next.js API
2. Next.js API → React Components → User Interface
3. User Actions → API Calls → Data Updates

## Deployment & Infrastructure

### Current Deployment
- **Next.js Application**: Deployed on Vercel or similar platform
- **Google Apps Script**: Deployed as web app
- **Environment Variables**: Secure configuration management

### Scalability Considerations
- **Data Volume**: Handles large datasets efficiently
- **User Load**: Optimized for multiple concurrent users
- **API Limits**: Respects external API rate limits
- **Caching**: Reduces server load through intelligent caching

---

*This document provides a comprehensive overview of the current BTA Campaign Performance Dashboard capabilities. Use this information to plan the next iteration and identify priority enhancements for your project roadmap.*
