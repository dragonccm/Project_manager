# Code Components Feature - WordPress Elementor Integration

## Overview
The Code Components feature allows you to store, manage, and reuse WordPress Elementor components as JSON files. This feature is perfect for developers and designers who want to maintain a library of reusable Elementor elements, sections, and templates.

## Features

### ✨ Core Functionality
- **Component Storage**: Store WordPress Elementor components as JSON data
- **Category Management**: Organize components by type (element, section, template, widget, global)
- **Project Association**: Link components to specific projects
- **Tag System**: Tag components for easy searching and filtering
- **Import/Export**: JSON import/export functionality for component sharing

### 🎯 Component Types
- **Element**: Individual widgets (buttons, headings, images, etc.)
- **Section**: Complete sections with multiple elements
- **Template**: Full page templates
- **Widget**: Custom Elementor widgets
- **Global**: Global components used across multiple projects

### 📋 Data Structure
Each component stores:
- **Basic Info**: Name, description, category
- **Technical Data**: 
  - `code_json`: Custom component structure
  - `elementor_data`: Native Elementor widget/section data
- **Metadata**: Tags, preview image, project association
- **Timestamps**: Created and updated dates

## Usage

### 🚀 Getting Started

1. **Navigate to Code Components**
   - Click on "Code Components" in the main navigation menu

2. **Create Your First Component**
   - Click "Thêm Component" button
   - **New Improved Form Features:**
     - **Wide Layout**: Form is now optimized with 4-column layout for better space usage
     - **File Upload**: Click "Tải file JSON" to upload existing component files
     - **Side-by-side JSON Editors**: Code JSON and Elementor Data are displayed side by side
     - **Vietnamese Interface**: User-friendly Vietnamese labels and instructions
   - Fill in the required fields:
     - Tên component (required)
     - Loại (Category - required)
     - Dự án (Project association)
     - Tags (comma-separated)
     - Mô tả (Description - optional)
     - Code JSON (required)
     - Elementor Data (required)

3. **Upload JSON Files**
   - **Method 1**: Use "Nhập từ file JSON" button in the header
   - **Method 2**: Use "Tải file JSON" button inside the create/edit dialog
   - Supported format: `.json` files
   - Sample files included: `sample-component.json`, `sample-button.json`

4. **Use Sample Data**
   - If no components exist, use "Create Sample Components" button
   - This creates example components to help you understand the structure

### 💡 New Form Improvements (Latest Update)

#### Wide Layout Design
- **4-Column Layout**: Basic information fields are arranged in 4 columns for better space efficiency
- **Side-by-side JSON Editors**: Code JSON and Elementor Data are displayed side by side for easier comparison and editing
- **Compact Height**: Form is now wider but shorter, reducing vertical scrolling

#### Enhanced File Upload
- **Multiple Upload Options**: 
  - Header "Nhập từ file JSON" button for quick import
  - In-dialog "Tải file JSON" button for form pre-filling
- **Smart Form Pre-filling**: Uploaded JSON automatically fills form fields
- **Error Handling**: Clear error messages for invalid JSON files

#### Vietnamese Interface
- **Localized Labels**: All form labels and buttons in Vietnamese
- **User-friendly Placeholders**: Helpful placeholder text in Vietnamese
- **Action Buttons**: "Thêm Component", "Cập nhật Component", "Hủy", etc.

#### Copy-to-Clipboard Features
- **Preview Dialog**: Copy JSON data directly from preview
- **Easy Sharing**: Quick copy buttons for both Code JSON and Elementor Data

## ✨ Form Improvements (Updated May 2025)

### 🎨 Enhanced User Interface
- **Wide Dialog Layout**: Form dialogs now use 6xl width for better screen utilization
- **4-Column Layout**: Basic information fields arranged in 4 columns for compact display
- **Side-by-Side JSON Editors**: Code JSON and Elementor Data displayed horizontally for easy comparison
- **Responsive Height**: Forms auto-adjust height with max 90vh and scroll support
- **Monospace Font**: JSON editors use monospace font for better code readability

### 📁 File Upload Features
- **JSON File Upload**: Direct file upload support for importing existing components
- **Smart Form Population**: Uploaded JSON automatically fills form fields
- **Multiple Upload Points**: Upload buttons available in both Create and Edit dialogs
- **Error Handling**: Clear error messages for invalid JSON files

### 🌐 Vietnamese Localization
- **Vietnamese Labels**: All form labels translated to Vietnamese
- **User-Friendly Messages**: Error messages and confirmations in Vietnamese
- **Intuitive Navigation**: Vietnamese button labels and descriptions

### 💡 Usability Enhancements
- **Shorter Form Height**: Optimized layout reduces vertical scrolling
- **Better Field Organization**: Logical grouping of related fields
- **Improved Button Layout**: Clear action buttons with proper spacing
- **Copy to Clipboard**: Quick copy buttons in preview dialog

### 📝 Adding Components

#### Manual Entry
1. **Basic Information**
   ```
   Name: Hero Section
   Category: Section
   Description: Modern hero section with gradient background
   Tags: hero, landing, gradient, cta
   ```

2. **Code JSON Structure**
   ```json
   {
     "type": "section",
     "elements": [
       {
         "type": "container",
         "settings": {
           "layout": "boxed",
           "content_width": "1200px"
         },
         "elements": [...]
       }
     ]
   }
   ```

3. **Elementor Data**
   ```json
   {
     "version": "3.16.0",
     "title": "Hero Section",
     "type": "section",
     "content": [
       {
         "id": "hero-section",
         "elType": "section",
         "settings": {...},
         "elements": [...]
       }
     ]
   }
   ```

#### Import from File
1. Click "Import" button
2. Select a JSON file containing component data
3. Modify imported data if needed
4. Save the component

### 🔍 Managing Components

#### Search and Filter
- **Search**: Type in the search box to find components by name, description, or tags
- **Category Filter**: Filter by component type
- **Project Filter**: Filter by associated project

#### Component Actions
- **👁️ Preview**: View component JSON data in a readable format
- **✏️ Edit**: Modify component details and data
- **📥 Export**: Download component as JSON file
- **🗑️ Delete**: Remove component (with confirmation)

### 📦 Import/Export

#### Exporting Components
1. Click the download icon on any component
2. Component will be saved as `ComponentName.json`
3. File contains all component data in portable format

#### Importing Components
1. Click "Import" button in the header
2. Select a JSON file with component data
3. Review and modify the imported data
4. Choose target project
5. Save to add to your library

### 🔧 JSON Structure Examples

#### Button Element
```json
{
  "name": "Primary Button",
  "category": "element",
  "tags": ["button", "primary", "cta"],
  "code_json": {
    "type": "button",
    "text": "Get Started",
    "style": "primary",
    "link": "#signup"
  },
  "elementor_data": {
    "widgetType": "button",
    "settings": {
      "text": "Get Started",
      "button_type": "primary",
      "link": {"url": "#signup"}
    }
  }
}
```

#### Contact Form Widget
```json
{
  "name": "Contact Form",
  "category": "widget",
  "tags": ["form", "contact", "validation"],
  "code_json": {
    "type": "form",
    "fields": [
      {"type": "text", "label": "Name", "required": true},
      {"type": "email", "label": "Email", "required": true},
      {"type": "textarea", "label": "Message", "required": true}
    ]
  },
  "elementor_data": {
    "widgetType": "form",
    "settings": {
      "form_fields": [...],
      "submit_button_text": "Send Message"
    }
  }
}
```

## Database Schema

### Table: `code_components`
```sql
CREATE TABLE code_components (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('element', 'section', 'template', 'widget', 'global')),
  tags TEXT[] DEFAULT '{}',
  code_json JSONB NOT NULL,
  preview_image TEXT,
  elementor_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Functions

### Database Operations
- `getCodeComponents()` - Retrieve all components with project names
- `createCodeComponent(data)` - Create new component
- `updateCodeComponent(id, data)` - Update existing component
- `deleteCodeComponent(id)` - Delete component

### Hook Operations
- `addCodeComponent(data)` - Add component via hook
- `editCodeComponent(id, data)` - Edit component via hook
- `removeCodeComponent(id)` - Remove component via hook

## Best Practices

### 🎨 Component Organization
1. **Use Descriptive Names**: Make component names clear and specific
2. **Categorize Properly**: Choose the most appropriate category
3. **Tag Consistently**: Use consistent tagging conventions
4. **Document Purpose**: Add meaningful descriptions

### 📁 Project Structure
1. **Group by Project**: Associate components with relevant projects
2. **Version Control**: Use export/import for version control
3. **Backup Regularly**: Export important components regularly

### 🔄 Workflow
1. **Design in Elementor**: Create components in Elementor first
2. **Extract Data**: Copy the JSON data from Elementor
3. **Store in Library**: Add to component library with proper metadata
4. **Reuse**: Import back into Elementor when needed

## Troubleshooting

### Common Issues

#### Invalid JSON Format
- **Problem**: Error when pasting JSON data
- **Solution**: Validate JSON format before saving
- **Tool**: Use online JSON validators

#### Missing Project Association
- **Problem**: Component not appearing in project filters
- **Solution**: Ensure project is selected when creating component

#### Import Failures
- **Problem**: JSON file won't import
- **Solution**: Check file format and ensure all required fields are present

### Error Messages
- `"Invalid JSON format"` - Check JSON syntax
- `"Missing required fields"` - Ensure name, category, code_json, and elementor_data are provided
- `"Database error"` - Check database connection and fallback to localStorage

## Integration with Existing Features

### 🔗 Project Management
- Components are linked to projects
- Filter components by project
- Project deletion handling

### 💾 Data Persistence
- Database storage with PostgreSQL
- localStorage fallback when database unavailable
- Automatic data synchronization

### 🎯 Search and Filtering
- Integrated with existing search patterns
- Category-based filtering
- Tag-based search functionality

## Future Enhancements

### Planned Features
- **Preview Images**: Upload and display component previews
- **Component Versions**: Version control for component iterations
- **Bulk Operations**: Import/export multiple components
- **Component Templates**: Pre-built component templates
- **Sharing**: Share components between team members

### Integration Possibilities
- **Elementor Plugin**: Direct integration with Elementor editor
- **GitHub Integration**: Version control with Git repositories
- **Template Library**: Public template sharing platform
- **API Endpoints**: REST API for external integrations

---

This feature enhances the project management capabilities by providing a comprehensive solution for managing reusable WordPress Elementor components, making it easier to maintain consistency across projects and speed up development workflows.
